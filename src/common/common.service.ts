import { Injectable } from '@nestjs/common'

import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhotoURLs(data: { photoURLs: string[] }) {
    return data.photoURLs
  }
}
