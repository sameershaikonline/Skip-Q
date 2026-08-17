import { Module } from '@nestjs/common';
import { TokensGateway } from './tokens.gateway';

@Module({
  providers: [TokensGateway],
  exports: [TokensGateway],
})
export class TokensModule {}
