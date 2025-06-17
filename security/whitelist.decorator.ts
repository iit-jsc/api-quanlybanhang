import { SetMetadata } from '@nestjs/common'

export const RequireWhitelist = () => SetMetadata('whitelist', true)
