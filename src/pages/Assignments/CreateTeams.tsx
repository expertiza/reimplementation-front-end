// src/pages/Assignments/CreateTeams.tsx
import React, { useMemo, useState, useCallback, useRef, memo } from 'react';
import {
  Button,
  Container,
  Row,
  Col,
  Modal,
  Form,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { useLoaderData, useNavigate } from 'react-router-dom';

/* =============================================================================
   Types
============================================================================= */

type ContextType = 'assignment' | 'course';

interface Participant {
  id: string | number;
  username: string;
  fullName?: string;
  teamName?: string;
}

interface Team {
  id: string | number;
  name: string;
  mentor?: Participant;
  members: Participant[];
}

interface LoaderPayload {
  contextType?: ContextType;
  contextName?: string;
  initialTeams?: Team[];
  initialUnassigned?: Participant[];
}

/* =============================================================================
   Assets (icons used only where required)
============================================================================= */

const publicUrl =
  (import.meta as any)?.env?.BASE_URL ??
  (typeof process !== 'undefined' ? (process as any)?.env?.PUBLIC_URL : '') ??
  '';

const assetUrl = (rel: string) =>
  `${publicUrl.replace(/\/$/, '')}/${rel.replace(/^\//, '')}`;

const ICONS = {
  add: 'assets/icons/add-participant-24.png',
  delete: 'assets/images/delete-icon-24.png',
  edit: 'assets/images/edit-icon-24.png',
} as const;

type IconName = keyof typeof ICONS;

const Icon: React.FC<{
  name: IconName;
  size?: number;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}> = memo(({ name, size = 16, alt, className, style }) => (
  <img
    src={assetUrl(ICONS[name])}
    width={size}
    height={size}
    alt={alt ?? name}
    className={className}
    style={{ verticalAlign: 'middle', ...style }}
  />
));
Icon.displayName = 'Icon';

/* =============================================================================
   Demo data
============================================================================= */

const sampleUnassigned: Participant[] = [
  { id: 2001, username: 'Student 10933', fullName: 'Kai Moore' },
  { id: 2002, username: 'Student 10934', fullName: 'Rowan Diaz' },
  { id: 2003, username: 'Student 10935', fullName: 'Parker Lee' },
  { id: 2004, username: 'Student 10936', fullName: 'Jamie Rivera' },
];

const sampleTeams: Team[] = [
  {
    id: 't1',
    name: 'sshivas MentoredTeam',
    mentor: {
      id: 'm1',
      username: 'Teaching Assistant 10816',
      fullName: 'Teaching Assistant 10816',
    },
    members: [
      {
        id: 1001,
        username: 'Student 10917',
        fullName: 'Avery Chen',
        teamName: 'sshivas MentoredTeam',
      },
      {
        id: 1002,
        username: 'Student 10916',
        fullName: 'Jordan Park',
        teamName: 'sshivas MentoredTeam',
      },
      {
        id: 1003,
        username: 'Teaching Assistant 10816 (Mentor)',
        fullName: 'Teaching Assistant 10816 (Mentor)',
        teamName: 'sshivas MentoredTeam',
      },
      {
        id: 1004,
        username: 'Student 10928',
        fullName: 'Sam Patel',
        teamName: 'sshivas MentoredTeam',
      },
    ],
  },
  {
    id: 't2',
    name: 'agaudan MentoredTeam',
    mentor: {
      id: 'm2',
      username: 'Teaching Assistant 10624',
      fullName: 'Teaching Assistant 10624',
    },
    members: [
      {
        id: 1005,
        username: 'Student 10925',
        fullName: 'Riley Gomez',
        teamName: 'agaudan MentoredTeam',
      },
    ],
  },
  {
    id: 't3',
    name: 'tjbrown8 MentoredTeam',
    mentor: {
      id: 'm3',
      username: 'Teaching Assistant 10199',
      fullName: 'Teaching Assistant 10199',
    },
    members: [
      {
        id: 1006,
        username: 'Student 10909',
        fullName: 'Taylor Nguyen',
        teamName: 'tjbrown8 MentoredTeam',
      },
      {
        id: 1007,
        username: 'Student 10921',
        fullName: 'Casey Morgan',
        teamName: 'tjbrown8 MentoredTeam',
      },
      {
        id: 1008,
        username: 'Teaching Assistant 10199 (Mentor)',
        fullName: 'Teaching Assistant 10199 (Mentor)',
        teamName: 'tjbrown8 MentoredTeam',
      },
    ],
  },
  {
    id: 't4',
    name: 'IronMan2 MentoredTeam',
    mentor: {
      id: 'm4',
      username: 'Teaching Assistant 10234',
      fullName: 'Teaching Assistant 10234',
    },
    members: [
      {
        id: 1009,
        username: 'Student 10931',
        fullName: 'Aria Brooks',
        teamName: 'IronMan2 MentoredTeam',
      },
      {
        id: 1010,
        username: 'Student 10932',
        fullName: 'Noah Shah',
        teamName: 'IronMan2 MentoredTeam',
      },
    ],
  },
];

/* =============================================================================
   Typography
   - Standard text: 13px / 30px
   - Subheading (provided for future use): 1.2em / 18px
   - Table data: 15px / 1.428em
============================================================================= */

const HEADING_TEXT: React.CSSProperties = {
  fontSize: '30px',
  lineHeight: '1.2em',
  fontWeight: 700,
};

const STANDARD_TEXT: React.CSSProperties = {
  fontFamily: 'verdana, arial, helvetica, sans-serif',
  color: '#333',
  fontSize: '13px',
  lineHeight: '30px',
};

const SUBHEADING_TEXT: React.CSSProperties = {
  fontSize: '1.2em',
  lineHeight: '18px',
};

const TABLE_TEXT: React.CSSProperties = {
  fontFamily: 'verdana, arial, helvetica, sans-serif',
  color: '#333',
  fontSize: '15px',
  lineHeight: '1.428em',
};

/* =============================================================================
   Layout / Reusable Styles
============================================================================= */

const pageWrap: React.CSSProperties = {
  ...STANDARD_TEXT,
  maxWidth: 1160,
  margin: '20px auto 40px',
  padding: '0 16px',
};

const frame: React.CSSProperties = {
  border: '1px solid #9aa0a6',
  borderRadius: 12,
  backgroundColor: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

const headerBar: React.CSSProperties = {
  background: '#f7f8fa',
  padding: '12px 16px',
  borderBottom: '1px solid #e4e6eb',
  fontWeight: 600,
  display: 'flex',
};

const teamRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '10px 16px',
  background: '#d8d8b8',
  borderBottom: '1px solid #ebe9dc',
  whiteSpace: 'nowrap',
};

const membersRowBase: React.CSSProperties = {
  padding: '12px 16px',
  background: '#ffffff',
  borderBottom: '1px solid #f0f1f3',
};

const caretButton: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
  width: 24,
  height: 24,
};

