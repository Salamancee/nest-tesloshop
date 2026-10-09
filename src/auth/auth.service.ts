import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto, LoginUserDto } from './dto/index.js';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService
    ) { }


    async register(registerUserDto: RegisterUserDto) {
        try {
            const { password, ...userData } = registerUserDto;
            const user = this.userRepository.create({ ...userData, password: bcrypt.hashSync(password, 10) });
            await this.userRepository.save(user);

            return { ...user, token: this.getJwtToken({ email: user.email }) };
        } catch (error) {
            this.handleDbErrors(error);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        const { password, email } = loginUserDto;
        const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true } });
        if (!user) throw new UnauthorizedException('Credentials are not valid');

        if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid');

        return this.getJwtToken({ email: user.email });
    }

    private getJwtToken(payload: JwtPayload) {
        return this.jwtService.sign(payload);
    }


    private handleDbErrors(error: any): never {
        if (error.code === '23505') throw new BadRequestException(error.detail);

        console.log(error);
        throw new InternalServerErrorException("Please check server logs");

    }
}
