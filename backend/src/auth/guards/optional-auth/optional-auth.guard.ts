/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '../../../shared/utils/jwt.service';
import { UsersService } from '../../../user/user.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      // No auth header, but that's okay for optional auth
      return true;
    }

    try {
      const token = this.jwtService.extractTokenFromHeader(authHeader);
      const payload = this.jwtService.verifyToken(token);

      // Verify user still exists and is active
      const user = (await this.usersService.findOne(payload.sub)) as {
        id: string;
        email: string;
        role: string;
        name: string;
        is_active: boolean;
      } | null;
      if (user && user.is_active) {
        // Attach user to request if valid
        request['user'] = {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
        };
      }
    } catch {
      // Invalid token, but that's okay for optional auth
      // Just continue without setting user
    }

    return true;
  }
}
