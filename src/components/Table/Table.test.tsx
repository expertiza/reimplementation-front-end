import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ColumnDef } from "@tanstack/react-table";
import Table from "./Table";

interface Person {
  name: string;
  email: string;
}

const columns: ColumnDef<Person, string>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const rows = (n: number): Person[] =>
  Array.from({ length: n }, (_, i) => ({
    name: `Person ${i}`,
    email: `person${i}@example.com`,
  }));

// The spec is written against 24 items; the default page size is 10.
const TWENTY_FOUR = rows(24);

const searchBoxes = () => screen.queryAllByPlaceholderText("Search");
const pageTurning = () => screen.queryByLabelText("Go to page");
const pageSizeDropdown = (container: HTMLElement) => container.querySelector("select");

const choosePageSize = (container: HTMLElement, value: string) => {
  fireEvent.change(pageSizeDropdown(container)!, { target: { value } });
};

describe("Table pagination and filter visibility", () => {
  it("24 items at Show 10: three pages, so search boxes, page turning and dropdown", () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    expect(searchBoxes()).toHaveLength(columns.length);
    expect(pageTurning()).toBeInTheDocument();
    expect(pageSizeDropdown(container)).toBeInTheDocument();
  });

  it("24 items at Show 50: one page, so no search boxes and no page turning, chooser stays", () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    choosePageSize(container, "50");

    expect(searchBoxes()).toHaveLength(0);
    expect(pageTurning()).not.toBeInTheDocument();
    expect(pageSizeDropdown(container)).toBeInTheDocument();
  });

  it("24 items at Show All: one page, but search boxes and dropdown both stay", () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    // "Show All" carries the row count as its value.
    choosePageSize(container, "24");

    expect(searchBoxes()).toHaveLength(columns.length);
    expect(pageSizeDropdown(container)).toBeInTheDocument();
  });

  // Fewer rows than the smallest page size: nothing to page, nothing to choose
  // between, so the whole footer goes — not just the page-turning controls.
  it("a table smaller than the smallest page size has no footer at all", () => {
    const { container } = render(
      <Table data={rows(5)} columns={columns} showColumnFilter={true} />
    );

    expect(searchBoxes()).toHaveLength(0);
    expect(pageTurning()).not.toBeInTheDocument();
    expect(pageSizeDropdown(container)).not.toBeInTheDocument();
  });

  it("hides the footer at exactly the smallest page size — 10 is not MORE than 10", () => {
    const { container } = render(
      <Table data={rows(10)} columns={columns} showColumnFilter={true} />
    );

    expect(pageTurning()).not.toBeInTheDocument();
    expect(pageSizeDropdown(container)).not.toBeInTheDocument();
  });

  // Every size stays on offer above the threshold, including ones bigger than the
  // row count: at 26 rows, Show 50 is how you get everything onto one page.
  it("offers every page size once the chooser is shown", () => {
    const { container } = render(<Table data={rows(26)} columns={columns} />);

    const labels = [...pageSizeDropdown(container)!.options].map((o) => o.text);
    expect(labels).toEqual(["Show 10", "Show 25", "Show 50", "Show All"]);
  });

  it("shows no search boxes when the caller has not opted in", () => {
    render(<Table data={TWENTY_FOUR} columns={columns} />);
    expect(searchBoxes()).toHaveLength(0);
  });

  // Regression: the stored pageSize (24, from "Show All") used to match none of
  // the chooser's options once a filter dropped totalItems below it — the fixed
  // sizes stay 10/25/50 and "Show All" now carries the new, smaller totalItems.
  // The controlled <select> then silently fell back to its first option ("Show
  // 10") while the table kept paging at 24, so the dropdown lied about the
  // table's actual page size.
  it("keeps the selected page size selectable after a filter shrinks the row count", async () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    // "Show All" carries the row count (24) as its value.
    choosePageSize(container, "24");

    // Matches "Person 1" and "Person 10".."Person 19" — 11 rows, which keeps the
    // chooser visible (totalItems > 10) while being neither a fixed size nor
    // the new totalItems "Show All" would offer.
    fireEvent.change(searchBoxes()[0], { target: { value: "Person 1" } });

    await waitFor(() => expect(container.querySelectorAll("tbody tr")).toHaveLength(11), {
      timeout: 2000,
    });

    const select = pageSizeDropdown(container)!;
    expect(select).toHaveValue("24");
    expect([...select.options].map((o) => o.text)).toContain("Show 24");
  });

  // Regression: visibility used to be keyed off the POST-filter row count, so
  // narrowing a table below one page unmounted the inputs mid-search and left
  // the filter stuck with no way to clear it.
  it("keeps the search boxes mounted after filtering narrows below one page", async () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    fireEvent.change(searchBoxes()[0], { target: { value: "Person 12" } });

    await waitFor(() => expect(container.querySelectorAll("tbody tr")).toHaveLength(1), {
      timeout: 2000,
    });
    expect(searchBoxes()).toHaveLength(columns.length);
    expect(searchBoxes()[0]).toHaveValue("Person 12");
  });
});

