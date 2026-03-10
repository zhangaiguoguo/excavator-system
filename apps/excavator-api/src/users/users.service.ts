import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRealNameStatus, Constants } from '@excavator/types';
import { CryptoService } from '../common/crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cryptoService: CryptoService,
  ) {}

  /** 解密用户敏感字段（读取时使用，解密失败则返回原值以兼容历史明文数据） */
  private decryptUser(user: User | null): User | null {
    if (!user) return null;
    const u = { ...user } as User;
    if (u.phone) {
      const dec = this.cryptoService.decrypt(u.phone);
      if (dec != null) u.phone = dec;
    }
    if (u.realName) {
      const dec = this.cryptoService.decrypt(u.realName);
      if (dec != null) u.realName = dec;
    }
    if (u.idCard) {
      const dec = this.cryptoService.decrypt(u.idCard);
      if (dec != null) u.idCard = dec;
    }
    return u;
  }

  /** 加密要写入的敏感字段 */
  private encryptSensitive(data: Partial<User>): Partial<User> {
    const out = { ...data };
    if (out.phone != null && out.phone !== '')
      out.phone = this.cryptoService.encrypt(out.phone) ?? out.phone;
    if (out.realName != null && out.realName !== '')
      out.realName = this.cryptoService.encrypt(out.realName) ?? out.realName;
    if (out.idCard != null && out.idCard !== '')
      out.idCard = this.cryptoService.encrypt(out.idCard) ?? out.idCard;
    return out;
  }

  async findAll(): Promise<User[]> {
    const list = await this.usersRepository.find();
    return list.map((u) => this.decryptUser(u)!).filter(Boolean);
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });
    return this.decryptUser(user);
  }

  async findByOpenId(wxOpenid: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ wxOpenid });
    return this.decryptUser(user);
  }

  /**
   * 校验用户是否可发布（设备/需求/揽活等）：必须已绑定手机号且已通过实名认证
   * @throws BadRequestException 未绑定手机或未实名认证时
   */
  async ensureUserCanPublish(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const phone = user.phone?.trim() || '';
    if (!phone || phone === Constants.DEFAULT_PHOTO) {
      throw new BadRequestException('请先绑定手机号后再发布');
    }
    if (user.realNameStatus !== UserRealNameStatus.APPROVED) {
      throw new BadRequestException('请先完成实名认证后再发布');
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const encrypted = this.encryptSensitive(userData);
    const user = this.usersRepository.create(encrypted);
    const saved = await this.usersRepository.save(user);
    return this.decryptUser(saved)!;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const phone = userData.phone;
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      throw new HttpException('手机号码格式不正确！', 500);
    }
    const encrypted = this.encryptSensitive(userData);
    await this.usersRepository.update(id, encrypted);
    return this.findOne(id);
  }

  async authorizeRealName(userData: Partial<User>): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userData.id });
    if (!user) {
      throw new HttpException('用户不存在', 404);
    }

    if (user.realNameStatus === UserRealNameStatus.APPROVED) {
      throw new HttpException('用户已实名认证', 400);
    }

    if (userData.realName == null || userData.idCard == null) {
      throw new HttpException('请填写真实姓名和身份证号', 400);
    }

    if (!/^[\u4e00-\u9fa5]{2,5}$/.test(userData.realName as string)) {
      throw new HttpException('真实姓名格式不正确', 400);
    }

    if (
      !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|3[0-1])\d{3}[\dXx]$/.test(
        userData.idCard as string,
      )
    ) {
      throw new HttpException('身份证号格式不正确', 400);
    }

    user.realName =
      this.cryptoService.encrypt(userData.realName as string) ??
      (userData.realName as string);
    user.idCard =
      this.cryptoService.encrypt(userData.idCard as string) ??
      (userData.idCard as string);
    user.realNameStatus = UserRealNameStatus.APPROVED;
    user.updateTime = new Date();
    user.companyName = (userData.companyName as string) ?? null;
    user.creditCode = (userData.creditCode as string) ?? null;

    //后续开启认证识别功能

    const saved = await this.usersRepository.save(user);
    return this.decryptUser(saved);
  }

  async updatePassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    // In a real application, you should hash the password and compare the hash
    // This is a simplified example
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Warning: Plain text password comparison for demo only. Use bcrypt in production.
    if (user.password !== oldPassword) {
      throw new BadRequestException('Old password is incorrect');
    }

    user.password = newPassword;
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
