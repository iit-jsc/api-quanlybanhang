export class VNPayIPNDto {
  txnId: string
  payDate: string
  code: string
  checksum: string
  msgType: string
  qrTrace: string
  bankCode: string
  mobile: string
  accountNo?: string
  amount: string
  masterMerCode?: string
  merchantCode: string
  terminalId?: string
  addData?: any[]
  ccy?: string
  message?: string
}
