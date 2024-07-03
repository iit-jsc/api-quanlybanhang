import { Module } from '@nestjs/common';
import { DiscountIssueService } from './discount-issue.service';
import { DiscountIssueController } from './discount-issue.controller';

@Module({
  controllers: [DiscountIssueController],
  providers: [DiscountIssueService],
})
export class DiscountIssueModule {}
