import { TokenPayload } from 'interfaces/common.interface';
import { USER_TYPE } from './user.enum';

export const BRANCH_SELECT = {
  id: true,
  photoURL: true,
  name: true,
  address: true,
  createdAt: true,
};

export const MEASUREMENT_UNIT_SELECT = {
  id: true,
  name: true,
  code: true,
  branches: { select: BRANCH_SELECT, where: { isPublic: true } },
};

export const SHOP_SELECT = {
  id: true,
  photoURL: true,
  name: true,
  branches: {
    select: BRANCH_SELECT,
    where: { isPublic: true },
  },
};

export const USER_SELECT = {
  id: true,
  code: true,
  type: true,
  phone: true,
  email: true,
  address: true,
  cardId: true,
  cardDate: true,
  cardAddress: true,
  birthday: true,
  sex: true,
  startDate: true,
  shops: {
    select: SHOP_SELECT,
    where: { isPublic: true },
  },
};

export const PERMISSION_SELECT = {
  id: true,
  name: true,
  description: true,
  branches: {
    select: BRANCH_SELECT,
    where: { isPublic: true },
  },
};

export const EMPLOYEE_GROUP_SELECT = {
  id: true,
  name: true,
  description: true,
  branches: {
    select: BRANCH_SELECT,
    where: { isPublic: true },
  },
};
