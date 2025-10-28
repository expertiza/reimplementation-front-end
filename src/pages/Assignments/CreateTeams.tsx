import React, { useState, useMemo, useCallback } from 'react';
import { Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import Table from "../../components/Table/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { BsFileText, BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { useLoaderData } from 'react-router-dom';

interface Participant {
  name: string;
  teamName: string;
}

interface Team {
  name: string;
  members: Participant[];
}

// Initial Data
const initialParticipants: Participant[] = [
  { name: 'Eve', teamName: '' },
  { name: 'Frank', teamName: '' },
  { name: 'Leslie', teamName: '' },
  { name: 'Dom', teamName: '' },
];

const initialTeams: Team[] = [
  { name: 'Team Alpha', members: [{ name: 'Alice', teamName: 'Team Alpha' }, { name: 'Bob', teamName: 'Team Alpha' }] },
  { name: 'Team Beta', members: [{ name: 'Charlie', teamName: 'Team Beta' }] },
  { name: 'Team Theta', members: [{ name: 'Max', teamName: 'Team Theta' }] },
];

const columnHelper = createColumnHelper<Team>();

const CreateTeams: React.FC = () => {
  const assignment: any = useLoaderData();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [teamNameEdit, setTeamNameEdit] = useState('');
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamNameForEdit, setTeamNameForEdit] = useState('');
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);

  const handleShowAddParticipantModal = useCallback((team: Team) => {
    setSelectedTeam(team);
    setShowAddParticipantModal(true);
  }, []);

  const handleShowEditTeamModal = useCallback((team: Team) => {
    setSelectedTeam(team);
    setTeamNameForEdit(team.name);
    setShowEditTeamModal(true);
  }, []);

  const handleSaveEditedTeamName = useCallback(() => {
    if (selectedTeam && teamNameForEdit) {
      const updatedTeams = teams.map((team) => {
        if (team.name === selectedTeam.name) {
          return { ...team, name: teamNameForEdit };
        }
        return team;
      });
      setTeams(updatedTeams);
      setTeamNameForEdit('');
      setShowEditTeamModal(false);
    }
  }, [selectedTeam, teamNameForEdit, teams]);

  const handleAddParticipantToTeam = useCallback(() => {
    if (selectedParticipant && selectedTeam) {
      const updatedTeams = teams.map((team) => {
        if (team.name === selectedTeam.name) {
          return {
            ...team,
            members: [...team.members, { name: selectedParticipant, teamName: team.name }]
          };
        }
        return team;
      });
      setTeams(updatedTeams);
      setParticipants(participants.filter((p) => p.name !== selectedParticipant));
      setShowAddParticipantModal(false);
    }
  }, [selectedParticipant, selectedTeam, teams, participants]);

  const handleDeleteTeam = useCallback((teamToDelete: string) => {
    const updatedTeams = teams.filter((team) => team.name !== teamToDelete);
    setTeams(updatedTeams);
    const reassignedParticipants = participants.map((participant) => {
      if (participant.teamName === teamToDelete) {
        return { ...participant, teamName: '' };
      }
      return participant;
    });
    setParticipants(reassignedParticipants);
  }, [teams, participants]);

  const handleCreateNewTeam = useCallback(() => {
    if (teamNameEdit && !teams.some(team => team.name === teamNameEdit)) {
      setTeams([...teams, { name: teamNameEdit, members: [] }]);
      setTeamNameEdit('');
    }
  }, [teamNameEdit, teams]);

  // const handleClose = () => {
  //   navigate(-1); // Go back to the previous page
  // };

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: () => 'Team Name',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('members', {
      header: () => 'Participants',
      cell: info => info.getValue().map((member: Participant) => member.name).join(', ')
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: ({ row }) => (
        <div>
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleShowAddParticipantModal(row.original)}
          >
            Add Participant
          </Button>{' '}
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => handleShowEditTeamModal(row.original)}
            title='Edit'
          >
            <BsPencilFill />
          </Button>{' '}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteTeam(row.original.name)}
            title='Delete'
          >
            <BsPersonXFill />
          </Button>
        </div>
      )
    })
  ], [handleShowAddParticipantModal, handleShowEditTeamModal, handleDeleteTeam]);

  return (
    <Container fluid className="px-md-4">
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>Teams - {assignment.name}</h1>
        </Col>
        <hr />
      </Row>
      <div style={{ color: '#31708f', backgroundColor: '#d9edf7', padding: '10px', borderRadius: '5px', border: '1px solid #bce8f1', marginBottom: '20px' }}>
        This is a placeholder page and is still in progress.
      </div>
      <Row>
        <Col md={{ span: 1, offset: 11 }}>
          <Button variant="outline-info" onClick={() => setShowCreateTeamModal(true)} className="d-flex align-items-center">
            <span className="me-1">Create</span><BsFileText />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <Table
            data={teams}
            columns={columns}
            columnVisibility={{
              id: false,
            }}
          />
        </Col>
      </Row>
      {/* <Row>
        <Col className="text-right">
          <Button variant="outline-secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
            Close
          </Button>
        </Col>
      </Row> */}
      <Modal show={showAddParticipantModal} onHide={() => setShowAddParticipantModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Participant to {selectedTeam?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formParticipantSelect">
              <Form.Label>Select Participant</Form.Label>
              <Form.Control as="select" value={selectedParticipant} onChange={(e) => setSelectedParticipant(e.target.value)}>
                <option value="">Select a participant</option>
                {participants.filter((p) => p.teamName === '').map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddParticipantModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddParticipantToTeam}>Add to Team</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditTeamModal} onHide={() => setShowEditTeamModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Team Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTeamNameEdit">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={teamNameForEdit}
                onChange={(e) => setTeamNameForEdit(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditTeamModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSaveEditedTeamName}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showCreateTeamModal} onHide={() => setShowCreateTeamModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formNewTeamName">
              <Form.Label>Team Name</Form.Label>
              <Form.Control
                type="text"
                value={teamNameEdit}
                onChange={(e) => setTeamNameEdit(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateTeamModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            handleCreateNewTeam();
            setShowCreateTeamModal(false);
          }}>Create Team</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTeams;