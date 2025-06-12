export enum Resource {
  USER = 'user',
  PROJECT = 'project',
  DOCUMENT = 'document',
  SYSTEM = 'system',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export enum Permission {
  // User Management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  READ_ALL_USERS = 'read_all_users',
  CHANGE_USER_PASSWORD = 'change_user_password',

  // Project Management
  CREATE_PROJECT = 'create_project',
  READ_PROJECT = 'read_project',
  UPDATE_PROJECT = 'update_project',
  DELETE_PROJECT = 'delete_project',
  ASSIGN_PROJECT = 'assign_project',
  READ_ALL_PROJECTS = 'read_all_projects',
  MARK_PROJECT_COMPLETE = 'mark_project_complete',

  // Document Management
  UPLOAD_DOCUMENT = 'upload_document',
  READ_DOCUMENT = 'read_document',
  DELETE_DOCUMENT = 'delete_document',

  // Reports and Analytics
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics',

  // System Administration
  MANAGE_SYSTEM = 'manage_system',
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  MANAGE_PERMISSIONS = 'manage_permissions',
}
