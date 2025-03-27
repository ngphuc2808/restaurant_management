'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import {
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
import { Check, ChevronsUpDown } from 'lucide-react'
import { endOfDay, format, startOfDay } from 'date-fns'
import { ColumnDef } from '@tanstack/react-table'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import useAppStore from '@/store/app'
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from '@/schemaValidations/order.schema'
import { GuestCreateOrdersResType } from '@/schemaValidations/guest.schema'
import { useTableListQuery } from '@/queries/useTable'
import {
  useGetOrderListQuery,
  useUpdateOrderMutation,
} from '@/queries/useOrder'
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  getVietnameseOrderStatus,
  handleErrorApi,
  simpleMatchText,
} from '@/lib/utils'
import { cn } from '@repo/ui/lib/utils'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@repo/ui/components/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { Input } from '@repo/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { toast } from '@repo/ui/hooks/use-toast'
import { OrderStatusValues } from '@/constants/type'
import TableSkeleton from '@/app/[locale]/manage/orders/table-skeleton'
import OrderStatics from '@/app/[locale]/manage/orders/order-statics'
import { useOrderService } from '@/app/[locale]/manage/orders/order.service'
import AddOrder from '@/app/[locale]/manage/orders/add-order'
import EditOrder from '@/app/[locale]/manage/orders/edit-order'
import OrderGuestDetail from '@/app/[locale]/manage/orders/order-guest-detail'
import AutoPagination from '@/components/molecules/auto-pagination'
import SearchParamsLoader, {
  useSearchParamsLoader,
} from '@/components/atoms/search-params-loader'
import useOrderTable from '@/store/order'
import { OrderStatus } from '@/constants/type'

export type OrderItem = GetOrdersResType['data'][0]
export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>
export type Statics = {
  status: StatusCountObject
  table: Record<number, Record<number, StatusCountObject>>
}
export type OrderObjectByGuestID = Record<number, GetOrdersResType['data']>
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

