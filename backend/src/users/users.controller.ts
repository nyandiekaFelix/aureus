import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  getMe(@CurrentUser() user: any) {
    return this.usersService.findByFirebaseUid(user.uid);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser() user: any) {
    const dbUser = await this.usersService.findByFirebaseUid(user.uid);
    return this.usersService.getProfile(dbUser.id);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    const dbUser = await this.usersService.findByFirebaseUid(user.uid);
    return this.usersService.updateProfile(dbUser.id, updateProfileDto);
  }
}


