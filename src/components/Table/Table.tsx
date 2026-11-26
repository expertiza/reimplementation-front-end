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
  ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Col, Container, Row, Table as BTable } from "react-bootstrap";
import { BsChevronRight, BsChevronDown } from "react-icons/bs";
import ColumnFilter from "./ColumnFilter";
import GlobalFilter from "./GlobalFilter";
import Pagination from "./Pagination";
import RowSelectCheckBox from "./RowSelectCheckBox";
import { FaSearch } from "react-icons/fa";
import ToolTip from "components/ToolTip";

interface TableProps {
  data: Record<string, any>[];
  columns: ColumnDef<any, any>[];
  showGlobalFilter?: boolean;
  showColumnFilter?: boolean;
  showPagination?: boolean;
  tableSize?: { span: number; offset: number };
  columnVisibility?: Record<string, boolean>;
  onSelectionChange?: (selectedData: Record<any, any>[]) => void;
  renderSubComponent?: (props: { row: any }) => React.ReactNode;
  getRowCanExpand?: (row: any) => boolean;
  disableGlobalFilter?: boolean;
  // Maps column header text to a tooltip string shown as an info icon in the header.
  headingComments?: Record<string, string>;
  // When true, passes fluid to Container so the table spans the full viewport width.
  fluid?: boolean;
  // Optional callback to add a CSS class to each row.
  getRowClassName?: (row: any, allRows: any[]) => string;
  // Optional callback to add arbitrary HTML attributes to each <tr> (e.g. onMouseEnter for hover tracking).
  getRowProps?: (row: any) => React.HTMLAttributes<HTMLTableRowElement>;
  // Optional callback to add extra <td> props (e.g. rowSpan). Return { skip: true } to omit the <td> entirely (used for rowspan).
  getCellProps?: (
    cell: any,
    row: any,
    allRows: any[]
  ) => React.TdHTMLAttributes<HTMLTableCellElement> & { skip?: boolean };
  // Optional style applied to the <table> element itself (e.g. width: "fit-content").
  tableStyle?: React.CSSProperties;
  // When false, disables Bootstrap's nth-child striping (useful when applying manual group-based row colors).
  striped?: boolean;
  // When true, adds Bootstrap's table-bordered class (column + row separators on all cells).
  bordered?: boolean;
  // When false, suppresses the <thead> row entirely (useful for nested sub-tables).
  showHeader?: boolean;
  // Optional renderer for the expander cell on rows that cannot expand (e.g. show an indicator icon).
  getExpanderFallback?: (row: any) => React.ReactNode;
  // Supply sub-rows from each row's data so TanStack renders them in-place with the same columns.
  getSubRows?: (row: Record<string, any>, index: number) => Record<string, any>[] | undefined;
  // Optional stable row identity function. Receives the raw row object and its index;
  // return a unique string for each row. Without this, TanStack defaults to array index,
  // which causes React to unmount/remount rows when items are inserted in the middle.
  getRowId?: (row: Record<string, any>, index: number) => string;
}

