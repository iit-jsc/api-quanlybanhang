import { Permission, Prisma } from '@prisma/client';
import { AnyObject } from 'interfaces/common.interface';

export function mapResponseLogin(data: AnyObject) {
  const { account, shops, currentShop } = data;
  const allRoles = account.permissions.flatMap(
    (permission: Prisma.PermissionCreateInput) => permission.roles,
  );

  const uniqueRoles = Array.from(
    new Set(allRoles.map((role: Prisma.RoleCreateInput) => role.code)),
  ).map((code) =>
    allRoles.find((role: Prisma.RoleCreateInput) => role.code === code),
  );

  return {
    type: account.type,
    user: currentShop ? account.user : undefined,
    permissions: currentShop ? uniqueRoles : undefined,
    currentShop: currentShop,
    shops: shops,
  };
}
