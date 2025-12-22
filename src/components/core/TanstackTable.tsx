import { useLocation, useRouter } from "@tanstack/react-router";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Header,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { FC, useState } from "react";
import { NoDataDevice } from "../svg/NoDataDeviceSvg";
import { NoUsersDataSvg } from "../svg/NoUsersDataSvg";
import { SortAscIcon } from "../svg/SortAscIcon";
import { SortDescIcon } from "../svg/SortDescIcon";
import { SortIcon } from "../svg/SortIcon";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const TanStackTable: FC<any> = ({
  columns,
  data,
  loading = false,
  getData,
  removeSortingForColumnIds,
  noDataLabel,
  lastRowRef,
  isFetchingNextPage,
  onRowClick,
  sortBy,
  sortType,
  setSortBy,
  setSortType,
  isSelectedId,
}: any) => {
  console.log(isSelectedId, "devdevw")
  const router = useRouter();
  const location = useLocation();

  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortType === "desc" },
  ]);

  const searchParams = new URLSearchParams(location?.search);

  const table = useReactTable({
    columns,
    data: data?.length ? data : [],
    state: { sorting },
    onSortingChange: (updater) => {
      setSorting(updater);
      const next =
        typeof updater === "function" ? updater(sorting) : updater;

      if (next.length) {
        setSortBy(next[0].id);
        setSortType(next[0].desc ? "desc" : "asc");
      } else {
        setSortBy("");
        setSortType("");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getWidth = (id: string) => {
    const col = columns.find((c: any) => c.id === id);
    return col?.width || col?.size || "120px";
  };

  const sortAndGetData = (header: Header<any, unknown>) => {
    if (removeSortingForColumnIds?.includes(header.id)) return;

    let nextSortBy = header.id;
    let nextSortType = "asc";

    if (sortBy === header.id) {
      if (sortType === "asc") nextSortType = "desc";
      else {
        nextSortBy = "";
        nextSortType = "";
      }
    }

    setSorting(
      nextSortBy ? [{ id: nextSortBy, desc: nextSortType === "desc" }] : []
    );

    setSortBy(nextSortBy);
    setSortType(nextSortType);

    getData({
      ...Object.fromEntries(searchParams),
      pageIndex: Number(searchParams.get("current_page")) || 1,
      page_size: Number(searchParams.get("page_size")) || 25,
      sort_by: nextSortBy || undefined,
      sort_type: nextSortType || undefined,
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {!data.length && !loading ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          {location.pathname.startsWith("/devices") ? (
            <>
              <NoDataDevice />
              <p className="mt-2">
                {noDataLabel || "No devices available"}
              </p>
            </>
          ) : (
            <>
              <NoUsersDataSvg />
              <p className="mt-2">
                {noDataLabel || "No users found"}
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto ">
            <Table className="w-full table-fixed overflow-y-auto !h-full ">
              <TableHeader className="bg-[#eef5f8] sticky top-0 z-10">
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header, index) => (
                      <TableHead
                        key={header.id}
                        className="text-xs font-normal"
                        style={{
                          width: getWidth(header.id),
                          minWidth: getWidth(header.id),
                        }}
                      >
                        {!header.isPlaceholder && (
                          <div
                            onClick={() => sortAndGetData(header)}
                            className={`flex items-center gap-1 ${header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                              }`}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <SortItems
                              header={header}
                              removeSortingForColumnIds={
                                removeSortingForColumnIds
                              }
                              sortBy={sortBy}
                              sortType={sortType}
                            />
                          </div>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading && !isFetchingNextPage ? (
                  [...Array(15)].map((_, i) => (
                    <TableRow key={i}>
                      {columns.map((_: any, j: number) => (
                        <TableCell key={j}>
                          <Skeleton className="h-3 w-3/5" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  table.getRowModel().rows.map((row: any, index) => {
                    const isLast =
                      index === table.getRowModel().rows.length - 1;
                    return (
                      <TableRow
                        key={row.id}
                        ref={isLast ? lastRowRef : null}
                        onClick={() => onRowClick?.(row.original)}
                        className={`hover:bg-[#eef5f8] cursor-pointer ${isSelectedId == row?.original?.id && "bg-[#eef5f8]"}`}
                      >
                        {row.getVisibleCells().map((cell: any) => (
                          <TableCell
                            key={cell.id}
                            style={{
                              width: getWidth(cell.column.id),
                              minWidth: getWidth(cell.column.id),
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {isFetchingNextPage && (
            <div className="bg-white border-t py-3 flex justify-center items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Loading more devices…</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TanStackTable;

export const SortItems = ({
  header,
  removeSortingForColumnIds,
  sortBy,
  sortType,
}: {
  header: any;
  removeSortingForColumnIds?: string[];
  sortBy: string;
  sortType: string;
}) => {
  if (removeSortingForColumnIds?.includes(header.id)) return null;

  if (sortBy !== header.id) return <SortIcon />;
  return sortType === "asc" ? <SortAscIcon /> : <SortDescIcon />;
};