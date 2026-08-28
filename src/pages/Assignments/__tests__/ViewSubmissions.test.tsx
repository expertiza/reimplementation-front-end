import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "store/rootReducer";
import ViewSubmissions, { transformResponse } from "../ViewSubmissions";

const sendRequestMock = vi.fn();
const mockNavigate = vi.fn();

let loaderData: any;
let mockApiState: any;

vi.mock("hooks/useAPI", () => ({
  default: () => mockApiState,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");

  return {
    ...actual,
    useLoaderData: () => loaderData,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: String(loaderData?.id ?? 1) }),
  };
});

const baseLoaderData = {
  id: 1,
  name: "Design Project",
  due_dates: [{ due_at: "2099-03-20T17:00:00Z" }],
};

const apiPayload = {
  assignment_id: 1,
  assignment_name: "Design Project",
  submissions: [
    {
      id: 901,
      team_id: 301,
      team_name: "Team Alpha",
      members: [
        {
          full_name: "Alice Johnson",
          github: "alice-johnson",
          email: "alice@example.com",
        },
        {
          full_name: "Bob Carter",
          github: "https://github.com/bobcarter",
          email: "bob@example.com",
        },
      ],
      links: [
        {
          id: 1,
          url: "https://github.com/team-alpha/project",
          display_name: "Project repository",
          modified: "2026-03-19T13:00:00Z",
        },
      ],
      files: [
        {
          id: 2,
          url: "https://example.com/files/design-doc.pdf",
          name: "design-doc.pdf",
          size: "128 KB",
          type: "PDF",
          modified: "2026-03-19T13:30:00Z",
        },
      ],
    },
  ],
};

const createStore = () =>
  configureStore({
    reducer: rootReducer,
  });

const renderComponent = () => {
  const store = createStore();

  return {
    store,
    ...render(
      <Provider store={store}>
        <ViewSubmissions />
      </Provider>
    ),
  };
};

describe("transformResponse", () => {
  it("maps snake_case submission payloads to camelCase interfaces", () => {
    const transformed = transformResponse(apiPayload);

    expect(transformed).toEqual([
      {
        id: 901,
        teamId: 301,
        teamName: "Team Alpha",
        members: [
          {
            fullName: "Alice Johnson",
            github: "alice-johnson",
            email: "alice@example.com",
          },
          {
            fullName: "Bob Carter",
            github: "https://github.com/bobcarter",
            email: "bob@example.com",
          },
        ],
        links: [
          {
            id: 1,
            url: "https://github.com/team-alpha/project",
            displayName: "Project repository",
            name: "Project repository",
            size: "-",
            type: "Link",
            modified: "2026-03-19T13:00:00Z",
          },
        ],
        files: [
          {
            id: 2,
            url: "https://example.com/files/design-doc.pdf",
            displayName: "design-doc.pdf",
            name: "design-doc.pdf",
            size: "128 KB",
            type: "PDF",
            modified: "2026-03-19T13:30:00Z",
          },
        ],
      },
    ]);
  });
});

describe("ViewSubmissions", () => {
  beforeEach(() => {
    loaderData = { ...baseLoaderData };
    mockApiState = {
      error: null,
      isLoading: false,
      data: { data: apiPayload },
      sendRequest: sendRequestMock,
    };
    sendRequestMock.mockClear();
    mockNavigate.mockClear();
  });

  it("renders team names, members, links, and available actions from API data", async () => {
    renderComponent();

    await waitFor(() => {
      expect(sendRequestMock).toHaveBeenCalledWith({
        url: "/submitted_content/1/view_submissions",
      });
    });

    expect(screen.getByText("Team Alpha")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "alice-johnson" })).toHaveAttribute(
      "href",
      "https://github.com/alice-johnson"
    );
    expect(screen.getByText("(Alice Johnson)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Project repository" })).toHaveAttribute(
      "href",
      "https://github.com/team-alpha/project"
    );
    expect(screen.getByRole("link", { name: "design-doc.pdf" })).toHaveAttribute(
      "href",
      "https://example.com/files/design-doc.pdf"
    );
    expect(screen.getByRole("button", { name: /view history/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /view reviews/i })).toBeInTheDocument();
  });

  it("shows a loading indicator while submissions are loading", () => {
    mockApiState = {
      error: null,
      isLoading: true,
      data: undefined,
      sendRequest: sendRequestMock,
    };

    renderComponent();

    expect(screen.getByText(/loading submissions/i)).toBeInTheDocument();
    expect(screen.queryByText("Team Alpha")).not.toBeInTheDocument();
  });

  it("shows an empty state when the API returns an empty submissions list", async () => {
    mockApiState = {
      error: null,
      isLoading: false,
      data: {
        data: {
          assignment_id: 1,
          assignment_name: "Design Project",
          submissions: [],
        },
      },
      sendRequest: sendRequestMock,
    };

    renderComponent();

    expect(
      await screen.findByText("No submissions are available for this assignment yet.")
    ).toBeInTheDocument();
  });

  it("shows an empty state and dispatches an alert when the API fails", async () => {
    mockApiState = {
      error: "Backend unavailable",
      isLoading: false,
      data: undefined,
      sendRequest: sendRequestMock,
    };

    const { store } = renderComponent();

    expect(
      await screen.findByText("No submissions are available for this assignment yet.")
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(store.getState().alert).toMatchObject({
        show: true,
        variant: "danger",
        message: "Backend unavailable",
      });
    });
  });

  it("navigates to the review page from row actions", async () => {
    const user = userEvent.setup();

    renderComponent();

    await user.click(await screen.findByRole("button", { name: /view reviews/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/assignments/1/review?team_id=301");
    expect(screen.getByRole("button", { name: /view history/i })).toBeDisabled();
  });

  it("switches the primary action to assign grade after the due date passes", async () => {
    const user = userEvent.setup();
    loaderData = {
      ...baseLoaderData,
      due_dates: [{ due_at: "2020-03-20T17:00:00Z" }],
    };

    renderComponent();

    const assignGradeButton = await screen.findByRole("button", { name: /assign grade/i });
    await user.click(assignGradeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/assignments/1/assign-grades?team_id=301");
  });
});
