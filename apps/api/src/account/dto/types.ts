export type AccountType = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  ownerId: number | null;
  createdAt: Date;
  updatedAt: Date;
};
