import { InjectRepository } from '@nestjs/typeorm';
import { PostDTO } from './dto/post.dto';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDTO } from '../auth/dto/user.dto';
import { Queue } from 'bullmq';
import { CommentDTO } from '../comments/dto/comment.dto';
import { ImageDTO } from './dto/image.dto';
import { ImageService } from './image.service';
@Injectable()
export class PostService {
  public imageUploadQueue: Queue;
  constructor(
    @InjectRepository(PostDTO)
    private readonly postRepository: Repository<PostDTO>,

    @InjectRepository(UserDTO)
    private readonly userRepository: Repository<UserDTO>,
    @InjectRepository(CommentDTO)
    private readonly commentRepository: Repository<CommentDTO>,
    private readonly imageService:ImageService
  ) {
    this.imageUploadQueue = new Queue('image-upload');
  }

  async createPost(postBody: PostDTO) {
    if (postBody.user && (postBody.user as any).id) {
      const user = await this.userRepository.findOne({
        where: { id: (postBody.user as any).id },
      });
      if (!user) throw new Error('User not found');
      postBody.user = user;
      
    }
    if(postBody.media_url )  {
      const imageData = await this.imageService.findUrl(postBody.media_url);
      postBody.media_url=imageData.imageUrl
      postBody.media_meta_data=imageData.mediaMetaData ?? {}
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
  async likePost(id: string) {
    const post = await this.postRepository.findOneBy({ id });
    if (!post) throw new BadRequestException('Post doesnt exist');
    post.likes_count++;
    const updatePost = await this.postRepository.save(post);
    return post;
  }
  async addComment(content: string, postId: string, userId: string) {
    const comment = this.commentRepository.create({
      content: content,
      userId: userId,
      postId: postId,
    });
    return this.commentRepository.save(comment);
  }
}
