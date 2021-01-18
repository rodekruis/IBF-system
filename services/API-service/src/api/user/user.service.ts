import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { UserRO } from './user.interface';
import { validate } from 'class-validator';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DeleteUserDto } from './dto/delete-user.dts';

@Injectable()
export class UserService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  private readonly relations: string[] = ['countries'];

  public constructor() {}

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

  public async create(dto: CreateUserDto): Promise<UserRO> {
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
    let newUser = new UserEntity();
    newUser.email = email;
    newUser.password = password;

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

  public async update(id: number, dto: UpdateUserDto): Promise<UserRO> {
    let toUpdate = await this.userRepository.findOne(id);
    let updated = toUpdate;
    updated.password = crypto.createHmac('sha256', dto.password).digest('hex');
    const updatedUser = await this.userRepository.save(updated);
    return this.buildUserRO(updatedUser);
  }

  public async deleteAccount(
    id: number,
    passwordData: DeleteUserDto,
  ): Promise<void> {
    const findOneOptions = {
      id: id,
    };
    const user = await this.userRepository.findOne(findOneOptions);

    if (!user) {
      const errors = 'User not found or already deleted';
      throw new HttpException({ errors }, HttpStatus.BAD_REQUEST);
    }

    const hashedpassword = crypto
      .createHmac('sha256', passwordData.password)
      .digest('hex');
    if (user.password !== hashedpassword) {
      const errors = 'Password for user is incorrect';
      throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
    }
    await this.userRepository.delete(user.id);
  }

  public async findById(id: number): Promise<UserRO> {
    const user = await this.userRepository.findOne(id, {
      relations: this.relations,
    });
    if (!user) {
      const errors = { User: ' not found' };
      throw new HttpException({ errors }, HttpStatus.UNAUTHORIZED);
    }

    return this.buildUserRO(user);
  }

  public async findByUsername(username: string): Promise<UserRO> {
    const user = await this.userRepository.findOne(
      { username: username },
      {
        relations: this.relations,
      },
    );
    if (!user) {
      const errors = { username: username + ' not found' };
      console.log(errors);
      throw new HttpException({ errors }, HttpStatus.NOT_FOUND);
    }
    return this.buildUserRO(user);
  }

  public async findByEmail(email: string): Promise<UserRO> {
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
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    const result = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        countries: user.countries.map(
          (countryEntity): string => countryEntity.countryCode,
        ),
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

  private buildUserRO(user: UserEntity): UserRO {
    const userRO = {
      id: user.id,
      email: user.email,
      token: this.generateJWT(user),
    };

    return { user: userRO };
  }
}
