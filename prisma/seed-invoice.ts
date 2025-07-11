import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface SeedResult {
  invoiceSettings: number
  invoiceProviders: number
  configs: number
}

interface BranchInfo {
  id: string
  name: string
}

interface InvoiceCreationResult {
  setting: boolean
  provider: boolean
  config: boolean
}

// Configuration constants
const INVOICE_CONFIG = {
  DEFAULT_VAT_RATE: 10.0,
  INVOICE_TYPE: 'VAT_INVOICE' as const,
  PROVIDER_TYPE: 'VNPT' as const,
  PROVIDER_NAME: 'VNPT Invoice Service',
  EMPTY_CONFIG: {
    vnptApiUrl: '',
    vnptUsername: '',
    vnptPassword: '',
    vnptAccount: '',
    vnptAccountPassword: '',
    invPattern: '',
    invSerial: ''
  }
} as const

// Database operation functions
async function getBranches(): Promise<BranchInfo[]> {
  return await prisma.branch.findMany({
    select: { id: true, name: true }
  })
}

async function createInvoiceSetting(branchId: string): Promise<boolean> {
  try {
    await prisma.invoiceSetting.create({
      data: {
        branchId,
        invoiceType: INVOICE_CONFIG.INVOICE_TYPE,
        defaultVatRate: INVOICE_CONFIG.DEFAULT_VAT_RATE
      }
    })
    return true
  } catch (error: any) {
    if (error.code === 'P2002') return false
    throw error
  }
}

async function createInvoiceProvider(branchId: string): Promise<string | null> {
  try {
    const provider = await prisma.invoiceProvider.create({
      data: {
        branchId,
        providerType: INVOICE_CONFIG.PROVIDER_TYPE,
        isActive: true,
        providerName: INVOICE_CONFIG.PROVIDER_NAME
      }
    })
    return provider.id
  } catch (error: any) {
    if (error.code === 'P2002') return null // Already exists
    throw error
  }
}

async function createInvoiceConfig(providerId: string): Promise<void> {
  await prisma.invoiceConfig.create({
    data: {
      invProviderId: providerId,
      ...INVOICE_CONFIG.EMPTY_CONFIG
    }
  })
}

// Helper functions
async function seedBranchInvoiceData(branch: BranchInfo): Promise<InvoiceCreationResult> {
  const results: InvoiceCreationResult = { setting: false, provider: false, config: false }

  // Create invoice setting
  results.setting = await createInvoiceSetting(branch.id)

  // Create invoice provider and config
  const providerId = await createInvoiceProvider(branch.id)
  if (providerId) {
    results.provider = true
    await createInvoiceConfig(providerId)
    results.config = true
  }

  return results
}

function logSummary(results: SeedResult): void {
  console.log('🎉 Invoice data seeding completed!')
  console.log('📊 Summary:')
  console.log(`   - Invoice Settings: ${results.invoiceSettings} created`)
  console.log(`   - Invoice Providers: ${results.invoiceProviders} created`)
  console.log(`   - Invoice Configs: ${results.configs} created`)
}

// Main seeding function
export async function seedInvoiceData(): Promise<SeedResult> {
  console.log('🏪 Seeding invoice data...')

  const branches = await getBranches()

  if (branches.length === 0) {
    console.log('⚠️ No branches found. Please seed branches first.')
    return { invoiceSettings: 0, invoiceProviders: 0, configs: 0 }
  }

  console.log(`📋 Found ${branches.length} branches`)

  const results: SeedResult = { invoiceSettings: 0, invoiceProviders: 0, configs: 0 }

  for (const branch of branches) {
    try {
      const branchResults = await seedBranchInvoiceData(branch)

      // Update counters
      if (branchResults.setting) results.invoiceSettings++
      if (branchResults.provider) results.invoiceProviders++
      if (branchResults.config) results.configs++
    } catch (error) {
      console.error(`❌ Failed to seed invoice data for ${branch.name}:`, error)
      throw error
    }
  }

  logSummary(results)
  return results
}

// Self-executing script for direct execution
if (require.main === module) {
  async function runSeed(): Promise<void> {
    try {
      await seedInvoiceData()
      console.log('✅ Invoice seed completed successfully')
    } catch (error) {
      console.error('❌ Invoice seed failed:', error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  }

  runSeed()
}
