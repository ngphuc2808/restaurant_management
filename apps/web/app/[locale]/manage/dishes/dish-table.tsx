"use client";

import { useEffect, useMemo, useState } from "react";
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
} from "@tanstack/react-table";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import DOMPurify from "dompurify";

import { DishListResType } from "@/schemaValidations/dish.schema";
import { useDeleteDishMutation, useDishListQuery } from "@/queries/useDish";
import {
  formatCurrency,
  getVietnameseDishStatus,
  handleErrorApi,
} from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { toast } from "@repo/ui/hooks/use-toast";
import AddDish from "@/app/[locale]/manage/dishes/add-dish";
import EditDish from "@/app/[locale]/manage/dishes/edit-dish";
import AutoPagination from "@/components/molecules/auto-pagination";
import SearchParamsLoader, {
  useSearchParamsLoader,
} from "@/components/atoms/search-params-loader";
import useDish from "@/store/dish";
import { useTranslations } from "next-intl";

type DishItem = DishListResType["data"][0];

const AlertDialogDeleteDish = ({
  dishDelete,
  setDishDelete,
}: {
  dishDelete: DishItem | undefined;
  setDishDelete: (value: DishItem | undefined) => void;
}) => {
  const t = useTranslations("Dishes");
  const tAll = useTranslations("All");

  const { mutateAsync } = useDeleteDishMutation();
  const deleteDish = async () => {
    if (dishDelete) {
      try {
        const result = await mutateAsync(dishDelete.id);
        setDishDelete(undefined);
        toast({
          title: result.payload.message,
        });
      } catch (error) {
        handleErrorApi({
          error,
        });
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(undefined);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteDish")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteDescription", {
              name: dishDelete?.name,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tAll("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>
            {tAll("continue")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const PAGE_SIZE = 10;

const DishTable = () => {
  const t = useTranslations("Dishes");
  const tAll = useTranslations("All");

  const { searchParams, setSearchParams } = useSearchParamsLoader();
  const page = searchParams?.get("page")
    ? Number(searchParams?.get("page"))
    : 1;
  const pageIndex = page - 1;

  const { dishIdEdit, setDishIdEdit, dishDelete, setDishDelete } = useDish();

  const dishListQuery = useDishListQuery();
  const data = dishListQuery.data?.payload.data ?? [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE,
  });

  const columns: ColumnDef<DishItem>[] = useMemo(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "image",
        header: t("table.photo"),
        cell: ({ row }) => (
          <div>
            <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
              <AvatarImage src={row.getValue("image")} />
              <AvatarFallback className="rounded-none text-center">
                {row.original.name}
              </AvatarFallback>
            </Avatar>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("table.dishName"),
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "price",
        header: t("table.price"),
        cell: ({ row }) => (
          <div className="capitalize">
            {formatCurrency(row.getValue("price"))}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: t("table.description"),
        cell: ({ row }) => (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(row.getValue("description")),
            }}
            className="whitespace-pre-line"
          />
        ),
      },
      {
        accessorKey: "status",
        header: t("table.status"),
        cell: ({ row }) => (
          <div>{tAll(getVietnameseDishStatus(row.getValue("status")))}</div>
        ),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: function Actions({ row }) {
          const { setDishIdEdit, setDishDelete } = useDish();

          const openEditDish = () => {
            setDishIdEdit(row.original.id);
          };

          const openDeleteDish = () => {
            setDishDelete(row.original);
          };
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <DotsHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openEditDish}>
                  {tAll("edit")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openDeleteDish}>
                  {tAll("delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, []);

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
  });

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  return (
    <>
      <SearchParamsLoader onParamsReceived={setSearchParams} />
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish
          dishDelete={dishDelete}
          setDishDelete={setDishDelete}
        />
        <div className="flex items-center py-4 gap-2">
          <Input
            placeholder={tAll("searchValue", { value: t("table.dishName") })}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddDish />
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
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    {tAll("noData")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            {tAll("showResultPagination", {
              result: table.getPaginationRowModel().rows.length,
              total: data.length,
            })}
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DishTable;
