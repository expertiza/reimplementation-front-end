import { Column } from "@tanstack/react-table";
import React, { useCallback } from "react";
import DebouncedInput from "./DebouncedInput";

/**
 * @author Ankur Mundra on May, 2023
 */

interface FilterProps {
  column: Column<any>;
}

const ColumnFilter: React.FC<FilterProps> = ({ column }) => {
  const [filterValue, setFilterValue] = [column.getFilterValue, column.setFilterValue];
  const searchHandler = useCallback(
    (value: string | number) => setFilterValue(value),
    [setFilterValue]
  );

  return (
    <DebouncedInput
      className="w-75"
      onChange={searchHandler}
      value={filterValue() ?? ""}
      placeholder="Search"
    />
  );
};

export default ColumnFilter;
