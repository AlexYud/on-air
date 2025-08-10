import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,

    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) { }

  async authenticate(signInDto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: signInDto.email },
      });

      if (!user) {
        throw new HttpException(`User with email ${signInDto.email} not found`, HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await this.hashingService.comparePasswords(
        signInDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      const token = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.audience,
          issuer: this.jwtConfiguration.issuer,
          expiresIn: this.jwtConfiguration.expiresIn,
        },
      );

      return {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.log('Authentication error:', error);

      if (error instanceof HttpException) throw error;
      throw new HttpException('Error during authentication', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
