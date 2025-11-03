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
import { UserRole } from './user-role.enum';

// REFACTOR: find a way to use this interface across the app
interface GetUsersQuery {
  countryCodeISO3: string;
  disasterType: DisasterType;
}

@ApiTags('--user--')
@Controller('user')
export class UserController {
  private readonly userService: UserService;
  public constructor(userService: UserService) {
    this.userService = userService;
  }

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
    @UserDecorator('userId') userId: string,
    @Query('userId') targetUserId: string,
    @Body() updateUserData: UpdateUserDto,
  ): Promise<UserResponseObject> {
    if (targetUserId) {
      const isAdmin = await this.userService.isAdmin(userId, targetUserId);
      if (!isAdmin) {
        throw new ForbiddenException(
          `You are not allowed to update user ${targetUserId}`,
        );
      }

      return this.userService.updateUser(targetUserId, updateUserData, true);
    }

    return this.userService.updateUser(userId, updateUserData);
  }
}
