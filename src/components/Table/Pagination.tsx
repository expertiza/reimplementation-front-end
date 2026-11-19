import { TableState } from "@tanstack/react-table";
import React from "react";
import { Col, Pagination as BPagination, Row } from "react-bootstrap";
import Input from "../Input";
import Select from "../Select";

/**
 * @author Ankur Mundra on May, 2023
 */

// The fixed page sizes offered, smallest first; "Show All" is appended at render.
const PAGE_SIZE_OPTIONS = [10, 25, 50];

interface PaginationProps {
  nextPage: () => void;
  previousPage: () => void;
  canNextPage: () => boolean;
  canPreviousPage: () => boolean;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  getPageCount: () => number;
  getState: () => TableState;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const {
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setPageIndex,
    setPageSize,
    getPageCount,
    getState,
    totalItems,
  } = props;
  const pageSize = getState().pagination.pageSize;
  const multiPage = totalItems > pageSize;
  // The chooser appears once there are MORE rows than the smallest page size —
  // strictly greater, so exactly 10 rows still means no chooser. Above that every
  // size stays on offer, including ones larger than the row count: picking "Show 50"
  // over 26 rows is how you put them all on one page. A footer with neither the
  // chooser nor page controls has nothing to show, so it is not rendered.
  const showPageSizeChooser = totalItems > Math.min(...PAGE_SIZE_OPTIONS);
  if (!multiPage && !showPageSizeChooser) return null;

  return (
    <Row className="justify-content-center">
      {multiPage && (
        <Col xs="auto">
          <BPagination>
            <BPagination.First onClick={() => setPageIndex(0)} disabled={!canPreviousPage()} />
            <BPagination.Prev onClick={() => previousPage()} disabled={!canPreviousPage()} />
            <BPagination.Next onClick={() => nextPage()} disabled={!canNextPage()} />
            <BPagination.Last
              onClick={() => setPageIndex(getPageCount() - 1)}
              disabled={!canNextPage()}
            />
          </BPagination>
        </Col>
      )}
      {/*<Col xs="auto">*/}
      {/*  {`Page ${getState().pagination.pageIndex + 1} of ${getPageCount()}`}*/}
      {/*</Col>*/}
      {multiPage && (
        <Col xs="auto">
          <Input
            id="columnFilter"
            label="Go to page"
            input={{
              type: "number",
              min: "1",
              max: getPageCount(),
              defaultValue: getState().pagination.pageIndex + 1,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                setPageIndex(page);
              },
            }}
          />
        </Col>
      )}
      {showPageSizeChooser && (
        <Col xs="auto">
          <Select
            id="pageSize"
            options={[
              ...PAGE_SIZE_OPTIONS.map((n) => ({ label: `Show ${n}`, value: String(n) })),
              { label: "Show All", value: String(totalItems) },
            ]}
            input={{
              value: getState().pagination.pageSize,
              onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                setPageSize(Number(e.target.value)),
            }}
          />
        </Col>
      )}
    </Row>
  );
};

export default Pagination;
