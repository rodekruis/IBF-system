import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  Post,
  Query,
  UnauthorizedException,
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
import { DisasterType } from '../disaster-type/disaster-type.enum';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDecorator } from './user.decorator';
import { User, UserResponseObject } from './user.model';
import { UserService } from './user.service';
import { USER_ROLE_RANK, UserRole } from './user-role.enum';

// REFACTOR: find a way to use this interface across the app
interface GetUsersQuery {
  countryCodeISO3: string;
  disasterType: DisasterType;
}

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
    { countryCodeISO3, disasterType }: Partial<GetUsersQuery>,
    @UserDecorator() user: User,
  ) {
    if (countryCodeISO3 && !user.countries.includes(countryCodeISO3)) {
      throw new ForbiddenException(
        `You cannot view users from country ${countryCodeISO3}`,
      );
    }

    let countries = user.countries;
    if (countryCodeISO3) {
      countries = [countryCodeISO3];
    }
    if (user.userRole === UserRole.Admin) {
      countries = [];
    }

    let disasterTypes: DisasterType[] = [];
    if (disasterType) {
      disasterTypes = [disasterType];
    }

    return this.userService.findUsers(countries, disasterTypes);
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
    const user = await this.userService.findOne(loginUserDto);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return await this.userService.buildUserRO(user, true);
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
      const isAdmin = await this.userService.isAdmin(user.userId, targetUserId);
      if (!isAdmin) {
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

      if (updateUserData.countries) {
        // prevent user from adding others to countries they are not in
        if (
          !updateUserData.countries.every((countryCodeISO3) =>
            user.countries.includes(countryCodeISO3),
          )
        ) {
          const forbiddenCountries = updateUserData.countries.filter(
            (countryCodeISO3) => !user.countries.includes(countryCodeISO3),
          );

          throw new ForbiddenException(
            `You cannot add users to countries ${forbiddenCountries}. You can add users to countries ${user.countries.join(', ')}.`,
          );
        }

        // keep user countries which the admin is not in but the user is
        const targetUser = await this.userService.findById(targetUserId);
        const immuneCountries = targetUser.user.countries.filter(
          (countryCodeISO3) => !user.countries.includes(countryCodeISO3),
        );

        updateUserData.countries.push(...immuneCountries);
      }

      return this.userService.updateUser(targetUserId, updateUserData, true);
    }

    return this.userService.updateUser(user.userId, updateUserData);
  }
}
