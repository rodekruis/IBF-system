import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { subMinutes } from 'date-fns';
import { LessThan, Repository } from 'typeorm';

import { CountryService } from '../country/country.service';
import { DisasterTypeService } from '../disaster-type/disaster-type.service';
import { UserService } from '../user/user.service';
import { UserRole } from '../user/user-role.enum';
import { LoginEntity } from './login.entity';

const CODE_EXPIRATION_MINUTES = 15;
const PASSWORD_LENGTH = 12;
const PROMPT_CODE = 'Enter the code sent to your email';
const UNDER_REVIEW = 'Your account is under review';

@Injectable()
export class LoginService {
  @InjectRepository(LoginEntity)
  private readonly loginRepository: Repository<LoginEntity>;

  public constructor(
    private userService: UserService,
    private countryService: CountryService,
    private disasterTypeService: DisasterTypeService,
  ) {}

  public async send(email: string) {
    const code = this.generateCode();
    let user = await this.userService.findByEmail(email);

    if (!user) {
      // create user if not exists
      const createUserDto = await this.getCreateUserDto(email);

      user = await this.userService.createUser(createUserDto);
    } else {
      // invalidate existing logins for the user
      await this.loginRepository.delete({ user });
    }

    const loginEntity = new LoginEntity();

    loginEntity.code = code;
    loginEntity.user = user;
    loginEntity.createdAt = new Date();

    await this.loginRepository.save(loginEntity);

    // TODO: send email with code

    return { message: PROMPT_CODE };
  }

  public async verify(email: string, code: string) {
    // clear expired codes before verifying
    await this.deleteExpiredCodes();

    const loginEntity = await this.loginRepository.findOne({
      where: { code, user: { email } },
      relations: ['user', 'user.countries'],
    });

    if (!loginEntity) {
      throw new UnauthorizedException(PROMPT_CODE);
    }

    await this.loginRepository.delete(loginEntity);

    if (loginEntity.user.countries.length < 1) {
      throw new UnauthorizedException(UNDER_REVIEW);
    }

    return this.userService.findById(loginEntity.user.userId);
  }

  generateCode() {
    // generate a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async getCreateUserDto(email: string) {
    const countryCodesISO3 = await this.getCountryCodesISO3(email);

    return {
      email,
      firstName: this.getFirstName(countryCodesISO3),
      lastName: UserRole.Viewer,
      userRole: UserRole.Viewer,
      countryCodesISO3,
      disasterTypes: await this.getDisasterTypes(),
      password: this.getPassword(),
      whatsappNumber: null,
    };
  }

  private async getCountryCodesISO3(email: string) {
    let countryCodesISO3: string[] = [];

    // hardcoded whitelisted domains for automatic access
    if (email.endsWith('@redcross.nl')) {
      const countries = await this.countryService.getCountries();

      countryCodesISO3 = countries.map(
        ({ countryCodeISO3 }) => countryCodeISO3,
      );
    } else if (email.endsWith('@redcross.org.zm')) {
      countryCodesISO3 = ['ZMB'];
    } else if (email.endsWith('@redcross.org.ls')) {
      countryCodesISO3 = ['LSO'];
    } else if (email.endsWith('@redcrossug.org')) {
      countryCodesISO3 = ['UGA'];
    } else if (email.endsWith('@redcrosszim.org.zw')) {
      countryCodesISO3 = ['ZWE'];
    } else if (email.endsWith('@redcross.or.ke')) {
      countryCodesISO3 = ['KEN'];
    } else if (email.endsWith('@redcross.org.ph')) {
      countryCodesISO3 = ['PHL'];
    } else if (email.endsWith('@redcrosseth.org')) {
      countryCodesISO3 = ['ETH'];
    } else if (email.endsWith('@redcross.mw')) {
      countryCodesISO3 = ['MWI'];
    } else if (email.endsWith('@ssdredcross.org')) {
      countryCodesISO3 = ['SSD'];
    }

    return countryCodesISO3;
  }

  private async getDisasterTypes() {
    const disasterTypes = await this.disasterTypeService.getDisasterTypes();

    return disasterTypes.map(({ disasterType }) => disasterType);
  }

  private getFirstName(countryCodesISO3: string[]) {
    let firstName = 'guest';
    const randomId = (Math.floor(Math.random() * 9000) + 1000).toString();

    if (countryCodesISO3.length > 1) {
      firstName = 'multi';
    } else if (countryCodesISO3.length > 0) {
      firstName = countryCodesISO3[0];
    }

    firstName = firstName + randomId;

    return firstName;
  }

  private getPassword(length = PASSWORD_LENGTH) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join('');
  }

  private async deleteExpiredCodes() {
    // delete codes older than 15 minutes
    const expirationTime = subMinutes(new Date(), CODE_EXPIRATION_MINUTES);

    await this.loginRepository.delete({ createdAt: LessThan(expirationTime) });
  }
}
