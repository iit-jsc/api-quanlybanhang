export interface RevenueData {
  totalRevenue: number
  totalCash: number
  totalTransfer: number
  totalVnpay: number
}

export interface RevenueReportItem extends RevenueData {
  time: string
}
