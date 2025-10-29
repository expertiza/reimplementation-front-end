import useAPI from "hooks/useAPI";

export const useStudentTeam = (studentId: string) => {
    const teamAPI = useAPI();
    const updateTeamNameAPI = useAPI();
    const inviteAPI = useAPI();
    const retractAPI = useAPI();
    const updateInviteAPI = useAPI();
    const leaveAPI = useAPI();
    const fetchSentInvitationsByTeamAPI = useAPI();
    const fetchSentInvitationsByParticipantAPI = useAPI();
    const fetchReceivedInvitationsAPI = useAPI();

    const fetchTeam = () =>
        teamAPI.sendRequest({ url: `/student_teams/view?student_id=${studentId}` });

    const updateName = (name: string) =>
        updateTeamNameAPI.sendRequest({
            method: "PUT",
            url: `/student_teams/update?student_id=${studentId}`,
            data: { team: { name } },
        });

    const createTeam = (name: string, assignment_id: number) =>
        updateTeamNameAPI.sendRequest({
            method: "POST",
            url: `/student_teams?student_id=${studentId}`,
            data: { team: { name }, assignment_id },
        });

    const sendInvite = (username: string, assignmentId: number) =>
        inviteAPI.sendRequest({
            url: `/invitations`,
            method: "POST",
            data: { assignment_id: assignmentId, username },
        });

    const retractInvite = (id: number) =>
        retractAPI.sendRequest({ url: `/invitations/${id}`, method: "PATCH", data: { reply_status: "R" }, });

    const updateInvite = (id: number, reply_status: "A" | "R" | "D") =>
        updateInviteAPI.sendRequest({
            url: `/invitations/${id}`,
            method: "PATCH",
            data: { reply_status },
        });

    const leaveTeam = () =>
        leaveAPI.sendRequest({
            url: `/student_teams/leave?student_id=${studentId}`,
            method: "PUT",
        });

    const fetchSentInvitationsByTeam = (teamId: number) => fetchSentInvitationsByTeamAPI.sendRequest({
        url: `/invitations/sent_by/team/${teamId}`
    })

    const fetchSentInvitationsByParticipant = (participantId: number) => fetchSentInvitationsByParticipantAPI.sendRequest({
        url: `/invitations/sent_by/participant/${participantId}`
    })

    const fetchReceivedInvitations = () => fetchReceivedInvitationsAPI.sendRequest({
        url: `/invitations/sent_to/${studentId}`
    })

    return {
        teamAPI,
        inviteAPI,
        retractAPI,
        updateInviteAPI,
        updateTeamNameAPI,
        leaveAPI,
        fetchSentInvitationsByTeamAPI,
        fetchReceivedInvitationsAPI,
        fetchSentInvitationsByParticipantAPI,
        fetchTeam,
        createTeam,
        updateName,
        sendInvite,
        retractInvite,
        updateInvite,
        fetchSentInvitationsByTeam,
        fetchSentInvitationsByParticipant,
        fetchReceivedInvitations,
        leaveTeam,
    };
};
