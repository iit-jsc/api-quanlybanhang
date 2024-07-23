import { Controller } from "@nestjs/common";
import { CompensationSettingService } from "./compensation-setting.service";

@Controller("compensation-setting")
export class CompensationSettingController {
  constructor(private readonly allowanceDeductionSettingService: CompensationSettingService) {}
}
