import { Prisma } from '@prisma/client';
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
  branches: { select: BRANCH_SELECT },
};

export const SHOP_SELECT = {
  id: true,
  photoURL: true,
  name: true,
  businessType: true,
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
  },
};

export const CREATE_ORDER_BY_EMPLOYEE_SELECT = {
  id: true,
  code: true,
  orderType: true,
  note: true,
  paymentMethod: true,
  orderStatus: true,
  customer: {
    select: {
      id: true,
      name: true,
      code: true,
      phone: true,
    },
  },
  orderDetails: {
    select: {
      id: true,
      amount: true,
      note: true,
      productPrice: true,
      toppingPrice: true,
      product: {
        select: {
          id: true,
          name: true,
          photoURLs: true,
          code: true,
        },
      },
      topping: {
        select: {
          id: true,
          name: true,
          photoURLs: true,
        },
      },
    },
  },
  createdByAccount: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          photoURL: true,
        },
      },
    },
  },
  updatedByAccount: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          photoURL: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as Prisma.OrderSelect;

export const CREATE_ORDER_BY_CUSTOMER_SELECT = {
  table: {
    select: {
      id: true,
      name: true,
      code: true,
      photoURL: true,
    },
  },
  note: true,
  orderStatus: true,
  orderDetails: {
    select: {
      id: true,
      amount: true,
      note: true,
      productPrice: true,
      toppingPrice: true,
      product: {
        select: {
          id: true,
          name: true,
          photoURLs: true,
          code: true,
        },
      },
      topping: {
        select: {
          id: true,
          name: true,
          photoURLs: true,
        },
      },
    },
  },
} as Prisma.OrderSelect;
