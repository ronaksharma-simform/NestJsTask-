import { Module } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostController } from "./post.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserDTO } from "../auth/dto/user.dto";
import { PostDTO } from "./dto/post.dto";

@Module({
    imports:[TypeOrmModule.forFeature([UserDTO, PostDTO])],
    providers:[PostService],
    controllers:[PostController]
    ,exports:[PostService]
})
export class PostModule{

}