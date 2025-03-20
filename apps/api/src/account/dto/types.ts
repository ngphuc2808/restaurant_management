export type AccountType = {
  role: string;
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  ownerId: number | null;
  createdAt: Date;
  updatedAt: Date;
};
