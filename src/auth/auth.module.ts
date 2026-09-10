import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDTO } from './dto/user.dto';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SignupController } from './signup.controller';
import { HashService } from '../utils/hash.services';
import { AppJwtModule } from '../jwt/jwt.module';
@Module({
    imports:[TypeOrmModule.forFeature([UserDTO]),AppJwtModule],
    providers:[AuthService,HashService],
    controllers:[AuthController, SignupController],
    exports:[AuthService]
})
export class AuthModuleModule {}
