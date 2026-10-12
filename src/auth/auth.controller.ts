import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterUserDto, LoginUserDto } from './dto/index.js';
import { GetUser } from './decorators/index.js';
import { User } from './entities/user.entity.js';
import { Auth } from './decorators/auth.decorator.js';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  // @Get('private')
  // @UseGuards(AuthGuard())
  // testingPrivateRoute(@GetUser() user: User, @GetUser('email') email: string, @GetRawHeaders() headers: string[]) {
  //   return { ok: true, user: user, email: email, headers }
  // }

  // @Get('private2')
  // @RoleProtected(ValidRoles.superUser)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // privateRoute2(@GetUser() user: User) {
  //   return { ok: true, user: user }
  // }

  // @Get('private3')
  // @Auth()
  // privateRoute3(@GetUser() user: User) {
  //   return { ok: true, user: user }
  // }
}
