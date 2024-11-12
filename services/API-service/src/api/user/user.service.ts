import crypto from 'crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';
import { In, Repository } from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterEntity } from '../disaster/disaster.entity';
import { LookupService } from '../notification/lookup/lookup.service';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { UserRole } from './user-role.enum';
import { UserEntity } from './user.entity';
import { UserResponseObject } from './user.model';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(DisasterEntity)
  private readonly disasterRepository: Repository<DisasterEntity>;

  private readonly relations: string[] = ['countries', 'disasterTypes'];

  public constructor(private readonly lookupService: LookupService) {}

  public async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      relations: this.relations,
    });
  }

  public async findOne(loginUserDto: LoginUserDto): Promise<UserEntity> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto
        .createHmac('sha256', loginUserDto.password)
        .digest('hex'),
    };

    return await this.userRepository.findOne({
      where: findOneOptions,
      relations: this.relations,
    });
  }

  public async create(dto: CreateUserDto): Promise<UserResponseObject> {
    const email = dto.email.toLowerCase();
    const username = dto.username.toLowerCase();
    const user = await this.userRepository.findOne({
      where: [{ email: email }, { username: username }],
    });

    if (user) {
      const errors = { errors: 'Email and username must be unique.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.whatsappNumber) {
      dto.whatsappNumber = await this.lookupService.lookupAndCorrect(
        dto.whatsappNumber,
      );
    }

    // create new user
    const newUser = new UserEntity();
    newUser.email = email;
    newUser.username = dto.username;
    newUser.password = dto.password;
    newUser.firstName = dto.firstName;
    newUser.middleName = dto.middleName;
    newUser.lastName = dto.lastName;
    newUser.userRole = dto.role;
    newUser.userStatus = dto.status;
    newUser.whatsappNumber = dto.whatsappNumber;
    newUser.countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(dto.countryCodesISO3) },
    });
    newUser.disasterTypes = await this.disasterRepository.find({
      where: { disasterType: In(dto.disasterTypes) },
    });

    const errors = await validate(newUser);
    if (errors.length > 0) {
      const _errors = { email: 'User input is not valid.' };
      throw new HttpException(
        { message: 'Input data validation failed', _errors },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      const savedUser = await this.userRepository.save(newUser);
      return this.buildUserRO(savedUser);
    }
  }

  public async findById(userId: string): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
      relations: this.relations,
    });
    if (!user) {
      const errors = {
        User: 'No user found with this id. Possibly update token.',
      };
      throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
    }

    return this.buildUserRO(user);
  }

  public async update(
    loggedInUserId: string,
    dto: UpdatePasswordDto,
  ): Promise<UserResponseObject> {
    let updateUser: UserEntity;
    const loggedInUser = await this.userRepository.findOne({
      where: { userId: loggedInUserId },
      relations: this.relations,
    });
    if (!loggedInUser) {
      const errors = { user: 'No logged in user found' };
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    if (dto.email) {
      if (loggedInUser.userRole !== UserRole.Admin) {
        const errors = {
          User: 'You can only use this endpoint with email-property if you are an admin-user',
        };
        throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
      }
      updateUser = await this.userRepository.findOne({
        where: { email: dto.email },
        relations: this.relations,
      });
      if (!updateUser) {
        const errors = { email: dto.email + ' not found' };
        throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
      }
    } else {
      updateUser = loggedInUser;
    }
    const password = crypto.createHmac('sha256', dto.password).digest('hex');
    await this.userRepository.save({
      userId: updateUser.userId,
      password,
    });
    return this.buildUserRO(updateUser);
  }

  public async generateJWT(user: UserEntity): Promise<string> {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    const result = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        userRole: user.userRole,
        userStatus: user.userStatus,
        countries: user.countries.map(
          (countryEntity): string => countryEntity.countryCodeISO3,
        ),
        disasterTypes: user.disasterTypes.length
          ? user.disasterTypes.map(
              (disasterEntity): string => disasterEntity.disasterType,
            )
          : (await this.disasterRepository.find()).map((d) => d.disasterType),
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

  private async buildUserRO(user: UserEntity): Promise<UserResponseObject> {
    const userRO = {
      email: user.email,
      token: await this.generateJWT(user),
      userRole: user.userRole,
    };

    return { user: userRO };
  }
}
