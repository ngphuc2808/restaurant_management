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
import { CaretSortIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { LoaderCircle } from 'lucide-react'

import { AccountType } from '@/schemaValidations/account.schema'
import {
  useDeleteAccountMutation,
  useGetAccountList,
} from '@/queries/useAccount'
import { handleErrorApi } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/avatar'
import { Button } from '@repo/ui/components/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table'
import { toast } from '@repo/ui/hooks/use-toast'
import AddEmployee from '@/app/[locale]/manage/accounts/add-employee'
import EditEmployee from '@/app/[locale]/manage/accounts/edit-employee'
import AutoPagination from '@/components/molecules/auto-pagination'
import useAccount from '@/store/account'

const AlertDialogDeleteAccount = ({
  employeeDelete,
  setEmployeeDelete,
}: {
  employeeDelete: AccountType | undefined
  setEmployeeDelete: (value: AccountType | undefined) => void
}) => {
  const t = useTranslations('ManageAccounts')
  const tAll = useTranslations('All')

  const { mutateAsync } = useDeleteAccountMutation()

  const deleteAccount = async () => {
    if (employeeDelete) {
      try {
        const result = await mutateAsync(employeeDelete.id)
        setEmployeeDelete(undefined)
        toast({
          title: result.payload.message,
        })
      } catch (error) {
        handleErrorApi({
          error,
        })
      }
    }
  }
  return (
    <AlertDialog
      open={Boolean(employeeDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setEmployeeDelete(undefined)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteAccount')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteDescription', {
              account: employeeDelete?.name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tAll('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteAccount}>
            {tAll('continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const AccountTable = () => {
  const {
    employeeIdEdit,
    setEmployeeIdEdit,
    employeeDelete,
    setEmployeeDelete,
  } = useAccount()

  const t = useTranslations('ManageAccounts')
  const tAll = useTranslations('All')

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

  const accountListQuery = useGetAccountList(page + 1, limit)
  const data = accountListQuery.data?.payload.data.accounts ?? []
  const meta = accountListQuery.data?.payload.data.meta

  const columns: ColumnDef<AccountType>[] = useMemo(() => {
    return [
      {
        accessorKey: 'id',
        header: 'ID',
      },
      {
        accessorKey: 'avatar',
        header: t('table.avatar'),
        cell: ({ row }) => (
          <div>
            <Avatar className="aspect-square h-[100px] w-[100px] rounded-md object-cover">
              <AvatarImage src={row.getValue('avatar')} />
              <AvatarFallback className="rounded-none text-center">
                {row.original.name}
              </AvatarFallback>
            </Avatar>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: t('table.name'),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'email',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              {t('table.email')}
              <CaretSortIcon className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: function Actions({ row }) {
          const { setEmployeeIdEdit, setEmployeeDelete } = useAccount()

          const openEditEmployee = () => {
            setEmployeeIdEdit(row.original.id)
          }

          const openDeleteEmployee = () => {
            setEmployeeDelete(row.original)
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
                <DropdownMenuItem onClick={openEditEmployee}>
                  {tAll('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDeleteEmployee}>
                  {tAll('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
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

  useEffect(() => {
    table.setPagination({
      pageIndex: page,
      pageSize: limit,
    })
  }, [table, page, limit])

  if (accountListQuery.isLoading)
    return <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />

  return (
    <div className="w-full">
      <EditEmployee
        id={employeeIdEdit}
        setId={setEmployeeIdEdit}
        onSubmitSuccess={() => {}}
      />
      <AlertDialogDeleteAccount
        employeeDelete={employeeDelete}
        setEmployeeDelete={setEmployeeDelete}
      />
      <div className="flex items-center gap-2 py-4">
        <Input
          placeholder={tAll('searchValue', { value: t('table.email') })}
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('email')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          <AddEmployee />
        </div>
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
  )
}

export default AccountTable
