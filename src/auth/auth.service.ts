import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private configService: ConfigService) { }

  async signIn(email: string, plainTextPassword: string): Promise<{ access_token: string }> {
    try {
      const userFinded = await this.usersService.getUser({ email });
      const { password, ...user } = userFinded;

      const match = await bcrypt.compare(plainTextPassword, password);

      if (!match) {
        throw new Error('Email or password is incorrect!');
      }

      const payload = { sub: user.id, email: user.email };

      return {
        access_token: await this.jwtService.signAsync(payload)
      }

    } catch (error) {
      console.error(error)
      throw new UnauthorizedException();
    }
  }

  async signUp(createNewUserData: SignUpDto) {
    const { password, ...userData } = createNewUserData;

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = { password: hash, ...userData }
    return await this.usersService.createUser(user);
  };

  /* verify if token is not exipired and is valid */
  async verifyToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, { secret: this.configService.get<string>('jwt.jwtSecret') })
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
}
