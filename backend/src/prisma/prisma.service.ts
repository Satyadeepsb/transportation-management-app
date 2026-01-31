import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // Ensure DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({
      connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });

    this.pool = pool;
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
    await this.pool.end();
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
