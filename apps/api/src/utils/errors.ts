import { Prisma } from '@prisma/client';

export const PrismaErrorCode = {
  UniqueConstraintViolation: 'P2002',
  RecordNotFound: 'P2025',
} as const;

export function isPrismaClientKnownRequestError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}
