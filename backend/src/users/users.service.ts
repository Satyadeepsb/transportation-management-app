import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all users (with optional role filter)
   */
  async findAll(role?: UserRole): Promise<User[]> {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find a single user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get all drivers (for assignment dropdown)
   */
  async findAllDrivers(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.DRIVER,
        isActive: true,
      },
      orderBy: { firstName: 'asc' },
    });
  }
}
