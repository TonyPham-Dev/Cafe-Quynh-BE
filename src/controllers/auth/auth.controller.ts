import { Body, Controller, Get, HttpStatus, Post, UseGuards, Request, UsePipes } from '@nestjs/common';
import { Response } from 'src/dtos/base/response.dto';
import { AuthService } from 'src/services/auth/auth.service';
import { UserService } from 'src/services/user/users.service';
import { ResetPasswordDto } from 'src/dtos/user/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from 'src/guards/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRoles } from '@prisma/client';
import { ZodValidationPipe } from 'nestjs-zod';
import { LoginSchema, LoginDto } from 'src/dtos/auth/login.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/guards/refreshToken.guard';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async signIn(@Body() loginData: LoginDto) {
    try {
      console.log(loginData);
      const data = await this.authService.signIn(loginData);
      return Response.success({
        data,
        message: 'Login successful',
      });
    } catch (err) {
      return Response.error({
        errorCode: err.message,
        message: 'Login failed',
      });
    }
  }

  @ApiBearerAuth('access-token')
  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(UserRoles.ADMIN, UserRoles.STAFF)
  async resetPassword(@Request() req: any, @Body() payload: ResetPasswordDto) {
    try {
      const { oldPassword, newPassword } = payload;
      const user = await this.userService.findByUsername(req.user.email);
      if (!user) {
        throw new Error('User not found');
      }
      const isCorrectPassword = await this.userService.verifyOldPassword(user.id, oldPassword);
      if (!isCorrectPassword) {
        throw new Error('Old password is incorrect');
      }
      const response = await this.userService.updatePassword(user.id, newPassword);
      return Response.success({
        data: response,
        message: 'Reset password successful',
      });
    } catch (error) {
      return Response.error({
        errorCode: error.message,
        message: 'Reset password failed',
      });
    }
  }

  @ApiBearerAuth('access-token')
  @Get('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@Request() req: Request) {
    try {
      const data = await this.authService.logout(req['user'].sub);
      return Response.success({
        data,
        message: 'Logout successful',
      });
    } catch (err) {
      return Response.error({
        errorCode: err.message,
        message: 'Logout failed',
      });
    }
  }

  @ApiBearerAuth('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refreshTokens(@Request() req: Request) {
    try {
      const user = req['user'];
      const users = await this.userService.findUserById(user.sub);
      const refreshToken = user.refreshToken;
      const data = await this.authService.refreshTokens(users.username, refreshToken);
      return Response.success({
        data,
        message: 'Refresh tokens successful',
      });
    } catch (err) {
      return Response.error({
        errorCode: err.message,
        message: 'Refresh tokens failed',
      });
    }
  }
}
