import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { CommentLike } from './comment-like.entity';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CryptoModule } from '../common/crypto/crypto.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, CommentLike]),
    CryptoModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
