import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, In } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { UserResponseObject } from './user.model';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DeleteUserDto } from './dto/delete-user.dto';
import { CountryEntity } from '../country/country.entity';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  @InjectRepository(CountryEntity)
  private readonly countryRepository: Repository<CountryEntity>;
  private readonly relations: string[] = ['countries'];

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

    return await this.userRepository.findOne(findOneOptions, {
      relations: this.relations,
    });
  }

  public async create(dto: CreateUserDto): Promise<UserResponseObject> {
    // check uniqueness of username
    const { email, password } = dto;
    const qb = await getRepository(UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    const user = await qb.getOne();

    if (user) {
      const errors = { email: 'Email must be unique.' };
      throw new HttpException(
        { message: 'Input data validation failed', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // create new user
    const newUser = new UserEntity();
    newUser.email = email;
    newUser.username = dto.username;
    newUser.password = password;
    newUser.firstName = dto.firstName;
    newUser.middleName = dto.middleName;
    newUser.lastName = dto.lastName;
    newUser.userRole = dto.role;
    newUser.userStatus = dto.status;
    newUser.countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(dto.countryCodesISO3) },
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
    const user = await this.userRepository.findOne(userId, {
      relations: this.relations,
    });
    if (!user) {
      const errors = { User: ' not found' };
      throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
    }

    return this.buildUserRO(user);
  }

  public async findByEmail(email: string): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne(
      { email: email },
      {
        relations: this.relations,
      },
    );
    if (!user) {
      const errors = { email: email + ' not found' };
      console.log(errors);
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    return this.buildUserRO(user);
  }

  public generateJWT(user: UserEntity): string {
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
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

  private buildUserRO(user: UserEntity): UserResponseObject {
    const userRO = {
      email: user.email,
      token: this.generateJWT(user),
    };

    return { user: userRO };
  }
}
