import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }

  /**
   * Connect to database when the module initializes
   */
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected successfully');
  }

  /**
   * Gracefully disconnect when the application shuts down
   */
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('👋 Database disconnected');
  }

  /**
   * Helper method to clean database (useful for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    // Delete in correct order due to foreign key constraints
    await this.shipment.deleteMany();
    await this.user.deleteMany();
  }
}
