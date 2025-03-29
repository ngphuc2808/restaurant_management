export type DishIndicator = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  status: string;
  successOrders: number;
};

export type RevenueByDate = {
  date: string;
  revenue: number;
};

export type IndicatorType = {
  revenue: number;
  guestCount: number;
  orderCount: number;
  servingTableCount: number;
  dishIndicator: DishIndicator[];
  revenueByDate: RevenueByDate[];
};
