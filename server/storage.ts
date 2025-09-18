import { type User, type InsertUser, type InsertProject, type SelectProject } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Project management methods
  getProject(id: number): Promise<SelectProject | undefined>;
  getProjectsByType(type: string): Promise<SelectProject[]>;
  getAllProjects(): Promise<SelectProject[]>;
  createProject(project: InsertProject): Promise<SelectProject>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<SelectProject | undefined>;
  deleteProject(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private projects: Map<number, SelectProject>;
  private projectIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectIdCounter = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProject(id: number): Promise<SelectProject | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByType(type: string): Promise<SelectProject[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.type === type,
    );
  }

  async getAllProjects(): Promise<SelectProject[]> {
    return Array.from(this.projects.values());
  }

  async createProject(insertProject: InsertProject): Promise<SelectProject> {
    const id = this.projectIdCounter++;
    const now = new Date();
    const project: SelectProject = {
      ...insertProject,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<SelectProject | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      return undefined;
    }
    
    const updatedProject: SelectProject = {
      ...existingProject,
      ...updateData,
      updatedAt: new Date(),
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
