export interface RevenueData {
  totalRevenue: number
  totalCash: number
  totalTransfer: number
  totalVNPay: number
}

export interface RevenueReportItem extends RevenueData {
  time: string
}

export interface ReportSummaryData {
  totalOrders: number
  totalRevenue: number
  paymentSummary: {
    totalCash: number
    totalTransfer: number
    totalVNPay: number
  }
  totalProductsSold: number
  totalProductsCanceled: number
  totalNewCustomers: number
}
