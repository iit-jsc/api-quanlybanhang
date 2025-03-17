import { Module } from '@nestjs/common'
import { OrderGateway } from './order.gateway'
import { TableGateway } from './table.gateway'
import { CustomerRequestGateway } from './customer-request.gateway'
import { FirebaseModule } from 'src/firebase/firebase.module'

@Module({
  controllers: [],
  providers: [OrderGateway, TableGateway, CustomerRequestGateway],
  exports: [OrderGateway, TableGateway, CustomerRequestGateway],
  imports: [FirebaseModule]
})
export class GatewayModule {}
