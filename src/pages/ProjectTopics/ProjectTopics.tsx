import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Modal, Button } from 'react-bootstrap';
import Table from "../../components/Table/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import useAPI from "../../hooks/useAPI";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "../../store/slices/alertSlice";
import Select from "../../components/Select";
import './ProjectTopics.css';

enum ROLE {
  SUPER_ADMIN = "Super Administrator",
  ADMIN = "Administrator",
  INSTRUCTOR = "Instructor",
  TA = "Teaching Assistant",
  STUDENT = "Student"
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
  
  const auth = useSelector((state: RootState) => state.authentication);
  const userRole = auth.user?.role || "";
  const username = auth.user?.name || "";
  
  const isAdmin = userRole === ROLE.ADMIN || userRole === ROLE.SUPER_ADMIN;
  const isStudent = userRole === ROLE.STUDENT;
  const isInstructor = userRole === ROLE.INSTRUCTOR;
  const isAdminOrInstructor = isAdmin || isInstructor;

  // Mock assignments data
  const mockAssignments: Assignment[] = [
    {
      id: 1,
      name: "OSS project & documentation",
      settings: {
        allow_suggestions: false,
        enable_bidding: false,
        can_review_same_topic: true,
        can_choose_topic_to_review: true,
        allow_bookmarks: false,
        allow_bidding_for_reviewers: false
      },
      topics: [
        {
          id: 1,
          topic_identifier: "E2400",
          topic_name: "Allow reviewers to bid on what to review",
          description: "Enable bidding functionality for reviewers",
          max_choosers: 1,
          category: "Enhancement",
          private_to: null,
          micropayment: 0,
          available_slots: 0,
          waitlist_count: 0,
          link: "",
          assignment_id: 1,
          assigned_teams: [{
            id: 1,
            topic_id: 1,
            team_id: 1,
            is_waitlisted: false,
            preference_priority_number: 1,
            team_members: ["admin admin","tester1","admin2"],
            status: true
          }]
        },
        {
          id: 2,
          topic_identifier: "E2401",
          topic_name: "Implementing and testing import & export controllers",
          description: "Import/Export functionality",
          max_choosers: 1,
          category: "Development",
          private_to: null,
          micropayment: 0,
          available_slots: 0,
          waitlist_count: 0,
          link: "",
          assignment_id: 1,
          assigned_teams: [{
            id: 2,
            topic_id: 2,
            team_id: 2,
            is_waitlisted: false,
            preference_priority_number: 1,
            team_members: ["user4","user3","user2"],
            status: true
          }]
        },
        {
          id: 3,
          topic_identifier: "E2402",
          topic_name: "User management and users table",
          description: "User management functionality",
          max_choosers: 1,
          category: "Development",
          private_to: null,
          micropayment: 0,
          available_slots: 1,
          waitlist_count: 0,
          link: "",
          assignment_id: 1,
          assigned_teams: [{
            id: 5,
            topic_id: 5,
            team_id: 5,
            is_waitlisted: false,
            preference_priority_number: 1,
            team_members: ["student3","student33","student333"],
            status: true
          }]
        },
        {
          id: 4,
          topic_identifier: "E2403",
          topic_name: "Mentor-meeting management",
          description: "Mentor meeting functionality",
          max_choosers: 1,
          category: "Development",
          private_to: null,
          micropayment: 0,
          available_slots: 0,
          waitlist_count: 1,
          link: "",
          assignment_id: 1,
          assigned_teams: [{
            id: 3,
            topic_id: 4,
            team_id: 3,
            is_waitlisted: false,
            preference_priority_number: 1,
            team_members: ["student1","student11","student111"],
            status: true
          }]
        },
        {
          id: 5,
          topic_identifier: "E2404",
          topic_name: "Refactor student_teams functionality",
          description: "Team management improvements",
          max_choosers: 2,
          category: "Enhancement",
          private_to: null,
          micropayment: 0,
          available_slots: 1,
          waitlist_count: 0,
          link: "",
          assignment_id: 1,
          assigned_teams: [{
            id: 4,
            topic_id: 5,
            team_id: 4,
            is_waitlisted: false,
            preference_priority_number: 1,
            team_members: ["student2","student22","student222"],
            status: true
          }]
        }
      ]
    }
  ];

