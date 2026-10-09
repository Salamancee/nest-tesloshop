import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "../interfaces/jwt-payload.interface.js";
import { PassportStrategy } from "@nestjs/passport";
import { Repository } from "typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../entities/user.entity.js";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super({
            secretOrKey: process.env.JWT_SECRET!,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });

    }

    async validate(payload: JwtPayload): Promise<User> {
        const { email } = payload;
        const user = await this.userRepository.findOneBy({ email });

        if (!user) throw new UnauthorizedException("Token not valid");
        if (!user.isActive) throw new UnauthorizedException("Token not valid");

        return user;
    }
}