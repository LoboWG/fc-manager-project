import { Injectable, OnModuleInit } from '@nestjs/common';
// On utilise notre nouvel alias
import { PrismaClient } from '@prisma/client';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}