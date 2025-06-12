import { Injectable } from '@nestjs/common';
import { UserRole, Permission } from '../enums/permission.enum';
import { Resource } from '../enums/resources.enum';
import { Action } from '../enums/action.enum';
import { permissions } from '../../config/permissions.config';

// Define ROLE_HIERARCHY locally if not exported from config
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.ADMIN]: 2,
  [UserRole.USER]: 1,
};

@Injectable()
export class PermissionService {
  hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = permissions[role] || [];
    return rolePermissions.includes(permission);
  }

  canPerformAction(
    role: UserRole,
    action: Action,
    resource: Resource,
  ): boolean {
    const permission = this.getPermissionForAction(action, resource);
    return permission ? this.hasPermission(role, permission) : false;
  }

  getRolePermissions(role: UserRole): Permission[] {
    return (permissions[role] || [])
      .map((perm: string) => Permission[perm as keyof typeof Permission])
      .filter(Boolean) as Permission[];
  }

  canAccessOwnResource(
    role: UserRole,
    action: Action,
    resource: Resource,
    ownerId: number,
    requesterId: number,
  ): boolean {
    // Only one admin in your project, always allow admin
    if (role === UserRole.ADMIN) {
      return this.canPerformAction(role, action, resource);
    }

    // User can access their own resource
    if (ownerId === requesterId) {
      return this.canPerformAction(role, action, resource);
    }

    return false;
  }

  checkHierarchicalPermission(role: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[requiredRole];
  }

  private getPermissionForAction(
    action: Action,
    resource: Resource,
  ): Permission | null {
    const permissionKey =
      `${action.toUpperCase()}_${resource.toUpperCase()}` as keyof typeof Permission;
    return Permission[permissionKey] || null;
  }

  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(role, permission),
    );
  }

  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(role, permission),
    );
  }
}
