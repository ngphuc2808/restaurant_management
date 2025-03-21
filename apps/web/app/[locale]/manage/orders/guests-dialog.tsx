'use client'

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
import { endOfDay, format, startOfDay } from 'date-fns'

import { GetListGuestsResType } from '@/schemaValidations/account.schema'
import { useGetGuestListQuery } from '@/queries/useAccount'
import { formatDateTimeToLocaleString, simpleMatchText } from '@/lib/utils'
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

type GuestItem = GetListGuestsResType['data'][0]

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

const GuestsDialog = ({
  onChoose,
}: {
  onChoose: (guest: GuestItem) => void
}) => {
  const t = useTranslations('Orders')
  const tAll = useTranslations('All')

  const [open, setOpen] = useState(false)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const guestListQuery = useGetGuestListQuery({
    fromDate,
    toDate,
  })
  const data = guestListQuery.data?.payload.data ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const columns: ColumnDef<GuestItem>[] = useMemo(() => {
    return [
      {
        accessorKey: 'name',
        header: t('guestDialog.name'),
        cell: ({ row }) => (
          <div className="capitalize">
            {row.getValue('name')} | (#{row.original.id})
          </div>
        ),
        filterFn: (row, columnId, filterValue: string) => {
          if (filterValue === undefined) return true
          return simpleMatchText(
            row.original.name + String(row.original.id),
            String(filterValue),
          )
        },
      },
      {
        accessorKey: 'tableNumber',
        header: t('guestDialog.tableNumber'),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('tableNumber')}</div>
        ),
        filterFn: (row, columnId, filterValue: string) => {
          if (filterValue === undefined) return true
          return simpleMatchText(
            String(row.original.tableNumber),
            String(filterValue),
          )
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('guestDialog.createdAt'),
        cell: ({ row }) => (
          <div className="flex items-center space-x-4 text-sm">
            {formatDateTimeToLocaleString(row.getValue('createdAt'))}
          </div>
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

  const choose = (guest: GuestItem) => {
    onChoose(guest)
    setOpen(false)
  }

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
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
        <Button variant="outline">{t('selectGuest')}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-full overflow-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{t('selectGuest2')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className="w-full">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <span className="mr-2">{tAll('from')}</span>
                <Input
                  type="datetime-local"
                  placeholder={tAll('fromDate')}
                  className="text-sm"
                  value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) =>
                    event.target.value &&
                    setFromDate(new Date(event.target.value))
                  }
                />
              </div>
              <div className="flex items-center">
                <span className="mr-2">{tAll('to')}</span>
                <Input
                  type="datetime-local"
                  placeholder={tAll('toDate')}
                  className="text-sm"
                  value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) =>
                    event.target.value &&
                    setToDate(new Date(event.target.value))
                  }
                />
              </div>
              <Button
                className=""
                variant={'outline'}
                onClick={resetDateFilter}
              >
                {tAll('reset')}
              </Button>
            </div>
            <div className="flex items-center gap-2 py-4">
              <Input
                placeholder={tAll('searchValue', {
                  value: t('nameOrId'),
                })}
                value={
                  (table.getColumn('name')?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table.getColumn('name')?.setFilterValue(event.target.value)
                }
                className="w-[170px]"
              />
              <Input
                placeholder={t('tableNumber')}
                value={
                  (table
                    .getColumn('tableNumber')
                    ?.getFilterValue() as string) ?? ''
                }
                onChange={(event) =>
                  table
                    .getColumn('tableNumber')
                    ?.setFilterValue(event.target.value)
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
                          choose(row.original)
                        }}
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

export default GuestsDialog
