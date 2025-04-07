import { permissionIcon } from "./AssignmentParticipants";
import { AssignmentProperties, Participant } from "./AssignmentParticipantsTypes";
import { classForRole, classForStatus, iconForRole } from "./AssignmentParticipantsUtil";
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './ParticipantsTable.css';
import { Icon } from "components/Icon/Icon";
import EditIcon from 'assets/edit_icon.png';
import DeleteIcon from 'assets/delete_icon.png';


interface ParticipantTableProps {
  participants: Participant[];
  onSort: (key: string) => void;
  assignmentProps: AssignmentProperties;
  openEditModal: (participant: Participant) => void;
  openRemoveModal: (participant: Participant) => void;
  numColumns: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

function ParticipantTable({
  participants,
  onSort,
  assignmentProps,
  openEditModal,
  openRemoveModal,
  numColumns,
  sortConfig,
}: ParticipantTableProps) {

  const sortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <FaSort />;
    }
    return sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <div className="assignment-participants-table-container">
      <table className="assignment-participants-table">
        <thead>
          <tr>
            <th
              onClick={() => onSort('id')}
              className={sortConfig?.key === 'id' ? 'sorted' : ''}
            >
              ID {sortIcon('id')}
            </th>
            <th
              onClick={() => onSort('name')}
              className={sortConfig?.key === 'name' ? 'sorted' : ''}
            >
              Name {sortIcon('name')}
            </th>
            <th
              onClick={() => onSort('email')}
              className={sortConfig?.key === 'email' ? 'sorted' : ''}
            >
              Email Address {sortIcon('email')}
            </th>
            <th
              onClick={() => onSort('role')}
              className={sortConfig?.key === 'role' ? 'sorted' : ''}
            >
              Role {sortIcon('role')}
            </th>
            <th
              onClick={() => onSort('parent')}
              className={sortConfig?.key === 'parent' ? 'sorted' : ''}
            >
              Parent {sortIcon('parent')}
            </th>
            <th
              className={sortConfig?.key === 'permissions.review' ? 'sorted' : ''}
              onClick={() => onSort('permissions.review')}
            >
              Review {sortIcon('permissions.review')}
            </th>
            <th
              onClick={() => onSort('permissions.submit')}
              className={sortConfig?.key === 'permissions.submit' ? 'sorted' : ''}
            >
              Submit {sortIcon('permissions.submit')}
            </th>
            {assignmentProps.hasQuiz && (
              <th
                onClick={() => onSort('permissions.takeQuiz')}
                className={sortConfig?.key === 'permissions.takeQuiz' ? 'sorted' : ''}
              >
                Take Quiz {sortIcon('permissions.takeQuiz')}
              </th>
            )}
            {assignmentProps.hasMentor && (
              <th
                onClick={() => onSort('permissions.mentor')}
                className={sortConfig?.key === 'permissions.mentor' ? 'sorted' : ''}
              >
                Mentor {sortIcon('permissions.mentor')}
              </th>
            )}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {participants.length > 0 ? (
            participants.map((participant) => (
              <tr key={participant.id}>
                <td>{participant.id}</td>
                <td>{participant.name}</td>
                <td>{participant.email}</td>
                <td className={classForRole(participant.role)} style={{ paddingLeft: '1rem' }}>
                  {iconForRole(participant.role)}
                  <span style={{
                    display: 'inline-block',
                    marginLeft: '1rem',
                    verticalAlign: 'middle',
                  }}>
                    {participant.role}
                  </span>
                </td>
                <td>{participant.parent}</td>
                <td className={`permission-column ${classForStatus(participant.permissions.review)}`}>
                  {permissionIcon(participant.permissions.review)}
                </td>
                <td className={`permission-column ${classForStatus(participant.permissions.submit)}`}>
                  {permissionIcon(participant.permissions.submit)}
                </td>
                {assignmentProps.hasQuiz && (
                  <td className={`permission-column ${classForStatus(participant.permissions.takeQuiz)}`}>
                    {permissionIcon(participant.permissions.takeQuiz)}
                  </td>
                )}
                {assignmentProps.hasMentor && (
                  <td className={`permission-column ${classForStatus(participant.permissions.mentor)}`}>
                    {permissionIcon(participant.permissions.mentor)}
                  </td>
                )}
                <td className="actions-column">
                  <button className="edit-user-button" onClick={() => openEditModal(participant)}>
                    <Icon src={EditIcon} alt="Edit participant icon" size={14} />
                  </button>
                  <button className="remove-user-button" onClick={() => openRemoveModal(participant)}>
                    <Icon src={DeleteIcon} alt="Delete participant icon" size={14} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={numColumns} className="no-results-message">
                No participants found matching the current search criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ParticipantTable;
