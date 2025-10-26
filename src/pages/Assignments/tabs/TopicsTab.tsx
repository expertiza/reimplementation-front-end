import React, { useState } from "react";
import { Col, Row, Form, Table as BootstrapTable, Button, Modal, FloatingLabel, Badge, Stack } from "react-bootstrap";
// Reverting to the standard import path for react-icons/bs
import { BsInfoCircle, BsCheck, BsX, BsBookmark, BsPencil, BsLink45Deg, BsPersonPlusFill, BsFillBookmarkPlusFill } from "react-icons/bs";

// --- Interface Modifications ---
// Assuming these interfaces are defined elsewhere and imported
// They are redefined here for clarity based on requirements

interface TeamMember {
  id: string; // User ID
  name: string; // User's full name
}

interface AssignedTeam {
  teamId: string;
  members: TeamMember[];
}

interface WaitlistedTeam {
  teamId: string;
  members: TeamMember[];
}

interface PartnerAd {
  text: string;
  // link?: string; // Optional: Link to a separate page if not using modal
}

interface BookmarkData {
  id: string;
  url: string;
  title: string;
}

// Updated TopicData interface
interface TopicData {
  id: string; // Topic ID
  name: string; // Topic Name
  url?: string; // Optional URL for the topic name
  description?: string; // Optional short description
  assignedTeams: AssignedTeam[]; // Teams/Students assigned to this topic
  waitlistedTeams: WaitlistedTeam[]; // Teams/Students waitlisted
  questionnaire: string; // Associated questionnaire name
  numSlots: number; // Total number of slots
  availableSlots: number; // Number of available slots
  // waitlist: number; // Redundant now, can derive from waitlistedTeams.length
  bookmarks: BookmarkData[]; // Array of bookmarks for this topic
  partnerAd?: PartnerAd; // Optional partner advertisement details
}

// Same as before
interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBookmarks: boolean;
  allowBiddingForReviewers: boolean;
}

