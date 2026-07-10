import { InjectRepository } from '@nestjs/typeorm';
import { PostDTO } from './dto/post.dto';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserDTO } from '../auth/dto/user.dto';
import {Queue} from 'bullmq'
@Injectable()
export class PostService {
  public imageUploadQueue: Queue;
  constructor(
    @InjectRepository(PostDTO)
    private readonly postRepository: Repository<PostDTO>,

    @InjectRepository(UserDTO)
    private readonly userRepository: Repository<UserDTO>,
  ) {
    this.imageUploadQueue = new Queue("image-upload")
  }

  async createPost(postBody: PostDTO) {
    if (postBody.user && (postBody.user as any).id) {
      const user = await this.userRepository.findOne({
        where: { id: (postBody.user as any).id },
      });
      if (!user) throw new Error('User not found');
      postBody.user = user;
    }
    return this.postRepository.save(postBody);
  }
  async deletePost(id: string) {
    return this.postRepository.delete({ id: id });
  }
  async getPost(id: string) {
    return this.postRepository.findBy({ id });
  }
  async getAllPost() {
    return this.postRepository.find();
  }
}
