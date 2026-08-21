import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NATS_SERVICE } from './nats.constants';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NATS_SERVICE,
        useFactory: () => ({
          transport: Transport.NATS,
          options: {
            url: process.env.NATS_URL || 'nats://localhost:4222',
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class NatsModule {}
