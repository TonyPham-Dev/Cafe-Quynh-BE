import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { LoginDto } from 'src/dtos/auth/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/services/user/users.service';
import { AuthResponse, JwtTokenData, JwtTokenPayload, SignupPayload } from '../../types/base/auth.type';
import { ConfigService } from '@nestjs/config';
import { helper } from 'src/libs/helper';
import { PrismaService } from 'src/repositories/database/prisma.service';
import { UserRoles } from '@prisma/client';
import { ErrorCode } from 'src/types/base/error-code.type';

@Injectable()
export class AuthService {
  protected readonly jwtAccessSecret: string;
  protected readonly jwtRefreshSecret: string;
  protected readonly jwtAccessExpiresIn: string;
  protected readonly jwtRefreshExpiresIn: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly userServices: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.jwtAccessSecret = this.configService.get('authentication.jwtAccessSecret');
    this.jwtRefreshSecret = this.configService.get('authentication.jwtRefreshSecret');
    this.jwtAccessExpiresIn = this.configService.get('authentication.jwtAccessExpiresIn');
    this.jwtRefreshExpiresIn = this.configService.get('authentication.jwtRefreshExpiresIn');
  }

  async signIn(data: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.userServices.findByUsername(data.username);
      if (!user) {
        throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS);
      }

      if (!user.active) {
        throw new ForbiddenException(ErrorCode.USER_NOT_FOUND);
      }

      const passwordMatches = await helper.compare(data.password, user.password);
      if (!passwordMatches) {
        throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS);
      }

      const tokens = await this.getTokens({
        id: user.id,
        username: user.username,
        role: user.role,
      });

      const hashedRefreshToken = await helper.hashData(tokens.refreshToken);
      await this.userServices.setRefreshToken(user.id, hashedRefreshToken);

      return {
        id: user.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        username: user.username,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(ErrorCode.INVALID_CREDENTIALS);
    }
  }

  async signUp(signUpPayload: SignupPayload, database?: PrismaService): Promise<AuthResponse> {
    const usersServices = new UserService(database);
    const credentialExisted = await usersServices.findByUsername(signUpPayload.username);

    if (credentialExisted) {
      throw new BadRequestException(ErrorCode.USER_EXISTS);
    }

    const user = await usersServices.create({
      username: signUpPayload.username,
      password: await helper.hashData(signUpPayload.password),
      role: UserRoles.ADMIN,
      fullName: signUpPayload.username,
    });

    const tokens = await this.getTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    const hashedRefreshToken = await helper.hashData(tokens.refreshToken);
    await usersServices.setRefreshToken(user.id, hashedRefreshToken);

    return {
      id: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      username: user.username,
    };
  }

  async logout(credentialId: number) {
    return this.userServices.setRefreshToken(credentialId, null);
  }

  async getTokens(payload: JwtTokenPayload) {
    const { id, username } = payload;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: id,
          username,
          role: payload.role,
        },
        {
          secret: this.jwtAccessSecret,
          expiresIn: this.jwtAccessExpiresIn,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: id,
          username,
        },
        {
          secret: this.jwtRefreshSecret,
          expiresIn: this.jwtRefreshExpiresIn,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(username: string, refreshToken: string) {
    const user = await this.userServices.findByUsername(username);
    if (!user || !user.refreshToken) throw new Error(ErrorCode.INVALID_CREDENTIALS);
    const refreshTokenMatches = await helper.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) throw new Error(ErrorCode.INVALID_CREDENTIALS);
    const tokens = await this.getTokens({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    const hashedRefreshToken = await helper.hashData(tokens.refreshToken);
    await this.userServices.setRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      username: user.username,
    };
  }

  async generateToken(params: {
    expiresIn?: string;
    username: string;
    prismaService?: PrismaService;
  }): Promise<string> {
    const { expiresIn = '5m', username, prismaService } = params;
    let user = await this.userServices.findByUsername(username);
    if (prismaService) {
      const usersServices = new UserService(prismaService);
      user = await usersServices.findByUsername(username);
    }
    if (!user) throw new BadRequestException(ErrorCode.USER_NOT_FOUND);
    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        username: user.username,
        role: user.role,
      },
      {
        secret: this.configService.get('authentication.jwtAccessSecret'),
        expiresIn: expiresIn,
      },
    );
    return token;
  }

  async verifyToken(token: string): Promise<JwtTokenData> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtTokenData>(token, {
        secret: this.configService.get('authentication.jwtAccessSecret'),
      });
      return payload;
    } catch (error) {
      throw new ForbiddenException(ErrorCode.FORBIDDEN_MESSAGE);
    }
  }
}
