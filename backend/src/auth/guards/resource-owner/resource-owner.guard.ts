/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../services/permission.service';
import { Action } from '../../enums/action.enum';
import { Resource } from '../../enums/resources.enum';
import { RESOURCE_OWNER_KEY } from '../../decorators/resource-owner.decorator';
import { RESOURCE_ACTION_KEY } from '../../decorators/resource-action.decorator';
import { UsersService } from '../../../user/user.service';
import { UserRole } from 'generated/prisma';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownerField = this.reflector.getAllAndOverride<string>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    const resourceAction = this.reflector.getAllAndOverride<{
      action: Action;
      resource: Resource;
    }>(RESOURCE_ACTION_KEY, [context.getHandler(), context.getClass()]);

    if (!ownerField || !resourceAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.ADMIN) {
      // Only one admin, allow all
      return true;
    }

    const resourceId = parseInt(String(request.params.id), 10);
    if (!resourceId) {
      throw new NotFoundException('Resource ID not found');
    }

    const ownerId = await this.getResourceOwnerId(
      resourceAction.resource,
      resourceId,
      ownerField,
    );

    const canAccess = this.permissionService.canAccessOwnResource(
      user.role,
      resourceAction.action,
      resourceAction.resource,
      ownerId,
      Number(user.id),
    );

    if (!canAccess) {
      throw new ForbiddenException(
        'Access denied. You can only access your own resources.',
      );
    }

    return true;
  }

  private async getResourceOwnerId(
    resource: Resource,
    resourceId: number,
    ownerField: string,
  ): Promise<number> {
    switch (resource) {
      case Resource.USER:
        return resourceId;
      case Resource.PROJECT:
        // Fetch project and return its assigned userId
        // You should implement a ProjectService and inject it if you want to fetch from DB
        // For now, just return resourceId as a placeholder
        return resourceId;
      case Resource.DOCUMENT:
        // Implement logic if needed
        return resourceId;
      default:
        return resourceId;
    }
  }
}
