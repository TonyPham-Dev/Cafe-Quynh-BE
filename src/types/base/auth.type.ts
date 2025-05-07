import { UserRoles } from '@prisma/client';

export type AuthResponse = {
  id: number;
  accessToken: string;
  refreshToken: string;
  username: string;
};

export type AuthenticationConfig = {
  jwtAccessTokenSecret: string;
  jwtRefreshTokenSecret: string;
  jwtAccessTokenExpiresIn: string;
  jwtRefreshTokenExpiresIn: string;
};

export type JwtTokenPayload = {
  id: number;
  username: string;
  role: UserRoles;
};

export type SignupPayload = {
  username: string;
  password: string;
};

export type JwtTokenData = {
  sub: number;
  username: string;
  role: UserRoles;
};
