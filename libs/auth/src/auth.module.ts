import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';
import { AppConfigService } from '@app/config/config.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: AppConfigService) => ({
        secret: configService.jwt.secret,
        signOptions: { expiresIn: configService.jwt.accessExpiresIn },
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [JwtStrategy, RefreshTokenStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthLibModule {}
