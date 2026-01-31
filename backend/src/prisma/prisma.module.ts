import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * @Global decorator makes PrismaService available throughout the application
 * without needing to import PrismaModule in every feature module
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
