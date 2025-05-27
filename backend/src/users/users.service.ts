import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  async findByFirebaseUid(firebaseUid: string) {
    const cacheKey = `user:firebase:${firebaseUid}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      include: { profile: true },
    });

    if (user) {
      await this.redis.setJSON(cacheKey, user, 300);
    }

    return user;
  }

  async findById(id: string) {
    const cacheKey = `user:id:${id}`;
    const cached = await this.redis.getJSON(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.redis.setJSON(cacheKey, user, 300);
    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: updateProfileDto,
      create: {
        userId,
        ...updateProfileDto,
      },
    });

    await this.redis.del(`user:id:${userId}`);
    await this.redis.del(`user:firebase:${(await this.prisma.user.findUnique({ where: { id: userId } }))?.firebaseUid}`);

    return profile;
  }

  async getProfile(userId: string) {
    const user = await this.findById(userId);
    return user.profile;
  }
}

