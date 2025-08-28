import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { In, Repository } from 'typeorm';

import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { LookupService } from '../notification/lookup/lookup.service';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import { UserData, UserResponseObject } from './user.model';
import { UserRole } from './user-role.enum';

const CREATE_ERROR = 'Failed to create user';
const NOT_FOUND = 'User not found';
const FORBIDDEN = 'Action not allowed';

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
    return await this.userRepository.find({ relations: this.relations });
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
    if (dto.whatsappNumber) {
      dto.whatsappNumber = await this.lookupService.lookupAndCorrect(
        dto.whatsappNumber,
      );
    }

    const user = await this.createUser(dto);

    return this.buildUserRO(user);
  }

  public async createUser(dto: CreateUserDto) {
    const userEntity = new UserEntity();
    userEntity.email = dto.email.toLowerCase();
    userEntity.password = dto.password;
    userEntity.firstName = dto.firstName;
    userEntity.middleName = dto.middleName;
    userEntity.lastName = dto.lastName;
    userEntity.userRole = dto.userRole;
    userEntity.whatsappNumber = dto.whatsappNumber;
    userEntity.countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(dto.countryCodesISO3) },
    });
    userEntity.disasterTypes = await this.disasterTypeRepository.find({
      where: { disasterType: In(dto.disasterTypes) },
    });

    const errors = await validate(userEntity);
    if (errors.length > 0) {
      throw new BadRequestException(CREATE_ERROR);
    }

    try {
      return await this.userRepository.save(userEntity);
    } catch {
      throw new BadRequestException(CREATE_ERROR);
    }
  }

  public async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      relations: this.relations,
    });
  }

  public async findById(userId: string): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: this.relations,
    });
    if (!user) {
      throw new UnauthorizedException(NOT_FOUND);
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
    });
    if (!loggedInUser) {
      throw new NotFoundException(NOT_FOUND);
    }

    if (dto.email) {
      if (loggedInUser.userRole !== UserRole.Admin) {
        throw new ForbiddenException(FORBIDDEN);
      }
      updateUser = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (!updateUser) {
        throw new NotFoundException(NOT_FOUND);
      }
    } else {
      updateUser = loggedInUser;
    }
    updateUser.password = dto.password;
    await this.userRepository.save(updateUser);
    return this.findById(updateUser.userId);
  }

  public async updateUser(
    email: string,
    updateUserData: UpdateUserDto,
  ): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(NOT_FOUND);
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
          ? user.disasterTypes.map(({ disasterType }) => disasterType)
          : (await this.disasterTypeRepository.find()).map(
              ({ disasterType }) => disasterType,
            ),
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

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
