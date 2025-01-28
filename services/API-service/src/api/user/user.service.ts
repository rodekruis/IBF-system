import crypto from 'crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';
import { In, Repository } from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { LookupService } from '../notification/lookup/lookup.service';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user-role.enum';
import { UserEntity } from './user.entity';
import { UserData, UserResponseObject } from './user.model';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  @InjectRepository(DisasterTypeEntity)
  private readonly disasterTypeRepository: Repository<DisasterTypeEntity>;

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
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      const errors = { errors: 'Email must be unique.' };
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
    newUser.password = dto.password;
    newUser.firstName = dto.firstName;
    newUser.middleName = dto.middleName;
    newUser.lastName = dto.lastName;
    newUser.userRole = dto.role;
    newUser.whatsappNumber = dto.whatsappNumber;
    newUser.countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(dto.countryCodesISO3) },
    });
    newUser.disasterTypes = await this.disasterTypeRepository.find({
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

  public async updatePassword(
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

  // UNIT TEST?
  public async updateUser(
    email: string,
    updateUserData: UpdateUserDto,
  ): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      const errors = { User: 'Not found' };
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }

    // If nothing to update, raise a 400 Bad Request.
    if (Object.keys(updateUserData).length === 0) {
      throw new HttpException(
        'Update user error: no attributes supplied to update',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Overwrite any non-nested attributes of the user (so not countries/disaster-types)
    for (const attribute in updateUserData) {
      user[attribute] = updateUserData[attribute];
    }

    const savedUser = await this.userRepository.save(user);
    return this.buildUserRO(savedUser, false);
  }

  private async generateJWT(user: UserEntity): Promise<string> {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    const result = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        userRole: user.userRole,
        countries: user.countries.map(
          (countryEntity): string => countryEntity.countryCodeISO3,
        ),
        disasterTypes: user.disasterTypes.length
          ? user.disasterTypes.map(
              (disasterTypeEntity): string => disasterTypeEntity.disasterType,
            )
          : (await this.disasterTypeRepository.find()).map(
              (d) => d.disasterType,
            ),
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

  // UNIT TEST?
  public async buildUserRO(
    user: UserEntity,
    includeToken = true,
  ): Promise<UserResponseObject> {
    const userRO: UserData = {
      email: user.email,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      userRole: user.userRole,
      whatsappNumber: user.whatsappNumber,
    };

    if (includeToken) {
      userRO.token = await this.generateJWT(user);
    }

    return { user: userRO };
  }
}
