import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Modal, Button } from "react-bootstrap";
import Table from "../../components/Table/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import useAPI from "../../hooks/useAPI";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import Select from "../../components/Select";
import styles from "./ProjectTopics.module.css";
import { mockdata } from "./testData.js";

enum ROLE {
  SUPER_ADMIN = "Super Administrator",
  ADMIN = "Administrator",
  INSTRUCTOR = "Instructor",
  TA = "Teaching Assistant",
  STUDENT = "Student",
}

interface TopicSettings {
  allow_suggestions: boolean;
  enable_bidding: boolean;
  can_review_same_topic: boolean;
  can_choose_topic_to_review: boolean;
  allow_bookmarks: boolean;
  allow_bidding_for_reviewers: boolean;
}

interface AssignedTeam {
  id: number;
  topic_id: number;
  team_id: number;
  is_waitlisted: boolean;
  preference_priority_number: number;
  team_members: string[];
  status: boolean;
}

interface Topic {
  id: number;
  topic_identifier: string;
  topic_name: string;
  description: string;
  max_choosers: number;
  category: string;
  private_to: number | null;
  micropayment: number;
  available_slots: number;
  waitlist_count: number;
  link: string;
  assignment_id: number;
  assigned_teams: AssignedTeam[];
}

interface Assignment {
  id: number;
  name: string;
  settings: TopicSettings;
  topics: Topic[];
}

const ProjectTopics: React.FC = () => {
  const dispatch = useDispatch();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userTopics, setUserTopics] = useState<Topic[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showYourTopics, setShowYourTopics] = useState(false);

  const auth = useSelector((state: RootState) => state.authentication);
  const userRole = auth.user?.role || "";
  const username = auth.user?.name || "";

  const isAdmin = userRole === ROLE.ADMIN || userRole === ROLE.SUPER_ADMIN;
  const isStudent = userRole === ROLE.STUDENT;
  const isInstructor = userRole === ROLE.INSTRUCTOR;
  const isAdminOrInstructor = isAdmin || isInstructor;

  // Mock assignments data
  const mockAssignments: Assignment[] = mockdata;

  // Transform assignments for form select
  const assignmentOptions = [
    { label: "Select an Assignment", value: "0" },
    ...mockAssignments.map((assignment) => ({
      label: assignment.name,
      value: assignment.id.toString(),
    })),
  ];

  useEffect(() => {
    if (selectedAssignment && isStudent) {
      const userAssignedTopics = selectedAssignment.topics.filter((topic) =>
        topic.assigned_teams.some((team) => team.team_members.includes(username))
      );
      setUserTopics(userAssignedTopics);
    }
  }, [selectedAssignment, username, isStudent]);

  let tableHeaders: string[] = [];
  if (isStudent) {
    tableHeaders = ["Topic ID", "Topic names(s)", "Available slots"];
  }
  if (isAdminOrInstructor) {
    tableHeaders = [
      "Topic ID",
      "Topic names(s)",
      "Available slots",
      "Num. of slots",
      "Num. on waitlist",
    ];
  }

  const handleAssignmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(
      alertActions.hideAlert()
    );
    const assignmentId = e.target.value;

    if (assignmentId === "0") {
      setSelectedAssignment(null);
      setTopics([]);
      return;
    }

    const assignment = mockAssignments.find((a) => a.id.toString() === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setTopics(assignment.topics);
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Loaded topics for ${assignment.name}`,
        })
      );
    }
  };

  // Role check modal
  const RoleCheckModal: React.FC = () => (
    <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Current User Role</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Current Role: {userRole}</p>
        <p>Is Admin: {isAdmin.toString()}</p>
        <p>Is Student: {isStudent.toString()}</p>
        <p>Is Instructor: {isInstructor.toString()}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
  const handleSelectYourTopics = () =>{
    setShowYourTopics(!showYourTopics)
  }
  // Admin settings section
  const AdminSettings: React.FC = () => {
    if (!isAdminOrInstructor) return null;

    return (
      <div className="mb-4">
        <h4>Topics for OSS project & documentation assignment</h4>
        <Form>
          <Form.Check
            type="checkbox"
            id="allow-suggestions"
            label="Allow topic suggestions from students?"
          />
          <Form.Check type="checkbox" id="enable-bidding" label="Enable bidding for topics?" />
          <Form.Check
            type="checkbox"
            id="can-review-same-topic"
            label="Enable authors to review others working on same topic?"
          />
          <Form.Check
            type="checkbox"
            id="can-choose-topic-to-review"
            label="Allow reviewer to choose which topic to review?"
          />
          <Form.Check
            type="checkbox"
            id="allow-bookmarks"
            label="Allow participants to create bookmarks?"
          />
          <Form.Check
            type="checkbox"
            id="allow-bidding-for-reviewers"
            label="Allow bidding for reviewers?"
          />
        </Form>
      </div>
    );
  };
  // Student's personal topics section
  let filteredTopics = topics
  if (showYourTopics){
    filteredTopics = userTopics
  }
  //main return starts here
  return (
    <div>
      <RoleCheckModal />
      <h1 className={styles.pageTitle}>{isAdminOrInstructor ? "Topics (Admin View)" : "Topics"}</h1>

      {isAdminOrInstructor && <AdminSettings />}
      <div className={styles.selectAssignment}>
        <label className={styles.selectAssignmentLabel}>Select Assignment</label>
        <select className={styles.selectAssigmentOption} onChange={handleAssignmentChange}>
          {assignmentOptions.map((assignment) => (
            <option value={assignment.value}>{assignment.label}</option>
          ))}
        </select>
      </div>

      {selectedAssignment && (
        <>
          <div className={styles.showYourTopics}>
            <input type="checkbox" className={styles.showYourTopicsCheckbox} onChange={handleSelectYourTopics}></input>
            <label className={styles.showYourTopicsLabel}>Show Your Topics</label>
          </div>
          <table className={styles.table}>
            <thead>
              {tableHeaders.map((column) => (
                <th className={styles.th}>{column}</th>
              ))}
            </thead>
            <tbody>
              {filteredTopics.map((topic) => (
                <tr className={styles.tr}>
                  <td className={styles.td}>{topic.topic_identifier}</td>
                  <td className={styles.td}>
                    {topic.topic_name}
                    {isAdminOrInstructor && (
                      <div className="topic-name-cell">
                        <div className="fw-bold">
                          {topic.assigned_teams.length > 0 && (
                            <span className="text-success ms-2">✓</span>
                          )}
                        </div>
                        {topic.assigned_teams.map((team: AssignedTeam, idx: number) => (
                          <div key={idx} className="team-members">
                            {team.team_members.join(", ")}
                            <span
                              className={`ms-1 ${team.status ? "text-success" : "text-danger"}`}
                            >
                              {team.status ? "✓" : "✗"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.td}>{topic.available_slots}</td>
                  {isAdminOrInstructor && (
                    <>
                      <td className={styles.td}>{topic.max_choosers}</td>
                      <td className={styles.td}>{topic.waitlist_count}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ProjectTopics;
