import { UserRole } from 'generated/prisma';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  profileImage?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Add projectId if you want to reference assigned project
  projectId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  projectId?: string;
}
