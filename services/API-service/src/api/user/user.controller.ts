import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
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
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDecorator } from './user.decorator';
import { UserResponseObject } from './user.model';
import { UserService } from './user.service';
import { UserRole } from './user-role.enum';

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
  @ApiOperation({ summary: 'Get list of users' })
  @ApiQuery({ name: 'countryCodeISO3', required: false, type: 'string' })
  @ApiQuery({ name: 'disasterType', required: false, enum: DisasterType })
  @ApiResponse({ status: 200, description: 'List users' })
  @Get()
  public async getUsers(
    @Query()
    {
      countryCodeISO3,
      disasterType,
    }: {
      countryCodeISO3?: string;
      disasterType?: DisasterType;
    },
  ) {
    return this.userService.findUsers(countryCodeISO3, disasterType);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Sign-up new user' })
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
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return await this.userService.buildUserRO(user);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Change password of user' })
  @Post('change-password')
  public async update(
    @UserDecorator('userId') loggedInUserId: string,
    @Body() userData: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(loggedInUserId, userData);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Update user properties' })
  @ApiQuery({ name: 'email', required: true, type: 'string' })
  @Patch()
  public async updateUser(
    @Body() updateUserData: UpdateUserDto,
    @Query('email') email: string,
  ): Promise<UserResponseObject> {
    return this.userService.updateUser(email, updateUserData);
  }
}
