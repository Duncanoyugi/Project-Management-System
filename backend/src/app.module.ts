import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './user/user.module';
import { ProjectsModule } from './project/project.module';
import { AuthModule } from './auth/auth.module';
// import { CloudinaryService } from './shared/utils/cloudinary/cloudinary.service';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './shared/utils/mailer/mailer.service';

@Module({
  imports: [UsersModule, ProjectsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, ConfigService, MailerService],
})
export class AppModule {}
