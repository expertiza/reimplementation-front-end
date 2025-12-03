import React, { act } from "react";
import { render, screen, within } from "@testing-library/react";
import CreateTeams from "./CreateTeams";
import {Team, LoaderPayload, Participant, ContextType} from "./CreateTeams"
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";


const teamData: Team[] = [
    {
        id: 10917,
        name: "Team 10917",
        mentor: { id: 10186, username: "ta10186", fullName: "Teaching Assistant 10186" },
        members: [
            { id: 10917, username: "student10917", fullName: "Student 10917" },
            { id: 10916, username: "student10916", fullName: "Student 10916" },
            { id: 10928, username: "student10928", fullName: "Student 10928" },
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
    },
]

const participantData: Participant[] = [
    {id: 20000, username: "student20000", fullName: "Student 20000"},
    {id: 20001, username: "student20001", fullName: "Student 20001"},
    {id: 20002, username: "student20002", fullName: "Student 20002"},
]

const assignmentContext = {
    contextType: 'assignment' as ContextType,
    contextName: "Assignment 1"
}

// Mock the useAPI hook to return mock assignments
jest.mock("hooks/useAPI", () => () => ({
    error: null,
    isLoading: false,
    data: {
        initialTeams: teamData,
        initialUnassigned: participantData
    },
    sendRequest: jest.fn(),
}));

const renderWithRouter = (component: React.ReactNode, contextType: ContextType, contextName: string) => {
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: component,
                loader: () => ({
                    contextType: contextType,
                    contextName: contextName,
                    initialTeams: teamData,
                    initialUnassigned: participantData
                }), // Mock your loader data
            },
        ],
        {
            initialEntries: ["/"], // Specify the initial URL
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

describe("Test Create Teams Displays Correctly", () => {
    it("Renders the component correctly as an assignment", async () => {
        await act(async () => {
            renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
        });
        expect(screen.getByText(/Create Team/i)).toBeInTheDocument();
        expect(screen.getByText(/Assignment 1/i)).toBeInTheDocument();
    });

    it("Renders the component correctly as an course", async () => {
        await act(async () => {
            renderWithRouter(<CreateTeams />, 'course', "Course 1");
        });
        expect(screen.getByText(/Create Team/i)).toBeInTheDocument();
        expect(screen.getByText(/Course 1/i)).toBeInTheDocument();
    });

    it("Renders the table correctly", async () => {
        await act(async () => {
            renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
        });

        expect(screen.getByText(/Details/i)).toBeInTheDocument();
        expect(screen.getByText(/Actions/i)).toBeInTheDocument();
    });

    /**
     * Update this when format is fixed. Should go element by element and test that
     * The correct information is displayed. Currently, elements don't have distinguishing
     * classes/ids.
     */
    it("Renders the table contents correctly", async () => {

        await act(async () => {
            renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
        });


        const sortedTeams = teamData.sort((teamA, teamB) => {
          if (typeof teamA.id === 'string' && typeof teamB.id === 'string') {
            return teamA.id.localeCompare(teamB.id)
          } else {
            return Number(teamA.id)  - Number(teamB.id)
          }
        });
        const teamRows = screen.getAllByTestId("team-row")

      teamRows.forEach((row, teamIdx) => {
            const team = sortedTeams[teamIdx]

            const actual_team_name = team.name.replace(/\s*MentoredTeam$/i, '')
            expect(within(row).getByText(actual_team_name)).toBeInTheDocument();

            const teamMentorRegex = new RegExp(`${team.mentor?.id}` , "i");
            expect(within(row).getAllByText(teamMentorRegex)[0]).toBeInTheDocument();

            team.members.forEach((member) => {
                const memberRegex = new RegExp(`${member.id}` , "i");
                expect(within(row).getAllByText(memberRegex)[0]).toBeInTheDocument();
            })
        })
    });
});

describe("Test Create Teams Functions Correctly", () => {
    it("Test Adding a Student to a Team", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      const teamTabPanel = screen.getByRole('tabpanel', {name: "Teams"})

      // Check student not on page
      expect(within(teamTabPanel).queryByText(participantData[0].username)).not.toBeInTheDocument()

      const firstRow = screen.getAllByTestId("team-row")[0]

      // Click Add Button and Select student in modal dropdown
      act(() => {
        const addButton = within(firstRow).getByRole('button', {name: "add"})
        addButton.click()
      });

      act(() => {
        const dropdown = screen.getByRole('combobox')
        userEvent.selectOptions(dropdown, String(participantData[0].id))

        within(screen.getByRole('dialog')).getByRole('button', {name: "add"}).click()
      })

      // Check student on page
      expect(within(teamTabPanel).getByText(participantData[0].username)).toBeInTheDocument()
    });

    it("Test Edit Team Name", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      // Check team on page
      const teamRegex = new RegExp(`${teamData[0].name}` , "i");
      const team = screen.getByText(teamRegex)
      expect(team).toBeInTheDocument()

      // Click Edit Button
      act(() => {
        if (!team.parentElement?.parentElement) fail()
        const editButton = within(team.parentElement?.parentElement).getByRole('button', {name: "edit"})
        editButton.click()
      });

      // Type in new team name
      act(() => {
        var textBox = screen.getByRole('textbox', {name: "Team name"})
        userEvent.type(textBox, "{selectall}{backspace}")
        userEvent.type(textBox, "New Team Name", {});
        screen.getByRole('button', {name: "save"}).click()
      })

      // Check new team name
      const teamNewName = await screen.findByText("New Team Name")
      expect(teamNewName).toBeInTheDocument()
    });

    it("Test Removing a Team", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      // Check team on page
      const teamRegex = new RegExp(`${teamData[0].name}` , "i");
      const team = screen.getByText(teamRegex)
      expect(team).toBeInTheDocument()

      // Click Delete button
      act(() => {
        if (!team.parentElement?.parentElement) fail()
        const deleteButton = within(team.parentElement?.parentElement).getByRole('button', {name: "delete"})
        deleteButton.click()
      });

      // Check team not on page
      expect(team).not.toBeInTheDocument()

    });

    it("Test Removing a Mentor", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      // Check Mentor is there
      //   const team = screen.getByRole('tabpanel', {name: "Teams"})
        const teamMentorRegex = new RegExp(`${teamData[0].mentor?.username}` , "i");
        const mentor = screen.getByText(teamMentorRegex)
        expect(mentor).toBeInTheDocument()

      // Click Delete Button
      act(() => {
        if (!mentor.parentElement) fail()
        const deleteButton = within(mentor.parentElement).getByRole("button")
        deleteButton.click()
      });

      // Check Mentor no longer there
      expect(mentor).not.toBeInTheDocument()
    });

    it("Test Removing a Student", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      // Check Student is there
      const studentButton = screen.getByText(teamData[0].members[0].username || "")
      expect(studentButton).toBeInTheDocument()

      // Click Delete ButtonfullName
      act(() => {
        const deleteButton = within(studentButton).getByRole('button')
        deleteButton.click()
      });

      // Check Student no longer there
      expect(studentButton).not.toBeInTheDocument()
    });

    it("Test Showing All Unassigned Users", async () => {
      await act(async () => {
        renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
      });

      const teamTabPanel = screen.getByRole('tabpanel', {name: "Teams"})
      const unassignedTabPanel = screen.getByRole('tabpanel', {name: "Students without teams"})

      expect(screen.getAllByRole('tab')).toHaveLength(2)

      expect(teamTabPanel).toHaveClass('active')
      expect(unassignedTabPanel).not.toHaveClass('active')

      // Check unassigned participants aren't there
      participantData.forEach((participant) => {
        expect(within(teamTabPanel).queryByText(participant.username || "")).not.toBeInTheDocument()
      })

      // Navigate to other tab
      act(() => {
        const unassignedTab = screen.getByRole('tab', {name: "Students without teams"})
        unassignedTab.click()
      });


      expect(unassignedTabPanel).toHaveClass('active')
      expect(teamTabPanel).not.toHaveClass(`active`)

      // Check all unassigned participants are on the page
      participantData.forEach((participant) => {
        expect(within(within(unassignedTabPanel).getByTestId("student-list")).getByText(participant.username)).toBeInTheDocument()
        // expect(within(screen.getByTestId("student-list")).getByText(participant.fullName?.replace(" ", "") || "", {exact: false})).toBeInTheDocument()
      })
    });

});

describe("Test Create Teams Handles Errors Properly", () => {
  it("Make sure empty names aren't accepted for teams", async () => {
    await act(async () => {
      renderWithRouter(<CreateTeams />, assignmentContext.contextType, assignmentContext.contextName);
    });

    // Check team on page
    const teamRegex = new RegExp(`${teamData[0].name}` , "i");
    const team = screen.getByText(teamRegex)
    expect(team).toBeInTheDocument()

    // Click Edit Button
    act(() => {
      if (!team.parentElement?.parentElement) fail()
      const editButton = within(team.parentElement?.parentElement).getByRole('button', {name: "edit"})
      editButton.click()
    });

    // Make text box empty
    act(() => {
      var textBox = screen.getByRole('textbox', {name: "Team name"})
      userEvent.type(textBox, "{selectall}{backspace}")
      screen.getByRole('button', {name: "save"}).click()
    })

    // Make sure the modal is still on the screen
    expect(screen.getByRole('textbox', {name: "Team name"})).toBeInTheDocument()

    // Close Modal
    act(() => {
      screen.getByRole('button', {name: "cancel"}).click()
    })

    // Make sure name stayed the same
    expect(team).toBeInTheDocument()
  })
});