describe("Table showPagination={false}", () => {
  // Regression: getPaginationRowModel always slices by pageSize regardless of
  // showPagination, so hiding the footer used to silently truncate the table to
  // the default page size (10) with no control left to reach the rest.
  it("renders every row even past the default page size when pagination is hidden", () => {
    const { container } = render(<Table data={TWENTY_FOUR} columns={columns} showPagination={false} />);

    expect(container.querySelectorAll("tbody tr")).toHaveLength(TWENTY_FOUR.length);
    expect(pageTurning()).not.toBeInTheDocument();
  });

  // Regression: pageSize was derived from initialData.length (TOP-level rows only), but
  // getPaginationRowModel slices the EXPANDED tree. A single parent row with pageSize=1
  // truncated away every one of its getSubRows children the moment it was expanded.
  it("keeps expanded sub-rows visible when the parent row count is smaller than its children", () => {
    const parent = [{ name: "Parent", email: "" }];
    const subRows = rows(4);

    const { container } = render(
      <Table
        data={parent}
        columns={columns}
        showPagination={false}
        getSubRows={(row) => (row === parent[0] ? subRows : undefined)}
        getRowCanExpand={(row) => row.original === parent[0]}
      />
    );

    fireEvent.click(container.querySelector("tbody tr button.btn-link")!);

    expect(container.querySelectorAll("tbody tr")).toHaveLength(1 + subRows.length);
  });
});

describe("Table column filter clearing", () => {
  // Regression: raising the page size past the (now filtered) row count hid the
  // filter inputs via columnFilterVisible, but left columnFilters set, so the table
  // stayed silently narrowed with no visible control to clear the filter.
  it("clears an active filter once the filter input is hidden by a page-size change", async () => {
    const { container } = render(
      <Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />
    );

    // Matches "Person 1" and "Person 10"-"Person 19": 11 rows, still above the
    // page-size-chooser threshold, so the dropdown stays available.
    fireEvent.change(searchBoxes()[0], { target: { value: "Person 1" } });
    // 11 rows match, but the default page size (10) still caps what is on screen.
    await waitFor(() => expect(container.querySelectorAll("tbody tr")).toHaveLength(10), {
      timeout: 2000,
    });

    // Show 50 raises pageSize past the 24 UNFILTERED rows, hiding the inputs.
    choosePageSize(container, "50");
    expect(searchBoxes()).toHaveLength(0);

    // The filter must have been cleared, not just hidden — all 24 rows come back.
    await waitFor(() => expect(container.querySelectorAll("tbody tr")).toHaveLength(24), {
      timeout: 2000,
    });
  });
});

describe("Table meta.style", () => {
  // Regression: tdProps was spread after the style prop, so any column meta style
  // was silently dropped on body cells whenever getCellProps returned a style.
  it("applies a column's meta.style to header and body cells, alongside getCellProps", () => {
    const styled: ColumnDef<Person, string>[] = [
      { accessorKey: "name", header: "Name", meta: { style: { borderLeftStyle: "hidden" } } },
    ];

    const { container } = render(
      <Table
        data={rows(3)}
        columns={styled}
        getCellProps={() => ({ style: { backgroundColor: "rgb(1, 2, 3)" } })}
      />
    );

    expect(container.querySelector("thead th")).toHaveStyle({ borderLeftStyle: "hidden" });

    const bodyCell = container.querySelector("tbody td")!;
    expect(bodyCell).toHaveStyle({ borderLeftStyle: "hidden" });
    expect(bodyCell).toHaveStyle({ backgroundColor: "rgb(1, 2, 3)" });
  });
});

describe("Table column-filter layout", () => {
  it("locks column widths when column filters are enabled", () => {
    render(<Table data={TWENTY_FOUR} columns={columns} showColumnFilter={true} />);
    expect(screen.getByRole("table")).toHaveStyle({ tableLayout: "fixed" });
  });

  it("leaves layout alone when column filters are off", () => {
    render(<Table data={TWENTY_FOUR} columns={columns} />);
    expect(screen.getByRole("table")).not.toHaveStyle({ tableLayout: "fixed" });
  });

  it("lets a caller opt out via tableStyle", () => {
    render(
      <Table
        data={TWENTY_FOUR}
        columns={columns}
        showColumnFilter={true}
        tableStyle={{ tableLayout: "auto" }}
      />
    );
    expect(screen.getByRole("table")).toHaveStyle({ tableLayout: "auto" });
  });
});
