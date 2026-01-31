import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Creates a NestJS testing module with mocked PrismaService
 * @param providers - Array of providers to include in the module
 * @returns Compiled testing module
 */
export async function createTestingModule(providers: any[]) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ...providers,
      {
        provide: PrismaService,
        useValue: createMockPrismaService(),
      },
    ],
  }).compile();

  return module;
}

/**
 * Creates a mock PrismaService with jest.fn() for all database operations
 * @returns Mocked PrismaService
 */
export function createMockPrismaService() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    shipment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };
}
