'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { DishListResType } from '@/schemaValidations/dish.schema'
import { useDishListQuery } from '@/queries/useDish'
import {
  formatCurrency,
  getVietnameseDishStatus,
  simpleMatchText,
} from '@/lib/utils'
import { Button } from '@repo/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import AutoPagination from '@/components/molecules/auto-pagination'
import { DishStatus } from '@/constants/type'

type DishItem = DishListResType['data']['dishes'][0]

const DishesDialog = ({ onChoose }: { onChoose: (dish: DishItem) => void }) => {
  const t = useTranslations('Orders')
  const tAll = useTranslations('All')

  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<number>(0)
  const [limit, setLimit] = useState<number>(12)
  const [pagination, setPagination] = useState({
    pageIndex: page,
    pageSize: limit,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const dishListQuery = useDishListQuery(page + 1, limit)
  const data = dishListQuery.data?.payload.data.dishes ?? []
  const meta = dishListQuery.data?.payload.data.meta

  const columns: ColumnDef<DishItem>[] = useMemo(() => {
    return [
      {
        id: 'dishName',
        header: t('dishesDialog.dish'),
        cell: ({ row }) => (
          <div className="flex items-center space-x-4">
            <Image
              src={row.original.image}
              alt={row.original.name}
              width={50}
              height={50}
              className="h-[50px] w-[50px] rounded-md object-cover"
            />
            <span>{row.original.name}</span>
          </div>
        ),
        filterFn: (row, _, filterValue: string) => {
          if (filterValue === undefined) return true
          return simpleMatchText(String(row.original.name), String(filterValue))
        },
      },
      {
        accessorKey: 'price',
        header: t('dishesDialog.price'),
        cell: ({ row }) => (
          <div className="capitalize">
            {formatCurrency(row.getValue('price'))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('dishesDialog.status'),
        cell: ({ row }) => (
          <div>{tAll(getVietnameseDishStatus(row.getValue('status')))}</div>
        ),
      },
    ]
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const choose = (dish: DishItem) => {
    onChoose(dish)
    setOpen(false)
  }

  useEffect(() => {
    table.setPagination({
      pageIndex: page,
      pageSize: limit,
    })
  }, [table, page, limit])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{tAll('change')}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('selectDish')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center gap-2 py-4">
              <Input
                placeholder={tAll('searchValue', {
                  value: tAll('name'),
                })}
                value={
                  (table.getColumn('dishName')?.getFilterValue() as string) ??
                  ''
                }
                onChange={(event) =>
                  table
                    .getColumn('dishName')
                    ?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() =>
                          row.original.status === DishStatus.Available &&
                          choose(row.original)
                        }
                        className="cursor-pointer"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {tAll('noData')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
              <div className="flex-1 py-4 text-xs text-muted-foreground ">
                {tAll('showResultPagination', {
                  result: table.getPaginationRowModel().rows.length,
                  total: data.length,
                })}
              </div>
              <div>
                <AutoPagination
                  pageSize={meta?.totalPages ?? 1}
                  page={page}
                  setPage={setPage}
                  limit={limit}
                  setLimit={setLimit}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DishesDialog
