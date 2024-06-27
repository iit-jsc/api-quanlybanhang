import { Prisma } from '@prisma/client';

export function mapResponseLogin(data: any) {
  const allRoles = data.permissions.flatMap((permission) => permission.roles);

  const uniqueRoles = Array.from(
    new Set(allRoles.map((role: Prisma.RoleCreateInput) => role.code)),
  ).map((code) =>
    allRoles.find((role: Prisma.RoleCreateInput) => role.code === code),
  );

  return {
    type: data.type,
    user: data.user,
    permissions: uniqueRoles,
  };
}