  // Transform assignments for form select
  const assignmentOptions = [
    { label: "Select an Assignment", value: "0" },
    ...mockAssignments.map(assignment => ({
      label: assignment.name,
      value: assignment.id.toString()
    }))
  ];

  useEffect(() => {
    if (selectedAssignment && isStudent) {
      const userAssignedTopics = selectedAssignment.topics.filter(topic => 
        topic.assigned_teams.some(team => 
          team.team_members.includes(username)
        )
      );
      setUserTopics(userAssignedTopics);
    }
  }, [selectedAssignment, username, isStudent]);

  const columnHelper = createColumnHelper<Topic>();

  
  const columns = useMemo<ColumnDef<Topic, any>[]>(() => {
    if (isStudent) {
      return [
        columnHelper.accessor('topic_identifier', {
          header: 'Topic ID',
          cell: info => info.getValue()
        }),
        columnHelper.accessor('topic_name', {
          header: 'Topic name(s)',
          cell: info => info.getValue()
        }),
        columnHelper.accessor('available_slots', {
          header: 'Available slots',
          cell: info => info.getValue()
        })
      ];
    }
  
    if (isAdminOrInstructor) {
      return [
        columnHelper.accessor('topic_identifier', {
          header: 'Topic ID',
          cell: info => info.getValue()
        }),
        columnHelper.accessor('topic_name', {
          header: 'Topic name(s)',
          cell: info => (
            <div className="topic-name-cell">
              <div className="fw-bold">
                {info.getValue()}
                {info.row.original.assigned_teams.length > 0 && 
                  <span className="text-success ms-2">✓</span>}
              </div>
              {info.row.original.assigned_teams.map((team: AssignedTeam, idx: number) => (
                <div key={idx} className="team-members">
                  {team.team_members.join(', ')}
                  <span className={`ms-1 ${team.status ? 'text-success' : 'text-danger'}`}>
                    {team.status ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          )
        }),
        columnHelper.accessor('max_choosers', {
          header: 'Num. of slots',
          cell: info => info.getValue()
        }),
        columnHelper.accessor('available_slots', {
          header: 'Available slots',
          cell: info => info.getValue()
        }),
        columnHelper.accessor('waitlist_count', {
          header: 'Num. on waitlist',
          cell: info => info.getValue()
        })
      ];
    }
  
    return [];
  }, [isAdminOrInstructor, isStudent]);

  const handleAssignmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value;
    
    if (assignmentId === "0") {
      setSelectedAssignment(null);
      setTopics([]);
      return;
    }

    const assignment = mockAssignments.find(a => a.id.toString() === assignmentId);
    if (assignment) {
      setSelectedAssignment(assignment);
      setTopics(assignment.topics);
      dispatch(alertActions.showAlert({
        variant: "success",
        message: `Loaded topics for ${assignment.name}`
      }));
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
          <Form.Check
            type="checkbox"
            id="enable-bidding"
            label="Enable bidding for topics?"
          />
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
  const StudentTopics: React.FC = () => {
    if (!isStudent || userTopics.length === 0) return null;
  
    return (
      <div className="student-topics">
        <h4>Your topic(s)</h4>
        <Table
          data={userTopics}
          columns={columns}
          showGlobalFilter={false}
          showColumnFilter={false}
          showPagination={false}
          onSelectionChange={() => {}}
        />
      </div>
    );
  };
  return (
    <Container fluid className="px-md-4">
      <RoleCheckModal />
      
      <Row className="mt-md-2 mb-md-2">
        <Col>
          <h1>
            {isAdminOrInstructor 
              ? 'Editing Assignment: OSS project & documentation'
              : 'Signup sheet for OSS project & documentation assignment'}
          </h1>
        </Col>
        <hr />
      </Row>

      {isAdminOrInstructor && <AdminSettings />}

      {isStudent && <StudentTopics />}

      <Row className="mb-3">
        <Col md={12}>
          <Select
            id="assignment-select"
            options={assignmentOptions}
            input={{
              onChange: handleAssignmentChange,
              value: selectedAssignment?.id?.toString() || "0"
            }}
            label="Select Assignment"
          />
        </Col>
      </Row>

      {selectedAssignment && (
        <Row>
          <Col>
            <div className="table-responsive">
              <Table
                data={topics}
                columns={columns}
                showGlobalFilter={isAdminOrInstructor}
                showColumnFilter={false}
                onSelectionChange={() => {}}
              />
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ProjectTopics;