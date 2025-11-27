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
import { User, UserResponseObject } from './user.model';
import { USER_ROLE_RANK, UserRole } from './user-role.enum';

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

  public async login(loginUserDto: LoginUserDto) {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto
        .createHmac('sha256', loginUserDto.password)
        .digest('hex'),
    };

    const user = await this.userRepository.findOne({
      where: findOneOptions,
      relations: this.relations,
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.getUserWithToken(user, true);
  }

  public async create(dto: CreateUserDto): Promise<UserResponseObject> {
    if (dto.whatsappNumber) {
      dto.whatsappNumber = await this.lookupService.lookupAndCorrect(
        dto.whatsappNumber,
      );
    }

    const user = await this.createUser(dto);

    return this.getUserWithToken(user);
  }

  public async createUser(createUserDto: CreateUserDto) {
    const userEntity = new UserEntity();
    userEntity.email = createUserDto.email.toLowerCase();
    userEntity.password = createUserDto.password;
    userEntity.firstName = createUserDto.firstName;
    userEntity.middleName = createUserDto.middleName;
    userEntity.lastName = createUserDto.lastName;
    userEntity.userRole = createUserDto.userRole;
    userEntity.whatsappNumber = createUserDto.whatsappNumber;
    userEntity.countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(createUserDto.countryCodesISO3) },
    });
    userEntity.disasterTypes = await this.disasterTypeRepository.find({
      where: { disasterType: In(createUserDto.disasterTypes) },
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

    return this.getUserWithToken(user, includeToken);
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

    if (updateUserDto.countryCodesISO3 && isAdmin) {
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
    return this.getUserWithToken(updatedUser, !isAdmin);
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
          !updateUserDto.countryCodesISO3.includes(countryCodeISO3),
      )
      .map(({ countryCodeISO3 }) => countryCodeISO3);

    await this.userRepository
      .createQueryBuilder()
      .relation(UserEntity, 'countries')
      .of(user.email)
      .remove(removeCountries);

    // add new countries
    const newCountryCodesISO3 = updateUserDto.countryCodesISO3.filter(
      (countryCodeISO3) =>
        !user.countries
          .map(({ countryCodeISO3 }) => countryCodeISO3)
          .includes(countryCodeISO3),
    );
    const countries = await this.countryRepository.find({
      where: { countryCodeISO3: In(newCountryCodesISO3) },
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

  // check if the user can manage the target user
  public async isUserAdmin(userId: string, targetUserId?: string) {
    // user cannot be their own user admin
    if (userId === targetUserId) {
      return false;
    }

    // user must have user role admin or local admin
    const user = await this.userRepository.findOne({
      where: { userId, userRole: In([UserRole.Admin, UserRole.LocalAdmin]) },
      relations: this.relations,
    });
    if (!user) {
      return false;
    }

    // admin can manage anyone
    if (user.userRole === UserRole.Admin) {
      return true;
    }

    const userCountryCodesISO3 = user.countries.map(
      ({ countryCodeISO3 }) => countryCodeISO3,
    );

    // target user must be in user countries
    if (!targetUserId) {
      return false;
    }
    const targetUser = await this.userRepository.findOne({
      where: {
        userId: targetUserId,
        countries: { countryCodeISO3: In(userCountryCodesISO3) },
      },
      relations: this.relations,
    });
    if (!targetUser) {
      return false;
    }

    // target user user role must be lower or equal to user user role
    return USER_ROLE_RANK[targetUser.userRole] >= USER_ROLE_RANK[user.userRole];
  }

  private async getToken(user: User) {
    const today = new Date();
    const exp = new Date(today); // token expiration time
    exp.setDate(today.getDate() + 60); // token valid for 60 days

    const token = jwt.sign(
      { ...user, exp: exp.getTime() / 1000 },
      process.env.SECRET,
    );

    return token;
  }

  private getUser = (userEntity: UserEntity) => ({
    userId: userEntity.userId,
    email: userEntity.email,
    firstName: userEntity.firstName,
    middleName: userEntity.middleName,
    lastName: userEntity.lastName,
    userRole: userEntity.userRole,
    whatsappNumber: userEntity.whatsappNumber,
    countryCodesISO3: userEntity.countries
      ?.map(({ countryCodeISO3 }) => countryCodeISO3)
      .sort(),
    disasterTypes: userEntity.disasterTypes
      ?.map(({ disasterType }) => disasterType)
      .sort(),
  });

  // REFACTOR: getUserWithToken should always include token
  private getUserWithToken = async (
    userEntity: UserEntity,
    includeToken = false,
  ) => {
    const user = this.getUser(userEntity);
    const token = includeToken ? await this.getToken(user) : null;

    return { user: { ...user, token } };
  };

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

    return users.map((user) => this.getUser(user));
  }

  public async deleteUser(userId: string) {
    await this.userRepository.delete({ userId });
  }
}
