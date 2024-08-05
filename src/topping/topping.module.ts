import { Module } from "@nestjs/common";
import { ToppingService } from "./topping.service";
import { ToppingController } from "./topping.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [ToppingController],
  providers: [ToppingService],
  imports: [CommonModule],
})
export class ToppingModule {}
