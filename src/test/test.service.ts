import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'

@Injectable()
export class TestService {
  constructor(private readonly httpService: HttpService) {}

  async getVnpayInvoicePdf(): Promise<Buffer> {
    const url = 'https://invoice-api.vnpaytest.vn/api/v6/invoices/pdf'
    const params = {
      taxCode: '0102182292-999',
      invoiceDate: '2025-07-01',
      requestId: 'REQ-20250701-0001'
    }

    const bearerToken =
      'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJXUnIyNjJhWnpsZHlLdGxvdUVuOUlQOGlzU2xhLTQzRXRCZW5hLTVvMHdrIn0.eyJleHAiOjE3NTEzODI0NjMsImlhdCI6MTc1MTM2MDg2MywianRpIjoiYjY1ODZiMDQtNjNiMS00YjA1LWJkMGItYWUzZDZmNjFmZTA0IiwiaXNzIjoiaHR0cDovL2ludm9pY2UtYXV0aC52bnBheXRlc3Qudm4vcmVhbG1zL3ZucGF5LWludm9pY2UiLCJzdWIiOiI3N2MwMmY2MS1mYWM3LTQyMjktOTBlMy03NGU3NTI3NTIyZDYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiIxODAxNzM1OTYwX2lpdCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiLyoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy12bnBheS1pbnZvaWNlIl19LCJzY29wZSI6ImVtYWlsIHByb2ZpbGUiLCJjbGllbnRIb3N0IjoiMTAuMTI5LjUuMjM5IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzZXJ2aWNlLWFjY291bnQtMTgwMTczNTk2MF9paXQiLCJjbGllbnRBZGRyZXNzIjoiMTAuMTI5LjUuMjM5IiwiY2xpZW50X2lkIjoiMTgwMTczNTk2MF9paXQifQ.ttJ2mnOkuIIWMJjRClMaO4j2JksYRLI97RGLAHku-KAahTuiB1y_Flqr5j_aHRZn0q0VBkJ3NiEVtA121ukdj2yf7VPI-nOGmPBs3TXIPz1apURynqnhImZK1-urrfPdfwSZglQSIjwNe9RHTYMw3H6NAJZmB41p3IcHNulxvOH4FeqSGWk6V6LaqI5JUQ3UyvFRuS3AAxGJTJJyazweLjRmme7i2pe7acjFRSWMFVbwKu9YJWD-vyH1eHgaQQaMBKJQV62QHGwbnES80_o-z7SsRFZ46f2eggt2gUzgGWTTkI0hGH9d31ri420qExxhqGeh6Xn1ogzmFSxvQWpbyw'

    try {
      console.log('🚀 Calling VNPay Invoice API...')
      console.log('📍 URL:', url)
      console.log('📝 Params:', params)

      const response = await this.httpService
        .get(url, {
          params,
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            'Content-Type': 'application/json'
          }
        })
        .toPromise()

      console.log('✅ API Response Status:', response.status)
      console.log('📋 Response Data:', {
        code: response.data?.code,
        message: response.data?.message,
        hasData: !!response.data?.data
      })

      if (response.data?.code !== '00') {
        throw new HttpException(
          `VNPay API Error: ${response.data?.message || 'Unknown error'}`,
          HttpStatus.BAD_REQUEST
        )
      }

      if (!response.data?.data) {
        throw new HttpException('No PDF data returned from VNPay API', HttpStatus.NOT_FOUND)
      }

      // Convert base64 to buffer
      const base64Data = response.data.data
      const pdfBuffer = Buffer.from(base64Data, 'base64')

      console.log('📄 PDF Buffer created, size:', pdfBuffer.length, 'bytes')

      return pdfBuffer
    } catch (error) {
      console.error('❌ Error calling VNPay API:', error.message)
      if (error.response) {
        console.error('📝 Error Response:', error.response.data)
        console.error('🔢 Error Status:', error.response.status)
      }

      throw new HttpException(
        `Failed to fetch invoice PDF: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
