import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { validate } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { FindOptionsWhere, In, Not, Repository } from 'typeorm';

import { DUNANT_EMAIL } from '../../config';
import { CountryEntity } from '../country/country.entity';
import { DisasterTypeEntity } from '../disaster-type/disaster-type.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { LookupService } from '../notification/lookup/lookup.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import { UserResponseObject } from './user.model';
import { UserRole } from './user-role.enum';

const CREATE_ERROR = 'Failed to create user';
const NOT_FOUND = 'User not found';

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

  public async findById(
    userId: string,
    includeToken = false,
  ): Promise<UserResponseObject> {
    const user = await this.userRepository.findOne({
      where: { userId },
      relations: this.relations,
    });
    if (!user) {
      throw new UnauthorizedException(NOT_FOUND);
    }

    return this.buildUserRO(user, includeToken);
  }

  public async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    isAdmin = false,
  ): Promise<UserResponseObject> {
    const where = { userId };

    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new NotFoundException(NOT_FOUND);
    }

    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }

    if (updateUserDto.middleName !== undefined) {
      user.middleName = updateUserDto.middleName;
    }

    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }

    if (updateUserDto.whatsappNumber) {
      user.whatsappNumber = await this.lookupService.lookupAndCorrect(
        updateUserDto.whatsappNumber,
      );
    }

    if (updateUserDto.userRole && isAdmin) {
      user.userRole = updateUserDto.userRole;
    }

    await this.userRepository.save(user);

    if (updateUserDto.countries && isAdmin) {
      await this.updateUserCountries(where, updateUserDto);
    }

    if (updateUserDto.disasterTypes) {
      await this.updateUserDisasterTypes(where, updateUserDto);
    }

    const updatedUser = await this.userRepository.findOne({
      where,
      relations: this.relations,
    });

    // include token only if user is updating their own account
    return this.buildUserRO(updatedUser, !isAdmin);
  }

  private async updateUserCountries(
    where: FindOptionsWhere<UserEntity>,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where,
      relations: ['countries'],
    });

    // remove countries
    const removeCountries = user.countries
      .filter(
        ({ countryCodeISO3 }) =>
          !updateUserDto.countries.includes(countryCodeISO3),
      )
      .map(({ countryCodeISO3 }) => countryCodeISO3);

    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'countries')
      .of(user.email)
      .remove(removeCountries);

    // add new countries
    const newCountries = updateUserDto.countries.filter(
      (countryCodeISO3) =>
        !user.countries
          .map(({ countryCodeISO3 }) => countryCodeISO3)
          .includes(countryCodeISO3),
    );
    const countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(newCountries) },
    });
    user.countries = countries;

    await this.userRepository.save(user);
  }

  private async updateUserDisasterTypes(
    where: FindOptionsWhere<UserEntity>,
    updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userRepository.findOne({
      where,
      relations: ['disasterTypes'],
    });

    // remove disaster types
    const removeDisasterTypes = user.disasterTypes
      .filter(
        ({ disasterType }) =>
          !updateUserDto.disasterTypes.includes(disasterType),
      )
      .map(({ disasterType }) => disasterType);

    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'disasterTypes')
      .of(user.email)
      .remove(removeDisasterTypes);

    // add new disaster types
    const newDisasterTypes = updateUserDto.disasterTypes.filter(
      (disasterType) =>
        !user.disasterTypes
          .map(({ disasterType }) => disasterType)
          .includes(disasterType),
    );
    const disasterTypes = await this.disasterTypeRepository.find({
      where: { disasterType: In(newDisasterTypes) },
    });
    user.disasterTypes = disasterTypes;

    await this.userRepository.save(user);
  }

  public async isAdmin(userId: string, targetUserId?: string) {
    // user cannot be their own admin
    if (userId === targetUserId) {
      return false;
    }

    // user must be admin or local admin
    const user = await this.userRepository.findOne({
      where: { userId, userRole: In([UserRole.Admin, UserRole.LocalAdmin]) },
      relations: this.relations,
    });
    if (!user) {
      return false;
    }

    // global admin can manage anyone
    if (user.userRole === UserRole.Admin) {
      return true;
    }

    const userCountries = user.countries.map(
      ({ countryCodeISO3 }) => countryCodeISO3,
    );

    // target user must be in one of the admin's countries
    if (!targetUserId) {
      return false;
    }
    const targetUser = await this.userRepository.findOne({
      where: {
        userId: targetUserId,
        countries: { countryCodeISO3: In(userCountries) },
      },
      relations: this.relations,
    });

    return !!targetUser;
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
        whatsappNumber: user.whatsappNumber,
        countries: user.countries.map(({ countryCodeISO3 }) => countryCodeISO3),
        disasterTypes: user.disasterTypes.map(
          ({ disasterType }) => disasterType,
        ),
        exp: exp.getTime() / 1000,
      },
      process.env.SECRET,
    );

    return result;
  }

  public buildUserRO = async (
    user: UserEntity,
    includeToken = false,
  ): Promise<UserResponseObject> => ({
    user: {
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      userRole: user.userRole,
      whatsappNumber: user.whatsappNumber,
      token: includeToken ? await this.generateJWT(user) : null,
      countries: user.countries?.map(({ countryCodeISO3 }) => countryCodeISO3),
      disasterTypes: user.disasterTypes?.map(
        ({ disasterType }) => disasterType,
      ),
    },
  });

  public async findUsers(
    countryCodesISO3: string[],
    disasterTypes: DisasterType[],
  ) {
    const where: FindOptionsWhere<UserEntity> = { email: Not(DUNANT_EMAIL) };
    if (countryCodesISO3.length) {
      where.countries = { countryCodeISO3: In(countryCodesISO3) };
    }
    if (disasterTypes.length) {
      where.disasterTypes = { disasterType: In(disasterTypes) };
    }

    const users = await this.userRepository.find({
      where,
      relations: this.relations,
    });

    return users.map((user) => {
      const countries = user.countries.map(
        ({ countryCodeISO3 }) => countryCodeISO3,
      );

      const disasterTypes = user.disasterTypes.map(
        ({ disasterType }) => disasterType,
      );

      return { ...user, countries, disasterTypes };
    });
  }

  public async deleteUser(userId: string) {
    await this.userRepository.delete({ userId });
  }
}
