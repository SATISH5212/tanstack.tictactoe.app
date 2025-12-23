import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";

const useResponsiveColumns = (columns: any[]) => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const resize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return columns.filter((col) => {
    const p = col.meta?.priority;
    if (width < 1280 && p === "low") return false;
    if (width < 1366 && p === "medium") return false;
    return true;
  });
};

const TanStackTable = ({
  columns,
  data,
  loading,
  onRowClick,
}: any) => {
  const responsiveColumns = useResponsiveColumns(columns);

  const table = useReactTable({
    columns: responsiveColumns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="h-full overflow-x-auto overflow-y-auto">
        <Table className="min-w-[1100px] w-full table-auto">
          <TableHeader className="sticky top-0 bg-[#eef5f8] z-10">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium"
                    style={{
                      minWidth: header.column.columnDef.minSize,
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading
              ? [...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  {responsiveColumns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
              : table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className="hover:bg-[#eef5f8] cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TanStackTable;
