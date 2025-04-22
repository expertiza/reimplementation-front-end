import participantsData from './participants.json';
import './AssignmentParticipants.css';

import { useEffect, useMemo, useState } from 'react';
import EditParticipantModal from './EditParticipantModal';
import ConfirmRemoveModal from './ConfirmRemoveModal';
import ToastNotification from './ToastNotification';
import ParticipantTable from './ParticipantsTable';
import { getNestedValue, participantRoleInfo, assignmentColSpan as numColumns } from './AssignmentParticipantsUtil';
import { AssignmentProperties, IsEnabled, Participant, ParticipantRole, Role } from './AssignmentParticipantsTypes';
import useAPI from 'hooks/useAPI';
import { useParams } from 'react-router-dom';
import { IAssignmentParticipantResponse, IAssignmentResponse } from 'utils/interfaces';
import { HttpMethod } from 'utils/httpMethods';
import { Form, Button } from 'react-bootstrap';


interface AssignmentParticipantsProps {
  assignmentProps: AssignmentProperties;
}

const initialData = participantsData as Participant[];

function AssignmentParticipants({ assignmentProps }: AssignmentParticipantsProps) {
  const { data: participantsResponse, sendRequest: fetchParticipants } = useAPI();
  const { data: usersResponse, sendRequest: fetchUsers } = useAPI();
  const { data: assignmentResponse, sendRequest: fetchAssignment } = useAPI();

  const { sendRequest: addParticipant } = useAPI();
  const { sendRequest: updateParticipant } = useAPI();  
  const { sendRequest: updateUser } = useAPI();  
  const { sendRequest: deleteParticipant } = useAPI();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newUserName, setNewUserName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>(ParticipantRole.Participant);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilterRole, setSelectedFilterRole] = useState<Role | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [modalShow, setModalShow] = useState({ edit: false, remove: false });
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [toast, setToast] = useState<{ message: string; onUndo: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null); // Error message state
  const [lastDeletedParticipant, setLastDeletedParticipant] = useState<Participant | null>(null);

  const { assignmentId } = useParams();

  useEffect(() => {
    if (!modalShow.edit || !modalShow.remove) {
      fetchParticipants({ url: `/participants/assignment/${assignmentId}` });
      fetchUsers({ url: "/users" });
      fetchAssignment({ url: `/assignments/${assignmentId}` });
    }
  }, [
    modalShow,
    assignmentId,
    fetchParticipants,
    fetchUsers,
    fetchAssignment,
    addParticipant,
    updateParticipant,
    updateUser,
    deleteParticipant,
  ]);

  useEffect(() => {
    if (participantsResponse?.data && usersResponse?.data && assignmentResponse?.data) {
      const assignment = assignmentResponse.data as IAssignmentResponse;
      const participants = participantsResponse.data.map((participant: IAssignmentParticipantResponse) => {
        const user = usersResponse.data.find((u: any) => u.id === participant.user_id);
        return {
          id: participant.id,
          user_id: user.id,
          name: user.full_name,
          email: user.email,
          role: user.role.name,
          parent: assignment.name,
          permissions: {
            review: participant.can_review ? IsEnabled.Yes : IsEnabled.No,
            submit: participant.can_submit ? IsEnabled.Yes : IsEnabled.No,
            takeQuiz: participant.can_take_quiz ? IsEnabled.Yes : IsEnabled.No,
            mentor: participant.can_mentor ? IsEnabled.Yes : IsEnabled.No,
          },
          participantRole: participant.authorization || ParticipantRole.Participant,
        };
      });
      setParticipants(participants);
    }
  }, [
    participantsResponse,
    usersResponse,
    assignmentResponse,
  ]);

  const filteredParticipants = participants
    .filter((participant) => {
      return (
        (selectedFilterRole === 'All' || participant.role === selectedFilterRole) &&
        (participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;

      const { key, direction } = sortConfig;

      const aValue = getNestedValue(a, key as string);
      const bValue = getNestedValue(b, key as string);

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const openEditModal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setModalShow({ edit: true, remove: false });
  };

  const openRemoveModal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setModalShow({ edit: false, remove: true });
  };

  const handleRemove = () => {
    if (selectedParticipant) {
      setLastDeletedParticipant(selectedParticipant);
      const updatedList = participants.filter((p) => p.id !== selectedParticipant.id);
      deleteParticipant({ url: `/participants/${selectedParticipant.id}`, method: 'DELETE' });
      setModalShow({ edit: false, remove: false });
    }
  };

  const handleSave = (updatedParticipant: Participant) => {
    // const updatedList = participants.map((p) =>
    //   p.id === updatedParticipant.id ? updatedParticipant : p
    // );
    // setParticipants(updatedList);
    // setSelectedParticipant(null);
    updateParticipant({
      url: `/participants/${updatedParticipant.id}/${updatedParticipant.participantRole}`,
      method: HttpMethod.PATCH,
    });
    updateUser({
      url: `/users/${updatedParticipant.user_id}`,
      method: HttpMethod.PATCH,
      data: {
        user: {
          full_name: updatedParticipant.name,
          email: updatedParticipant.email,
        }
      },
    })
  };

  const handleAddUser = () => {
    if (!newUserName.trim()) {
      setError('Name must not be empty.');
      return;
    }

    if (participants.some((p) => p.name.toLowerCase() === newUserName.trim().toLowerCase())) {
      setError('Participant name must be unique.');
      return;
    }

    // Reset error if name is valid
    setError(null);
    
    const user = usersResponse?.data.find((u: any) => u.name === newUserName.trim());
    
    if (!user) {
      setError('User not found.');
      return;
    }

    addParticipant({
      url: "/participants/participant",
      method: 'POST',
      data: {
        user_id: user.id,
        assignment_id: Number(assignmentId),
        authorization: selectedRole,
      }
    });

    setNewUserName('');
  };

  const handleSort = (path: string) => {
    setSortConfig((prev) =>
      prev && prev.key === path
        ? { key: path, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key: path, direction: 'asc' }
    );
    // Reset error if any
    setError(null);
  };

  return (
    <div className="assignment-participants-container">
      <h1 className="assignment-participants-header">Assignment Participants: Program 1</h1>
      {/* Add User Section */}
      <label className="section-label">Add new participant</label>
      {error && <div className="error-message">{error}</div>}
      <div className="add-user-section">
        <div className="user-permissions">
          <input
            type="text"
            placeholder="Enter a new username"
            className="user-input"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <Button className ="btn btn-md"
  variant="danger"
  onClick={handleAddUser}
  style={{ height: '42px' }}
>
  Add user
</Button>
        </div>

        {/* Radio Group for Role Selection */}
        <div className="role-radio-group">
          {Object.values(ParticipantRole).map((role) => (
            <label key={role} className="role-radio-option">
              <input
                type="radio"
                value={role}
                checked={selectedRole === role}
                onChange={() => setSelectedRole(role as ParticipantRole)}
              />
              {role}
              <img
      src={`${process.env.PUBLIC_URL}assets/images/info.png`}
      alt="Info"
      title={participantRoleInfo(role)}
      width="16"
      height="16"
      className="ms-2"
    />
            </label>
          ))}
        </div>
      </div>

      {/* Participant Table */}
      <ParticipantTable
        participants={filteredParticipants}
        onSort={handleSort}
        assignmentProps={assignmentProps}
        openEditModal={openEditModal}
        openRemoveModal={openRemoveModal}
        numColumns={numColumns(assignmentProps)}
        sortConfig={sortConfig}
      />

      {/* Modals */}
      {selectedParticipant && (
        <EditParticipantModal
          show={modalShow.edit}
          participant={selectedParticipant}
          onHide={() => setModalShow({ ...modalShow, edit: false })}
          onSave={handleSave}
        />
      )}
      <ConfirmRemoveModal
        show={modalShow.remove}
        onHide={() => setModalShow({ ...modalShow, remove: false })}
        onConfirm={handleRemove}
      />

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          onUndo={toast.onUndo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export function permissionIcon(permission: IsEnabled) {
  return permission === IsEnabled.Yes ? <img
  src={`${process.env.PUBLIC_URL}/assets/images/Check-icon.png`}
  width="20"
  height="20"
/> : <img
      src={`${process.env.PUBLIC_URL}/assets/images/Uncheck-icon.png`}
      width="20"
      height="20"
    />;
}

export default AssignmentParticipants;
