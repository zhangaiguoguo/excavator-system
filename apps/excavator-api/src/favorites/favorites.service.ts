import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favRepository: Repository<Favorite>,
  ) {}

  async add(userId: string, refType: string, refId: string): Promise<Favorite> {
    const exists = await this.favRepository.findOne({ where: { userId, refType, refId } });
    if (exists) return exists;
    const fav = this.favRepository.create({ userId, refType, refId });
    return this.favRepository.save(fav);
  }

  async remove(userId: string, refType: string, refId: string): Promise<void> {
    await this.favRepository.delete({ userId, refType, refId });
  }

  async list(userId: string): Promise<Favorite[]> {
    return this.favRepository.find({ where: { userId }, order: { createTime: 'DESC' } });
  }

  async isFav(userId: string, refType: string, refId: string): Promise<boolean> {
    const one = await this.favRepository.findOne({ where: { userId, refType, refId } });
    return !!one;
  }
}
