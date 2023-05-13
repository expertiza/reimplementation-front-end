import React, { useCallback } from "react";
import DebouncedInput from "./DebouncedInput";

/**
 * @author Ankur Mundra on May, 2023
 */

interface FilterProps {
  filterValue: string | number;
  setFilterValue: (value: string | number) => void;
}

const GlobalFilter: React.FC<FilterProps> = ({ filterValue, setFilterValue }) => {
  const searchHandler = useCallback(
    (value: string | number) => setFilterValue(value),
    [setFilterValue]
  );

  return (
    <DebouncedInput
      onChange={searchHandler}
      value={filterValue ?? ""}
      className="w-75"
      label="Search"
      placeholder="Search all columns"
    />
  );
};

export default GlobalFilter;
