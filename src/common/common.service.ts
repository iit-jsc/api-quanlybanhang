import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class CommonService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadPhotoURLs(data: { photoURLs: string[] }) {
    return data.photoURLs
  }

  async getCurrentDate() {
    const now = new Date()

    return {
      timestamp: now.getTime(),
      isoString: now.toISOString(),
      localDate: now.toLocaleDateString('vi-VN'),
      localTime: now.toLocaleTimeString('vi-VN'),
      localDateTime: now.toLocaleString('vi-VN'),
      utcDate: now.toUTCString(),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      dayOfWeek: now.getDay(),
      dayOfWeekName: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][
        now.getDay()
      ]
    }
  }
}
