import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ColumnDef } from "@tanstack/react-table";
import Table from "./Table";

const columns: ColumnDef<any, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const rows = (n: number) =>
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

describe("Table meta.style", () => {
  // Regression: tdProps was spread after the style prop, so any column meta style
  // was silently dropped on body cells whenever getCellProps returned a style.
  it("applies a column's meta.style to header and body cells, alongside getCellProps", () => {
    const styled: ColumnDef<any, any>[] = [
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
