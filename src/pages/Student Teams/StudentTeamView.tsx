import React, { FC, useState, useEffect, useCallback } from "react";
import { Button, Form, Table, FormControl, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { StudentTeamsProps, Invitation } from "../../utils/interfaces";
import { useStudentTeam } from "hooks/useStudentTeam";
import styles from "./StudentTeamView.module.css";

export const replyStatus = (status: string): string => {
  const statuses: Record<string, string> = {
    A: "Accepted",
    D: "Declined",
    R: "Retracted",
    W: "Waitlisted",
  };

  return statuses[status] ?? "Unknown";
};


const StudentTeamView: FC<StudentTeamsProps> = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get("student_id") ?? "";
  const [adExist, setAdExist] = useState(false);
  const [items, setItems] = useState<string[]>([]);

  const {
    teamAPI,
    inviteAPI,
    updateInviteAPI,
    updateTeamNameAPI,
    leaveAPI,
    fetchSentInvitationsByParticipantAPI,
    fetchReceivedInvitationsAPI,
    fetchJoinTeamRequestsAPI,
    acceptJoinRequestAPI,
    declineJoinRequestAPI,
    fetchTeam,
    createTeam,
    updateName,
    sendInvite,
    updateInvite,
    leaveTeam,
    fetchSentInvitationsByParticipant,
    fetchReceivedInvitations,
    fetchJoinTeamRequests,
    acceptJoinRequest,
    declineJoinRequest
  } = useStudentTeam(studentId);

  const [editMode, setEditMode] = useState(false);
  const [userLogin, setUserLogin] = useState("");
  const [teamName, setTeamName] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { error: fetchTeamError, isLoading, data: team, errorStatus } = teamAPI;
  const { error: createTeamError, data: createTeamResponse, reset: resetCreateTeam } = updateTeamNameAPI;
  const { error: updateNameError, data: updateNameResponse, reset: resetUpdateName } = updateTeamNameAPI;
  const { data: sentInvitations } = fetchSentInvitationsByParticipantAPI;
  const { data: receivedInvitations } = fetchReceivedInvitationsAPI;
  const { data: joinTeamRequests } = fetchJoinTeamRequestsAPI;
  const { error: sendInviteError, data: sendInviteResponse, reset: resetSendInvite } = inviteAPI;
  const { error: updateInviteError, data: updateInviteResponse, reset: resetUpdateInvite } = updateInviteAPI;
  const { error: leaveTeamError, data: leaveTeamResponse, reset: resetLeaveTeam } = leaveAPI;
  const { error: acceptJoinRequestError, data: acceptJoinRequestResponse, reset: resetAcceptJoinRequest } = acceptJoinRequestAPI;
  const { error: declineJoinRequestError, data: declineJoinRequestResponse, reset: resetDeclineJoinRequest } = declineJoinRequestAPI;

  useEffect(() => {
    if (errorStatus != '403')
      fetchReceivedInvitations();
  }, [updateInviteResponse]);

  useEffect(() => {
    if (team?.data.team) {
      setTeamName(team.data.team.name);
      fetchSentInvitationsByParticipant(parseInt(studentId));
      fetchJoinTeamRequests(team.data.team.id);
      if (team.data.team.signed_up_team && team.data.team.signed_up_team.advertise_for_partner) {
        setAdExist(true);
        const { comments_for_advertisement } = team.data.team.signed_up_team;
        const skills = comments_for_advertisement.split(' &AND& ');
        setItems(skills);
      }
    }
  }, [team, sendInviteResponse, acceptJoinRequestResponse, declineJoinRequestResponse]);

  // Toggle between edit and view mode for team name
  const handleEditNameToggle = () => {
    setEditMode(!editMode);
  };

  const handleCancelUpdate = () => {
    setTeamName(team?.data.team.name); // Reset team name to current team name if cancels the update
    handleEditNameToggle();
  }

  const handleInvite = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!userLogin.trim()) {
      setShowAlert(true);
      setToastMessage("Please enter a valid username.");
      return;
    }

    const isMember = team?.data.team.members.some(
      (m: any) => m.user.username === userLogin.trim() || m.user.email === userLogin.trim()
    );
    if (isMember) {
      setShowAlert(true);
      setToastMessage(`${userLogin} is already part of your team.`);
      return;
    }

    const newInvite: Invitation = {
      assignment_id: team?.data.assignment.id,
      username: userLogin.trim(),
    };
    sendInvite(newInvite.username, newInvite.assignment_id);
    setUserLogin("")
  }, [userLogin, team, sendInvite]);

  const handleNameSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (team?.data.team) {
        updateName(teamName);
      }
      else {
        createTeam(teamName, team?.data.assignment.id);
        setTeamName("")
      }
    },
    [updateName, teamName]
  );


  const updateToastMessage = (response: any) => {
    if (response.data.success) {
      setShowAlert(false);
    } else {
      setShowAlert(true)
    }

    setToastMessage(response.data.message);
    const timeout = setTimeout(() => {
      setToastMessage("");
      setShowAlert(false);
      resetAllLogs(false, true);
    }, 3000);
    return () => clearTimeout(timeout);
  }


  const handleAcceptJoinRequest = (requestId: number) => {
    acceptJoinRequest(requestId);
    setToastMessage("Join request accepted successfully!");
  };

  const handleDeclineJoinRequest = (requestId: number) => {
    declineJoinRequest(requestId);
    setToastMessage("Join request declined.");
  };

  useEffect(() => {
    const showFeedback = (response: any) => {
      setToastMessage(response.data.message);
      resetAllLogs(false, true);
    }
    if (updateNameResponse) {
      if (updateNameResponse.data.success) {
        setTeamName(updateNameResponse.data.name);
        setEditMode(false); // Exit edit mode
      }
      updateToastMessage(updateNameResponse);
    }

    if (sendInviteResponse) {
      updateToastMessage(sendInviteResponse)
    }

    if (updateInviteResponse) {
      updateToastMessage(updateInviteResponse)
    }

    if (leaveTeamResponse) {
      updateToastMessage(leaveTeamResponse)
    }
    if (createTeamResponse) {
      updateToastMessage(createTeamResponse)
      showFeedback(updateNameResponse);
    }

    if (sendInviteResponse) {
      showFeedback(sendInviteResponse)
    }

    if (updateInviteResponse) {
      showFeedback(updateInviteResponse)
    }

    if (leaveTeamResponse) {
      showFeedback(leaveTeamResponse)
    }
    if (createTeamResponse) {
      showFeedback(createTeamResponse)
    }

  }, [updateNameResponse, sendInviteResponse, updateInviteResponse, leaveTeamResponse, createTeamResponse]);

  const resetAllLogs = (error: boolean, data: boolean) => {
    resetCreateTeam?.(error, data);
    resetUpdateName?.(error, data);
    resetSendInvite?.(error, data);
    resetLeaveTeam?.(error, data);
    resetUpdateInvite?.(error, data);
    resetAcceptJoinRequest?.(error, data);
    resetDeclineJoinRequest?.(error, data);
  };

  // Combine all hook errors into one derived variable
  const error =
    createTeamError ||
    updateNameError ||
    sendInviteError ||
    leaveTeamError ||
    updateInviteError ||
    acceptJoinRequestError ||
    declineJoinRequestError ||
    null;

  useEffect(() => {
    if (!error) return;

    setShowAlert(true);
    setToastMessage(error);

    const timeout = setTimeout(() => {
      setToastMessage("");
      setShowAlert(false);
      resetAllLogs(true, false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    fetchTeam();
  }, [studentId]);

  useEffect(() => {
    if (createTeamResponse?.data.success || leaveTeamResponse?.data.success || updateInviteResponse?.data.success || acceptJoinRequestResponse || declineJoinRequestResponse) {
      fetchTeam();
    }
  }, [createTeamResponse, leaveTeamResponse, updateInviteResponse, acceptJoinRequestResponse, declineJoinRequestResponse])


  if (isLoading)
    return (<div style={{ width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Spinner />
    </div>);

  if (errorStatus === '403')
    return (
      <>
        <Alert variant="danger" className="flash_note alert alert-danger">
          {fetchTeamError}
        </Alert>
      </>
    );

  return (
    <div className={styles.studentTeamContainer}>
      <div>
        {
          toastMessage && (
            <Alert className={showAlert ? "flash_note alert alert-warning" : "flash_note alert alert-success"}>
              {toastMessage}
            </Alert>
          )
        }
      </div >
      {team && !team.data.team ?
        (<div>
          <h1>Team Information for {team.data.assignment.name}</h1>
          <h6>You no longer have a team!</h6>
          <div className={styles.studentTeamDetailsSection}>
            <h4 style={{ marginBottom: "0px" }}>Name Team</h4>
            <div className={styles.studentTeamNameSection}>
              <form onSubmit={handleNameSubmit}>
                <div className={styles.studentTeamInviteInputGroup}>
                  <input
                    type="text"
                    id="nameTeam"
                    required
                    value={teamName}
                    className={styles.studentTeamInviteInput}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                  <Button variant="primary" type="submit" className="btn pull-right new-button btn-md">
                    Create
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>) :
        team?.data.team &&
        <div>
          <div className={styles.studentTeamDetailsSection}>
            <h2 className={styles.studentTeamHeader}>Team</h2>
            <div className={styles.studentTeamNameSection}>
              {!editMode ? (
                <h2>
                  {" "}
                  {teamName}{" "}
                </h2>
              ) : (
                <Form onSubmit={handleNameSubmit}>
                  <div className={styles.studentTeamInviteInputGroup}>
                    <FormControl
                      type="text"
                      required
                      value={teamName}
                      className={styles.studentTeamInviteInput}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <Button variant="link" type="submit" className={styles.studentTeamButtonLink} disabled={teamName.trim() === team.data.team.name}>
                      Save
                    </Button>
                    <Button variant="link" onClick={handleCancelUpdate} className={styles.studentTeamButtonLink}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </div>
            <h2> for {team.data.assignment.name} </h2>
            {!editMode && (<Button variant="link" onClick={handleEditNameToggle} className={styles.studentTeamButtonLink}>
              (Edit team name)
            </Button>)}
          </div>

          <h3 className={styles.studentTeamFormLabel}>Team members</h3>
          <Table striped bordered hover className={styles.studentTeamTable}>
            <thead>
              <tr className={styles.studentTeamTableHeader}>
                <th className={styles.studentTeamTableCellHeader}>Username</th>
                <th className={styles.studentTeamTableCellHeader}>Name</th>
                <th className={styles.studentTeamTableCellHeader}>Email address</th>
                <th className={styles.studentTeamTableCellHeader}>Review action</th>
              </tr>
            </thead>
            <tbody>
              {team &&
                team.data.team.members.map((participant: any) => (
                  <tr key={participant.id}>
                    <td className={styles.studentTeamTableCell}>{participant.user.username}</td>
                    <td className={styles.studentTeamTableCell}>{participant.user.fullName}</td>
                    <td className={styles.studentTeamTableCell}>{participant.user.email}</td>
                    <td className={styles.studentTeamTableCell}>
                      {participant.id !== Number(studentId) && <Link to="/" className={styles.studentTeamButtonLink}>
                        Review
                      </Link>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <Button variant="link" className={styles.studentTeamLeaveButtonLink} onClick={() => {
            if (window.confirm(`You are leaving team: ${teamName}. Are you sure?`)) {
              leaveTeam();
            }
          }
          }>
            Leave team
          </Button>

          <div className={styles.studentTeamInviteSection}>
            <h3 className={styles.studentTeamFormLabel}>Invite a teammate</h3>
            {team.data.team.team_size < team?.data.assignment.max_team_size ? <Form>
              <div className={styles.studentTeamInviteInputGroup}>
                <p className={styles.studentTeamInviteLabel}>Enter username: </p>
                <FormControl
                  id="invite-user"
                  type="text"
                  className={styles.studentTeamInviteInput}
                  value={userLogin}
                  required
                  onChange={(e) => setUserLogin(e.target.value)}
                />
                <button onClick={handleInvite} className={styles.studentTeamInviteButton}>
                  Invite
                </button>
              </div >
            </Form > :
              <h6>You cannot invite new members as there is no room on your team. </h6>}
          </div >

          {
            team.data.team.sign_up_topic && team.data.team.signed_up_team && <div className={styles.studentTeamAdvertisementSection}>
              <h3 className={styles.studentTeamFormLabel}>Advertise for teammates</h3>
              {adExist ?
                <div>
                  <Table striped bordered hover className={styles.studentTeamTable}>
                    <thead>
                      <tr className={styles.studentTeamTableHeader}>
                        <th className={styles.studentTeamTableCellHeader}>Topic</th>
                        <th className={styles.studentTeamTableCellHeader}>Desired Qualifications</th>
                        <th className={styles.studentTeamTableCellHeader}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={styles.studentTeamTableCell}>{team.data.team.sign_up_topic.topic_name}</td>
                        <td className={styles.studentTeamTableCell}>
                          <div className={styles.adList}>
                            {items.map((item, index) => (
                              <div className={styles.adListItem} key={index}>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className={styles.studentTeamTableCell}>
                          <Link to={`/advertise_for_partner?team_id=${team.data.team.signed_up_team.id}`} className={styles.studentTeamButtonLink}>
                            Manage Advertisement
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div> :
                <Link to={`/advertise_for_partner?team_id=${team.data.team.signed_up_team.id}`} className={styles.studentTeamButtonLink}>
                  Create advertisement
                </Link>}
            </div>
          }

        </div >}

      {
        sentInvitations && sentInvitations.data.length > 0 && <div>
          <h3 className={styles.studentTeamFormLabel}>Sent invitations</h3>
          {sentInvitations && sentInvitations.data.length > 0 && (
            <Table striped bordered hover className={styles.studentTeamTable}>
              <thead>
                <tr>
                  <th className={styles.studentTeamTableCellHeader}>Username</th>
                  <th className={styles.studentTeamTableCellHeader}>Name</th>
                  <th className={styles.studentTeamTableCellHeader}>Email address</th>
                  <th className={styles.studentTeamTableCellHeader}>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  sentInvitations.data.map((invite: any) => (
                    <tr key={invite.id}>
                      <td className={styles.studentTeamTableCell}>{invite.to_participant?.user?.name}</td>
                      <td className={styles.studentTeamTableCell}>{invite.to_participant?.user?.full_name}</td>
                      <td className={styles.studentTeamTableCell}>{invite.to_participant?.user?.email}</td>
                      <td className={styles.studentTeamTableCell}>
                        {invite.reply_status === 'W' ?
                          <Button
                            variant="link"
                            size="sm"
                            className={styles.studentTeamButtonLink}
                            onClick={() => {
                              if (window.confirm(`You are retracting invite to ${invite.to_participant?.user?.name}. Are you sure?`)) {
                                updateInvite(invite.id, "R")
                              }
                            }}
                          >
                            Retract
                          </Button> :
                          replyStatus(invite.reply_status)}
                      </td>
                    </tr >
                  ))
                }
              </tbody >
            </Table >
          )}
        </div >}
      {
        receivedInvitations && receivedInvitations.data.length > 0 && <div style={{ marginTop: "2rem" }}>
          <h3 className={styles.studentTeamFormLabel}>Received invitations</h3>
          {receivedInvitations && receivedInvitations.data.length > 0 && (
            <Table striped bordered hover className={styles.studentTeamTable}>
              <thead>
                <tr>
                  <th className={styles.studentTeamTableCellHeader}>Team</th>
                  <th className={styles.studentTeamTableCellHeader}>Sender</th>
                  <th className={styles.studentTeamTableCellHeader}>Action</th>
                </tr >
              </thead >
              <tbody>
                {
                  receivedInvitations.data.map((invite: any) => (
                    <tr key={invite.id}>
                      <td className={styles.studentTeamTableCell}>{invite.from_participant?.team?.name}</td>
                      <td className={styles.studentTeamTableCell}>{invite.from_participant?.user?.name}</td>
                      <td className={styles.studentTeamTableCell}>
                        {invite.reply_status === 'W' ?
                          <>
                            <Button
                              variant="link"
                              size="sm"
                              className={styles.studentTeamButtonLink}
                              onClick={() => {
                                if (window.confirm(`You are accepting invite from ${invite.from_participant?.team?.name}. Are you sure?`)) {
                                  updateInvite(invite.id, "A");
                                }
                              }}
                            >
                              Accept
                            </Button>
                            <span> | </span>
                            <Button
                              variant="link"
                              size="sm"
                              className={styles.studentTeamButtonLink}
                              onClick={() => {
                                if (window.confirm(`You are declining invite from ${invite.from_participant?.name}. Are you sure?`)) {
                                  updateInvite(invite.id, "D");
                                }
                              }}
                            >
                              Decline
                            </Button>
                          </> :
                          replyStatus(invite.reply_status)
                        }
                      </td>
                    </tr >
                  ))
                }
              </tbody >
            </Table >
          )}
        </div >}

      {/* Received Requests (Join Team Requests) */}
      {joinTeamRequests && joinTeamRequests.data && joinTeamRequests.data.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h3 className={styles.studentTeamFormLabel}>Received Requests</h3>
          <Table striped bordered hover className={styles.studentTeamTable}>
            <thead>
              <tr>
                <th className={styles.studentTeamTableCellHeader}>Name</th>
                <th className={styles.studentTeamTableCellHeader}>Comments</th>
                <th className={styles.studentTeamTableCellHeader} style={{ paddingLeft: "calc(0.2rem + 5px)" }}>Action</th>

              </tr>
            </thead>
            <tbody>
              {joinTeamRequests.data.map((request: any) => {
                const isTeamFull = request.team?.is_full || false;


                return (
                  <tr key={request.id}>
                    <td className={styles.studentTeamTableCell}>{request.participant.user_name}</td>
                    <td className={styles.studentTeamTableCell}>{request.comments}</td>
                    <td className={styles.studentTeamTableCell}>
                      {request.reply_status === 'PENDING' ? (
                        <>
                          <Button
                            variant="link"
                            size="sm"
                            className={styles.studentTeamButtonLink}
                            disabled={isTeamFull}
                            onClick={() => {
                              if (window.confirm(`Accept ${request.participant.user_name}'s request to join team?`)) {
                                handleAcceptJoinRequest(request.id);
                              }
                            }}
                            title={isTeamFull ? "Team is full" : "Invite this user to join the team"}
                          >
                            Accept
                          </Button>
                          {' | '}
                          <Button
                            variant="link"
                            size="sm"
                            className={styles.studentTeamButtonLink}
                            onClick={() => {
                              if (window.confirm(`Decline join request from ${request.participant.user_name}?`)) {
                                handleDeclineJoinRequest(request.id);
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <span>{request.reply_status}</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}
    </div >
  );
}

export default StudentTeamView;