const actionCell: React.CSSProperties = { width: 200, textAlign: 'right' };

const chipBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  marginRight: 10,
  marginBottom: 10,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  boxShadow: '0 1px 0 rgba(0,0,0,0.03)',
};

const chipRemoveButton: React.CSSProperties = {
  marginLeft: 10,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: 0,
  lineHeight: 1,
};

const toolbarWrap: React.CSSProperties = { margin: '4px 0 10px' };
const toolbarLinkBase: React.CSSProperties = {
  ...STANDARD_TEXT,
  color: '#8b5e3c',
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  cursor: 'pointer',
  textDecoration: 'none',
};
const pipe: React.CSSProperties = { margin: '0 8px', color: '#8b5e3c' };

/* =============================================================================
   Small presentational helpers
============================================================================= */

const ToolbarLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <button style={toolbarLinkBase} onClick={onClick}>
    {children}
  </button>
);

const MentorRemovalButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id="rm-mentor-tt">Remove mentor</Tooltip>}>
    <button
      style={{ ...chipRemoveButton, marginLeft: 6 }}
      onClick={onClick}
      aria-label="Remove mentor"
      title="Remove mentor"
    >
      <Icon name="delete" size={16} />
    </button>
  </OverlayTrigger>
);

/* =============================================================================
   Main Component
============================================================================= */

