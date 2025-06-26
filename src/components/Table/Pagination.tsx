import { TableState } from "@tanstack/react-table";
import React from "react";
import { Col, Pagination as BPagination, Row } from "react-bootstrap";
import Input from "../Input";
import Select from "../Select";

interface PaginationProps {
  nextPage: () => void;
  previousPage: () => void;
  canNextPage: () => boolean;
  canPreviousPage: () => boolean;
  setPageIndex: (updater: number | ((pageIndex: number) => number)) => void;
  setPageSize: (pageSize: number) => void;
  getPageCount: () => number;
  getState: () => TableState;
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
  } = props;

  const totalPages = getPageCount();
  const isPaginationDisabled = totalPages <= 1;

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const pageSize =
      selectedValue === `${Number.MAX_SAFE_INTEGER}`
        ? Number.MAX_SAFE_INTEGER // Show all (effectively no pagination)
        : Number(selectedValue);
    
    setPageSize(pageSize);

    // Reset to the first page when "Show All" is selected
    if (pageSize === Number.MAX_SAFE_INTEGER) {
      setPageIndex(0);
    }
  };

  // Handle case when "Show All" is selected and pagination is disabled
  if (isPaginationDisabled && getState().pagination.pageSize !== Number.MAX_SAFE_INTEGER) return null;

  return (
    <Row className="justify-content-center">
      <Col xs="auto">
        <BPagination>
          <BPagination.First onClick={() => setPageIndex(0)} disabled={!canPreviousPage()} />
          <BPagination.Prev onClick={() => previousPage()} disabled={!canPreviousPage()} />
          <BPagination.Next onClick={() => nextPage()} disabled={!canNextPage()} />
          <BPagination.Last
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={!canNextPage()}
          />
        </BPagination>
      </Col>
      <Col xs="auto">
        <Input
          id="columnFilter"
          label="Go to page"
          input={{
            type: "number",
            min: "1",
            max: totalPages,
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
            { label: "Show 10", value: "10" },
            { label: "Show 25", value: "25" },
            { label: "Show 50", value: "50" },
            { label: "Show All", value: `${Number.MAX_SAFE_INTEGER}` }, // Add "Show All" with a large value
          ]}
          input={{
            value: getState().pagination.pageSize,
            onChange: handlePageSizeChange, // Call the handlePageSizeChange function
          }}
        />
      </Col>
    </Row>
  );
};

const PaginationWrapper: React.FC<PaginationProps> = (props) => {
  const totalPages = props.getPageCount();
  if (totalPages <= 1 && props.getState().pagination.pageSize !== Number.MAX_SAFE_INTEGER) return null;
  return <Pagination {...props} />;
};

export default PaginationWrapper;
