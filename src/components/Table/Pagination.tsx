import { TableState } from "@tanstack/react-table";
import React from "react";
import { Col, Pagination as BPagination, Row } from "react-bootstrap";
import Input from "../Input";
import Select from "../Select";

/**
 * @author Ankur Mundra on May, 2023
 */

interface PaginationProps {
  nextPage: () => void;
  previousPage: () => void;
  canNextPage: () => boolean;
  canPreviousPage: () => boolean;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  getPageCount: () => number;
  getState: () => TableState;
  totalRows: number;
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
    totalRows
  } = props;

  // Only show pagination if total rows exceed 25
  if (totalRows <= 25) {
    return null; // Don't render pagination controls
  }

  return (
    <Row className="justify-content-center">
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
      {/*<Col xs="auto">*/}
      {/*  {`Page ${getState().pagination.pageIndex + 1} of ${getPageCount()}`}*/}
      {/*</Col>*/}
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
      <Col xs="auto">
        <Select
          id="pageSize"
          options={[
            { label: "Show 25", value: "25" },
            { label: "Show 50", value: "50" },
            { label: "Show all", value: "1000" },
          ]}
          input={{
            value: getState().pagination.pageSize,
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
              setPageSize(Number(e.target.value)),
          }}
        />
      </Col>
    </Row>
  );
};

export default Pagination;
