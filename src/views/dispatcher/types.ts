export type OrderStatus = 'NEW' | 'SCHEDULED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';

export interface DriverRow {
  _id: string;
  name: string;
  phone: string;
  specialization?: string;
  status: 'free' | 'busy';
  telegramId?: number;
  telegramUsername?: string;
  telegramLinkedAt?: string;
  deepLinkToken: string;
  isActive: boolean;
  companyId: number;
}

export interface OrderRow {
  _id: string;
  customer: string;
  phone: string;
  address: string;
  location?: string;
  description?: string;
  priority: number;
  status: OrderStatus;
  companyId: number;
  requestedAt?: string | Date;
  scheduledAt?: string | Date;
  acknowledgedAt?: string | Date;
  completedAt?: string | Date;
  cancelledAt?: string | Date;
  cancelReason?: string;
  assignedTo?: DriverRow | string | null;
  tgGroupMessageId?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OrderStats {
  total: number;
  new: number;
  scheduled: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  todayCompleted: number;
  overdue: number;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'Yangi',
  SCHEDULED: 'Rejalashtirilgan',
  ASSIGNED: 'Tayinlangan',
  IN_PROGRESS: 'Bajarilmoqda',
  COMPLETED: 'Bajarildi',
  CANCELLED: 'Bekor qilindi',
  POSTPONED: 'Qoldirildi',
};

export const STATUS_COLORS: Record<
  OrderStatus,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  NEW: 'default',
  SCHEDULED: 'info',
  ASSIGNED: 'primary',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
  POSTPONED: 'secondary',
};

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Past',
  2: "O'rta",
  3: 'Yuqori',
};

export const isOverdue = (order: OrderRow): boolean => {
  if (!order.scheduledAt) return false;
  if (['COMPLETED', 'CANCELLED'].includes(order.status)) return false;
  return new Date(order.scheduledAt) < new Date();
};
