import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Response } from 'express';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { CountryDisasterType } from '../country/country-disaster.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { CreateUserDto, DeleteUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDecorator } from './user.decorator';
import { User, UserData, UserResponseObject } from './user.model';
import { UserService } from './user.service';
import { USER_ROLE_RANK, UserRole } from './user-role.enum';

@ApiTags('--user--')
@Controller('user')
export class UserController {
  private logger = new Logger('UserController');

  public constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.LocalAdmin)
  @ApiOperation({ summary: 'Read users' })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @ApiResponse({ status: 200, description: 'List users' })
  @Get()
  public async readUsers(
    @Query()
    { countryCodeISO3, disasterType }: Partial<CountryDisasterType>,
    @UserDecorator() user: User,
    @Res() res: Response,
  ) {
    if (countryCodeISO3 && !user.countryCodesISO3.includes(countryCodeISO3)) {
      const message = `You cannot view users from country ${countryCodeISO3}`;
      return res.status(HttpStatus.FORBIDDEN).send({ message });
    }

    let countryCodesISO3 = user.countryCodesISO3;
    if (countryCodeISO3) {
      countryCodesISO3 = [countryCodeISO3];
    }
    if (user.userRole === UserRole.Admin && !countryCodeISO3) {
      countryCodesISO3 = [];
    }

    let disasterTypes: DisasterType[] = [];
    if (disasterType) {
      disasterTypes = [disasterType];
    }

    try {
      const users = await this.userService.findUsers(
        countryCodesISO3,
        disasterTypes,
      );

      return res
        .status(HttpStatus.OK)
        .send(users.map((user) => this.userService.getUser(user)));
    } catch (error) {
      this.logger.error(`Failed to read users: ${error}`);

      const message = 'Failed to read users';
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).send({ message });
    }
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.LocalAdmin)
  @ApiOperation({ summary: 'Add new user' })
  @ApiResponse({ status: 201, description: 'Added user', type: UserData })
  @Post()
  public async createUser(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userService.createUser(createUserDto);

      return res
        .status(HttpStatus.CREATED)
        .send(this.userService.getUser(user));
    } catch (error) {
      this.logger.error(`Failed to create user: ${error}`);

      const message = 'Failed to create user';
      return res.status(HttpStatus.BAD_REQUEST).send({ message });
    }
  }

  @ApiOperation({ summary: '[EXTERNALLY USED] Log in existing user' })
  @ApiResponse({
    status: 200,
    description: 'User email and login token',
    type: UserResponseObject,
  })
  @ApiResponse({
    status: 403,
    description: 'A user with these credentials is not found.',
  })
  @Post('login')
  public async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const user = await this.userService.login(loginUserDto);
    if (!user) {
      const message = 'Invalid login';
      return res.status(HttpStatus.UNAUTHORIZED).send({ message });
    }

    const userWithToken = await this.userService.getUserWithToken(user, true);

    return res.status(HttpStatus.OK).send(userWithToken);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update user properties' })
  @ApiQuery({ name: 'userId', required: false, type: 'string' })
  @Patch()
  public async updateUser(
    @UserDecorator() user: User,
    @Query('userId') targetUserId: string,
    @Body() updateUserData: UpdateUserDto,
    @Res() res: Response,
  ) {
    if (targetUserId) {
      const isUserAdmin = await this.userService.isUserAdmin(
        user.userId,
        targetUserId,
      );
      // any admin can invite a user to a country
      const isInvite =
        updateUserData.countryCodesISO3?.length > 0 &&
        [UserRole.Admin, UserRole.LocalAdmin].includes(user.userRole);

      if (!isUserAdmin && !isInvite) {
        const message = `You are not allowed to update user ${targetUserId}`;
        return res.status(HttpStatus.FORBIDDEN).send({ message });
      }

      if (
        updateUserData.userRole &&
        USER_ROLE_RANK[updateUserData.userRole] < USER_ROLE_RANK[user.userRole]
      ) {
        const allowedRoles = Object.keys(USER_ROLE_RANK).filter(
          (userRole: UserRole) =>
            USER_ROLE_RANK[userRole] >= USER_ROLE_RANK[user.userRole],
        );

        const messages = [
          `You cannot set user role to ${updateUserData.userRole}.`,
          `You can set user role to ${allowedRoles.join(', ')}.`,
        ];
        return res
          .status(HttpStatus.FORBIDDEN)
          .send({ message: messages.join(' ') });
      }

      if (updateUserData.countryCodesISO3) {
        // prevent user from adding others to countries they are not in
        if (
          !updateUserData.countryCodesISO3.every((countryCodeISO3) =>
            user.countryCodesISO3.includes(countryCodeISO3),
          )
        ) {
          const forbiddenCountries = updateUserData.countryCodesISO3.filter(
            (countryCodeISO3) =>
              !user.countryCodesISO3.includes(countryCodeISO3),
          );

          const messages = [
            `You cannot add users to countries ${forbiddenCountries}.`,
            `You can add users to countries ${user.countryCodesISO3.join(', ')}.`,
          ];
          return res
            .status(HttpStatus.FORBIDDEN)
            .send({ message: messages.join(' ') });
        }

        // keep user countries which the admin is not in but the user is
        const targetUser = await this.userService.findById(targetUserId);
        if (!targetUser) {
          const message = `User ${targetUserId} not found`;
          return res.status(HttpStatus.NOT_FOUND).send({ message });
        }

        const immuneCountries = targetUser.countries
          .map(({ countryCodeISO3 }) =>
            !user.countryCodesISO3.includes(countryCodeISO3)
              ? countryCodeISO3
              : null,
          )
          .filter(Boolean);

        updateUserData.countryCodesISO3.push(...immuneCountries);

        if (!isUserAdmin) {
          // if not admin, only invite to countries
          updateUserData = {
            countryCodesISO3: updateUserData.countryCodesISO3,
          };
        }
      }

      const updatedUser = await this.userService.updateUser(
        targetUserId,
        updateUserData,
        true,
      );

      const userWithToken =
        await this.userService.getUserWithToken(updatedUser);

      return res.status(HttpStatus.OK).send(userWithToken);
    }

    const updatedUser = await this.userService.updateUser(
      user.userId,
      updateUserData,
    );

    // include token only if user is updating their own account
    const userWithToken = await this.userService.getUserWithToken(
      updatedUser,
      true,
    );

    return res.status(HttpStatus.OK).send(userWithToken);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @Delete()
  @HttpCode(204)
  public async delete(@Body() { userId }: DeleteUserDto) {
    return this.userService.deleteUser(userId);
  }
}
