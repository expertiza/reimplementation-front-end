import React, { FC, useState, useEffect, useCallback } from "react";
import { Button, Form, Table, FormControl, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { StudentTeamsProps, TeamMember, Invitation, TeamDetails } from "../../utils/interfaces";
import { useSearchParams } from "react-router-dom";
import useAPI from "hooks/useAPI";
import { Link } from "react-router-dom";

const StudentTeamView: FC<StudentTeamsProps> = () => {
  // Styles object to maintain consistent styling across the component
  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "20px",
      fontSize: "0.85rem",
    },
    header: {
      //marginBottom: "20px",
      fontStyle: "bold",
      fontSize: "2rem", // Keep the header font size larger
    },
    teamNameSection: {
      display: "flex",
      alignItems: "center",
      //marginBottom: "20px",
      fontSize: "1rem", // Uniform font size
    },
    inviteSection: {
      marginTop: "20px",
      marginBottom: "20px",
    },
    inviteInputGroup: {
      display: "flex", // flexbox to align label and input inline
      justifyContent: "center",
      gap: "10px",
      alignItems: "center", // Center align items vertically
      //marginBottom: "20px", // Space below the input group
    },
    inviteLabel: {
      //marginRight: "10px",
      //marginTop: "13px",
      fontSize: "1rem",
      margin: "0px",
    },
    teamLabel: {
      //marginRight: "10px",
      fontSize: "1rem",
    },
    inviteInput: {
      width: "450px",
      //marginRight: "10px", // Add some space between the input and the button
      fontSize: "1rem",
      borderColor: "black",
      borderRadius: "3px",
      margin: "0px",
    },
    inviteButton: {
      backgroundColor: "transparent", // button should be transparent
      borderColor: "#000", // black border color
      borderStyle: "solid",
      borderRadius: "0px", // changing Bootstrap's default border-radius for buttons
      color: "#000", // text color
      fontSize: "1rem", // match the font size of other elements
      padding: "2px 5px", // adjust the vertical and horizontal padding as needed
      margin: "0px",
    },
    advertisementSection: {
      marginBottom: "20px",
      fontSize: "1rem", // Uniform font size
    },
    formLabel: {
      fontSize: "1.5rem",
      fontWeight: "bold",
    },
    formControl: {
      fontSize: "1rem",
    },
    table: {
      width: "100%",
      marginBottom: "10px",
      fontSize: "1rem", // Uniform font size for table
      tableLayout: "fixed" as const,
      //marginLeft: "100px",
    },
    tableCell: {
      padding: "0.2rem",
      height: "30px",
      verticalAlign: "middle",
      textAlign: "left" as const,
    },
    tableHeader: {
      backgroundColor: "#f8f9fa",
      color: "#212529",
      fontSize: "1rem", // Uniform font size for table header
    },
    tableCellHeader: {
      padding: "0.2rem", // Reduced padding for a tighter header
      fontSize: "1rem", // Uniform font size for table header cells
    },
    buttonLink: {
      textDecoration: "none",
      padding: "0px",
      marginRight: "5px",
      color: "#99570c",
      fontSize: "1rem", // Uniform font size for buttons
    },
    alert: {
      backgroundColor: "rgb(251, 221, 221)", // Red background
      color: "darkred",
    },
    leaveButtonLink: {
      textDecoration: "none",
      color: "#99570c",
      fontSize: "1rem",
      padding: "0px",
      marginBottom: "20px",
    },
    errorMessage: {
      backgroundColor: "#fdd",
      color: "#510",
      padding: "15px",
      margin: "20px",
      border: "1px solid transparent",
      borderRadius: "4px",
    },
  };

  // Hooks for navigation and state management
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [userLogin, setUserLogin] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [searchParams] = useSearchParams();
  const { error: fetchTeamError, isLoading, data: team, sendRequest: fetchTeamDetails } = useAPI();
  const { error: updateNameError, data: updateNameResponse, sendRequest: changeName } = useAPI();
  const { error: fetchInviteError, data: sentInvitations, sendRequest: fetchSentInvitations } = useAPI();
  const { data: receivedInvitations, sendRequest: fetchReceivedInvitations } = useAPI();
  const { error: sendInviteError, data: sendInviteResponse, sendRequest: sendInvite } = useAPI();
  const { error: retractInviteError, data: retractInviteResponse, sendRequest: retractInvite } = useAPI();
  const { error: updateInviteError, data: updateInviteResponse, sendRequest: updateInvite } = useAPI();
  const { error: leaveTeamError, data: leaveTeamResponse, sendRequest: leaveTeam } = useAPI();
  const studentId = searchParams.get("student_id");

  const [teamName, setTeamName] = useState("");
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  // Toggle between edit and view mode for team name
  const handleEditNameToggle = () => {
    setEditMode(!editMode);
  };

  const handleCancelUpdate = () => {
    setTeamName(team?.data.name); // Reset team name to current team name if cancels the update
    handleEditNameToggle();
  }


  // Handle the submission of a new team name
  const handleNameChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here, also send the new team name to the server or backend if necessary
    changeName({
      method: "PUT", url: `/student_teams/update?student_id=${studentId}`, data: {
        team: {
          name: teamName
        }
      }
    })
  };

  // Handle the process of inviting a new team member
  const handleInvite = () => {
    if (!userLogin.trim()) {
      setShowAlert(true);
      setToastMessage(`Please enter a valid username.`)
      return;
    }
    const isMember = team?.data.members.some((member: any) => member.username === userLogin.trim());
    if (isMember) {
      setShowAlert(true);
      setToastMessage(`${userLogin} is already part of your team.`)
      setTimeout(() => setToastMessage(""), 3000);
      return;
    }

    const newInvitation: Invitation = {
      assignment_id: team?.data.assignment.id,
      username: userLogin,
    };

    sendInvite({ url: '/invitations', method: 'POST', data: newInvitation })
    setUserLogin("");
  };

  // Navigation handlers for creating ads and reviewing responses
  const handleCreateAdClick = () => {
    if (studentId) {
      navigate(`/advertise_for_partner/new?student_id=${studentId}`);
    } else {
      // Handle the case where studentId is not available
      console.error("Student ID is not available for navigation.");
    }
  };

  // delete invitations when needed
  const handleRetract = (id: number) => {
    if (window.confirm(`Are you sure you want to retract the invitation??`)) {
      retractInvite({ url: `/invitations/${id}`, method: 'DELETE' })
    }
  };

  const handleUpdateInvite = (id: number, response: string) => {
    if (response === "reject") {
      if (window.confirm(`Are you sure you want to reject the invitation??`)) {
        updateInvite({
          url: `/invitations/${id}`, method: 'PATCH', data: {
            reply_status: 'R'
          }
        })
      }
    }
    else if (response === "accept") {
      if (window.confirm(`Are you sure you want to accept the invitation? You will leave your current team.`)) {
        updateInvite({
          url: `/invitations/${id}`, method: 'PATCH', data: {
            reply_status: 'A'
          }
        })
        if (!updateInviteError) {
          setTimeout(() => window.location.reload(), 3000);
        }
      }
    }
  };

  const handleLeaveTeam = () => {
    if (window.confirm(`You are leaving team: ${team?.data.name}. Are you sure?`)) {
      leaveTeam({
        url: `/student_teams/leave?student_id=${studentId}`, method: 'PUT'
      })
      //navigate("/"); // Navigate to the home page after the user acknowledges the alert
    } // Display an alert to the user
  };

  useEffect(() => {
    fetchTeamDetails({ url: `/student_teams/view?student_id=${studentId}` });

  }, [studentId, fetchTeamDetails, updateNameResponse]);

  useEffect(() => {
    if (team?.data) {
      fetchSentInvitations({ url: `/invitations/sent_by/${team?.data.id}` })
      fetchReceivedInvitations({ url: `/invitations/sent_to/${studentId}` })
    }
  }, [team, fetchSentInvitations, fetchReceivedInvitations, sendInviteResponse, retractInviteResponse, updateInviteResponse])

  useEffect(() => {
    if (team?.data?.name) {
      setTeamName(team.data.name);
    }
  }, [team]);


  useEffect(() => {
    const updateToastMessage = (response: any) => {
      if (response.data.success) {
        setShowAlert(false);
      } else {
        setShowAlert(true)
      }

      setToastMessage(response.data.message);
      setTimeout(() => {
        setToastMessage("");
      }, 3000);
      return;
    }
    if (updateNameResponse) {
      if (updateNameResponse.data.success) {
        setTeamName(updateNameResponse.data.team.name);
        setEditMode(false); // Exit edit mode
      }
      updateToastMessage(updateNameResponse);
    }

    if (sendInviteResponse) {
      updateToastMessage(sendInviteResponse)
    }

    if (retractInviteResponse) {
      updateToastMessage(retractInviteResponse)
    }

    if (updateInviteResponse) {
      updateToastMessage(updateInviteResponse)
    }

    if (leaveTeamResponse) {
      updateToastMessage(leaveTeamResponse)
    }

  }, [updateNameResponse, sendInviteResponse, retractInviteResponse, updateInviteResponse, leaveTeamResponse]);


  // Combine all hook errors into one derived variable
  const error =
    fetchInviteError ||
    retractInviteError ||
    sendInviteError ||
    leaveTeamError ||
    updateInviteError ||
    null;

  useEffect(() => {
    if (!error) return;

    setShowAlert(true);
    setToastMessage(error);

    const timeout = setTimeout(() => {
      setToastMessage("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [error]);

  if (error) {
    return (
      <div>
        <div style={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner></Spinner>;
  }

  // Render the component UI
  return (
    <div style={styles.container}>
      <div>
        {toastMessage && (
          <Alert variant={showAlert ? "warning" : "success"}>
            {toastMessage}
          </Alert>
        )}
      </div>

      {team ?
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "20px" }}>
            <h2 style={styles.header}>Team</h2>
            <div style={styles.teamNameSection}>
              {/* <strong style={styles.teamLabel}>Team name : </strong> */}
              {!editMode ? (
                <h2>
                  {" "}
                  {teamName}{" "}
                </h2>
              ) : (
                <Form onSubmit={handleNameChangeSubmit}>
                  <div style={styles.inviteInputGroup}>
                    <FormControl
                      type="text"
                      required
                      value={teamName}
                      style={styles.inviteInput}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                    <Button variant="link" type="submit" style={styles.buttonLink} disabled={teamName.trim() === team.data.name}>
                      Save
                    </Button>
                    <Button variant="link" onClick={handleCancelUpdate} style={styles.buttonLink}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              )}
            </div>
            <h2> for {team.data.assignment.name} </h2>
            {!editMode && (<Button variant="link" onClick={handleEditNameToggle} style={styles.buttonLink}>
              (Edit team name)
            </Button>)} </div>

          <h3 style={styles.formLabel}>Team members</h3>
          <Table striped bordered hover style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.tableCellHeader}>Username</th>
                <th style={styles.tableCellHeader}>Name</th>
                <th style={styles.tableCellHeader}>Email address</th>
                <th style={styles.tableCellHeader}>Review action</th>
              </tr>
            </thead>
            <tbody>
              {team &&
                team.data.members.map((participant: any) => (
                  <tr key={participant.id}>
                    <td style={styles.tableCell}>{participant.username}</td>
                    <td style={styles.tableCell}>{participant.fullName}</td>
                    <td style={styles.tableCell}>{participant.email}</td>
                    <td style={styles.tableCell}>
                      {participant.id !== Number(studentId) && <Link to="/" style={styles.buttonLink}>
                        Review
                      </Link>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>

          <Button variant="link" style={styles.leaveButtonLink} onClick={handleLeaveTeam}>
            Leave team
          </Button>

          {sentInvitations?.data.length > 0 && (
            <>
              <h3 style={styles.formLabel}>Sent invitations</h3>
              <Table striped bordered hover style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableCellHeader}>Username</th>
                    <th style={styles.tableCellHeader}>Name</th>
                    <th style={styles.tableCellHeader}>Email address</th>
                    <th style={styles.tableCellHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sentInvitations?.data &&
                    sentInvitations?.data?.map((invite: any) => (
                      <tr key={invite.id}>
                        <td style={styles.tableCell}>{invite.to_participant.user.name}</td>
                        <td style={styles.tableCell}>{invite.to_participant.fullname}</td>
                        <td style={styles.tableCell}>{invite.to_participant.user.email}</td>
                        <td style={styles.tableCell}>
                          {invite.reply_status === 'W' ?
                            <Button
                              variant="link"
                              size="sm"
                              style={styles.buttonLink}
                              onClick={() => handleRetract(invite.id)}
                            >
                              Retract
                            </Button> :
                            invite.reply_status === 'R' ? "Rejected" : "Accepted"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </>
          )}

          {receivedInvitations?.data.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={styles.formLabel}>Received invitations</h3>
              <Table striped bordered hover style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableCellHeader}>Team</th>
                    {/* <th style={styles.tableCellHeader}>Name</th>
                <th style={styles.tableCellHeader}>Email address</th> */}
                    <th style={styles.tableCellHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedInvitations?.data &&
                    receivedInvitations?.data.map((invite: any) => (
                      <tr key={invite.id}>
                        <td style={styles.tableCell}>{invite.from_team.name}</td>
                        {/* <td style={styles.tableCell}>{invite.from_participant.fullName}</td>
                    <td style={styles.tableCell}>{invite.from_participant.user.email}</td> */}
                        <td style={styles.tableCell}>
                          {invite.reply_status === 'W' ?
                            <>
                              <Button
                                variant="link"
                                size="sm"
                                style={styles.buttonLink}
                                onClick={() => handleUpdateInvite(invite.id, "accept")}
                              >
                                Accept
                              </Button>
                              <Button
                                variant="link"
                                size="sm"
                                style={styles.buttonLink}
                                onClick={() => handleUpdateInvite(invite.id, "reject")}
                              >
                                Reject
                              </Button>
                            </> :

                            invite.reply_status === 'R' ? "Rejected" : "Accepted"
                          }
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}

          <div style={styles.inviteSection}>
            <h3 style={styles.formLabel}>Invite a teammate</h3>
            {team.data.team_size < team?.data.assignment.max_team_size ? <Form>
              <div style={styles.inviteInputGroup}>
                <p style={styles.inviteLabel}>Enter username: </p>
                <FormControl
                  id="invite-user"
                  type="text"
                  style={styles.inviteInput}
                  className="mr-sm-2"
                  value={userLogin}
                  required
                  onChange={(e) => setUserLogin(e.target.value)}
                />
                <Button variant="outline-primary" onClick={handleInvite} style={styles.inviteButton}>
                  Invite
                </Button>
              </div>
            </Form> :
              <h6>You cannot invite new members as there is no room on your team. </h6>}
          </div>

          <div style={styles.advertisementSection}>
            <h3 style={styles.formLabel}>Advertise for teammates</h3>
            <Button variant="link" onClick={handleCreateAdClick} style={styles.buttonLink}>
              Create advertisement
            </Button>
          </div>
        </div> :
        (<div>
          <h1>Team Information for </h1>
          <h6>You no longer have a team!</h6>
        </div>)}
    </div>
  );
};

export default StudentTeamView;
