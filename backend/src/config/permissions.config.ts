/* eslint-disable prettier/prettier */
/**
 * permissions.config.ts
 * Configuration for user roles and permissions.
 */

export type Role = 'admin' | 'project' | 'user';

export interface PermissionConfig {
  [role: string]: string[];
}

export const permissions: PermissionConfig = {
  admin: [
    'create_project',
    'edit_project',
    'delete_project',
    'view_project',
    'manage_users',
    'assign_roles',
  ],
  project: ['create_project', 'edit_project', 'view_project'],
  user: ['view_project', 'edit_own_tasks', 'create_task'],
};

/**
 * Checks if a role has a specific permission.
 * @param role User role
 * @param permission Permission to check
 */
export function hasPermission(role: Role, permission: string): boolean {
  return permissions[role]?.includes(permission) ?? false;
}
