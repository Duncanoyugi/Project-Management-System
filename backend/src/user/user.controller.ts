/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { ApiResponse } from 'src/shared/interfaces/api-response.interface';
import { User } from './interfaces/user.interface';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission/permission.guard';
import { ResourceActionGuard } from '../auth/guards/resource-action/resource-action.guard';
import { ResourceOwnerGuard } from '../auth/guards/resource-owner/resource-owner.guard';
import { RequirePermissions } from '../auth/decorators/permission.decorator';
import { RequireResourceAction } from '../auth/decorators/resource-action.decorator';
import { CheckResourceOwner } from '../auth/decorators/resource-owner.decorator';
import {
  CurrentUser,
  CurrentUserData,
} from '../auth/decorators/current-user.decorator';
import { Permission } from '../auth/enums/permission.enum';
import { Action } from '../auth/enums/action.enum';
import { Resource } from '../auth/enums/resources.enum';
import { UserRole } from 'generated/prisma';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Multer } from 'multer';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.CREATE_USER)
  async create(@Body() data: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.create(data);
      const { password, ...userWithoutPassword } = user;
      return {
        sucess: true,
        message: 'User created successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.READ_ALL_USERS)
  async findAll(
    @Query('active') active?: string,
    @Query('role') role?: UserRole,
  ): Promise<ApiResponse<User[]>> {
    try {
      let users: User[];

      if (role) {
        users = await this.usersService.findByRole(role);
      } else if (active === 'true') {
        users = await this.usersService.findActive();
      } else {
        users = await this.usersService.findAll();
      }

      const usersWithoutPasswords = users.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      });

      return {
        sucess: true,
        message: `Retrieved ${users.length} users`,
        data: usersWithoutPasswords,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  @Get('profile')
  async getProfile(
    @CurrentUser() user: CurrentUserData,
  ): Promise<ApiResponse<CurrentUserData>> {
    return {
      sucess: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Get(':id')
  @UseGuards(ResourceActionGuard, ResourceOwnerGuard)
  @RequireResourceAction(Action.READ, Resource.USER)
  @CheckResourceOwner('id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findOne(id);
      const { password, ...userWithoutPassword } = user;
      return {
        sucess: true,
        message: 'User found',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'User not found',
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  @Patch(':id')
  @UseGuards(ResourceActionGuard, ResourceOwnerGuard)
  @RequireResourceAction(Action.UPDATE, Resource.USER)
  @CheckResourceOwner('id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<ApiResponse<User>> {
    try {
      if (currentUser.role === UserRole.USER) {
        const { role, ...userAllowedData } = data;
        data = userAllowedData;
      }

      const user = await this.usersService.update(id, data);
      const { password, ...userWithoutPassword } = user;
      return {
        sucess: true,
        message: 'User updated successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  @Post(':id/profile-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Multer.File,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.uploadProfileImage(id, file);
      const { password, ...userWithoutPassword } = user;
      return {
        sucess: true,
        message: 'Profile image uploaded successfully',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Delete(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.DELETE_USER)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<null>> {
    try {
      const result = await this.usersService.remove(id);
      return {
        sucess: true,
        message: result.message,
      };
    } catch (error) {
      return {
        sucess: false,
        message: 'Failed to deactivate user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
