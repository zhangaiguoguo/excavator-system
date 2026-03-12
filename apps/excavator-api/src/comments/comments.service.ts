import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment } from './comment.entity';
import { CommentLike } from './comment-like.entity';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    private cryptoService: CryptoService,
  ) {}

  async findByRef(
    refType: string,
    refId: string,
    currentUserId?: string,
  ): Promise<(Comment & { user?: any; liked?: boolean })[]> {
    const list = await this.commentRepository.find({
      where: { refType, refId },
      relations: ['user'],
      order: { createTime: 'DESC' },
      take: 200,
    });
    const commentIds = list.map((c) => c.id);
    let likedSet = new Set<string>();
    if (currentUserId && commentIds.length > 0) {
      const likes = await this.commentLikeRepository.find({
        where: {
          commentId: In(commentIds),
          userId: currentUserId,
        },
      });
      likedSet = new Set(likes.map((l) => l.commentId));
    }
    return list.map((c) => {
      const { user, ...rest } = c as any;
      let safeUser: any;
      if (user) {
        const phone =
          user.phone != null
            ? this.cryptoService.decrypt(user.phone) ?? user.phone
            : undefined;
        safeUser = {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone,
        };
      }
      return {
        ...rest,
        user: safeUser,
        liked: likedSet.has(c.id),
      } as Comment & { user?: any; liked?: boolean };
    });
  }

  async create(
    refType: string,
    refId: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const trimmed = (content || '').trim();
    if (!trimmed) throw new Error('评论内容不能为空');
    if (trimmed.length > 500) throw new Error('评论最多500字');
    if (!['machine', 'demand'].includes(refType))
      throw new Error('refType 仅支持 machine、demand');
    const comment = this.commentRepository.create({
      refType,
      refId: String(refId),
      userId: String(userId),
      content: trimmed,
    });
    return this.commentRepository.save(comment);
  }

  async toggleLike(commentId: string, userId: string): Promise<{ likeCount: number; liked: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) throw new Error('评论不存在');
    const existing = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });
    if (existing) {
      await this.commentLikeRepository.remove(existing);
      comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);
      await this.commentRepository.save(comment);
      return { likeCount: comment.likeCount, liked: false };
    }
    await this.commentLikeRepository.save(
      this.commentLikeRepository.create({ commentId, userId }),
    );
    comment.likeCount = (comment.likeCount || 0) + 1;
    await this.commentRepository.save(comment);
    return { likeCount: comment.likeCount, liked: true };
  }
}
