// src/pages/Assignments/ResponseMaps.tsx
import React, { useMemo, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";

type Id = number;
type ReviewStatus = "Not saved" | "Saved" | "Submitted";

interface Assignment { id: Id; name: string }
interface Team { id: Id; name: string; parent_id: Id; mentor_id?: Id | null }
interface User { id: Id; name: string | null; full_name: string | null }
interface TeamUser { team_id: Id; user_id: Id }
interface Participant { id: Id; user_id: Id; parent_id: Id; team_id?: Id | null }
interface ResponseMapRow {
  id: Id; reviewer_id: Id; reviewee_id: Id; reviewed_object_id: Id;
  reviewee_team_id?: Id | null; reviewer_user_id?: Id | null;
}
interface ResponseRow {
  id: Id; map_id: Id; is_submitted: boolean | 0 | 1; created_at?: string | null; updated_at?: string | null;
}

interface IUserView { id: Id; username: string; fullName: string }
interface IReviewerAssignment { id: Id; reviewer: IUserView; status: ReviewStatus }
interface ITeamRow { id: Id; name: string; mentor?: IUserView; members: IUserView[]; reviewers: IReviewerAssignment[] }

type Persist = {
  assignment: Assignment;
  teams: Team[];
  users: User[];
  teams_users: TeamUser[];
  participants: Participant[];
  response_maps: ResponseMapRow[];
  responses: ResponseRow[];
  nextMapId: number;
  nextResponseId: number;
  nextParticipantId: number;
};

const nowIso = () => new Date().toISOString();

function parseAssignmentId(location: ReturnType<typeof useLocation>, params: Readonly<Record<string, string | undefined>>): Id | undefined {
  const fromParam = params?.id ? Number(params.id) : undefined;
  if (Number.isFinite(fromParam)) return fromParam as number;
  const m =
    location.pathname.match(/assignments\/(?:edit|view|show)\/(\d+)\/assignreviewer/i) ||
    location.pathname.match(/assignments\/(\d+)\/assignreviewer/i);
  if (m) return Number(m[1]);
  const q = new URLSearchParams(location.search).get("assignment_id");
  return q ? Number(q) : undefined;
}

function keyFor(asgId: Id) { return `assignreviewer:${asgId}`; }
function read(asgId: Id): Persist | null {
  try { const s = localStorage.getItem(keyFor(asgId)); return s ? (JSON.parse(s) as Persist) : null; } catch { return null; }
}
function write(asgId: Id, p: Persist) { localStorage.setItem(keyFor(asgId), JSON.stringify(p)); }

function toView(u?: User | null, fallbackId?: Id): IUserView | undefined {
  if (u) return { id: u.id, username: u.name ?? `user_${u.id}`, fullName: u.full_name ?? u.name ?? `user_${u.id}` };
  if (fallbackId !== undefined) return { id: fallbackId, username: `user_${fallbackId}`, fullName: `user_${fallbackId}` };
  return undefined;
}

function isArr<T>(x: any): x is T[] { return Array.isArray(x); }

function normalizePersist(asgId: Id, raw: any): Persist {
  const safe: Persist = {
    assignment: raw?.assignment && typeof raw.assignment === "object"
      ? { id: Number(raw.assignment.id) || asgId, name: String(raw.assignment.name ?? ASG_NAME?.[asgId] ?? `Assignment ${asgId}`) }
      : { id: asgId, name: ASG_NAME?.[asgId] ?? `Assignment ${asgId}` },

    teams:            isArr<Team>(raw?.teams) ? raw.teams : [],
    users:            isArr<User>(raw?.users) ? raw.users : [],
    teams_users:      isArr<TeamUser>(raw?.teams_users) ? raw.teams_users : [],
    participants:     isArr<Participant>(raw?.participants) ? raw.participants : [],
    response_maps:    isArr<ResponseMapRow>(raw?.response_maps) ? raw.response_maps : [],
    responses:        isArr<ResponseRow>(raw?.responses) ? raw.responses : [],

    nextMapId:         Number.isFinite(raw?.nextMapId) ? Number(raw.nextMapId) : 1,
    nextResponseId:    Number.isFinite(raw?.nextResponseId) ? Number(raw.nextResponseId) : 1,
    nextParticipantId: Number.isFinite(raw?.nextParticipantId) ? Number(raw.nextParticipantId) : 1,
  };
  return safe;
}

const ASG_NAME: Record<number, string> = {
  1: "google",
  2: "heal",
  3: "signify",
  4: "tee",
  5: "open",
  6: "donate",
  7: "blossom",
  8: "seize",
};

function makeEmpty(asgId: Id): Persist {
  return {
    assignment: { id: asgId, name: ASG_NAME[asgId] ?? `Assignment ${asgId}` },
    teams: [],
    users: [],
    teams_users: [],
    participants: [],
    response_maps: [],
    responses: [],
    nextMapId: 1,
    nextResponseId: 1,
    nextParticipantId: 1,
  };
}

/* Demo data: 4 teams per assignment id with varied reviewer counts (1, 2, 3, 0) */
function demo(asgId: Id): Persist {
  let uid = 1000, pid = 2000, mid = 3000, rid = 4000;

  // Derive 4 team IDs from the assignment id so they look consistent with your DB examples
  const teamIds = [asgId, asgId + 8, asgId + 12, asgId + 16];

  // Create mentors
  const mentors = [
    { id: uid++, name: `mentor_${asgId}_1`, full_name: `Mentor ${asgId}-1` },
    { id: uid++, name: `mentor_${asgId}_2`, full_name: `Mentor ${asgId}-2` },
    { id: uid++, name: `mentor_${asgId}_3`, full_name: `Mentor ${asgId}-3` },
    { id: uid++, name: `mentor_${asgId}_4`, full_name: `Mentor ${asgId}-4` },
  ] as User[];

  // 3 members per team (12 total)
  const memberUsers: User[] = [];
  for (let i = 0; i < 12; i++) {
    memberUsers.push({
      id: uid++,
      name: `user_${asgId}_${i + 1}`,
      full_name: `User ${asgId}-${i + 1}`,
    });
  }

  const users: User[] = [...mentors, ...memberUsers];

  // Teams
  const teams: Team[] = teamIds.map((tid, i) => ({
    id: tid,
    name: `Team ${tid}`,
    parent_id: asgId,
    mentor_id: mentors[i]?.id ?? null,
  }));

  // Team membership: 3 members per team
  const teams_users: TeamUser[] = [];
  for (let t = 0; t < 4; t++) {
    const base = t * 3;
    const team_id = teamIds[t];
    teams_users.push({ team_id, user_id: memberUsers[base + 0].id });
    teams_users.push({ team_id, user_id: memberUsers[base + 1].id });
    teams_users.push({ team_id, user_id: memberUsers[base + 2].id });
  }

  // Participants for all users; place each member into their team; mentors aren’t placed on teams (null)
  const participants: Participant[] = users.map((u) => {
    const tu = teams_users.find((x) => x.user_id === u.id);
    return {
      id: pid++,
      user_id: u.id,
      parent_id: asgId,
      team_id: tu ? tu.team_id : null,
    };
  });

  const pByUser = new Map(participants.map((p) => [p.user_id, p]));
  const part = (u: User) => pByUser.get(u.id)!.id;

  // REVIEWER SETUP (varied counts):
  // - TeamIds[0] -> 1 reviewer (Saved)
  // - TeamIds[1] -> 2 reviewers (one Not saved, one Submitted)
  // - TeamIds[2] -> 3 reviewers (Saved, Submitted, Not saved)
  // - TeamIds[3] -> 0 reviewers
  //
  // We pick reviewers from other teams to simulate cross-team reviews.
  const [tA, tB, tC, tD] = teamIds;

  const membersOf = (tid: number) =>
    teams_users.filter((tu) => tu.team_id === tid).map((tu) => users.find((u) => u.id === tu.user_id)!) as User[];

  const tA_members = membersOf(tA);
  const tB_members = membersOf(tB);
  const tC_members = membersOf(tC);
  const tD_members = membersOf(tD);

  const response_maps: ResponseMapRow[] = [];

  // Team A (1 reviewer) — reviewer from Team B
  if (tB_members[0]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tB_members[0]),
      reviewer_user_id: tB_members[0].id,
      reviewee_id: tA,
      reviewee_team_id: tA,
    });
  }

  // Team B (2 reviewers) — reviewers from Team A
  if (tA_members[0]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tA_members[0]),
      reviewer_user_id: tA_members[0].id,
      reviewee_id: tB,
      reviewee_team_id: tB,
    });
  }
  if (tA_members[1]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tA_members[1]),
      reviewer_user_id: tA_members[1].id,
      reviewee_id: tB,
      reviewee_team_id: tB,
    });
  }

  // Team C (3 reviewers) — reviewers from Team D
  if (tD_members[0]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tD_members[0]),
      reviewer_user_id: tD_members[0].id,
      reviewee_id: tC,
      reviewee_team_id: tC,
    });
  }
  if (tD_members[1]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tD_members[1]),
      reviewer_user_id: tD_members[1].id,
      reviewee_id: tC,
      reviewee_team_id: tC,
    });
  }
  if (tD_members[2]) {
    response_maps.push({
      id: mid++,
      reviewed_object_id: asgId,
      reviewer_id: part(tD_members[2]),
      reviewer_user_id: tD_members[2].id,
      reviewee_id: tC,
      reviewee_team_id: tC,
    });
  }

  // Team D (0 reviewers) — none

  // Responses:
  // - Team A: the single reviewer -> Saved
  // - Team B: first reviewer -> Not saved (no response), second -> Submitted
  // - Team C: first -> Saved, second -> Submitted, third -> Not saved (no response)
  const t0 = nowIso();
  const responses: ResponseRow[] = [];
  // Team A saved
  if (response_maps[0]) {
    responses.push({ id: rid++, map_id: response_maps[0].id, is_submitted: 0, created_at: t0, updated_at: t0 });
  }
  // Team B submitted (second reviewer)
  if (response_maps[2]) {
    responses.push({ id: rid++, map_id: response_maps[2].id, is_submitted: 1, created_at: t0, updated_at: t0 });
  }
  // Team C saved (first), submitted (second)
  const teamCMaps = response_maps.filter((m) => m.reviewee_team_id === tC);
  if (teamCMaps[0]) responses.push({ id: rid++, map_id: teamCMaps[0].id, is_submitted: 0, created_at: t0, updated_at: t0 });
  if (teamCMaps[1]) responses.push({ id: rid++, map_id: teamCMaps[1].id, is_submitted: 1, created_at: t0, updated_at: t0 });

  return {
    assignment: { id: asgId, name: ASG_NAME[asgId] ?? `Assignment ${asgId}` },
    teams,
    users,
    teams_users,
    participants,
    response_maps,
    responses,
    nextMapId: mid,
    nextResponseId: rid,
    nextParticipantId: pid,
  };
}


