import { Prisma } from '@prisma/client';

// Danh sách các model áp dụng soft delete
const SOFT_DELETE_MODELS = {
  Customer: {
    modelKey: 'customer',
  },
  CustomerGroup: {
    modelKey: 'customerGroup',
  },
  ProductCategory: {
    modelKey: 'productCategory',
  },
  Product: {
    modelKey: 'product',
  },
  Package: {
    modelKey: 'package',
  },
  PriceList: {
    modelKey: 'priceList',
  },
  Warehouse: {
    modelKey: 'warehouse',
  },
  Device: {
    modelKey: 'device',
  },
  TransactionReceipt: {
    modelKey: 'transactionReceipt',
  },
  TransactionReceiptItem: {
    modelKey: 'transactionReceiptItem',
  },
  Order: {
    modelKey: 'order',
  },
  Invoice: {
    modelKey: 'invoice',
  },
  Payment: {
    modelKey: 'payment',
  },
  BankAccount: {
    modelKey: 'bankAccount',
  },
  Subscription: {
    modelKey: 'subscription',
  },
  SubscriptionBilling: {
    modelKey: 'subscriptionBilling',
  },
  SubscriptionDevice: {
    modelKey: 'subscriptionDevice',
  },
} as const;

type SupportedModel = keyof typeof SOFT_DELETE_MODELS;

export const softDeleteMiddleware: Prisma.Middleware = async (params: Prisma.MiddlewareParams, next) => {
  // Check if model should apply soft delete
  const modelName = params.model as SupportedModel;
  if (!(modelName in SOFT_DELETE_MODELS)) {
    return next(params);
  }

  // Handle count queries
  if (params.action === 'count') {
    if (params.args?.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    } else {
      params.args = { where: { deletedAt: null } };
    }
  }

  // Handle find queries
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    // Change to findFirst to allow filtering
    params.action = 'findFirst';
    // Add deletedAt filter while maintaining existing where conditions
    params.args.where = { ...params.args.where, deletedAt: null };
  }

  if (params.action === 'findFirstOrThrow' || params.action === 'findUniqueOrThrow') {
    if (params.args?.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    } else {
      params.args = { where: { deletedAt: null } };
    }
  }

  if (params.action === 'findMany') {
    if (params.args?.where) {
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    } else {
      params.args = { where: { deletedAt: null } };
    }
  }

  // Handle update queries
  if (params.action === 'update') {
    // Change to updateMany to allow filtering
    params.action = 'updateMany';
    // Add deletedAt filter
    params.args.where = { ...params.args.where, deletedAt: null };
  }

  if (params.action === 'updateMany') {
    if (params.args?.where) {
      params.args.where.deletedAt = null;
    } else {
      params.args = { where: { deletedAt: null } };
    }
  }

  // Handle delete queries
  if (params.action === 'delete') {
    // Change to update
    params.action = 'update';
    params.args.data = { deletedAt: new Date() };
  }

  if (params.action === 'deleteMany') {
    // Change to updateMany
    params.action = 'updateMany';
    if (params.args.data !== undefined) {
      params.args.data.deletedAt = new Date();
    } else {
      params.args.data = { deletedAt: new Date() };
    }
  }

  return next(params);
};
