import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Button, Container, Row, Col, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { BsPlus, BsX, BsPencil } from 'react-icons/bs';
import { useLoaderData, useNavigate } from 'react-router-dom';

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

/* ---------- DEMO DATA (replace with loader/backend) ---------- */
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
    mentor: { id: 'm1', username: 'Teaching Assistant 10816', fullName: 'Teaching Assistant 10816' },
    members: [
      { id: 1001, username: 'Student 10917', fullName: 'Avery Chen', teamName: 'sshivas MentoredTeam' },
      { id: 1002, username: 'Student 10916', fullName: 'Jordan Park', teamName: 'sshivas MentoredTeam' },
      { id: 1003, username: 'Teaching Assistant 10816 (Mentor)', fullName: 'Teaching Assistant 10816 (Mentor)', teamName: 'sshivas MentoredTeam' },
      { id: 1004, username: 'Student 10928', fullName: 'Sam Patel', teamName: 'sshivas MentoredTeam' },
    ],
  },
  {
    id: 't2',
    name: 'agaudan MentoredTeam',
    mentor: { id: 'm2', username: 'Teaching Assistant 10624', fullName: 'Teaching Assistant 10624' },
    members: [{ id: 1005, username: 'Student 10925', fullName: 'Riley Gomez', teamName: 'agaudan MentoredTeam' }],
  },
  {
    id: 't3',
    name: 'tjbrown8 MentoredTeam',
    mentor: { id: 'm3', username: 'Teaching Assistant 10199', fullName: 'Teaching Assistant 10199' },
    members: [
      { id: 1006, username: 'Student 10909', fullName: 'Taylor Nguyen', teamName: 'tjbrown8 MentoredTeam' },
      { id: 1007, username: 'Student 10921', fullName: 'Casey Morgan', teamName: 'tjbrown8 MentoredTeam' },
      { id: 1008, username: 'Teaching Assistant 10199 (Mentor)', fullName: 'Teaching Assistant 10199 (Mentor)', teamName: 'tjbrown8 MentoredTeam' },
    ],
  },
  {
    id: 't4',
    name: 'IronMan2 MentoredTeam',
    mentor: { id: 'm4', username: 'Teaching Assistant 10234', fullName: 'Teaching Assistant 10234' },
    members: [
      { id: 1009, username: 'Student 10931', fullName: 'Aria Brooks', teamName: 'IronMan2 MentoredTeam' },
      { id: 1010, username: 'Student 10932', fullName: 'Noah Shah', teamName: 'IronMan2 MentoredTeam' },
    ],
  },
];

/* ----------------------------- STYLES (Option A) ----------------------------- */
const frame: React.CSSProperties = {
  border: '1px solid #9aa0a6',
  borderRadius: 12,
  backgroundColor: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

const headerBar: React.CSSProperties = {
  background: '#f7f8fa',
  padding: '14px 18px',
  borderBottom: '1px solid #e4e6eb',
  fontWeight: 600,
  display: 'flex',
};

const teamRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '12px 18px',
  background: '#d8d8b8',
  borderBottom: '1px solid #ebe9dc',
};

const membersRowStyle: React.CSSProperties = {
  padding: '14px 18px',
  background: '#ffffff',
  borderBottom: '1px solid #f0f1f3',
};

const caretBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, width: 24, height: 24 };
const actionCell: React.CSSProperties = { width: 120, textAlign: 'right' };
const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', padding: '6px 12px', marginRight: 10, marginBottom: 10, fontSize: 14, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 18, boxShadow: '0 1px 0 rgba(0,0,0,0.03)' };
const chipRemoveBtn: React.CSSProperties = { marginLeft: 10, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, lineHeight: 1 };
const headingStyle: React.CSSProperties = { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '0.2px', margin: '10px 0 6px 0', textAlign: 'left' };
const toolbarRowStyle: React.CSSProperties = { fontSize: 14, marginBottom: 12 };
const toolbarLinkCls = 'p-0 text-decoration-none';

