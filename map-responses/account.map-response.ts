import { AnyObject } from 'interfaces/common.interface'

export function mapResponseLogin(data: AnyObject) {
  const { account, shops, currentShop } = data

  return {
    account,
    permissions: [],
    currentShop: currentShop,
    shops: shops
  }
}