const Table: React.FC<TableProps> = ({
  data: initialData,
  columns,
  showGlobalFilter = false,
  showColumnFilter = false,
  showPagination = true,
  onSelectionChange,
  columnVisibility = {},
  tableSize = { span: 12, offset: 0 },
  renderSubComponent,
  getRowCanExpand,
  disableGlobalFilter = false,
  headingComments = {},
  fluid = false,
  getRowClassName,
  getRowProps,
  getCellProps,
  tableStyle,
  getRowId,
  showHeader = true,
  getSubRows,
  striped = true,
  bordered = false,
  getExpanderFallback,
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string | number>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [paginationState, setPaginationState] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnVisibilityState, setColumnVisibilityState] = useState(columnVisibility);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setColumnVisibilityState(columnVisibility);
  }, [JSON.stringify(columnVisibility)]);
  const [isGlobalFilterVisible, setIsGlobalFilterVisible] = useState(showGlobalFilter);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const selectable = typeof onSelectionChange === "function";
  const onSelectionChangeRef = useRef<any>(onSelectionChange);

  const colsPlusExpander = useMemo(() => {
    if (!renderSubComponent && !getSubRows) return columns;

    const expanderColumn: ColumnDef<any, any> = {
      id: "expander",
      header: () => null,
      meta: { width: "28px" },
      cell: ({ row }) => {
        if (getRowCanExpand ? !getRowCanExpand(row) : false) {
          return getExpanderFallback ? getExpanderFallback(row) : null;
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

    const selectableColumn: ColumnDef<any, any>[] = selectable
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
            enableColumnFilter: false,
          },
        ]
      : [];

    return [...selectableColumn, expanderColumn, ...columns];
  }, [columns, selectable, renderSubComponent, getSubRows, getRowCanExpand]);

  // When pagination controls are hidden, the table must not silently page the data:
  // getPaginationRowModel always slices by pageSize regardless of showPagination, so
  // without this override any list past the first page would just vanish with no way
  // to reach it. The pagination row model slices the EXPANDED tree (top-level rows plus
  // any expanded getSubRows children), not just initialData — deriving pageSize from
  // initialData.length (top-level row count only) truncated away expanded sub-rows
  // whenever a parent had more children than there were top-level rows (observed with
  // a single expanded course and several assignment sub-rows, but the mismatch can go
  // either way for any number of parents/children). A fixed, generously large page size
  // avoids ever needing to count rows (nested or not) to disable pagination.
  const UNPAGINATED_PAGE_SIZE = Number.MAX_SAFE_INTEGER;
  const effectivePagination = showPagination
    ? paginationState
    : { pageIndex: 0, pageSize: UNPAGINATED_PAGE_SIZE };

  const table = useReactTable({
    data: initialData,
    // ColumnDef<any, any> doesn't structurally satisfy ColumnDef<Record<string, any>, any>
    // (TanStack constrains accessorKey to `keyof TData & string`, which `any` can't match
    // exactly) even though they're compatible at runtime — callers pass columns typed
    // against their own row shape, not Record<string, any>. Cast at the boundary rather
    // than loosening TableProps.columns for every caller.
    columns: colsPlusExpander as ColumnDef<Record<string, any>, any>[],
    ...(getRowId ? { getRowId } : {}),
    ...(getSubRows ? { getSubRows } : {}),
    ...(getSubRows ? { filterFromLeafRows: true } : {}),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
      columnVisibility: columnVisibilityState,
      expanded,
      pagination: effectivePagination,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibilityState,
    onExpandedChange: setExpanded,
    onPaginationChange: setPaginationState,
    getRowCanExpand,
    // Page by top-level rows: sub-rows stay on their parent's page.
    paginateExpandedRows: false,
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

  // Filter inputs show when the data spans more than one page (rows > pageSize) or
  // when "Show All" is picked (pageSize === rows) — the two cases ">=" covers. A page
  // size larger than the data is neither, so they stay hidden.
  //
  // Counted on getCoreRowModel (the UNFILTERED rows) on purpose: getPrePaginationRowModel
  // counts rows after filtering, so narrowing a table below one page used to unmount
  // the inputs and strand the filter with no way to clear it.
  const unfilteredRows = table.getCoreRowModel().rows.length;
  const { pageSize } = table.getState().pagination;
  const columnFilterVisible = showColumnFilter && unfilteredRows >= pageSize;

  // Hiding the filter inputs must not leave an active filter applied invisibly.
  // Without this, picking a larger page size after typing into a filter dropped the
  // input (unfilteredRows < pageSize) while columnFilters stayed set, so rows stayed
  // silently narrowed with no control left to clear them.
  useEffect(() => {
    if (!columnFilterVisible) {
      setColumnFilters((prev) => (prev.length > 0 ? [] : prev));
    }
  }, [columnFilterVisible]);

  return (
    <>
      <Container fluid={fluid}>
        <Row className="mb-md-2">
          <Col md={{ span: 12 }}>
            {isGlobalFilterVisible && (
              <GlobalFilter filterValue={globalFilter} setFilterValue={setGlobalFilter} />
            )}
          </Col>
          {!disableGlobalFilter && (
            <Col xs="auto">
              <button
                type="button"
                className="btn btn-link p-0 ms-1"
                onClick={toggleGlobalFilter}
                aria-expanded={isGlobalFilterVisible}
                aria-label={`${isGlobalFilterVisible ? "Hide" : "Show"} global search`}
              >
                <FaSearch aria-hidden="true" />
                {isGlobalFilterVisible ? " Hide" : " Show"}
              </button>
            </Col>
          )}
        </Row>
      </Container>
      <Container fluid={fluid}>
        <Row>
          <Col md={tableSize}>
            <BTable
              striped={striped}
              bordered={bordered}
              hover
              responsive
              size="sm"
              style={{
                margin: tableStyle ? "0 auto" : undefined,
                // A filter input changes a column's natural width, so lock widths whenever
                // filters are enabled. Keyed off the prop rather than columnFilterVisible so
                // the layout does not flip as the row count crosses pageSize.
                // Callers opt out with tableStyle={{ tableLayout: "auto" }}.
                ...(showColumnFilter ? { tableLayout: "fixed" as const } : {}),
                ...tableStyle,
              }}
            >
              {showHeader && (
                <thead className="table-secondary">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        // Add info icon to Heading if comment exists.
                        const comment = headingComments[header.column.columnDef.header as string];
                        return (
                          <th
                            key={header.id}
                            colSpan={header.colSpan}
                            style={(() => {
                              const m = header.column.columnDef.meta as any;
                              return m
                                ? {
                                    ...(m.minWidth ? { minWidth: m.minWidth } : {}),
                                    ...(m.maxWidth ? { maxWidth: m.maxWidth } : {}),
                                    ...(m.width ? { width: m.width } : {}),
                                    ...(m.whiteSpace ? { whiteSpace: m.whiteSpace } : {}),
                                    // Free-form escape hatch, applied to header and body
                                    // cells alike so a column can style its whole strip.
                                    ...(m.style ?? {}),
                                  }
                                : undefined;
                            })()}
                          >
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
                                  {comment && <ToolTip id={header.id} info={comment} />}
                                  {{
                                    asc: " 🔼",
                                    desc: " 🔽",
                                  }[header.column.getIsSorted() as string] ?? null}
                                </div>
                                {columnFilterVisible && header.column.getCanFilter() ? (
                                  <ColumnFilter column={header.column} />
                                ) : null}
                              </>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
              )}
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <tr
                      className={
                        getRowClassName ? getRowClassName(row, table.getRowModel().rows) : undefined
                      }
                      {...(getRowProps ? getRowProps(row) : {})}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const { skip, ...tdProps } =
                          getCellProps?.(cell, row, table.getRowModel().rows) ?? {};
                        if (skip) return null;
                        const colMeta = cell.column.columnDef.meta as any;
                        const colMetaStyle = colMeta
                          ? {
                              ...(colMeta.width ? { width: colMeta.width } : {}),
                              ...(colMeta.minWidth ? { minWidth: colMeta.minWidth } : {}),
                              ...(colMeta.maxWidth ? { maxWidth: colMeta.maxWidth } : {}),
                              ...(colMeta.whiteSpace ? { whiteSpace: colMeta.whiteSpace } : {}),
                              ...(colMeta.style ?? {}),
                            }
                          : {};
                        return (
                          // tdProps is spread BEFORE style: it carries its own style key,
                          // so spreading it afterwards threw away every meta style.
                          <td
                            key={cell.id}
                            {...tdProps}
                            // overflowWrap break-word first, so a column can override it:
                            // under table-layout:fixed a value with no space in it (an email
                            // address, a URL) cannot wrap and spills over the next column.
                            // break-word, not anywhere, so it does not shrink min-content
                            // widths on the auto-layout tables.
                            style={{
                              overflowWrap: "break-word",
                              ...colMetaStyle,
                              ...(tdProps.style ?? {}),
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
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
                // Use pre-pagination row count so the total reflects active filters, not raw data length.
                totalItems={table.getPrePaginationRowModel().rows.length}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Table;
