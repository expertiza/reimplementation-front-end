import React, { act } from "react";
import { render, screen } from "@testing-library/react";
import CreateTeams from "./CreateTeams";
import {Team, LoaderPayload, Participant, ContextType} from "./CreateTeams"
import { BrowserRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import "@testing-library/jest-dom";
import assignment from "./Assignment";

// const assignmentData = {
//     id: 2,
//     name: "Assignment 2",
//     courseName: "Test Course",
//     description: "Description 2",
//     created_at: "2023-01-03",
//     updated_at: "2023-01-04",
// };

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
        data: teamData
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

describe("Test Assign Reviewers Displays Correctly", () => {
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

        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();


        expect(screen.getByText(/Contributor/i)).toBeInTheDocument();
        expect(screen.getByText(/Reviewed By/i)).toBeInTheDocument();
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

        teamData.forEach((team) => {
            expect(screen.getByText(team.name)).toBeInTheDocument();

            var teamMentorRegex = new RegExp(`${team.mentor?.id}` , "i");
            expect(screen.getAllByText(teamMentorRegex)[0]).toBeInTheDocument();

            team.members.forEach((member) => {
                var memberRegex = new RegExp(`${member.id}` , "i");
                expect(screen.getAllByText(memberRegex)[0]).toBeInTheDocument();
            })
        })
    });
});

describe("Test Assign Reviewers Functions Correctly", () => {
    xit("Test Assigning a Reviewer", () => {

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
