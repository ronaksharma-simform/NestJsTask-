import { Body, Controller, Get, Post } from "@nestjs/common";
import { PostService } from "./post.service";
import { PostDTO } from "./dto/post.dto";

@Controller('post')
export class PostController {
    constructor(private readonly postService:PostService){}

    @Post()
    async createPost(@Body() reqBody : PostDTO){
        const post = await this.postService.createPost(reqBody);
        return {
            message:"Post Created SucessFully",
            post
        }
    }
    // @Get('/:id')
    // async getPost()
}