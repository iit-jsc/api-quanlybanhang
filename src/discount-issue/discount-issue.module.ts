import { Module } from "@nestjs/common";
import { DiscountIssueService } from "./discount-issue.service";
import { DiscountIssueController } from "./discount-issue.controller";
import { CommonModule } from "src/common/common.module";

@Module({
  controllers: [DiscountIssueController],
  providers: [DiscountIssueService],
  imports: [CommonModule],
})
export class DiscountIssueModule {}
