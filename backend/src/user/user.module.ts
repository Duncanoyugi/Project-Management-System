import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { DatabaseService } from 'src/database/connection.service';
import { JwtService } from '../shared/utils/jwt.service';
import { ConfigModule } from '@nestjs/config';
import { PermissionService } from 'src/auth/services/permission.service';
import { CloudinaryService } from 'src/shared/utils/cloudinary/cloudinary.service';

@Module({
  imports: [ConfigModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    DatabaseService,
    JwtService,
    CloudinaryService,
    PermissionService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
