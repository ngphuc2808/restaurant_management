'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import { TableListResType } from '@/schemaValidations/table.schema'
import { useTableListQuery } from '@/queries/useTable'
import { getVietnameseTableStatus, simpleMatchText } from '@/lib/utils'
import { cn } from '@repo/ui/lib/utils'
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
import { TableStatus } from '@/constants/type'
import AutoPagination from '@/components/molecules/auto-pagination'

type TableItem = TableListResType['data'][0]

const PAGE_SIZE = 10

const TablesDialog = ({
  onChoose,
}: {
  onChoose: (table: TableItem) => void
}) => {
  const t = useTranslations('Orders')
  const tAll = useTranslations('All')

  const [open, setOpen] = useState(false)
  const tableListQuery = useTableListQuery()
  const data = tableListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const columns: ColumnDef<TableItem>[] = useMemo(() => {
    return [
      {
        accessorKey: 'number',
        header: t('tableDialog.tableNumber'),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('number')}</div>
        ),
        filterFn: (row, columnId, filterValue: string) => {
          if (filterValue === undefined) return true
          return simpleMatchText(
            String(row.original.number),
            String(filterValue),
          )
        },
      },
      {
        accessorKey: 'capacity',
        header: t('tableDialog.capacity'),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('capacity')}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('tableDialog.status'),
        cell: ({ row }) => (
          <div>{tAll(getVietnameseTableStatus(row.getValue('status')))}</div>
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
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  const choose = (table: TableItem) => {
    onChoose(table)
    setOpen(false)
  }

  useEffect(() => {
    table.setPagination({
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    })
  }, [table])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{tAll('change')}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('selectTable')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex items-center gap-2 py-4">
              <Input
                placeholder={t('tableNumber')}
                value={
                  (table.getColumn('number')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('number')?.setFilterValue(event.target.value)
                }
                className="w-[150px]"
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
                        onClick={() => {
                          if (
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Reserved
                          ) {
                            choose(row.original)
                          }
                        }}
                        className={cn({
                          'cursor-pointer':
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Reserved,
                          'cursor-not-allowed':
                            row.original.status === TableStatus.Hidden,
                        })}
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
                  page={table.getState().pagination.pageIndex + 1}
                  pageSize={table.getPageCount()}
                  onClick={(pageNumber) =>
                    table.setPagination({
                      pageIndex: pageNumber - 1,
                      pageSize: PAGE_SIZE,
                    })
                  }
                  isLink={false}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TablesDialog
