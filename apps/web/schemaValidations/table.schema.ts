import z from 'zod'

import { TableStatusValues } from '@/constants/type'
import { MetaSchema } from '@/schemaValidations/metadata.schema'

export const CreateTableBody = z.object({
  number: z.coerce.number().positive({ message: 'minTableNumber' }),
  capacity: z.coerce.number().positive({ message: 'minCapacity' }),
  status: z.enum(TableStatusValues).optional(),
})

export type CreateTableBodyType = z.TypeOf<typeof CreateTableBody>

export const TableSchema = z.object({
  number: z.coerce.number(),
  capacity: z.coerce.number(),
  status: z.enum(TableStatusValues),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const TableRes = z.object({
  data: TableSchema,
  message: z.string(),
})

export type TableResType = z.TypeOf<typeof TableRes>

export const TableListRes = z.object({
  data: z.object({
    tables: z.array(TableSchema),
    meta: MetaSchema,
  }),

  message: z.string(),
})

export type TableListResType = z.TypeOf<typeof TableListRes>

export const UpdateTableBody = z.object({
  changeToken: z.boolean(),
  capacity: z.coerce.number().positive({ message: 'minCapacity' }),
  status: z.enum(TableStatusValues).optional(),
})
export type UpdateTableBodyType = z.TypeOf<typeof UpdateTableBody>
export const TableParams = z.object({
  number: z.coerce.number(),
})
export type TableParamsType = z.TypeOf<typeof TableParams>