/* ------------------------------ COMPONENT ------------------------------ */
const CreateTeams: React.FC<{ contextType?: ContextType; contextName?: string }> = ({ contextType, contextName }) => {
  const loader = (useLoaderData?.() as LoaderPayload) || {};
  const navigate = useNavigate();

  const ctxType = (contextType || loader.contextType || 'assignment') as ContextType;
  const ctxName = contextName || loader.contextName || 'Program';

  // start from loader/demo; ensure unassigned excludes anyone already on a team
  const baseTeams = loader.initialTeams || sampleTeams;
  const baseUnassigned = loader.initialUnassigned || sampleUnassigned;
  const assignedIdSet = new Set(baseTeams.flatMap((t) => t.members.map((m) => String(m.id))));
  const initialUnassigned = baseUnassigned.filter((u) => !assignedIdSet.has(String(u.id)));

  const [teams, setTeams] = useState<Team[]>(baseTeams);
  const [unassigned, setUnassigned] = useState<Participant[]>(initialUnassigned);
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>(() => Object.fromEntries(baseTeams.map((t) => [t.id, true])));
  const [showUsernames, setShowUsernames] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBequeathModal, setShowBequeathModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [editTeamName, setEditTeamName] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [bequeathTarget, setBequeathTarget] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayOf = useCallback((p?: Participant) => (p ? (showUsernames ? p.username : p.fullName || p.username) : ''), [showUsernames]);
  const baseTeamName = (name: string) => name.replace(/\s*MentoredTeam$/i, '');
  const toggleTeam = (teamId: Team['id']) => setExpanded((prev) => ({ ...prev, [teamId]: !prev[teamId] }));

  const openAdd = (team: Team) => { setSelectedTeam(team); setSelectedParticipantId(''); setShowAddModal(true); };
  const addToTeam = () => {
    if (!selectedTeam || !selectedParticipantId) return;
    const part = unassigned.find((u) => String(u.id) === selectedParticipantId);
    if (!part) return;
    setUnassigned((prev) => prev.filter((u) => String(u.id) !== selectedParticipantId));
    setTeams((prev) => prev.map((t) => (t.id === selectedTeam.id ? { ...t, members: [...t.members, { ...part, teamName: t.name }] } : t)));
    setShowAddModal(false);
  };

  const removeFromTeam = (teamId: Team['id'], memberId: Participant['id']) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    const member = team.members.find((m) => m.id === memberId);
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, members: t.members.filter((m) => m.id !== memberId) } : t)));
    if (member) setUnassigned((prev) => [...prev, { ...member, teamName: '' }]);
  };

  const openEdit = (team: Team) => { setSelectedTeam(team); setEditTeamName(team.name); setShowEditModal(true); };
  const saveEdit = () => {
    if (!selectedTeam || !editTeamName.trim()) return;
    const newName = editTeamName.trim();
    setTeams((prev) =>
      prev.map((t) => (t.id !== selectedTeam.id ? t : { ...t, name: newName, members: t.members.map((m) => ({ ...m, teamName: newName })) }))
    );
    setShowEditModal(false);
  };

  const deleteTeam = (teamId: Team['id']) => {
    const team = teams.find((t) => t.id === teamId);
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (team) setUnassigned((prev) => [...prev, ...team.members.map((m) => ({ ...m, teamName: '' }))]);
  };

  const createTeam = () => {
    const name = newTeamName.trim();
    if (!name || teams.some((t) => t.name === name)) return;
    const id = `t-${Date.now()}`;
    setTeams((prev) => [...prev, { id, name, members: [] }]);
    setNewTeamName('');
    setShowCreateModal(false);
  };

  const deleteAllTeams = () => {
    if (!window.confirm('Delete all teams? This returns all members to the unassigned list.')) return;
    const everyone = teams.flatMap((t) => t.members);
    setUnassigned((prev) => [...prev, ...everyone.map((m) => ({ ...m, teamName: '' }))]);
    setTeams([]);
  };

  const importTeamsClick = () => fileInputRef.current?.click();
  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const newTeams: Team[] = Array.isArray(data?.teams) ? data.teams : teams;
        const newUnassigned: Participant[] = Array.isArray(data?.unassigned) ? data.unassigned : unassigned;
        const assigned = new Set(newTeams.flatMap((t) => t.members.map((m) => String(m.id))));
        setTeams(newTeams);
        setUnassigned(newUnassigned.filter((u) => !assigned.has(String(u.id))));
      } catch { alert('Invalid JSON file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportTeams = () => {
    const payload = { teams, unassigned };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `teams-export-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const bequeathAll = () => { alert(`Bequeathing ${teams.length} team(s) to "${bequeathTarget || '(choose target)'}"`); setShowBequeathModal(false); };

  const studentsWithoutTeams = useMemo(() => unassigned, [unassigned]);

  return (
    <Container fluid className="px-md-4">
      <Row className="mt-3 align-items-center">
        <Col className="text-start">
          <h1 style={headingStyle}>{`Teams for ${ctxName}`}</h1>
        </Col>
        <Col xs="auto" className="ms-auto d-flex align-items-center" style={{ paddingTop: 6 }}>
          <Form.Check type="switch" id="toggle-names" label={showUsernames ? 'Showing: Usernames' : 'Showing: Names'} checked={!showUsernames} onChange={() => setShowUsernames((prev) => !prev)} />
        </Col>
      </Row>

      {/* Toolbar */}
      <Row style={toolbarRowStyle}>
        <Col className="text-start">
          <Button variant="link" className={toolbarLinkCls} onClick={() => setShowCreateModal(true)}>Create Team</Button>
          <span className="text-muted mx-2">|</span>
          <Button variant="link" className={toolbarLinkCls} onClick={importTeamsClick}>Import Teams</Button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={onImportFile} hidden />
          <span className="text-muted mx-2">|</span>
          <Button variant="link" className={toolbarLinkCls} onClick={exportTeams}>Export Teams</Button>
          <span className="text-muted mx-2">|</span>
          <Button variant="link" className={toolbarLinkCls} onClick={deleteAllTeams}>Delete All Teams</Button>
          <span className="text-muted mx-2">|</span>
          <Button variant="link" className={toolbarLinkCls} onClick={() => setShowBequeathModal(true)}>Bequeath All Teams</Button>
          <span className="text-muted mx-2">|</span>
          <Button variant="link" className={toolbarLinkCls} onClick={() => navigate(-1)}>Back</Button>
        </Col>
      </Row>

      {/* Unified outer wrapper for BOTH tabs */}
      <div
        style={{
          border: '2px solid #9aa0a6',
          borderRadius: 12,
          padding: '8px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginTop: '12px',
          marginBottom: '20px',
        }}
      >
        <Tabs defaultActiveKey="teams" className="mb-3">
          <Tab eventKey="teams" title="Teams">
            <div style={frame}>
              <div style={headerBar}>
                <div style={{ width: 40 }} />
                <div className="flex-grow-1">Details</div>
                <div style={{ width: 120, textAlign: 'center' }}>Actions</div>
              </div>

              {teams.map((team) => {
                const open = !!expanded[team.id];
                return (
                  <div key={team.id}>
                    <div style={teamRowStyle}>
                      <div style={{ width: 40 }}>
                        <button style={caretBtn} onClick={() => toggleTeam(team.id)}>{open ? '▾' : '▸'}</button>
                      </div>
                      <div className="flex-grow-1">
                        <strong>{baseTeamName(team.name)}</strong>
                        {team.mentor && (
                          <span className="ms-2">: {displayOf(team.mentor)} <span style={{ opacity: 0.9 }}>(Mentor)</span></span>
                        )}
                      </div>
                      <div style={actionCell}>
                        <Button variant="link" className="p-0 me-3" title="Add member" onClick={() => openAdd(team)}><BsPlus style={{ color: '#2e8b57', fontSize: 18 }} /></Button>
                        <Button variant="link" className="p-0 me-3" title="Delete team" onClick={() => deleteTeam(team.id)}><BsX style={{ color: '#c53030', fontSize: 18 }} /></Button>
                        <Button variant="link" className="p-0" title="Edit team name" onClick={() => openEdit(team)}><BsPencil style={{ color: '#6c757d', fontSize: 16 }} /></Button>
                      </div>
                    </div>

                    {open && (
                      <div style={membersRowStyle}>
                        {team.members.length === 0 ? (
                          <span style={{ color: '#6b7280' }}>No students yet.</span>
                        ) : (
                          team.members.map((m) => (
                            <span key={`${team.id}-${m.id}`} style={chip}>
                              {displayOf(m)}
                              <button style={chipRemoveBtn} title="Remove" aria-label={`Remove ${displayOf(m)} from ${team.name}`} onClick={() => removeFromTeam(team.id, m.id)}>
                                <BsX style={{ color: '#b91c1c' }} />
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
          </Tab>

          <Tab eventKey="students" title="Students without teams">
            <div style={frame}>
              <div style={headerBar}><div className="flex-grow-1">Student</div></div>
              <div style={{ padding: 16 }}>
                {studentsWithoutTeams.length === 0 ? (
                  <span style={{ color: '#6b7280' }}>All students are on a team.</span>
                ) : (
                  studentsWithoutTeams.map((u) => (
                    <span key={`un-${u.id}`} style={chip}>{displayOf(u)}</span>
                  ))
                )}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ADD MEMBER MODAL */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add member to {selectedTeam ? baseTeamName(selectedTeam.name) : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="addMemberSelect">
              <Form.Label>Select student</Form.Label>
              <Form.Select value={selectedParticipantId} onChange={(e) => setSelectedParticipantId(e.target.value)}>
                <option value="">Select…</option>
                {unassigned.map((u) => <option key={u.id} value={String(u.id)}>{displayOf(u)}</option>)}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={addToTeam}>Add</Button>
        </Modal.Footer>
      </Modal>

      {/* EDIT TEAM MODAL */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit team name</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editTeamName">
              <Form.Label>Team name</Form.Label>
              <Form.Control type="text" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={saveEdit}>Save</Button>
        </Modal.Footer>
      </Modal>

      {/* CREATE TEAM MODAL */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton><Modal.Title>Create new team</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="newTeamName">
              <Form.Label>Team name</Form.Label>
              <Form.Control type="text" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={createTeam}>Create</Button>
        </Modal.Footer>
      </Modal>

      {/* BEQUEATH MODAL (stub) */}
      <Modal show={showBequeathModal} onHide={() => setShowBequeathModal(false)}>
        <Modal.Header closeButton><Modal.Title>Bequeath All Teams</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="bequeathTarget">
              <Form.Label>Destination {ctxType === 'course' ? 'course' : 'assignment'}</Form.Label>
              <Form.Control type="text" placeholder="e.g., Assignment 12 / Course Section 003" value={bequeathTarget} onChange={(e) => setBequeathTarget(e.target.value)} />
              <Form.Text className="text-muted">(Stub) Wire this to your backend to copy teams.</Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBequeathModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={bequeathAll}>Bequeath</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateTeams;

