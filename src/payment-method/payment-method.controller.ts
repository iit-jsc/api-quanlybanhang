// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Req,
//   UseGuards,
//   HttpCode,
//   HttpStatus,
//   Query,
//   UseInterceptors,
//   UploadedFile,
// } from '@nestjs/common';
// import { PaymentMethodService } from './payment-method.service';
// import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
// import { TokenPayload } from 'interfaces/common.interface';
// import { DeleteManyDto, FindManyDto } from 'utils/Common.dto';
// import { JwtAuthGuard } from 'guards/jwt-auth.guard';
// import { CustomFileInterceptor } from 'utils/Helps';

// @Controller('payment-method')
// export class PaymentMethodController {
//   constructor(private readonly paymentMethodService: PaymentMethodService) {}

//   @Post('')
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(CustomFileInterceptor('logo'))
//   create(
//     @Body() createPaymentMethodDto: CreatePaymentMethodDto,
//     @Req() req: any,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     const tokenPayload = req.tokenPayload as TokenPayload;

//     return this.paymentMethodService.create(
//       { ...createPaymentMethodDto, logo: file?.path },
//       tokenPayload,
//     );
//   }

//   @Get('')
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(JwtAuthGuard)
//   findAll(@Query() findManyDto: FindManyDto, @Req() req: any) {
//     const tokenPayload = req.tokenPayload as TokenPayload;

//     return this.paymentMethodService.findAll(findManyDto, tokenPayload);
//   }

//   @Get(':id')
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(JwtAuthGuard)
//   findUniq(@Param('id') id: number, @Req() req: any) {
//     const tokenPayload = req.tokenPayload as TokenPayload;

//     return this.paymentMethodService.findUniq(
//       {
//         id,
//       },
//       tokenPayload,
//     );
//   }

//   @Patch(':id')
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(JwtAuthGuard)
//   @UseInterceptors(CustomFileInterceptor('logo'))
//   update(
//     @Param('id') id: number,
//     @Body() createPaymentMethodDto: CreatePaymentMethodDto,
//     @Req() req: any,
//     @UploadedFile() file: Express.Multer.File,
//   ) {
//     const tokenPayload = req.tokenPayload as TokenPayload;
//     return this.paymentMethodService.update(
//       {
//         where: {
//           id,
//         },
//         data: { ...createPaymentMethodDto, logo: file?.path },
//       },
//       tokenPayload,
//     );
//   }

//   @Delete('')
//   @HttpCode(HttpStatus.OK)
//   @UseGuards(JwtAuthGuard)
//   deleteMany(@Body() deleteManyDto: DeleteManyDto, @Req() req: any) {
//     const tokenPayload = req.tokenPayload as TokenPayload;
//     return this.paymentMethodService.removeMany(
//       {
//         id: {
//           in: deleteManyDto.ids,
//         },
//       },
//       tokenPayload,
//     );
//   }
// }
