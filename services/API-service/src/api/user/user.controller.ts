import {
  Post,
  Body,
  Controller,
  UsePipes,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseObject } from './user.model';
import { CreateUserDto, LoginUserDto, UpdatePasswordDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ValidationPipe } from '../../shared/pipes/validation.pipe';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles.guard';
import { UserRole } from './user-role.enum';
import { Roles } from '../../roles.decorator';
import { UserDecorator } from './user.decorator';

@ApiTags('-- user --')
@Controller('user')
export class UserController {
  private readonly userService: UserService;
  public constructor(userService: UserService) {
    this.userService = userService;
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
  @UsePipes(new ValidationPipe())
  @Post()
  public async create(
    @Body() userData: CreateUserDto,
  ): Promise<UserResponseObject> {
    return this.userService.create(userData);
  }

  @ApiOperation({ summary: 'Log in existing user' })
  @UsePipes(new ValidationPipe())
  @Post('login')
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
  public async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<UserResponseObject> {
    const _user = await this.userService.findOne(loginUserDto);
    if (!_user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const token = await this.userService.generateJWT(_user);
    const { email, userRole } = _user;
    const user = {
      email,
      token,
      userRole,
    };

    return { user };
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Change password of user' })
  @Post('change-password')
  public async update(
    @UserDecorator('userId') loggedInUserId: string,
    @Body() userData: UpdatePasswordDto,
  ): Promise<any> {
    return this.userService.update(loggedInUserId, userData);
  }
}