const OrderTable = () => {
  const { socket } = useAppStore()

  const t = useTranslations('Orders')
  const tAll = useTranslations('All')

  const { orderIdEdit, setOrderIdEdit } = useOrderTable()

  const { searchParams, setSearchParams } = useSearchParamsLoader()
  const page = searchParams?.get('page') ? Number(searchParams?.get('page')) : 1
  const [openStatusFilter, setOpenStatusFilter] = useState(false)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const pageIndex = page - 1
  const orderListQuery = useGetOrderListQuery({
    fromDate,
    toDate,
  })
  const refetchOrderList = orderListQuery.refetch
  const orderList = orderListQuery.data?.payload.data ?? []
  const tableListQuery = useTableListQuery()
  const tableList = tableListQuery.data?.payload.data ?? []
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number)
  const updateOrderMutation = useUpdateOrderMutation()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE,
  })

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } =
    useOrderService(orderList)

  const changeStatus = async (body: {
    orderId: number
    dishId: number
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body)
    } catch (error) {
      handleErrorApi({
        error,
      })
    }
  }

  const columns: ColumnDef<OrderItem>[] = [
    {
      accessorKey: 'tableNumber',
      header: t('table.tableNumber'),
      cell: ({ row }) => <div>{row.getValue('tableNumber')}</div>,
      filterFn: (row, columnId, filterValue: string) => {
        if (filterValue === undefined) return true
        return simpleMatchText(
          String(row.getValue(columnId)),
          String(filterValue),
        )
      },
    },
    {
      id: 'guestName',
      header: t('table.guest'),
      cell: function Cell({ row }) {
        const guest = row.original.guest
        return (
          <div>
            {!guest && (
              <div>
                <span>{tAll('deleted')}</span>
              </div>
            )}
            {guest && (
              <Popover>
                <PopoverTrigger>
                  <div>
                    <span>{guest.name}</span>
                    <span className="font-semibold">(#{guest.id})</span>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] sm:w-[440px]">
                  <OrderGuestDetail
                    guest={guest}
                    orders={orderObjectByGuestId[guest.id]!}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        )
      },
      filterFn: (row, _, filterValue: string) => {
        if (filterValue === undefined) return true
        return simpleMatchText(
          row.original.guest?.name ?? tAll('deleted'),
          String(filterValue),
        )
      },
    },
    {
      id: 'dishName',
      header: t('table.dish'),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Image
                src={row.original.dishSnapshot.image}
                alt={row.original.dishSnapshot.name}
                width={50}
                height={50}
                className="h-[50px] w-[50px] cursor-pointer rounded-md object-cover"
              />
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex flex-wrap gap-2">
                <Image
                  src={row.original.dishSnapshot.image}
                  alt={row.original.dishSnapshot.name}
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] rounded-md object-cover"
                />
                <div className="space-y-1 text-sm">
                  <h3 className="font-semibold">
                    {row.original.dishSnapshot.name}
                  </h3>
                  <div className="italic">
                    {formatCurrency(row.original.dishSnapshot.price)}
                  </div>
                  <div>{row.original.dishSnapshot.description}</div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>{row.original.dishSnapshot.name}</span>
              <Badge className="px-1" variant={'secondary'}>
                x{row.original.quantity}
              </Badge>
            </div>
            <span className="italic">
              {formatCurrency(
                row.original.dishSnapshot.price * row.original.quantity,
              )}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('table.status'),
      cell: function Cell({ row }) {
        const changeOrderStatus = async (
          status: (typeof OrderStatusValues)[number],
        ) => {
          changeStatus({
            orderId: row.original.id,
            dishId: row.original.dishSnapshot.dishId!,
            status: status,
            quantity: row.original.quantity,
          })
        }
        return (
          <Select
            onValueChange={(value: (typeof OrderStatusValues)[number]) => {
              changeOrderStatus(value)
            }}
            defaultValue={OrderStatus.Pending}
            value={row.getValue('status')}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {OrderStatusValues.map((status) => (
                <SelectItem key={status} value={status}>
                  {tAll(getVietnameseOrderStatus(status))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      id: 'orderHandlerName',
      header: t('table.processor'),
      cell: ({ row }) => <div>{row.original.orderHandler?.name ?? ''}</div>,
    },
    {
      accessorKey: 'createdAt',
      header: t('table.createUpdate'),
      cell: ({ row }) => (
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-4">
            {formatDateTimeToLocaleString(row.getValue('createdAt'))}
          </div>
          <div className="flex items-center space-x-4">
            {formatDateTimeToLocaleString(
              row.original.updatedAt as unknown as string,
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: function Actions({ row }) {
        const { setOrderIdEdit } = useOrderTable()
        const openEditOrder = () => {
          setOrderIdEdit(row.original.id)
        }

        return (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('table.actions')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openEditOrder}>
                {tAll('edit')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orderList,
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

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    })
  }, [table, pageIndex])

  useEffect(() => {
    function refetch() {
      const now = new Date()
      if (now >= fromDate && now <= toDate) {
        refetchOrderList()
      }
    }

    function onNewOrder(data: GuestCreateOrdersResType['data']) {
      const { guest } = data[0]!
      toast({
        description: t('createSocket', {
          name: guest?.name,
          table: guest?.tableNumber,
          quantity: data.length,
        }),
      })
      refetch()
    }

    function onUpdateOrder(data: UpdateOrderResType['data']) {
      const {
        dishSnapshot: { name },
        quantity,
        status,
      } = data
      toast({
        description: t('updateSocket', {
          name,
          quantity,
          status: tAll(getVietnameseOrderStatus(status)),
        }),
      })
      refetch()
    }

    function onPayment(data: PayGuestOrdersResType['data']) {
      const { guest } = data[0]!
      toast({
        description: t('paymentSocket', {
          name: guest?.name,
          table: guest?.tableNumber,
          quantity: data.length,
        }),
      })
      refetch()
    }

    socket?.on('new-order', onNewOrder)
    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)

    return () => {
      socket?.off('new-order', onNewOrder)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [socket, refetchOrderList, fromDate, toDate])

  return (
    <>
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <div className="w-full">
        <EditOrder
          id={orderIdEdit}
          setId={setOrderIdEdit}
          onSubmitSuccess={() => {}}
        />
        <div className=" flex items-center">
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
                  event.target.value && setToDate(new Date(event.target.value))
                }
              />
            </div>
            <Button className="" variant={'outline'} onClick={resetDateFilter}>
              {tAll('reset')}
            </Button>
          </div>
          <div className="ml-auto">
            <AddOrder />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 py-4">
          <Input
            placeholder={t('guestName')}
            value={
              (table.getColumn('guestName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('guestName')?.setFilterValue(event.target.value)
            }
            className="max-w-[150px]"
          />
          <Input
            placeholder={t('tableNumber')}
            value={
              (table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('tableNumber')?.setFilterValue(event.target.value)
            }
            className="max-w-[150px]"
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatusFilter}
                className="w-[150px] justify-between text-sm"
              >
                {table.getColumn('status')?.getFilterValue()
                  ? tAll(
                      getVietnameseOrderStatus(
                        table
                          .getColumn('status')
                          ?.getFilterValue() as (typeof OrderStatusValues)[number],
                      ),
                    )
                  : tAll('status')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        className="cursor-pointer"
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue ===
                                table.getColumn('status')?.getFilterValue()
                                ? ''
                                : currentValue,
                            )
                          setOpenStatusFilter(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            table.getColumn('status')?.getFilterValue() ===
                              status
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                        {tAll(getVietnameseOrderStatus(status))}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />
        {orderListQuery.isPending && <TableSkeleton />}
        {!orderListQuery.isPending && (
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
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 py-4 text-xs text-muted-foreground ">
            {tAll('showResultPagination', {
              result: table.getPaginationRowModel().rows.length,
              total: orderList.length,
            })}
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/orders"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderTable
