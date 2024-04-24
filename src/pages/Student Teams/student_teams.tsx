import React, { FC, useState } from 'react';
import { Button, Form, Table, FormControl, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { StudentTeamsProps, TeamMember, Invitation } from '../../utils/interfaces';   // Adjust the path as necessary

const StudentTeamView: FC<StudentTeamsProps> = () => {
  // Styles object to maintain consistent styling across the component
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px',
      fontSize: '0.85rem',
    },
    header: {
      marginBottom: '20px',
      fontSize: '2rem', // Keep the header font size larger
    },
    teamNameSection: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      fontSize: '0.85rem', // Uniform font size
    },
    inviteSection: {
      marginTop: '20px',
      marginBottom: '20px',
    },
    inviteInputGroup: {
      display: 'flex', // flexbox to align label and input inline
      alignItems: 'center', // Center align items vertically
      marginBottom: '20px', // Space below the input group
    },
    inviteLabel: {
      marginRight: '10px',
      marginLeft: '100px', // Space between label and input
      marginTop: '13px',
      fontSize: '0.85rem',
    },
    teamLabel: {
      marginRight: '10px',
      fontSize: '0.85rem',
    },
    inviteInput: {
      width: '450px',
      marginRight: '10px', // Add some space between the input and the button
      fontSize: '0.85rem',
      borderColor: 'black',
      borderRadius: '3px',
    },
    inviteButton: {
      backgroundColor: 'transparent', // button should be transparent
      borderColor: '#000', // black border color
      borderStyle: 'solid',
      borderRadius: '0px', // changing Bootstrap's default border-radius for buttons
      color: '#000', // text color
      fontSize: '0.85rem', // match the font size of other elements
      padding: '2px 5px', // adjust the vertical and horizontal padding as needed
    },
    advertisementSection: {
      marginBottom: '20px',
      fontSize: '0.85rem', // Uniform font size
    },
    formLabel: {
      fontSize: '0.85rem',
      fontWeight: 'bold',
    },
    formControl: {
      fontSize: '0.85rem',
    },
    table: {
      width: '80%',
      marginBottom: '10px',
      fontSize: '0.85rem', // Uniform font size for table
      tableLayout: 'fixed' as const,
      marginLeft: '100px',
    },
    tableCell: {
      padding: '0.3rem',
      verticalAlign: 'middle',
      textAlign: 'left' as const,
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      color: '#212529',
      fontSize: '0.85rem', // Uniform font size for table header
    },
    tableCellHeader: {
      padding: '0.4rem', // Reduced padding for a tighter header
      fontSize: '0.85rem', // Uniform font size for table header cells
    },
    buttonLink: {
      textDecoration: 'none',
      color: '#99570c',
      fontSize: '0.85rem', // Uniform font size for buttons
    },
    alert: {
      backgroundColor: 'rgb(251, 221, 221)', // Red background
      color: 'darkred',
    },
    leaveButtonLink: {
      textDecoration: 'none',
      color: '#99570c',
      fontSize: '0.85rem',
      marginLeft: '90px',
      marginBottom: '20px',
    }
  };

  // Hooks for navigation and state management
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('E2433 team');
  const [editMode, setEditMode] = useState(false);
  const [newTeamName, setNewTeamName] = useState(teamName);
  const [members, setMembers] = useState<TeamMember[]>([
    { username: 'smandav', fullName: 'Sreenitya Mandava', email: 'smandav@ncsu.edu' },
    { username: 'ssheva', fullName: 'Sree Tulasi Sheva', email: 'ssheva@ncsu.edu' },
    { username: 'yseela', fullName: 'Yogitha Seela', email: 'yseela@ncsu.edu' },
  ]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [userLogin, setUserLogin] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Toggle between edit and view mode for team name
  const handleEditNameToggle = () => {
    setEditMode(!editMode);
    setNewTeamName(teamName); // Reset new name to current team name when toggling the edit mode
  };

  // Handle the submission of a new team name
  const handleNameChangeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTeamName(newTeamName); // Save the new name
    setEditMode(false); // Exit edit mode
    // Here, also send the new team name to the server or backend if necessary
  };

  // Function to send email invitations
  const sendEmailInvitation = (invitation: Invitation) => {
    const emailSubject = `Invitation to join team ${teamName}`;
    const emailBody = `Hello ${invitation.fullName},\n\nYou are invited to join the team "${teamName}" for our project. Please let us know your decision at your earliest convenience.\n\nBest regards,\n${teamName}`;
    window.open(`mailto:${invitation.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
  };

  // Handle the process of inviting a new team member
  const handleInvite = () => {
    const isMember = members.some(member => member.username === userLogin);
    if (isMember) {
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    const newInvitation: Invitation = {
      username: userLogin,
      fullName: 'Fetching...', // Placeholder until the real name is fetched
      email: `${userLogin}@ncsu.edu`, // Construct the email, or fetch from server
      status: 'Waiting for reply',
    };

    // Send an email to the invited user
    sendEmailInvitation(newInvitation);

    // Update the state to include the new invitation
    setInvitations(prevInvitations => [...prevInvitations, newInvitation]);
    setUserLogin('');
  };

  // Navigation handlers for creating ads and reviewing responses
  const handleCreateAdClick = () => {
    navigate('/advertise_for_partner/new');
  };

  // Review page navigation
  const handleReview = () => {
    navigate('/response/new');
  };

  // delete invitations when needed
  const handleRetract = (username: string) => {
    setInvitations(invitations.filter(invite => invite.username !== username));
  };

  const handleLeaveTeam = () => {
    // You might want to add logic here for any cleanup or notifications before leaving a team
    alert('You are leaving team: E2433 team');  // Display an alert to the user
    navigate('/');  // Navigate to the home page after the user acknowledges the alert
  };

  // Render the component UI
  return (
    <div style={styles.container}>
      <div>
        {showAlert && <Alert variant="warning" style={styles.alert}>This user is already part of the team.</Alert>}
      </div>
      <h2 style={styles.header}>Team Information for Final project (and design doc)</h2>
      <div style={styles.teamNameSection}>
        <strong style={styles.teamLabel}>Team Name:</strong>
        {!editMode ? (
          <>
            {teamName} <Button variant="link" onClick={handleEditNameToggle} style={styles.buttonLink}>Edit name</Button>
          </>
        ) : (
          <Form onSubmit={handleNameChangeSubmit}>
            <div style={styles.inviteInputGroup}>
              <FormControl
                type="text"
                value={newTeamName}
                style={styles.inviteInput}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
              <Button variant="link" type="submit" style={styles.buttonLink}>
                Save
              </Button>
              <Button variant="link" onClick={handleEditNameToggle} style={styles.buttonLink}>
                Cancel
              </Button>
            </div>
          </Form>
        )}
      </div>

      <h3 style={styles.formLabel}>Team members</h3>
      <Table striped bordered hover style={styles.table}>
        <thead>
          <tr style={styles.tableHeader}>
            <th style={styles.tableCellHeader}>Username</th>
            <th style={styles.tableCellHeader}>Full name</th>
            <th style={styles.tableCellHeader}>Email address</th>
            <th style={styles.tableCellHeader}>Review action</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member, index) => (
            <tr key={index}>
              <td style={styles.tableCell}>{member.username}</td>
              <td style={styles.tableCell}>{member.fullName}</td>
              <td style={styles.tableCell}>{member.email}</td>
              <td style={styles.tableCell}>
                <Button variant="link" style={styles.buttonLink} onClick={handleReview}>
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="link" style={styles.leaveButtonLink} onClick={handleLeaveTeam}>Leave team</Button>

      {invitations.length > 0 && (
        <>
          <h3 style={styles.formLabel}>Sent invitations</h3>
          <Table striped bordered hover style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableCellHeader}>Username</th>
                <th style={styles.tableCellHeader}>Full name</th>
                <th style={styles.tableCellHeader}>Email address</th>
                <th style={styles.tableCellHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((invite, index) => (
                <tr key={index}>
                  <td style={styles.tableCell}>{invite.username}</td>
                  <td style={styles.tableCell}>{invite.fullName}</td>
                  <td style={styles.tableCell}>{invite.email}</td>
                  <td style={styles.tableCell}>{invite.status}
                    <Button
                      variant="link"
                      size="sm"
                      style={styles.buttonLink}
                      onClick={() => handleRetract(invite.username)}
                    >
                      Retract
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      <div style={styles.inviteSection}>
        <h3 style={styles.formLabel}>Invite people</h3>
        <Form>
          <div style={styles.inviteInputGroup}>
            <p style={styles.inviteLabel}>Enter user login: </p>
            <FormControl
              type="text"
              style={styles.inviteInput}
              className="mr-sm-2"
              value={userLogin}
              onChange={(e) => setUserLogin(e.target.value)}
            />
            <Button variant="outline-primary" onClick={handleInvite} style={styles.inviteButton}>Invite</Button>
          </div>
        </Form>
      </div>

      <div style={styles.advertisementSection}>
        <h3 style={styles.formLabel}>Advertisement for teammates</h3>
        <Button variant="link" onClick={handleCreateAdClick} style={styles.buttonLink}>Create</Button>
      </div>
    </div>
  );
};

export default StudentTeamView;