import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async signUpLocal(dto: AuthDto) {
    const hashed = await this.hashData(dto.password);
    const newUser = this.prismaService.user.create({
      data: {
        email: dto.email,
        hash: hashed,
      }
    })
  }

  signInLocal() {}

  logout() {}

  refreshTokens() {}
}