const ResponseMaps: React.FC = () => {
  const location = useLocation();
  const params = useParams();
  const maybeId = parseAssignmentId(location, params);

  // Hooks must be unconditionally called:
  const [tick, setTick] = useState(0);
  const [showNames, setShowNames] = useState(true);

  // Use a definite id for calculations; if no id yet, use 0 and avoid LS writes.
  const assignmentId: Id = (maybeId ?? 0) as Id;
  const hasValidId = Number.isFinite(maybeId);

  const bump = () => setTick(v => v + 1);

  // Read persisted data or a transient empty shell when id is missing.
  const persisted: Persist = hasValidId
    ? normalizePersist(assignmentId, read(assignmentId) ?? (() => {
      const empty = makeEmpty(assignmentId);
      write(assignmentId, empty);
      return empty;
    })())
    : makeEmpty(assignmentId);

  const { assignment, teams, users, teams_users, participants, response_maps, responses } = persisted;

  const fmt = (u?: IUserView) => (!u ? "" : showNames ? u.fullName : u.username);

  const usersById = useMemo(() => new Map<Id, User>(users.map(u => [u.id, u])), [users, tick]);
  const teamsById = useMemo(() => new Map<Id, Team>(teams.map(t => [t.id, t])), [teams, tick]);
  const participantsById = useMemo(() => new Map<Id, Participant>(participants.map(p => [p.id, p])), [participants, tick]);

  const teamMembersByTeam = useMemo(() => {
    const m = new Map<Id, Id[]>();
    teams_users.forEach(tu => m.set(tu.team_id, [...(m.get(tu.team_id) ?? []), tu.user_id]));
    return m;
  }, [teams_users, tick]);

  const latestResponseByMap = useMemo(() => {
    const latest = new Map<Id, ResponseRow>();
    responses.forEach(r => {
      const ts = new Date((r.updated_at ?? r.created_at ?? "") as string).getTime() || 0;
      const prev = latest.get(r.map_id);
      const prevTs = prev ? (new Date((prev.updated_at ?? prev.created_at ?? "") as string).getTime() || 0) : -1;
      if (!prev || ts > prevTs) latest.set(r.map_id, r);
    });
    return latest;
  }, [responses, tick]);

  const getRevieweeTeamId = (rm: ResponseMapRow): Id | undefined => {
    if (rm.reviewee_team_id) return rm.reviewee_team_id;
    if (teamsById.has(rm.reviewee_id)) return rm.reviewee_id;
    const pr = participantsById.get(rm.reviewee_id);
    return pr?.team_id ?? undefined;
  };
  const getReviewerUserId = (rm: ResponseMapRow): Id | undefined => {
    if (rm.reviewer_user_id) return rm.reviewer_user_id;
    const pr = participantsById.get(rm.reviewer_id);
    return pr?.user_id ?? undefined;
  };
  const statusForMap = (mapId: Id): ReviewStatus => {
    const latest = latestResponseByMap.get(mapId);
    if (!latest) return "Not saved";
    const submitted = typeof latest.is_submitted === "boolean" ? latest.is_submitted : latest.is_submitted === 1;
    return submitted ? "Submitted" : "Saved";
  };

  const rows: ITeamRow[] = useMemo(() => {
    const mapsByTeam = new Map<Id, ResponseMapRow[]>();
    response_maps.forEach(rm => {
      if (rm.reviewed_object_id !== assignmentId) return;
      const teamId = getRevieweeTeamId(rm);
      if (!teamId) return;
      mapsByTeam.set(teamId, [...(mapsByTeam.get(teamId) ?? []), rm]);
    });

    const teamIds = teams.filter(t => t.parent_id === assignmentId).map(t => t.id);
    return teamIds.map<ITeamRow>((teamId) => {
      const t = teamsById.get(teamId);
      const mentor = t?.mentor_id ? toView(usersById.get(t.mentor_id) ?? null, t.mentor_id) : undefined;

      const members = (teamMembersByTeam.get(teamId) ?? [])
        .map(uid => toView(usersById.get(uid) ?? null, uid))
        .filter((u): u is IUserView => !!u);

      const reviewers: IReviewerAssignment[] = (mapsByTeam.get(teamId) ?? [])
        .map(rm => {
          const reviewerUid = getReviewerUserId(rm);
          const rv = toView(reviewerUid ? usersById.get(reviewerUid) ?? null : null, reviewerUid);
          if (!rv) return undefined as any;
          return { id: rm.id, reviewer: rv, status: statusForMap(rm.id) };
        })
        .filter(Boolean) as IReviewerAssignment[];

      return { id: teamId, name: t?.name ?? `Team #${teamId}`, mentor, members, reviewers };
    });
  }, [assignmentId, teams, usersById, teamsById, teamMembersByTeam, response_maps, latestResponseByMap, participantsById, tick]);

  function mutate(fn: (p: Persist) => void) {
    if (!hasValidId) return; // don't write without a real id
    const cur = read(assignmentId) ?? makeEmpty(assignmentId);
    fn(cur);
    write(assignmentId, cur);
    setTimeout(() => setTick(v => v + 1), 0);
  }

  function onAddReviewer(teamId: number) {
    if (!hasValidId) return;
    const raw = window.prompt("Enter reviewer user_id to add for this team:");
    if (!raw) return;
    const reviewerUserId = Number(raw);
    if (!Number.isFinite(reviewerUserId)) { window.alert("Invalid user_id."); return; }

    mutate(p => {
      let reviewerPart = p.participants.find(x => x.user_id === reviewerUserId && x.parent_id === assignmentId);
      if (!reviewerPart) {
        const newPart: Participant = { id: p.nextParticipantId++, user_id: reviewerUserId, parent_id: assignmentId, team_id: null };
        p.participants.push(newPart);
        reviewerPart = newPart;
        if (!p.users.find(u => u.id === reviewerUserId)) {
          p.users.push({ id: reviewerUserId, name: `user_${reviewerUserId}`, full_name: `user_${reviewerUserId}` });
        }
      }
      p.response_maps.push({
        id: p.nextMapId++,
        reviewed_object_id: assignmentId,
        reviewer_id: reviewerPart.id,
        reviewer_user_id: reviewerUserId,
        reviewee_id: teamId,
        reviewee_team_id: teamId,
      });
    });
  }

  function onDeleteReviewer(_teamId: number, mappingId: number) {
    if (!hasValidId) return;
    mutate(p => {
      p.response_maps = p.response_maps.filter(m => m.id !== mappingId);
      p.responses = p.responses.filter(r => r.map_id !== mappingId);
    });
  }

  function onUnsubmit(_teamId: number, mappingId: number) {
    if (!hasValidId) return;
    mutate(p => {
      p.responses.push({ id: p.nextResponseId++, map_id: mappingId, is_submitted: 0, created_at: nowIso(), updated_at: nowIso() });
    });
  }

  function onDeleteAll(teamId: number) {
    if (!hasValidId) return;
    mutate(p => {
      const ids = new Set<Id>(
        p.response_maps
          .filter(m => m.reviewed_object_id === assignmentId && (m.reviewee_team_id === teamId || m.reviewee_id === teamId))
          .map(m => m.id)
      );
      p.response_maps = p.response_maps.filter(m => !ids.has(m.id));
      p.responses = p.responses.filter(r => !ids.has(r.map_id));
    });
  }

  const empty = teams.length === 0 && users.length === 0 && participants.length === 0 && response_maps.length === 0;

  return (
    <Container fluid className="px-3" style={{ fontFamily: "verdana,arial,helvetica,sans-serif" }}>
      <div className="ex-shell">
        <div className="flash_note alert alert-info mb-3" style={{ color: "#333" }}>
          Assign Reviewer: {(hasValidId ? assignment?.name : "Assignment")} {hasValidId ? `(ID: ${assignmentId})` : "(ID: unknown)"} ·
          {" "}Teams:{teams.length} · Maps:{response_maps.length} · Responses:{responses.length}
        </div>

        {!hasValidId && (
          <div className="flash_note alert alert-danger mb-3">
            Missing assignment id in URL. Actions are disabled.
          </div>
        )}

        <Row className="align-items-center mb-2 g-2">
          <Col xs={12} md className="min-w-0">
            <h2 className="m-0 text-truncate" style={{ color: "#333", lineHeight: "32px" }}>
              Assign Reviewer: {(hasValidId ? assignment?.name : "Assignment")} {hasValidId ? `(ID: ${assignmentId})` : ""}
            </h2>
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-3 flex-shrink-0">
            <Form.Check
              type="switch"
              id="toggle-names"
              label={showNames ? "Showing names" : "Showing usernames"}
              checked={showNames}
              onChange={() => setShowNames(v => !v)}
            />

            <Button
              variant="outline-secondary"
              disabled={!hasValidId ? true : false}
              onClick={() => {
                if (!hasValidId) return;
                if (!empty) { window.alert("Data exists. Clear first to load demo."); return; }
                write(assignmentId, demo(assignmentId));
                setTick(v => v + 1);
              }}
            >
              Load demo data
            </Button>

            <Button
              variant="danger"
              disabled={!hasValidId}
              onClick={() => {
                if (!hasValidId) return;
                if (window.confirm(`Clear local data for ${keyFor(assignmentId)}?`)) {
                  write(assignmentId, makeEmpty(assignmentId));
                  setTick(v => v + 1);
                }
              }}
            >
              Clear local data
            </Button>
          </Col>
        </Row>

        <div className="ex-table-wrap">
          <table className="table table-striped table-sm align-middle ex-table">
            <thead>
            <tr>
              <th style={{ width: "42%" }}>Contributor</th>
              <th>Reviewed by</th>
            </tr>
            </thead>

            <tbody style={{ fontSize: "15px", lineHeight: "1.428em", color: "#333" }}>
            {rows.length === 0 && (
              <tr>
                <td className="ex-cell" colSpan={2}>
                <span className="text-muted">
                  No reviewer data to display. Use “Load demo data” or add reviewers after you add teams/users locally.
                </span>
                </td>
              </tr>
            )}

            {rows.map(team => (
              <tr key={team.id}>
                <td className="ex-cell">
                  <div className="ex-team">{team.name}</div>

                  {team.mentor && (
                    <div className="ex-line">
                      <span className="text-muted">Mentor:&nbsp;</span>
                      {fmt(team.mentor)} <span className="text-muted">(Mentor)</span>
                    </div>
                  )}

                  <div className="ex-line">
                    <span className="text-muted">Members:&nbsp;</span>
                    {team.members.length === 0
                      ? <span className="text-muted">none</span>
                      : team.members.map((m, i) => <span key={m.id}>{fmt(m)}{i < team.members.length - 1 ? ", " : ""}</span>)
                    }
                  </div>

                  <div className="ex-actions">
                    <a role="button" className="ex-link" onClick={() => hasValidId && onAddReviewer(team.id)}>Add reviewer</a>
                    <a role="button" className="ex-link" onClick={() => hasValidId && onDeleteAll(team.id)}>Delete outstanding reviewers</a>
                  </div>
                </td>

                <td className="ex-cell">
                  {team.reviewers.length === 0 && <span className="text-muted">—</span>}

                  {team.reviewers.map(r => (
                    <div key={r.id} className="ex-review-row">
                      <span className="ex-reviewer">{fmt(r.reviewer)}</span>
                      <span className="text-muted">&nbsp;Review status:&nbsp;</span>
                      <strong>{r.status}</strong>
                      {r.status === "Submitted" && (
                        <a role="button" className="ex-inline-link" onClick={() => hasValidId && onUnsubmit(team.id, r.id)}>(Unsubmit)</a>
                      )}
                      <a role="button" className="ex-inline-link" onClick={() => hasValidId && onDeleteReviewer(team.id, r.id)}>Delete</a>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
    .ex-shell {
      max-width: 1100px;
      margin: 24px auto;
      clear: both;
      display: flex;
      flex-direction: column;
      align-items: center;   /* centers everything horizontally */
    }
    .flash_note { margin: 0 0 16px 0; }

    .ex-table-wrap {
      display: inline-block;   /* shrink to fit content */
      max-width: 100%;
      overflow: auto;
      border-radius: 4px;
      margin: 16px auto;       /* add spacing and keep it centered */
    }
    .ex-table{ width:auto; table-layout:auto; margin: auto;}

    .ex-cell{ padding:12px 14px; vertical-align:top; }
    .ex-team{ font-weight:600; margin-bottom:2px; }
    .ex-line{ margin-top:2px; }
    .ex-actions{ margin-top:8px; }

    .ex-link, .ex-inline-link{
      font-size:0.95rem; color:#7a2c2c; text-decoration:none; cursor:pointer;
      margin-right:18px;
    }
    .ex-inline-link{ margin-left:8px; }
    .ex-link:hover, .ex-inline-link:hover{ text-decoration:underline; }

    .ex-review-row{ padding:2px 0; }
    .ex-reviewer{ font-weight:600; }

    body, .ex-shell { color:#333; }
    td, th { font-size:15px; line-height:1.428em; }

    @media (max-width:768px){
      .ex-cell{ font-size:0.95rem; }
    }
  `}</style>
    </Container>
  );
};

export default ResponseMaps;
