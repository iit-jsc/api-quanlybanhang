import { Controller } from '@nestjs/common';
import { InventoryTransactionService } from './inventory-transaction.service';

@Controller('inventory-transaction')
export class InventoryTransactionController {
  constructor(private readonly inventoryTransactionService: InventoryTransactionService) {}
}
