export interface Project {
  id: string;
  name: string;
  description?: string;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // The user assigned to this project (if any)
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  // Project completion status
  isCompleted?: boolean;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  isCompleted?: boolean;
}
