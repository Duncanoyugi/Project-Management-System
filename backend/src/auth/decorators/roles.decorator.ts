import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
export const RequireAnyRole = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY + '_ANY', roles);
export const RequireAllRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY + '_ALL', roles);
export const RequireRolesOrAny = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY + '_OR_ANY', roles);