const CreateTeams: React.FC<{ contextType?: ContextType; contextName?: string }> = ({
                                                                                      contextType,
                                                                                      contextName,
                                                                                    }) => {
  // Loader / routing
  const loader = (useLoaderData?.() as LoaderPayload) || {};
  const navigate = useNavigate();

  // Context
  const ctxType = (contextType || loader.contextType || 'assignment') as ContextType;
  const ctxName = contextName || loader.contextName || 'Program';

  // Initial data
  const baseTeams = loader.initialTeams || sampleTeams;
  const baseUnassigned = loader.initialUnassigned || sampleUnassigned;

  // Compute initial unassigned list excluding already-assigned members
  const initialUnassigned = useMemo(() => {
    const assignedIds = new Set(
      baseTeams.flatMap((t) => t.members.map((m) => String(m.id))),
    );
    return baseUnassigned.filter((u) => !assignedIds.has(String(u.id)));
  }, [baseTeams, baseUnassigned]);

  // State
  const [teams, setTeams] = useState<Team[]>(baseTeams);
  const [unassigned, setUnassigned] = useState<Participant[]>(initialUnassigned);
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>(
    () => Object.fromEntries(baseTeams.map((t) => [t.id, true])),
  );
  const [showUsernames, setShowUsernames] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCopyToModal, setShowCopyToModal] = useState(false);
  const [showCopyFromModal, setShowCopyFromModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [editTeamName, setEditTeamName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [copyTarget, setCopyTarget] = useState('');
  const [copySource, setCopySource] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* -------------------------------------------------------------------------
     Derived helpers
  ------------------------------------------------------------------------- */

  const displayName = useCallback(
    (p?: Participant) =>
      p ? (showUsernames ? p.username : p.fullName || p.username) : '',
    [showUsernames],
  );

  const normalizedTeamName = useCallback(
    (name: string) => name.replace(/\s*MentoredTeam$/i, ''),
    [],
  );

  const studentsWithoutTeams = useMemo(() => unassigned, [unassigned]);

  const isMentorMember = useCallback((team: Team, m: Participant) => {
    if (!team.mentor) return false;
    const normalize = (s: string) => s.replace(/\s*\(Mentor\)\s*$/i, '').trim();
    const idMatch = String(m.id) === String(team.mentor.id);
    const usernameMatch = normalize(m.username) === normalize(team.mentor.username);
    const nameMatch =
      !!m.fullName &&
      !!team.mentor.fullName &&
      normalize(m.fullName) === normalize(team.mentor.fullName);
    return idMatch || usernameMatch || nameMatch;
  }, []);

  /* -------------------------------------------------------------------------
     UI event handlers
  ------------------------------------------------------------------------- */

  const toggleTeamExpand = useCallback((teamId: Team['id']) => {
    setExpanded((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  }, []);

  const openAddMemberModal = useCallback((team: Team) => {
    setSelectedTeam(team);
    setSelectedParticipantId('');
    setShowAddModal(true);
  }, []);

  const confirmAddMember = useCallback(() => {
    if (!selectedTeam || !selectedParticipantId) return;
    const member = unassigned.find((u) => String(u.id) === selectedParticipantId);
    if (!member) return;

    setUnassigned((prev) => prev.filter((u) => String(u.id) !== selectedParticipantId));
    setTeams((prev) =>
      prev.map((t) =>
        t.id === selectedTeam.id
          ? { ...t, members: [...t.members, { ...member, teamName: t.name }] }
          : t,
      ),
    );
    setShowAddModal(false);
  }, [selectedParticipantId, selectedTeam, unassigned]);

  const removeMemberFromTeam = useCallback(
    (teamId: Team['id'], memberId: Participant['id']) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const member = team.members.find((m) => m.id === memberId);
      setTeams((prev) =>
        prev.map((t) =>
          t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t,
        ),
      );
      if (member) {
        setUnassigned((prev) => [...prev, { ...member, teamName: '' }]);
      }
    },
    [teams],
  );

  const removeMentor = useCallback((teamId: Team['id']) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId || !t.mentor) return t;
        const filtered = t.members.filter((m) => !isMentorMember(t, m));
        return { ...t, mentor: undefined, members: filtered };
      }),
    );
  }, [isMentorMember]);

  const openEditTeamModal = useCallback((team: Team) => {
    setSelectedTeam(team);
    setEditTeamName(team.name);
    setShowEditModal(true);
  }, []);

  const confirmEditTeamName = useCallback(() => {
    if (!selectedTeam || !editTeamName.trim()) return;
    const newName = editTeamName.trim();
    setTeams((prev) =>
      prev.map((t) =>
        t.id !== selectedTeam.id
          ? t
          : {
            ...t,
            name: newName,
            members: t.members.map((m) => ({ ...m, teamName: newName })),
          },
      ),
    );
    setShowEditModal(false);
  }, [editTeamName, selectedTeam]);

  const deleteTeam = useCallback(
    (teamId: Team['id']) => {
      const team = teams.find((t) => t.id === teamId);
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
      if (team) {
        setUnassigned((prev) => [...prev, ...team.members.map((m) => ({ ...m, teamName: '' }))]);
      }
    },
    [teams],
  );

  const createTeam = useCallback(() => {
    const name = newTeamName.trim();
    if (!name || teams.some((t) => t.name === name)) return;
    const id = `t-${Date.now()}`;
    setTeams((prev) => [...prev, { id, name, members: [] }]);
    setNewTeamName('');
    setShowCreateModal(false);
  }, [newTeamName, teams]);

  const deleteAllTeams = useCallback(() => {
    if (!window.confirm('Delete all teams? This returns all members to the unassigned list.'))
      return;
    const everyone = teams.flatMap((t) => t.members);
    setUnassigned((prev) => [...prev, ...everyone.map((m) => ({ ...m, teamName: '' }))]);
    setTeams([]);
  }, [teams]);

  const triggerImportClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(String(reader.result));
          const newTeams: Team[] = Array.isArray(data?.teams) ? data.teams : teams;
          const newUnassigned: Participant[] = Array.isArray(data?.unassigned)
            ? data.unassigned
            : unassigned;
          const assigned = new Set(
            newTeams.flatMap((t) => t.members.map((m) => String(m.id))),
          );
          setTeams(newTeams);
          setUnassigned(newUnassigned.filter((u) => !assigned.has(String(u.id))));
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [teams, unassigned],
  );

  const exportTeams = useCallback(() => {
    const payload = { teams, unassigned };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [teams, unassigned]);

  const copyTeamsToCourse = useCallback(() => {
    alert(`Copying ${teams.length} team(s) to "${copyTarget || '(choose destination)'}"`);
    setShowCopyToModal(false);
  }, [copyTarget, teams.length]);

  const copyTeamsFromCourse = useCallback(() => {
    alert(`Copying teams from "${copySource || '(choose source)'}" into this ${ctxType}`);
    setShowCopyFromModal(false);
  }, [copySource, ctxType]);

  /* -------------------------------------------------------------------------
     Render
  ------------------------------------------------------------------------- */

  return (
    <Container fluid style={pageWrap}>
      {/* Header */}
      <Row className="align-items-center g-2" style={{ marginBottom: 4 }}>
        <Col className="text-start">
          <h2 style={{ margin: 0, ...HEADING_TEXT }}>Teams For {ctxName}</h2>
        </Col>
        <Col xs="auto" className="ms-auto d-flex align-items-center" style={{ paddingTop: 2 }}>
          <Form.Check
            type="switch"
            id="toggle-names"
            label={showUsernames ? 'Showing usernames' : 'Showing names'}
            checked={!showUsernames}
            onChange={() => setShowUsernames((prev) => !prev)}
          />
        </Col>
      </Row>

      {/* Toolbar (text-only links with pipes) */}
      <Row style={toolbarWrap}>
        <Col
          className="text-start"
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
        >
          <ToolbarLink onClick={() => setShowCreateModal(true)}>Create team</ToolbarLink>
          <span style={pipe}>|</span>
          <ToolbarLink onClick={triggerImportClick}>Import teams</ToolbarLink>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            hidden
          />
          <span style={pipe}>|</span>
          <ToolbarLink onClick={exportTeams}>Export teams</ToolbarLink>
          <span style={pipe}>|</span>
          <ToolbarLink onClick={deleteAllTeams}>Delete all teams</ToolbarLink>
          <span style={pipe}>|</span>
          <ToolbarLink onClick={() => setShowCopyToModal(true)}>Copy teams to course</ToolbarLink>
          <span style={pipe}>|</span>
          <ToolbarLink onClick={() => setShowCopyFromModal(true)}>
            Copy teams from course
          </ToolbarLink>
          <span style={pipe}>|</span>
          <ToolbarLink onClick={() => navigate(-1)}>Back</ToolbarLink>
        </Col>
      </Row>

      {/* Card wrapper */}
      <div
        style={{
          border: '2px solid #9aa0a6',
          borderRadius: 12,
          padding: 12,
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Tabs defaultActiveKey="teams" className="mb-3">
          <Tab eventKey="teams" title="Teams">
            <div style={{ overflowX: 'auto' }}>
              {/* All table text: 15px / 1.428em */}
              <div style={{ ...frame, width: 'max-content', minWidth: '100%', ...TABLE_TEXT }}>
                <div style={{ ...headerBar }}>
                  <div style={{ width: 40 }} />
                  <div className="flex-grow-1">Details</div>
                  <div style={{ width: 200, textAlign: 'center' }}>Actions</div>
                </div>

                {teams.map((team) => {
                  const open = !!expanded[team.id];
                  const visibleMembers = team.members.filter((m) => !isMentorMember(team, m));
                  return (
                    <div key={team.id}>
                      <div style={{ ...teamRowStyle }}>
                        <div style={{ width: 40 }}>
                          <button
                            style={caretButton}
                            onClick={() => toggleTeamExpand(team.id)}
                            aria-label={open ? 'Collapse team' : 'Expand team'}
                          >
                            {open ? '▾' : '▸'}
                          </button>
                        </div>

                        <div className="flex-grow-1" style={{ overflow: 'hidden' }}>
                          <strong>{normalizedTeamName(team.name)}</strong>
                          {team.mentor && (
                            <>
                              <span className="ms-2">
                                : {displayName(team.mentor)}{' '}
                                <span style={{ opacity: 0.9 }}>(Mentor)</span>
                              </span>
                              <MentorRemovalButton onClick={() => removeMentor(team.id)} />
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div style={actionCell}>
                          <Button
                            variant="link"
                            className="p-0 me-3"
                            title="Add member"
                            onClick={() => openAddMemberModal(team)}
                          >
                            <Icon name="add" size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 me-3"
                            title="Delete team"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Icon name="delete" size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0"
                            title="Edit team name"
                            onClick={() => openEditTeamModal(team)}
                          >
                            <Icon name="edit" size={16} />
                          </Button>
                        </div>
                      </div>

                      {open && (
                        <div style={{ ...membersRowBase }}>
                          {visibleMembers.length === 0 ? (
                            <span style={{ color: '#6b7280' }}>No students yet.</span>
                          ) : (
                            visibleMembers.map((m) => (
                              <span key={`${team.id}-${m.id}`} style={{ ...chipBase }}>
                                {displayName(m)}
                                <button
                                  style={chipRemoveButton}
                                  title="Remove"
                                  aria-label={`Remove ${displayName(m)} from ${team.name}`}
                                  onClick={() => removeMemberFromTeam(team.id, m.id)}
                                >
                                  <Icon name="delete" size={16} />
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Tab>

          <Tab eventKey="students" title="Students without teams">
            <div style={{ overflowX: 'auto' }}>
              <div style={{ ...frame, width: 'max-content', minWidth: '100%', ...TABLE_TEXT }}>
                <div style={{ ...headerBar }}>
                  <div className="flex-grow-1">Student</div>
                </div>
                <div style={{ padding: 16 }}>
                  {studentsWithoutTeams.length === 0 ? (
                    <span style={{ color: '#6b7280' }}>All students are on a team.</span>
                  ) : (
                    studentsWithoutTeams.map((u) => (
                      <span key={`un-${u.id}`} style={{ ...chipBase }}>
                        {displayName(u)}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Modals */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="addMemberSelect">
              <Form.Label>Select student</Form.Label>
              <Form.Select
                value={selectedParticipantId}
                onChange={(e) => setSelectedParticipantId(e.target.value)}
              >
                <option value="">Select…</option>
                {unassigned.map((u) => (
                  <option key={u.id} value={String(u.id)}>
                    {displayName(u)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            cancel
          </Button>
          <Button variant="primary" onClick={confirmAddMember}>
            add
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit team name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editTeamName">
              <Form.Label>Team name</Form.Label>
              <Form.Control
                type="text"
                value={editTeamName}
                onChange={(e) => setEditTeamName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            cancel
          </Button>
          <Button variant="primary" onClick={confirmEditTeamName}>
            save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create team</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="newTeamName">
              <Form.Label>Team name</Form.Label>
              <Form.Control
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
            cancel
          </Button>
          <Button variant="primary" onClick={createTeam}>
            create
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCopyToModal} onHide={() => setShowCopyToModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Copy teams to course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="copyTarget">
              <Form.Label>Destination course</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., CSC517 Section 003"
                value={copyTarget}
                onChange={(e) => setCopyTarget(e.target.value)}
              />
              <Form.Text className="text-muted">
                (Stub) Wire this to your backend to copy teams to a course.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCopyToModal(false)}>
            cancel
          </Button>
          <Button variant="primary" onClick={copyTeamsToCourse}>
            copy
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCopyFromModal} onHide={() => setShowCopyFromModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Copy teams from course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="copySource">
              <Form.Label>Source course</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., CSC517 Section 002"
                value={copySource}
                onChange={(e) => setCopySource(e.target.value)}
              />
              <Form.Text className="text-muted">
                (Stub) Wire this to your backend to pull teams from another course.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCopyFromModal(false)}>
            cancel
          </Button>
          <Button variant="primary" onClick={copyTeamsFromCourse}>
            copy
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTeams;
