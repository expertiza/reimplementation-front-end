import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Table as BTable, Col, Container, Row } from "react-bootstrap";
import { BsChevronDown, BsChevronRight } from "react-icons/bs";
import { FaSearch } from "react-icons/fa";
import ColumnFilter from "./ColumnFilter";
import GlobalFilter from "./GlobalFilter";
import Pagination from "./Pagination";
import RowSelectCheckBox from "./RowSelectCheckBox";

interface TableProps {
  data: Record<string, any>[];
  columns: ColumnDef<any, any>[];
  disableGlobalFilter?: boolean;
  showGlobalFilter?: boolean;
  showColumnFilter?: boolean;
  showPagination?: boolean;
  tableSize?: { span: number; offset: number };
  columnVisibility?: Record<string, boolean>;
  onSelectionChange?: (selectedData: Record<any, any>[]) => void;
  renderSubComponent?: (props: { row: any }) => React.ReactNode;
  getRowCanExpand?: (row: any) => boolean;
}

const Table: React.FC<TableProps> = ({
  data: initialData,
  columns,
  disableGlobalFilter = false,
  showGlobalFilter = false,
  showColumnFilter = true,
  showPagination = true,
  onSelectionChange,
  columnVisibility = {},
  tableSize = { span: 12, offset: 0 },
  renderSubComponent,
  getRowCanExpand,
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string | number>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibilityState, setColumnVisibilityState] = useState(columnVisibility);
  const [isGlobalFilterVisible, setIsGlobalFilterVisible] = useState(showGlobalFilter);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const selectable = typeof onSelectionChange === "function";
  const onSelectionChangeRef = useRef<any>(onSelectionChange);

  const colsPlusExpander = useMemo(() => {
    if (!renderSubComponent) return columns;

    const expanderColumn: ColumnDef<any, any> = {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        if (getRowCanExpand ? !getRowCanExpand(row) : false) {
          return null;
        }
        return (
          <button
            className="btn btn-link p-0"
            onClick={(e) => {
              e.stopPropagation();
              row.toggleExpanded();
            }}
          >
            {row.getIsExpanded() ? <BsChevronDown /> : <BsChevronRight />}
          </button>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    };

    const selectableColumn = selectable
      ? [
          {
            id: "select",
            header: ({ table }: any) => (
              <RowSelectCheckBox
                {...{
                  checked: table.getIsAllRowsSelected(),
                  indeterminate: table.getIsSomeRowsSelected(),
                  onChange: table.getToggleAllRowsSelectedHandler(),
                }}
              />
            ),
            cell: ({ row }: any) => (
              <RowSelectCheckBox
                {...{
                  checked: row.getIsSelected(),
                  disabled: !row.getCanSelect(),
                  indeterminate: row.getIsSomeSelected(),
                  onChange: row.getToggleSelectedHandler(),
                }}
              />
            ),
            enableSorting: false,
            enableFilter: false,
          },
        ]
      : [];

    return [...selectableColumn, expanderColumn, ...columns];
  }, [columns, selectable, renderSubComponent, getRowCanExpand]);

  const table = useReactTable({
    data: initialData,
    columns: colsPlusExpander,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility: columnVisibilityState,
      expanded,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibilityState,
    onExpandedChange: setExpanded,
    getRowCanExpand,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const flatRows = table.getSelectedRowModel().flatRows;

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    if (typeof onSelectionChangeRef.current !== "function") {
      return;
    }
    const selectedData = flatRows.map((flatRow) => flatRow.original);
    const handleSelectionChange = onSelectionChangeRef.current;
    handleSelectionChange?.(selectedData);
  }, [flatRows]);

  const toggleGlobalFilter = () => {
    setIsGlobalFilterVisible(!isGlobalFilterVisible);
  };

  const firstRenderRef = useRef(true);

  return (
    <>
      {!disableGlobalFilter && (
        <Container>
          <Row className="mb-md-2" style={{ flex: 1 }}>
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
      )}
      <Container>
        <Row style={{ flex: 1 }}>
          <Col md={tableSize}>
            <BTable striped hover responsive size="sm">
              <thead className="table-secondary">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none"
                                  : "",
                                onClick: header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: " 🔼",
                                desc: " 🔽",
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                            {showColumnFilter && header.column.getCanFilter() ? (
                              <ColumnFilter column={header.column} />
                            ) : null}
                          </>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {row.getIsExpanded() && renderSubComponent && (
                      <tr>
                        <td colSpan={row.getVisibleCells().length}>
                          {renderSubComponent({ row })}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </BTable>
            {showPagination && (
              <Pagination
                nextPage={table.nextPage}
                previousPage={table.previousPage}
                canNextPage={table.getCanNextPage}
                canPreviousPage={table.getCanPreviousPage}
                setPageIndex={table.setPageIndex}
                setPageSize={table.setPageSize}
                getPageCount={table.getPageCount}
                getState={table.getState}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Table;
