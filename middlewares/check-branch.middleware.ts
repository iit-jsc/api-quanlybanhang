import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { JwtAuthGuard } from 'guards/jwt-auth.guard'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const branchIds = req.body.branchIds || []

    next()
  }
}
