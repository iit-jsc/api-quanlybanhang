import { Body, Controller, Post } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDTO } from './dto/create-account.dto';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  create(@Body() CreateAccountDTO: CreateAccountDTO) {
    // return this.accountService.create(CreateAccountDTO);
  }
}
