import './AssignmentParticipants.css';

import { useEffect, useMemo, useState } from 'react';
import EditParticipantModal from './EditParticipantModal';
import ConfirmRemoveModal from './ConfirmRemoveModal';
import ParticipantTable from './ParticipantsTable';
import {
  assignmentTableFlagsFromResponse,
  displayNameForUser,
  findUserByIdentifier,
  participantRoleInfo,
} from './AssignmentParticipantsUtil';
import { AssignmentProperties, IsEnabled, Participant, ParticipantRole, Role } from './AssignmentParticipantsTypes';
import useAPI from 'hooks/useAPI';
import { useParams } from 'react-router-dom';
import { IAssignmentResponse } from 'utils/interfaces';
import { HttpMethod } from 'utils/httpMethods';
import { Form, Button } from 'react-bootstrap';

const UI_ROLE_TO_API_ROLE_NAME: Record<string, string> = {
  admin: 'administrator',
  student: 'student',
  instructor: 'instructor',
};

const API_ROLE_TO_UI_ROLE: Record<string, string> = {
  'Administrator': Role.Admin,
  'Super Administrator': Role.Admin,
};

/** Manages assignment participant listing, filtering, and participant CRUD actions. */
function AssignmentParticipants() {
  const { data: participantsResponse, sendRequest: fetchParticipants } = useAPI();
  const { data: usersResponse, sendRequest: fetchUsers } = useAPI();
  const { data: assignmentResponse, sendRequest: fetchAssignment } = useAPI();
  const { data: rolesResponse, sendRequest: fetchRoles } = useAPI();

  const { data: addParticipantResponse, sendRequest: addParticipant } = useAPI();
  const { data: updateParticipantResponse, sendRequest: updateParticipant } = useAPI();
  const { data: updateUserResponse, sendRequest: updateUser } = useAPI();
  const { data: deleteParticipantResponse, sendRequest: deleteParticipant } = useAPI();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newUserName, setNewUserName] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>(ParticipantRole.Participant);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilterRole, setSelectedFilterRole] = useState<Role | 'All'>('All');
  const [modalShow, setModalShow] = useState({ edit: false, remove: false });
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { assignmentId } = useParams();

  const assignmentProps: AssignmentProperties = useMemo(() => {
    const data = assignmentResponse?.data as IAssignmentResponse | undefined;
    if (!data) return { hasQuiz: false, hasMentor: false };
    return assignmentTableFlagsFromResponse(data);
  }, [assignmentResponse?.data]);

  const assignmentName = (assignmentResponse?.data as IAssignmentResponse | undefined)?.name ?? "assignment";

  const roleOptions = useMemo<string[]>(() => [Role.Admin, Role.Instructor, Role.Student], []);

  /** Maps a UI role label to its API role id from the fetched roles list. */
  const resolveRoleId = (uiRoleName: string): number | undefined => {
    const backendName = UI_ROLE_TO_API_ROLE_NAME[uiRoleName.toLowerCase().trim()] ?? uiRoleName.toLowerCase().trim();
    const match = (rolesResponse?.data ?? []).find(
      (r: any) => String(r?.name ?? '').toLowerCase().trim() === backendName
    );
    return match?.id;
  };

  /** Refreshes assignment, users, participants, and roles after modal/API state changes. */
  useEffect(() => {
    if (!modalShow.edit && !modalShow.remove) {
      fetchParticipants({ url: `/participants/assignment/${assignmentId}` });
      fetchUsers({ url: "/users" });
      fetchRoles({ url: "/roles" });
      fetchAssignment({ url: `/assignments/${assignmentId}` });
    }
  }, [
    assignmentId,
    addParticipantResponse,
    updateParticipantResponse,
    updateUserResponse,
    deleteParticipantResponse,
  ]);

  /** Normalizes API participant payload into table-ready participant rows. */
  useEffect(() => {
    if (participantsResponse?.data && assignmentResponse?.data) {
      const assignment = assignmentResponse.data as IAssignmentResponse;
      const mapped = participantsResponse.data
        .map((participant: any) => {
          const user = participant.user;
          if (!user) return null;
          return {
            id: participant.id,
            user_id: user.id,
            name: displayNameForUser(user),
            email: user.email ?? "",
            role: API_ROLE_TO_UI_ROLE[user.role?.name] ?? user.role?.name ?? Role.Student,
            parent: assignment.name,
            permissions: {
              review: participant.can_review ? IsEnabled.Yes : IsEnabled.No,
              submit: participant.can_submit ? IsEnabled.Yes : IsEnabled.No,
              takeQuiz: participant.can_take_quiz ? IsEnabled.Yes : IsEnabled.No,
              mentor: participant.can_mentor ? IsEnabled.Yes : IsEnabled.No,
            },
            participantRole: participant.authorization || ParticipantRole.Participant,
          };
        })
        .filter(Boolean) as Participant[];
      setParticipants(mapped);
    }
  }, [participantsResponse, assignmentResponse]);

  /** Filters participants by selected role and search text. */
  const filteredParticipants = useMemo(() => {
    return participants.filter((participant) => {
      return (
        (selectedFilterRole === 'All' || participant.role === selectedFilterRole) &&
        (participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          participant.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [participants, searchTerm, selectedFilterRole]);

  /** Opens the edit modal for the chosen participant. */
  const openEditModal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setSaveError(null);
    setModalShow({ edit: true, remove: false });
  };

  /** Opens the remove confirmation modal for the chosen participant. */
  const openRemoveModal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setModalShow({ edit: false, remove: true });
  };

  /** Deletes the selected participant and closes the remove modal. */
  const handleRemove = () => {
    if (selectedParticipant) {
      deleteParticipant({ url: `/participants/${selectedParticipant.id}`, method: 'DELETE' });
      setModalShow({ edit: false, remove: false });
    }
  };

  /**
   * Persists participant authorization and user profile/role edits.
   * Awaits both backend writes; only closes the modal on success and surfaces an
   * inline error on failure or when the role id cannot be resolved.
   */
  const handleSave = async (updatedParticipant: Participant) => {
    const roleId = resolveRoleId(updatedParticipant.role);

    if (roleId == null) {
      setSaveError(
        `Could not resolve a role id for "${updatedParticipant.role}". Please refresh and try again.`
      );
      return;
    }

    setSaveError(null);

    try {
      await Promise.all([
        updateParticipant({
          url: `/participants/${updatedParticipant.id}/${updatedParticipant.participantRole}`,
          method: HttpMethod.PATCH,
        }),
        updateUser({
          url: `/users/${updatedParticipant.user_id}`,
          method: HttpMethod.PATCH,
          data: {
            full_name: updatedParticipant.name,
            email: updatedParticipant.email,
            role_id: roleId,
          },
        }),
      ]);
      setModalShow({ edit: false, remove: false });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err?.message ??
        'Failed to save participant. Please try again.';
      setSaveError(message);
    }
  };

  /** Validates lookup input and adds a matched user as an assignment participant. */
  const handleAddUser = () => {
    if (!newUserName.trim()) {
      setError('Name must not be empty.');
      return;
    }

    const user = findUserByIdentifier(usersResponse?.data ?? [], newUserName);

    if (!user) {
      setError('User not found.');
      return;
    }

    if (participants.some((p) => p.user_id === user.id)) {
      setError('This user is already a participant.');
      return;
    }

    setError(null);

    addParticipant({
      url: `/participants/${selectedRole}`,
      method: 'POST',
      data: {
        user_id: user.id,
        assignment_id: Number(assignmentId),
      }
    });

    setNewUserName('');
  };

  return (
    <div className="assignment-participants-container">
      <h2 className="assignment-participants-header">Assignment Participants: {assignmentName}</h2>
      <label className="section-label">Add new participant</label>
      {error && <div className="flash_note alert alert-danger error-message">{error}</div>}
      <div className="add-user-section">
        <div className="user-permissions">
          <Form.Control
            type="text"
            placeholder="Username, name, or email"
            className="user-input"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            aria-label="Username, name, or email"
          />
          <Button className="btn btn-md"
            variant="danger"
            onClick={handleAddUser}
            style={{ height: '42px' }}
          >
            Add user
          </Button>
        </div>

        <div className="role-radio-group">
          {Object.values(ParticipantRole).map((role) => (
            <label key={role} className="role-radio-option">
              <input
                type="radio"
                name="participant-role"
                value={role}
                checked={selectedRole === role}
                onChange={() => setSelectedRole(role as ParticipantRole)}
              />
              {role}
              <img
                src="/assets/icons/info.png"
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

      <label className="section-label">Filter participants</label>
      <div className="search-filter-section">
        <Form.Control
          type="text"
          placeholder="Search by name or email"
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search participants"
        />
        <Form.Select
          className="filter-select"
          value={selectedFilterRole}
          onChange={(e) => setSelectedFilterRole(e.target.value as Role | 'All')}
          aria-label="Filter participants by role"
        >
          <option value="All">All roles</option>
          {Object.values(Role).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </Form.Select>
      </div>

      <ParticipantTable
        participants={filteredParticipants}
        assignmentProps={assignmentProps}
        openEditModal={openEditModal}
        openRemoveModal={openRemoveModal}
      />

      {selectedParticipant && (
        <EditParticipantModal
          show={modalShow.edit}
          participant={selectedParticipant}
          roleOptions={roleOptions}
          onHide={() => {
            setSaveError(null);
            setModalShow({ ...modalShow, edit: false });
          }}
          onSave={handleSave}
          errorMessage={saveError}
        />
      )}
      <ConfirmRemoveModal
        show={modalShow.remove}
        onHide={() => setModalShow({ ...modalShow, remove: false })}
        onConfirm={handleRemove}
      />
    </div>
  );
}

/** Returns the enabled/disabled permission icon for a permission cell. */
export function permissionIcon(permission: IsEnabled) {
  return permission === IsEnabled.Yes ? <img
    src="/assets/icons/Check-icon.png"
    width="20"
    height="20"
  /> : <img
    src="/assets/icons/Uncheck-icon.png"
    width="20"
    height="20"
  />;
}

export default AssignmentParticipants;
