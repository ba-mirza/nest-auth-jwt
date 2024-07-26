import { PrismaService } from './../prisma/prisma.service';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUpLocal(dto: AuthDto): Promise<Tokens> {
    const hashed = await this.hashData(dto.password);
    const newUser = await this.prismaService.user.create({
      data: {
        email: dto.email,
        hash: hashed,
      }
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRtHash(newUser.id, tokens.refresh_token);
    
    return tokens;
  }

  async signInLocal(dto: AuthDto): Promise<Tokens> {
    const isUser = await this.prismaService.user.findUnique({
      where: {
        email: dto.email
      }
    });

    const passwordMatches = await bcrypt.compare(dto.password, isUser.hash);
    
    if(!isUser && !passwordMatches) throw new ForbiddenException("Access Denied");

    const tokens = await this.getTokens(isUser.id, isUser.email);
    await this.updateRtHash(isUser.id, tokens.refresh_token);
    
    return tokens;
  }

  logout() {}

  refreshTokens() {}

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    }
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRt: hash,
      }
    })
  }
}
