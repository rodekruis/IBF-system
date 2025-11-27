import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';
import { CountryDisasterType } from '../country/country-disaster.entity';
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { CreateUserDto, DeleteUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDecorator } from './user.decorator';
import { User, UserResponseObject } from './user.model';
import { UserService } from './user.service';
import { USER_ROLE_RANK, UserRole } from './user-role.enum';

@ApiTags('--user--')
@Controller('user')
export class UserController {
  public constructor(private userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin, UserRole.LocalAdmin)
  @ApiOperation({ summary: 'Get users' })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @ApiResponse({ status: 200, description: 'List users' })
  @Get()
  public async getUsers(
    @Query()
    { countryCodeISO3, disasterType }: Partial<CountryDisasterType>,
    @UserDecorator() user: User,
  ) {
    if (countryCodeISO3 && !user.countryCodesISO3.includes(countryCodeISO3)) {
      throw new ForbiddenException(
        `You cannot view users from country ${countryCodeISO3}`,
      );
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

    return this.userService.findUsers(countryCodesISO3, disasterTypes);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Add new user' })
  @ApiResponse({
    status: 201,
    description: 'New user email and login token',
    type: UserResponseObject,
  })
  @Post()
  public async create(
    @Body() userData: CreateUserDto,
  ): Promise<UserResponseObject> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: '[EXTERNALLY USED] Log in existing user' })
  @ApiResponse({
    status: 201,
    description:
      'Email and login token of logged-in user. To use other protected endpoints, copy this token and paste in in the "Authorize" button on top of this page.',
    type: UserResponseObject,
  })
  @ApiResponse({
    status: 403,
    description: 'A user with these credentials is not found.',
  })
  @Post('login')
  public async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseObject> {
    return await this.userService.login(loginUserDto);
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
  ): Promise<UserResponseObject> {
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
        throw new ForbiddenException(
          `You are not allowed to update user ${targetUserId}`,
        );
      }

      if (
        updateUserData.userRole &&
        USER_ROLE_RANK[updateUserData.userRole] < USER_ROLE_RANK[user.userRole]
      ) {
        const allowedRoles = Object.keys(USER_ROLE_RANK).filter(
          (userRole: UserRole) =>
            USER_ROLE_RANK[userRole] >= USER_ROLE_RANK[user.userRole],
        );

        throw new ForbiddenException(
          `You cannot set user role to ${updateUserData.userRole}. You can set user role to ${allowedRoles.join(', ')}.`,
        );
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

          throw new ForbiddenException(
            `You cannot add users to countries ${forbiddenCountries}. You can add users to countries ${user.countryCodesISO3.join(', ')}.`,
          );
        }

        // keep user countries which the admin is not in but the user is
        const targetUser = await this.userService.findById(targetUserId);
        const immuneCountries = targetUser.user.countryCodesISO3.filter(
          (countryCodeISO3) => !user.countryCodesISO3.includes(countryCodeISO3),
        );

        updateUserData.countryCodesISO3.push(...immuneCountries);

        if (!isUserAdmin) {
          // if not admin, only invite to countries
          updateUserData = {
            countryCodesISO3: updateUserData.countryCodesISO3,
          };
        }
      }

      return this.userService.updateUser(targetUserId, updateUserData, true);
    }

    return this.userService.updateUser(user.userId, updateUserData);
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
