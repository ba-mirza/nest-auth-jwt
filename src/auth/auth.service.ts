import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  signUpLocal() {}

  signInLocal() {}

  logout() {}

  refreshTokens() {}
}
