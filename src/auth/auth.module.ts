import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('jwt.jwtSecret'),
      signOptions: { expiresIn: '3600s' },
    }),
    inject: [ConfigService]
  }),
    UsersModule,],
  providers: [AuthService, UsersService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
