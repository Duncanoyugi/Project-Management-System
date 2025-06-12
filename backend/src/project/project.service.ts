/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { getPrismaClient } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './interfaces/project.interface';

@Injectable()
export class ProjectsService {
  private prisma = getPrismaClient();

  async create(data: CreateProjectDto): Promise<Project> {
    try {
      const project = await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          endDate: new Date(data.endDate),
          isCompleted: false,
        },
      });
      return this.mapPrismaProjectToInterface(project);
    } catch {
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return projects.map((project) =>
        this.mapPrismaProjectToInterface(project),
      );
    } catch {
      throw new InternalServerErrorException('Failed to retrieve projects');
    }
  }

  async findByCompletion(isCompleted: boolean): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        where: { isCompleted },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return projects.map((project) =>
        this.mapPrismaProjectToInterface(project),
      );
    } catch {
      throw new InternalServerErrorException('Failed to retrieve projects');
    }
  }

  async findByAssignedUser(userId: string): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        where: { assignedUserId: userId },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return projects.map((project) =>
        this.mapPrismaProjectToInterface(project),
      );
    } catch {
      throw new InternalServerErrorException('Failed to retrieve projects');
    }
  }

  async findOne(id: string): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      if (!project) {
        throw new NotFoundException(`Project with ID ${id} not found`);
      }
      return this.mapPrismaProjectToInterface(project);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve project');
    }
  }

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.endDate && { endDate: new Date(data.endDate) }),
        },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      return this.mapPrismaProjectToInterface(project);
    } catch {
      throw new InternalServerErrorException('Failed to update project');
    }
  }

  async assignProject(projectId: string, userId: string): Promise<Project> {
    try {
      // Check if user already has a project
      const existing = await this.prisma.project.findFirst({
        where: { assignedUserId: userId },
      });
      if (existing) {
        throw new ConflictException('User is already assigned to a project');
      }
      const project = await this.prisma.project.update({
        where: { id: projectId },
        data: { assignedUserId: userId },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      // TODO: Send email to user about assignment
      return this.mapPrismaProjectToInterface(project);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to assign project');
    }
  }

  async markComplete(id: string): Promise<Project> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: { isCompleted: true },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      // TODO: Send email to admin about completion
      return this.mapPrismaProjectToInterface(project);
    } catch {
      throw new InternalServerErrorException(
        'Failed to mark project as complete',
      );
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.project.delete({ where: { id } });
      return { message: 'Project deleted successfully' };
    } catch {
      throw new InternalServerErrorException('Failed to delete project');
    }
  }

  private mapPrismaProjectToInterface(project: any): Project {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      assignedUser: project.assignedUser
        ? {
            id: project.assignedUser.id,
            name: project.assignedUser.name,
            email: project.assignedUser.email,
          }
        : undefined,
      isCompleted: project.isCompleted,
    };
  }
}
