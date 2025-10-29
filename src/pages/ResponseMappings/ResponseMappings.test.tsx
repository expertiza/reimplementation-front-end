import React, { act } from "react";
import { render, screen, within } from "@testing-library/react";
import ResponseMappings, {
  ResponseMapRow,
  ResponseRow,
  Team,
  TeamUser,
  User,
    demo
} from "./ResponseMappings";
import { BrowserRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import "@testing-library/jest-dom";
import {Simulate} from "react-dom/test-utils";
import click = Simulate.click;

const APIAssignmentData = {
      id: 2,
      name: "Assignment 2",
      courseName: "Test Course",
      description: "Description 2",
      created_at: "2023-01-03",
      updated_at: "2023-01-04",
    };


/**
 * To be used when API is introduced to the page
 */
const APITeamData = [
  {
    id: 10917,
    name: "Team 10917",
    mentor: { id: 10186, username: "ta10186", fullName: "Teaching Assistant 10186" },
    members: [
      { id: 10917, username: "student10917", fullName: "Student 10917" },
      { id: 10916, username: "student10916", fullName: "Student 10916" },
      { id: 10928, username: "student10928", fullName: "Student 10928" },
    ],
    reviewers: [
      {
        id: 1,
        reviewer: { id: 10925, username: "student10925", fullName: "Student 10925" },
        status: "Saved",
      },
      {
        id: 2,
        reviewer: { id: 10927, username: "student10927", fullName: "Student 10927" },
        status: "Saved",
      },
    ],
  },
  {
    id: 10925,
    name: "Team 10925",
    mentor: { id: 10624, username: "ta10624", fullName: "Teaching Assistant 10624" },
    members: [
      { id: 10925, username: "student10925", fullName: "Student 10925" },
      { id: 10914, username: "student10914", fullName: "Student 10914" },
      { id: 10904, username: "student10904", fullName: "Student 10904" },
    ],
    reviewers: [
      {
        id: 3,
        reviewer: { id: 10934, username: "student10934", fullName: "Student 10934" },
        status: "Submitted",
      },
      {
        id: 4,
        reviewer: { id: 10928, username: "student10928", fullName: "Student 10928" },
        status: "Submitted",
      },
      {
        id: 5,
        reviewer: { id: 10909, username: "student10909", fullName: "Student 10909" },
        status: "Submitted",
      },
    ],
  },
]



// Mock the useAPI hook to return mock assignments
jest.mock("hooks/useAPI", () => () => ({
  error: null,
  isLoading: false,
  data: {
    data: APITeamData
  },
  sendRequest: jest.fn(),
}));

const renderWithRouter = (component: React.ReactNode) => {
  const router = createMemoryRouter(
    [
      {
        path: "/ssignments/edit/:id/responsemappings",
        element: component,
        loader: () => (APIAssignmentData), // Mock your loader data
      },
    ],
    {
      initialEntries: [`/ssignments/edit/${APIAssignmentData.id}/responsemappings`], // Specify the initial URL
    }
  );

  return render(
    <RouterProvider
      router={router}
      future={{
        v7_startTransition: true,
      }}
    />
  );
};

const renderAndLoad = async () => {
  await act(async () => {
    renderWithRouter(<ResponseMappings />);
  });

  await act (async () => {
    // Load Table Data
    const loadButton = screen.getByRole("button", {'name': /Load demo data/i})
    loadButton.click()
  });
}

describe("Test Response Mappings Displays Correctly", () => {
  it("Renders the table correctly", async () => {
    await act(async () => {
      renderWithRouter(<ResponseMappings />);
    });

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    var memberRegex = new RegExp(`Assign Reviewer: ${APIAssignmentData.name}` , "i");
    expect(screen.getAllByText(/Assign Reviewer: /i)).toHaveLength(2)

    expect(screen.getByText(/Contributor/i)).toBeInTheDocument();
    expect(screen.getByText(/Reviewed by/i)).toBeInTheDocument();
  });

  /**
   * Update this when format is fixed. Should go element by element and test that
   * The correct information is displayed. Currently, elements don't have distinguishing
   * classes/ids.
   */
  it("Renders the Contributor Column Correctly", async () => {

    await renderAndLoad()

    const data = demo(APIAssignmentData.id)
    const sortedTeams = data.teams.sort((teamA: Team, teamB: Team) => teamA.id - teamB.id)


    // Get the table rows, and remove the first (column headers)
    const allTableRows = screen.getAllByRole('row')
    allTableRows.shift()

    allTableRows.forEach((row, idx) => {
      // Skip the header row
      if (idx != 0) {
        const cols = within(row).getAllByRole("cell");
        expect(cols).toHaveLength(2);

        const contributerCol = cols[0];
        const reviewedByCol = cols[1];

        var team = sortedTeams[idx]
        var mentorName = data.users.find((user: User) => user.id === team.mentor_id)?.full_name
        var members = data.teams_users.filter((user: TeamUser) => user.team_id === team.id)

        // Team Name
        expect(within(contributerCol).getByText(sortedTeams[idx].name)).toBeInTheDocument();

        // Mentor Name
        expect(contributerCol).toHaveTextContent(`Mentor: ${mentorName}`);

        // Members
        members.forEach((member: TeamUser) => {
          var memberName = data.users.find((user: User) => user.id === member.user_id)?.full_name
          expect(memberName).toBeTruthy()
          expect(contributerCol).toHaveTextContent(memberName || "")
        })

        // Buttons
        var buttons = within(contributerCol).getAllByRole('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toHaveTextContent("Add reviewer")
        expect(buttons[1]).toHaveTextContent("Delete outstanding reviewers")
      }
    })
  });

  it("Renders the Reviewed By Column Correctly", async () => {

    await renderAndLoad()

    const data = demo(APIAssignmentData.id)
    console.log(data.users)
    const sortedTeams = data.teams.sort((teamA: Team, teamB: Team) => teamA.id - teamB.id)

    // Get the table rows, and remove the first (column headers)
    const allTableRows = screen.getAllByRole('row')
    allTableRows.shift()

    allTableRows.forEach((row, idx) => {
        var team = sortedTeams[idx]
        var teamResponseMaps = data.response_maps.filter((responseMap: ResponseMapRow) => responseMap.reviewee_team_id == team.id)
        var teamReviewers = teamResponseMaps.map((responseMap: ResponseMapRow) => {return data.users.find((user: User) => user.id === responseMap.reviewer_user_id)})
        var teamReviews  = teamResponseMaps.map((responseMap: ResponseMapRow) => {return data.responses.find((response: ResponseRow) => response.map_id === responseMap.id)})
        var cleanedTeamReviews = teamReviews.filter(item => item !== null && item !== undefined);
        const reviewerRows = within(row).queryAllByTestId("ex-review-row")


        reviewerRows.forEach((reviewerRow, reviewerIdx) => {
          var review = cleanedTeamReviews.find((review: ResponseRow) => teamResponseMaps[reviewerIdx].id === review?.map_id )

          // Name
          expect(reviewerRow).toHaveTextContent(teamReviewers[reviewerIdx]?.full_name || "")

          // Status
          // If the review is submitted
          if (review && review.is_submitted) {
            expect(reviewerRow).toHaveTextContent("Submitted")

            expect(within(reviewerRow).getByRole('button', {name: "(unsubmit)"})).toBeInTheDocument()
          } else {
            if (review) {
              expect(reviewerRow).toHaveTextContent("Saved")
            } else {
              expect(reviewerRow).toHaveTextContent("Not saved")
            }
          }

          expect(within(reviewerRow).getByRole('button', {name: "delete"})).toBeInTheDocument()
        })
    })
  });
});

describe("Test Response Mappings Functions Correctly", () => {
  let promptSpy: jest.SpyInstance;

  beforeEach(() => {
    promptSpy = jest.spyOn(window, 'prompt');
  });

  afterEach(() => {
    promptSpy.mockRestore();
  });

  it("Test Assigning a Reviewer", async () => {
    promptSpy.mockReturnValue('1005');
    await renderAndLoad()
    const data = demo(APIAssignmentData.id)

    // Finds the first "Add Reviewer" button on the screen
    var user_name = data.users.find((user: User) => user.id === 1005)?.full_name || ""
    var firstRow = screen.getAllByRole('row')[1]
    var firstRowContributorCell = within(firstRow).getAllByRole("cell")[1];

    expect(firstRowContributorCell).not.toHaveTextContent(user_name)


    var addReviewerButton = within(firstRow).getByRole('button', {name: "Add reviewer"})
    addReviewerButton.click()

    console.log(promptSpy)
    expect(promptSpy).toBeCalled()

    firstRowContributorCell = (await within((await screen.findAllByRole('row'))[1]).findAllByRole("cell"))[1]
    expect(firstRowContributorCell).toHaveTextContent(user_name)
  });

  xit("Test Adding a Reviewer", () => {

  });

  xit("Test Removing a Reviewer", () => {

  });

  xit("Test Removing all Current Reviewer", () => {

  });

  xit("Test Unsubmitting a Review", () => {

  });

  xit("Test Showing Names / Usernames", () => {

  });
});
