import { useLocation, useParams, useRouter } from "@tanstack/react-router";
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
import PondsIcon from "../svg/map/PondsIcon";
import { NoDataPonds } from "../svg/NoDataPonds";

const TanStackTable: FC<any> = ({
  columns,
  data,
  loading = false,
  getData,
  removeSortingForColumnIds,
  heightClass,
  noDataLabel,
  lastRowRef,
  isFetchingNextPage,
  onRowClick,
  sortBy,
  sortType,
  setSortBy,
  tableType,
  setSortType,
}: any) => {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([
    { id: sortBy, desc: sortType === "desc" },
  ]);
  const location = useLocation();

  const searchParams = new URLSearchParams(location?.search);
  const table = useReactTable({
    columns,
    data: data?.length ? data : [],
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater;
      if (newSorting.length > 0) {
        setSortBy(newSorting[0].id);
        setSortType(newSorting[0].desc ? "desc" : "asc");
      } else {
        setSortBy("title");
        setSortType("desc");
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const getWidth = (id: string) => {
    const widthObj = columns.find((col: any) => col.id === id);
    return widthObj ? widthObj?.width || widthObj?.size || "100px" : "100px";
  };

  const { user_id, apfc_id, device_id, pond_id } = useParams({
    strict: false,
  });

  const sortAndGetData = (header: Header<any, unknown>) => {
    if (
      removeSortingForColumnIds &&
      removeSortingForColumnIds.length &&
      removeSortingForColumnIds.includes(header.id)
    ) {
      return;
    }

    let newSortBy = header.id;
    let newSortType = "asc";
    if (sortBy === header.id) {
      if (sortType === "asc") {
        newSortType = "desc";
      } else if (sortType === "desc") {
        newSortBy = "";
        newSortType = "";
      }
    }
    setSorting(
      newSortBy ? [{ id: newSortBy, desc: newSortType === "desc" }] : []
    );
    setSortBy(newSortBy);
    setSortType(newSortType);
    getData({
      ...Object.fromEntries(searchParams),
      pageIndex: Number(searchParams.get("current_page")) || 1,
      pageSize: Number(searchParams.get("page_size")) || 25,
      sort_by: newSortBy || undefined,
      sort_type: newSortType || undefined,
    });
  };

  return (
    <div
      className={`scrollbar w-full ${heightClass ? heightClass : "h-auto"}  rounded-md`}
      style={{ overflowX: "auto", overflowY: "visible" }}
    >
      <div
        className={`scrollbar w-full relative ease-in-out duration-300 transition-all ${
          heightClass ? heightClass : "h-auto"
        }`}
        style={{ overflowY: "auto", overflowX: "visible" }}
      >
        {!data.length && !loading && tableType !== "ponds" ? (
          <div
            className={`w-full box-border flex flex-col  items-center justify-center text-center text-gray-500 ${
              location.pathname.startsWith("/devices")
                ? "p-40  top-0 "
                : "p-10 r"
            }`}
          >
            {location.pathname.startsWith("/devices") ? (
              <>
                <NoDataDevice className="mb-2  " />
                <p className="mb-2 font-medium ">
                  {noDataLabel ? noDataLabel : "No devices available"}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center justify-center h-[70vh] w-full ">
                  <NoUsersDataSvg />
                  <p className=" font-medium ">
                    {noDataLabel ? noDataLabel : "No users found"}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className={`[&>*:first-child]:h-full ${
              heightClass ? heightClass : "h-auto"
            }`}
          >
            <Table
              className={`relative   ${
                tableType === "ponds" ? "rounded-md" : ""
              }`}
            >
              <TableHeader className="sticky top-0 z-40">
                {table?.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(
                      (header: Header<any, unknown>, index: number) => (
                        <TableHead
                          key={index}
                          colSpan={header.colSpan}
                          className={`${
                            tableType == "ponds"
                              ? "bg-neutral-200"
                              : "bg-gray-200"
                          }`}
                        >
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center gap-1 text-xs font-normal ${
                                header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : ""
                              }`}
                              onClick={() => sortAndGetData(header)}
                              style={{
                                minWidth: getWidth(header.id),
                                width: getWidth(header.id),
                                borderRadius:
                                  index === 0
                                    ? "5px 0 0 0"
                                    : index === headerGroup.headers.length - 1
                                      ? "0 5px 0 0"
                                      : "0",
                              }}
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
                      )
                    )}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="relative">
                {loading && !isFetchingNextPage ? (
                  [...Array(15)].map((_, i) => (
                    <TableRow
                      key={`loading-row-${i}`}
                      className="border-b-4 border-b-lightgray text-xs 3xl:text-sm text-gray-700 font-normal"
                    >
                      {[...Array(columns.length)].map((_, j) => (
                        <TableCell key={`loading-cell-${i}-${j}`}>
                          {j == 1 ? (
                            <div className="p-0 flex gap-0 items-center">
                              <Skeleton className="h-7 w-7 rounded-full bg-gray-200" />
                              <Skeleton className="h-3 w-3/5 bg-gray-200 rounded-none" />
                            </div>
                          ) : (
                            <div className="p-0">
                              <Skeleton className="h-3 w-3/5 bg-gray-200 rounded-none" />
                            </div>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : !data.length && tableType === "ponds" ? (
                  <TableRow className="pointer-events-none hover:bg-transparent">
                    <TableCell
                      colSpan={columns.length}
                      className="h-[600px] text-center align-middle "
                    >
                      <div className="flex flex-col items-center justify-center text-gray-500 h-full w-full">
                        <NoDataPonds className="mb-2" />
                        <p className="font-medium">
                          {noDataLabel ? noDataLabel : "No ponds found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {table?.getRowModel().rows.map((row: any, index) => {
                      const isLastRow =
                        index === table.getRowModel().rows.length - 1;
                      return (
                        <TableRow
                          key={row.id}
                          ref={isLastRow ? lastRowRef : null}
                          onClick={() => onRowClick?.(row.original)}
                          className={`border-b border-slate-200 h-full w-full text-center hover:text-black ${
                            user_id == row?.original?.id ||
                            apfc_id == row?.original?.id ||
                            device_id == row?.original?.id ||
                            pond_id == row?.original?.id
                              ? "bg-E4F5E3"
                              : "hover:bg-gray-100"
                          } transition-colors duration-0 cursor-pointer`}
                        >
                          {row
                            .getVisibleCells()
                            .map((cell: any, cellIndex: any) => (
                              <TableCell
                                className={`p-0 !bg-transparent ${
                                  user_id == row?.original?.id ||
                                  apfc_id == row?.original?.id ||
                                  device_id == row?.original?.id ||
                                  pond_id == row?.original?.id
                                    ? "selectedCell"
                                    : "defaultCell"
                                } transition-colors duration-0 cursor-pointer ${
                                  cell.column?.id === "full_name"
                                    ? "overflow-visible"
                                    : ""
                                }`}
                                key={cell?.id}
                                style={{
                                  overflow:
                                    cell.column.id === "full_name"
                                      ? "visible"
                                      : undefined,
                                  position:
                                    cell.column.id === "full_name"
                                      ? "static"
                                      : undefined,
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
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        {isFetchingNextPage && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 py-3 z-30">
            <div className="flex justify-center items-center gap-3 mb-2.5">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 font-medium">
                Loading more...
              </span>
            </div>
          </div>
        )}
      </div>
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
  if (removeSortingForColumnIds?.includes(header.id)) {
    return null;
  }

  return (
    <div className="flex items-center">
      {sortBy === header.id ? (
        sortType === "asc" ? (
          <SortAscIcon />
        ) : (
          <SortDescIcon />
        )
      ) : (
        <SortIcon />
      )}
    </div>
  );
};
