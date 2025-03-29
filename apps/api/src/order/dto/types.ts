import { GuestType } from '@/guest/dto/types';

export type OrderType = {
  id: number;
  guestId: number;
  tableNumber: number;
  dishSnapshotId: number;
  quantity: number;
  orderHandlerId: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  dishSnapshot: DishSnapshotType;
  guest: GuestType;
  orderHandler: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
  };
};

export type DishSnapshotType = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  status: string;
  dishId: number;
  createdAt: Date;
  updatedAt: Date;
};
