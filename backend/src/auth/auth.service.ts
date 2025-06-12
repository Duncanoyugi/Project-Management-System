/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../user/user.service';
import { JwtService } from '../shared/utils/jwt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload } from './interface/auth.interface';
import * as bcrypt from 'bcryptjs';
import { UserRole } from './enums/permission.enum';
import { MailerService } from '../shared/utils/mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      // If user not found, continue with registration
    }

    try {
      // Create user
      const user = await this.usersService.create({
        name: registerDto.name,
        email: registerDto.email,
        phone: registerDto.phone,
        password: registerDto.password,
        role:
          typeof registerDto.role === 'string' &&
          Object.values(UserRole).includes(registerDto.role as UserRole)
            ? (registerDto.role as UserRole)
            : UserRole.USER,
      });

      try {
        await this.mailerService.sendWelcomeEmail(user.email, {
          name: user.name,
          email: user.email,
        });
      } catch (emailError) {
        console.warn(
          `Failed to send welcome email to ${user.email}:`,
          emailError.message,
        );
      }
      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: UserRole[user.role as keyof typeof UserRole],
      };

      const access_token = this.jwtService.generateToken(payload);

      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: UserRole[user.role as keyof typeof UserRole],
        },
      };
    } catch {
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);

      if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }
      // Generate JWT token
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: UserRole[user.role as keyof typeof UserRole],
      };

      const access_token = this.jwtService.generateToken(payload);

      return {
        access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: UserRole[user.role as keyof typeof UserRole],
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verifyToken(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(token: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verifyToken(token);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || !user.is_active) {
        throw new UnauthorizedException('User not found or inactive');
      }
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: UserRole[user.role as keyof typeof UserRole],
      };

      const access_token = this.jwtService.generateToken(newPayload);

      return { access_token };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