interface TopicsTabProps {
  topicSettings: TopicSettings;
  topicsData: TopicData[]; // Ensure the data passed matches the updated TopicData interface
  onTopicSettingChange: (setting: string, value: boolean) => void;
  // Add handlers for actions like drop team, delete topic, edit topic, create bookmark etc.
  onDropTeam: (topicId: string, teamId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onEditTopic: (topicId: string) => void;
  onCreateBookmark: (topicId: string) => void; // Function to handle opening a create bookmark UI/modal
  // Handler for partner ad application submission
  onApplyPartnerAd: (topicId: string, applicationText: string) => void;
}

// --- Component Implementation ---

const TopicsTab = ({
  topicSettings,
  topicsData,
  onTopicSettingChange,
  onDropTeam,
  onDeleteTopic,
  onEditTopic,
  onCreateBookmark,
  onApplyPartnerAd,
}: TopicsTabProps) => {
  const [displayUserNames, setDisplayUserNames] = useState(false); // State for toggling user name/ID display
  const [showPartnerAdModal, setShowPartnerAdModal] = useState(false);
  const [selectedPartnerAdTopic, setSelectedPartnerAdTopic] = useState<TopicData | null>(null);
  const [partnerAdApplication, setPartnerAdApplication] = useState("");

  // --- Partner Ad Modal Handlers ---
  const handleShowPartnerAd = (topic: TopicData) => {
    setSelectedPartnerAdTopic(topic);
    setPartnerAdApplication(""); // Reset text area
    setShowPartnerAdModal(true);
  };

  const handleClosePartnerAd = () => {
    setShowPartnerAdModal(false);
    setSelectedPartnerAdTopic(null);
  };

  const handleSubmitPartnerAd = () => {
    if (selectedPartnerAdTopic) {
      onApplyPartnerAd(selectedPartnerAdTopic.id, partnerAdApplication);
      // Optional: Show success message or handle response
    }
    handleClosePartnerAd();
  };

  // --- Render Helper Functions ---
  const renderTeamMembers = (members: TeamMember[]) => {
    // Basic check for members array
    if (!Array.isArray(members)) {
        return '';
    }
    return members.map(member => (displayUserNames ? member.name : member.id)).join(', ');
  };

  return (
    <Row className="mt-4">
      <Col>
        <h4>Topics for OSS project & documentation assignment</h4>

        {/* Topic Settings */}
        <div className="mb-4">
          <Form>
              <Form.Check
                type="checkbox"
                id="allowTopicSuggestions"
                label="Allow topic suggestions from students?"
                checked={topicSettings.allowTopicSuggestions}
                onChange={(e) => onTopicSettingChange('allowTopicSuggestions', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="enableBidding"
                label="Enable bidding for topics?"
                checked={topicSettings.enableBidding}
                onChange={(e) => onTopicSettingChange('enableBidding', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="enableAuthorsReview"
                label="Enable authors to review others working on same topic?"
                checked={topicSettings.enableAuthorsReview}
                onChange={(e) => onTopicSettingChange('enableAuthorsReview', e.target.checked)}
              />
            
               <Form.Check
                type="checkbox"
                id="allowReviewerChoice"
                label="Allow reviewer to choose which topic to review?"
                checked={topicSettings.allowReviewerChoice}
                onChange={(e) => onTopicSettingChange('allowReviewerChoice', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="allowBookmarks"
                label="Allow participants to create bookmarks?"
                checked={topicSettings.allowBookmarks}
                onChange={(e) => onTopicSettingChange('allowBookmarks', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="allowBiddingForReviewers"
                label="Allow bidding for reviewers?"
                checked={topicSettings.allowBiddingForReviewers}
                onChange={(e) => onTopicSettingChange('allowBiddingForReviewers', e.target.checked)}
              />
          </Form>
        </div>

        {/* View Options */}
        <div className="mb-3 d-flex justify-content-between align-items-center">
           {/* Hide all teams link - Functionality TBD */}
           {/* <a href="#" className="text-decoration-none">Hide all teams</a> */}
           <div></div> {/* Placeholder for alignment */}
          <Form.Check
            type="switch"
            id="displayUserNamesToggle"
            label="Display User Names"
            checked={displayUserNames}
            onChange={(e) => setDisplayUserNames(e.target.checked)}
          />
        </div>


        {/* Topics Table */}
        <BootstrapTable striped bordered hover responsive> {/* Added responsive */}
          <thead>
            <tr>
              {/* Adjusted width for checkbox column */}
              <th style={{ width: '50px' }}>
                <Form.Check type="checkbox" aria-label="Select all topics" /> {/* Consider select all functionality */}
              </th>
              <th>Topic ID</th>
              {/* Topic Name column with max-width */}
              <th style={{ maxWidth: '400px', wordWrap: 'break-word' }}>Topic name(s)</th>
              <th>Questionnaire</th>
              <th>Num. slots</th>
              <th>Available slots</th>
              <th>Waitlist</th>
              <th>Bookmarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Ensure topicsData is not null or undefined before mapping */}
            {topicsData && topicsData.length > 0 ? (
                topicsData.map((topic) => (
                <tr key={topic.id}>
                    {/* Checkbox cell */}
                    <td>
                    <Form.Check type="checkbox" aria-label={`Select topic ${topic.id}`} />
                    </td>
                    {/* Topic ID */}
                    <td>{topic.id}</td>
                    {/* Topic Name, Description, Teams, Waitlist, Partner Ad */}
                    <td>
                    <div>
                        {/* Topic Name (as link if URL exists) */}
                        {topic.url ? (
                        <a href={topic.url} target="_blank" rel="noopener noreferrer">{topic.name} <BsLink45Deg/></a>
                        ) : (
                        <span>{topic.name}</span>
                        )}
                        {/* Topic Description */}
                        {topic.description && (
                        <div className="text-muted small mt-1">{topic.description}</div>
                        )}
                    </div>
                    {/* Assigned Teams */}
                    {topic.assignedTeams && topic.assignedTeams.map((team) => (
                        <div key={team.teamId} className="d-flex align-items-center mt-2">
                            <Badge bg="success" className="me-2">Assigned</Badge>
                            <span className="small">{renderTeamMembers(team.members)}</span>
                            {/* Drop Team Icon - Requires handler */}
                            <BsX
                            className="text-danger ms-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onDropTeam(topic.id, team.teamId)}
                            title={`Drop team ${team.teamId}`}
                            />
                        </div>
                        ))}
                        {/* Waitlisted Teams */}
                        {topic.waitlistedTeams && topic.waitlistedTeams.map((team) => (
                        <div key={team.teamId} className="d-flex align-items-center mt-1">
                            <Badge bg="warning" text="dark" className="me-2">Waitlisted</Badge>
                            <span className="small text-muted">{renderTeamMembers(team.members)}</span>
                            {/* Optional: Add icon/action for waitlisted teams if needed */}
                        </div>
                        ))}
                        {/* Partner Advertisement */}
                        {topic.partnerAd && (
                        <div className="mt-2">
                            <Button variant="outline-info" size="sm" onClick={() => handleShowPartnerAd(topic)}>
                            <BsPersonPlusFill className="me-1"/> Partner Ad
                            </Button>
                        </div>
                        )}
                    </td>
                    {/* Questionnaire */}
                    <td>
                    {/* This might need adjustment based on how questionnaires are handled (e.g., multiple rounds) */}
                    <div>Review Round 1:</div>
                    <Form.Select size="sm" defaultValue={topic.questionnaire} disabled> {/* Assuming display only */}
                        <option>{topic.questionnaire}</option>
                    </Form.Select>
                    </td>
                    {/* Slots */}
                    <td>{topic.numSlots}</td>
                    <td>{topic.availableSlots}</td>
                    {/* Waitlist count */}
                    <td>{topic.waitlistedTeams ? topic.waitlistedTeams.length : 0}</td>
                    {/* Bookmarks */}
                    <td>
                    <Stack gap={1} className="align-items-start">
                        {/* Display existing bookmarks */}
                        {topic.bookmarks && topic.bookmarks.length > 0 ? (
                        topic.bookmarks.map(bm => (
                            <a key={bm.id} href={bm.url} target="_blank" rel="noopener noreferrer" className="small text-truncate" title={bm.title}>
                            <BsBookmark className="me-1"/> {bm.title || bm.url}
                            </a>
                        ))
                        ) : (
                        <span className="text-muted small">None</span>
                        )}
                        {/* Create Bookmark Button */}
                        {topicSettings.allowBookmarks && (
                        <Button variant="outline-secondary" size="sm" className="mt-1" onClick={() => onCreateBookmark(topic.id)} title="Add Bookmark">
                            <BsFillBookmarkPlusFill />
                        </Button>
                        )}
                    </Stack>
                    </td>
                    {/* Actions */}
                    <td>
                    <div className="d-flex gap-2">
                        {/* Edit Icon */}
                        <BsPencil
                            className="text-primary"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onEditTopic(topic.id)}
                            title="Edit Topic"
                        />
                        {/* Delete Icon */}
                        <BsX
                            className="text-danger"
                            style={{ cursor: 'pointer', fontSize: '1.2rem' }} // Made slightly larger
                            onClick={() => onDeleteTopic(topic.id)}
                            title="Delete Topic"
                        />
                    </div>
                    </td>
                </tr>
                ))
            ) : (
                 /* Add row for empty state */
                <tr>
                    <td colSpan={9} className="text-center text-muted">No topics found.</td>
                </tr>
            )}
          </tbody>
        </BootstrapTable>

        {/* Action Buttons */}
        <div className="d-flex gap-2 mt-3 flex-wrap"> {/* Added flex-wrap */}
          <Button variant="primary" onClick={() => { /* Handle New topic */ }}>
            New topic
          </Button>
          <Button variant="secondary" onClick={() => { /* Handle Import topics */ }}>
            Import topics
          </Button>
          <Button variant="danger" onClick={() => { /* Handle Delete selected */ }}>
            Delete selected topics
          </Button>
          <Button variant="danger" onClick={() => { /* Handle Delete all */ }}>
            Delete all topics
          </Button>
          <Button variant="secondary" onClick={() => { /* Handle Back */ }}>
            Back
          </Button>
        </div>
      </Col>

       {/* Partner Advertisement Modal */}
       <Modal show={showPartnerAdModal} onHide={handleClosePartnerAd} centered>
        <Modal.Header closeButton>
          <Modal.Title>Partner Advertisement: {selectedPartnerAdTopic?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{selectedPartnerAdTopic?.partnerAd?.text}</p>
          <hr />
          <FloatingLabel controlId="partnerAdApplicationText" label="Why would you be a good partner?">
            <Form.Control
              as="textarea"
              placeholder="Enter your application text here"
              style={{ height: '100px' }}
              value={partnerAdApplication}
              onChange={(e) => setPartnerAdApplication(e.target.value)}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePartnerAd}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitPartnerAd} disabled={!partnerAdApplication.trim()}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default TopicsTab;

