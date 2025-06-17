import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import * as QRCode from 'qrcode'

@Injectable()
export class QrCodeService {
  constructor(private readonly httpService: HttpService) {}

  async createQrCode(payload: any): Promise<string> {
    try {
      const response = await this.httpService.post(process.env.VNP_CREATE_QR, payload).toPromise()
      const qrData = response.data?.data

      if (!qrData) {
        throw new HttpException(`Không nhận được dữ liệu từ VNP!`, HttpStatus.NOT_FOUND)
      }

      return await this.generateQrCodeImage(qrData)
    } catch (error) {
      throw new HttpException(
        `Không thể tạo mã QR: ${error?.response?.data?.message || error.message}`,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  private async generateQrCodeImage(qrData: string): Promise<string> {
    const qrOptions = {
      errorCorrectionLevel: 'M',
      width: 200,
      height: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
    return QRCode.toDataURL(qrData, qrOptions)
  }
}
