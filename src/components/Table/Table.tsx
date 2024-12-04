import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Col, Container, Row, Table as BTable } from "react-bootstrap";
import ColumnFilter from "./ColumnFilter";
import GlobalFilter from "./GlobalFilter";
import Pagination from "./Pagination";
import RowSelectCheckBox from "./RowSelectCheckBox";
import { FaSearch } from "react-icons/fa";
import * as XLSX from "xlsx";

/**
 * @author Ankur Mundra on May, 2023
 */

interface TableProps {
  data: Record<string, any>[];
  columns: ColumnDef<any, any>[];
  showGlobalFilter?: boolean;
  showColumnFilter?: boolean;
  showPagination?: boolean;
  tableSize?: { span: number; offset: number };
  columnVisibility?: Record<string, boolean>;
  onSelectionChange?: (selectedData: Record<any, any>[]) => void;
}

const Table: React.FC<TableProps> = ({
  data: initialData,
  columns,
  showGlobalFilter = false,
  showColumnFilter = true,
  showPagination = true,
  onSelectionChange,
  columnVisibility = {},
  tableSize = { span: 12, offset: 0 },
}) => {
  const colsPlusSelectable = useMemo(() => {
    const selectableColumn: any = {
      id: "select",
      header: ({ table }: any) => {
        return (
          <RowSelectCheckBox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        );
      },
      cell: ({ row }: any) => {
        return (
          <RowSelectCheckBox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        );
      },
      enableSorting: false,
      enableFilter: false,
    };
    return [selectableColumn, ...columns];
  }, [columns]);

  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string | number>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibilityState, setColumnVisibilityState] = useState(columnVisibility);
  const [isGlobalFilterVisible, setIsGlobalFilterVisible] = useState(showGlobalFilter);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const selectable = typeof onSelectionChange === "function";
  const onSelectionChangeRef = useRef<any>(onSelectionChange);

  const table = useReactTable({
    data: initialData,
    columns: selectable ? colsPlusSelectable : columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility: columnVisibilityState,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibilityState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const {
    getState,
    getHeaderGroups,
    getRowModel,
    getCanNextPage,
    getCanPreviousPage,
    previousPage,
    nextPage,
    setPageIndex,
    setPageSize,
    getPageCount,
  } = table;

  useEffect(() => {
    if (typeof onSelectionChangeRef.current === "function") {
      const selectedData = table.getSelectedRowModel().flatRows.map((flatRow) => flatRow.original);
      onSelectionChangeRef.current(selectedData);
    }
  }, [table.getSelectedRowModel().flatRows]);

  useEffect(() => {
    setLastUpdated(new Date());
  }, [initialData]);

  const toggleGlobalFilter = () => {
    setIsGlobalFilterVisible(!isGlobalFilterVisible);
  };

  const exportTableData = (format: "csv" | "xlsx") => {
    const tableData = initialData.map((row) => {
      const rowData: Record<string, any> = {};
      columns.forEach((col) => {
        const accessor = col.id; // Use column `id` for keys
        if (accessor) {
          rowData[accessor] = row[accessor];
        }
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TableData");

    const fileType = format === "csv" ? "csv" : "xlsx";
    XLSX.writeFile(workbook, `table_data.${fileType}`);
  };

  const refreshTableData = () => {
    setLastUpdated(new Date());
  };

  return (
    <>
      <Container>
        <Row className="mb-md-2">
          <Col md={{ span: 12 }}>
            {isGlobalFilterVisible && (
              <GlobalFilter filterValue={globalFilter} setFilterValue={setGlobalFilter} />
            )}
          </Col>
          <span style={{ marginLeft: "5px" }} onClick={toggleGlobalFilter}>
            <FaSearch style={{ cursor: "pointer" }} />
            {isGlobalFilterVisible ? " Hide" : " Show"}
          </span>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col md={tableSize}>
            <BTable striped hover responsive size="sm">
              <thead className="table-secondary">
                {getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : "",
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted()
                              ? header.column.getIsSorted() === "asc"
                                ? " 🔼"
                                : " 🔽"
                              : null}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </BTable>
            {showPagination && (
              <Pagination
                nextPage={nextPage}
                previousPage={previousPage}
                canNextPage={getCanNextPage}
                canPreviousPage={getCanPreviousPage}
                setPageIndex={setPageIndex}
                setPageSize={setPageSize}
                getPageCount={getPageCount}
                getState={getState}
              />
            )}
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => exportTableData("csv")} className="btn btn-primary me-2">
                Export to CSV
              </button>
              <button onClick={() => exportTableData("xlsx")} className="btn btn-primary">
                Export to Excel
              </button>
            </div>
            <div style={{ marginTop: "10px" }}>
              <span>
                Last Updated: {lastUpdated ? lastUpdated.toLocaleString() : "Never"}
              </span>
              <button onClick={refreshTableData} className="btn btn-secondary ms-3">
                Refresh Data
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Table;
