import React, { useCallback } from "react";
import DebouncedInput from "./DebouncedInput";

/**
 * @author Ankur Mundra on May, 2023
 */

interface FilterProps {
  filterValue: string | number;
  setFilterValue: (value: string | number) => void;
  isDisabled?: boolean; // New optional prop to disable the filter
}

const GlobalFilter: React.FC<FilterProps> = ({
  filterValue,
  setFilterValue,
  isDisabled = true, // Default to true for disabling
}) => {
  const searchHandler = useCallback(
    (value: string | number) => setFilterValue(value),
    [setFilterValue]
  );

  if (isDisabled) {
    return null; // Render nothing when disabled
  }

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
