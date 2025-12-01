import React, { useState } from "react";
import { Col, Row, Form, Button, Modal, FloatingLabel, Stack } from "react-bootstrap";
// Reverting to the standard import path for react-icons/bs
import { BsPersonPlusFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import TopicsTable from "pages/Assignments/components/TopicsTable";
import DeleteTopics from "../TopicDelete";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

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
  id: string; // topic_identifier for display/selection
  databaseId: number; // Database ID for API calls
  name: string; // Topic Name
  url?: string; // Optional URL for the topic name
  description?: string; // Optional short description
  category?: string; // Optional category
  assignedTeams: AssignedTeam[]; // Teams/Students assigned to this topic
  waitlistedTeams: WaitlistedTeam[]; // Teams/Students waitlisted
  questionnaire: string; // Associated questionnaire name
  numSlots: number; // Total number of slots
  availableSlots: number; // Number of available slots
  // waitlist: number; // Redundant now, can derive from waitlistedTeams.length
  bookmarks: BookmarkData[]; // Array of bookmarks for this topic
  partnerAd?: PartnerAd; // Optional partner advertisement details
  createdAt?: string;
  updatedAt?: string;
}

// Same as before
interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBookmarks: boolean;
  allowBiddingForReviewers: boolean;
  allowAdvertiseForPartners: boolean;
}

interface TopicsTabProps {
  assignmentName?: string;
  assignmentId: string;
  topicSettings: TopicSettings;
  topicsData: TopicData[]; // Ensure the data passed matches the updated TopicData interface
  topicsLoading?: boolean;
  topicsError?: string | null;
  onTopicSettingChange: (setting: string, value: boolean) => void;
  // Add handlers for actions like drop team, delete topic, edit topic, create bookmark etc.
  onDropTeam: (topicId: string, teamId: string) => void;
  onDeleteTopic: (topicId: string) => void;
  onEditTopic: (topicId: string, updatedData?: any) => void;
  onCreateTopic?: (topicData: any) => void;
  // Handler for partner ad application submission
  onApplyPartnerAd: (topicId: string, applicationText: string) => void;
  onTopicsChanged?: () => void;
}

// --- Component Implementation ---

const TopicsTab = ({
  assignmentName = "Assignment",
  assignmentId,
  topicSettings,
  topicsData,
  topicsLoading = false,
  topicsError = null,
  onTopicSettingChange,
  onDropTeam,
  onDeleteTopic,
  onEditTopic,
  onCreateTopic,
  onApplyPartnerAd,
  onTopicsChanged,
}: TopicsTabProps) => {
  const [showPartnerAdModal, setShowPartnerAdModal] = useState(false);
  const [selectedPartnerAdTopic, setSelectedPartnerAdTopic] = useState<TopicData | null>(null);
  const [partnerAdApplication, setPartnerAdApplication] = useState("");
  
  // New topic modal state
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [newTopicData, setNewTopicData] = useState({
    topic_name: '',
    topic_identifier: '',
    category: '',
    max_choosers: 1,
    description: '',
    link: ''
  });

  // Selected topics state
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Import topics modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');

  // Delete modal state (repo-standard)
  const [deleteState, setDeleteState] = useState<{ visible: boolean; ids: string[]; names: string[] }>({ visible: false, ids: [], names: [] });

  // Edit topic modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicData | null>(null);
  const [editTopicData, setEditTopicData] = useState({
    topic_name: '',
    topic_identifier: '',
    category: '',
    max_choosers: 1,
    description: '',
    link: ''
  });

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

  // --- New Topic Modal Handlers ---
  const handleShowNewTopic = () => {
    setNewTopicData({
      topic_name: '',
      topic_identifier: '',
      category: '',
      max_choosers: 1,
      description: '',
      link: ''
    });
    setShowNewTopicModal(true);
  };

  const handleCloseNewTopic = () => {
    setShowNewTopicModal(false);
  };

  const handleSubmitNewTopic = () => {
    if (onCreateTopic) {
      onCreateTopic(newTopicData);
      handleCloseNewTopic();
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setNewTopicData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Edit Topic Modal Handlers ---
  const handleShowEditTopic = (topic: TopicData) => {
    console.log('Edit button clicked for topic:', topic);
    setEditingTopic(topic);
    setEditTopicData({
      topic_name: topic.name || '',
      topic_identifier: topic.id || '',
      category: topic.category || '',
      max_choosers: topic.numSlots || 1,
      description: topic.description || '',
      link: topic.url || ''
    });
    setShowEditModal(true);
    console.log('Edit modal should be opening now');
  };

  const handleCloseEditTopic = () => {
    setShowEditModal(false);
    setEditingTopic(null);
  };

  const handleSubmitEditTopic = () => {
    console.log('Submitting edit for topic:', editingTopic);
    console.log('Edit data:', editTopicData);
    if (editingTopic && onEditTopic) {
      console.log('Calling onEditTopic with DB id:', editingTopic.databaseId, editTopicData);
      onEditTopic(String(editingTopic.databaseId), editTopicData);
      handleCloseEditTopic();
    } else {
      console.log('Missing editingTopic or onEditTopic:', { editingTopic, onEditTopic });
    }
  };

  const handleEditInputChange = (field: string, value: string | number) => {
    setEditTopicData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // --- Selection Handlers ---
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTopics(new Set());
      setSelectAll(false);
    } else {
      const allTopicIds = new Set(topicsData.map(topic => topic.id));
      setSelectedTopics(allTopicIds);
      setSelectAll(true);
    }
  };

  const handleSelectTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
    setSelectAll(newSelected.size === topicsData.length);
  };

  // --- Import Topics Handlers ---
  const handleShowImport = () => {
    setImportData('');
    setShowImportModal(true);
  };

  const handleCloseImport = () => {
    setShowImportModal(false);
  };

  const handleImportTopics = () => {
    try {
      // Parse CSV or JSON data
      const lines = importData.trim().split('\n');
      const topics = lines.map((line, index) => {
        const [topic_name, topic_identifier, category, max_choosers, description, link] = line.split(',');
        return {
          topic_name: topic_name?.trim() || `Imported Topic ${index + 1}`,
          topic_identifier: topic_identifier?.trim() || `IMP${index + 1}`,
          category: category?.trim() || '',
          max_choosers: parseInt(max_choosers?.trim()) || 1,
          description: description?.trim() || '',
          link: link?.trim() || ''
        };
      });

      // Create each topic
      topics.forEach(topic => {
        if (onCreateTopic) {
          onCreateTopic(topic);
        }
      });

      handleCloseImport();
    } catch (error) {
      console.error('Error importing topics:', error);
    }
  };

  // --- Delete Handlers ---
  const handleDeleteSelected = () => {
    if (selectedTopics.size === 0) return;
    const ids = Array.from(selectedTopics);
    const names = ids.map(id => topicsData.find(t => t.id === id)?.name || id);
    setDeleteState({ visible: true, ids, names });
  };

  // --- Back Handler ---
  const handleBack = () => {
    // Navigate back to assignments list
    window.history.back();
  };

  // Check if questionnaire varies across topics
  const questionnaireVaries = topicsData.length > 0 &&
    topicsData.some(t => t.questionnaire !== topicsData[0].questionnaire);

  // --- Render Helper Functions ---
  // removed: renderTeamMembers (moved to TopicsTable renderDetails inline rendering)

  return (
    <Row className="mt-4">
      <Col>
        <h4>Topics for {assignmentName} assignment</h4>

        {/* Topic Settings */}
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
                label="Allow bidding for topics?"
                checked={topicSettings.enableBidding}
                onChange={(e) => onTopicSettingChange('enableBidding', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="enableAuthorsReview"
                label="Allow authors to review others working on same topic?"
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
                id="allowAdvertiseForPartners"
                label="Allow participants to advertise for partners?"
                checked={topicSettings.allowAdvertiseForPartners}
                onChange={(e) => onTopicSettingChange('allowAdvertiseForPartners', e.target.checked)}
              />
            
              <Form.Check
                type="checkbox"
                id="allowBiddingForReviewers"
                label="Allow bidding for reviewers?"
                checked={topicSettings.allowBiddingForReviewers}
                onChange={(e) => onTopicSettingChange('allowBiddingForReviewers', e.target.checked)}
              />
        </Form>

        {/* Error Message */}
        {topicsError && (
          <div className="alert alert-danger" role="alert">
            <strong>Error loading topics:</strong> {
              typeof topicsError === 'string' 
                ? topicsError 
                : JSON.stringify(topicsError)
            }
          </div>
        )}

        <TopicsTable
          data={(topicsData || []).map((t) => ({
            id: t.id,
            databaseId: t.databaseId,
            name: t.name,
            url: t.url,
            description: t.description,
            availableSlots: t.availableSlots,
            waitlistCount: t.waitlistedTeams?.length || 0,
            assignedTeams: t.assignedTeams,
            waitlistedTeams: t.waitlistedTeams,
          }))}
          mode="instructor"
          selectable
          selectAll={selectAll}
          isRowSelected={(id) => selectedTopics.has(id)}
          onToggleAll={handleSelectAll}
          onToggleRow={handleSelectTopic}
          extraColumns={[
            ...(questionnaireVaries //displays the questionnaire column only if it varies across the topics
              ? [
                  {
                    id: "questionnaire",
                    header: "Questionnaire",
                    cell: ({ row }: any) => <span>{(topicsData.find(t => t.id === row.original.id)?.questionnaire) || "--Default rubric--"}</span>,
                  },
                ]
              : []),
            {
              id: "numSlots",
              header: "Num. of Slots",
              cell: ({ row }: any) => <span className="d-block text-center">{topicsData.find(t => t.id === row.original.id)?.numSlots ?? 0}</span>,
            },
            {
              id: "availableSlots",
              header: "Available Slots",
              cell: ({ row }: any) => <span className="d-block text-center">{row.original.availableSlots ?? 0}</span>,
            },
            {
              id: "waitlisted",
              header: "Waitlisted",
              cell: ({ row }: any) => <span className="d-block text-center">{row.original.waitlistedTeams?.length ?? 0}</span>,
            },
            ...(topicSettings.allowBookmarks
              ? [
                  {
                    id: "bookmarks",
                    header: "Bookmarks",
                    cell: ({ row }: any) => {
                      const topic = topicsData.find(t => t.id === row.original.id);
                      const bookmarkCount = topic?.bookmarks?.length || 0;
                      return (
                        <span>
                          {bookmarkCount === 0 ? "None" : `${bookmarkCount} bookmark${bookmarkCount > 1 ? 's' : ''}`}
                        </span>
                      );
                    },
                  },
                ]
              : []),
          ]}
          renderDetails={(row) => (
            <div>
              {row.assignedTeams && row.assignedTeams.length > 0 && (
                <div className="mt-2">
                  {row.assignedTeams.map((team) => {
                    const topicDbId = row.databaseId?.toString() ?? row.id;
                    return (
                      <div key={team.teamId} className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small fw-bold text-primary me-2">
                          {team.members.map(m => m.name || m.id).join(", ")}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDropTeam(topicDbId, team.teamId)}
                          title="Remove signup team from topic"
                        >
                          Remove team
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
              {row.waitlistedTeams && row.waitlistedTeams.length > 0 && (
                <div className="mt-1">
                  {row.waitlistedTeams.map((team) => (
                    <div key={team.teamId} className="d-flex align-items-center mb-1">
                      <span className="small text-muted">
                        {team.members.map(m => m.name || m.id).join(", ")} (waitlisted)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          renderInstructorActions={(topic) => (
            <Stack direction="horizontal" gap={2}>
              <OverlayTrigger overlay={<Tooltip>Edit Topic</Tooltip>}>
                <Button
                  variant="link"
                  onClick={() => {
                    const full = topicsData.find(t => t.id === topic.id);
                    if (!full) return;
                    handleShowEditTopic(full);
                  }}
                  aria-label="Edit Topic"
                  className="p-0"
                >
                  <img src={process.env.PUBLIC_URL + "/assets/images/edit-icon-24.png"} alt="Edit" style={{ width: "20px", height: "20px" }} />
                </Button>
              </OverlayTrigger>

              <OverlayTrigger overlay={<Tooltip>Delete Topic</Tooltip>}>
                <Button
                  variant="link"
                  onClick={() => setDeleteState({ visible: true, ids: [topic.id], names: [topic.name] })}
                  aria-label="Delete Topic"
                  className="p-0"
                >
                  <img src={process.env.PUBLIC_URL + "/assets/images/delete-icon-24.png"} alt="Delete" style={{ width: "20px", height: "20px" }} />
                </Button>
              </OverlayTrigger>

              {topicSettings.allowAdvertiseForPartners && (
                <OverlayTrigger overlay={<Tooltip>Apply to partner ad</Tooltip>}>
                  <Button
                    variant="link"
                    onClick={() => {
                      const full = topicsData.find(t => t.id === topic.id);
                      if (!full) return;
                      handleShowPartnerAd(full);
                    }}
                    aria-label="Apply to partner ad"
                    className="p-0"
                  >
                    <img
                      src={process.env.PUBLIC_URL + "/assets/images/add-ta-24.png"}
                      alt="Apply to partner ad"
                      style={{ width: "20px", height: "20px" }}
                    />
                  </Button>
                </OverlayTrigger>
              )}
            </Stack>
          )}
        />

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-2 justify-content-start mb-3 mt-3">
          <Button 
            variant="success" 
            onClick={handleShowNewTopic}
          >
            New topic
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleShowImport}
          >
            Import topics
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteSelected}
            disabled={selectedTopics.size === 0}
          >
            Delete selected topics ({selectedTopics.size})
          </Button>
          <Button 
            variant="primary" 
            onClick={handleBack}
          >
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

      {/* New Topic Modal */}
      <Modal show={showNewTopicModal} onHide={handleCloseNewTopic} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <FloatingLabel controlId="topicName" label="Topic Name" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter topic name"
                    value={newTopicData.topic_name}
                    onChange={(e) => handleInputChange('topic_name', e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="topicIdentifier" label="Topic Identifier" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="e.g., E2550"
                    value={newTopicData.topic_identifier}
                    onChange={(e) => handleInputChange('topic_identifier', e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FloatingLabel controlId="category" label="Category" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter category"
                    value={newTopicData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="maxChoosers" label="Max Choosers" className="mb-3">
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newTopicData.max_choosers}
                    onChange={(e) => handleInputChange('max_choosers', parseInt(e.target.value) || 1)}
                    required
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FloatingLabel controlId="description" label="Description" className="mb-3">
                  <Form.Control
                    as="textarea"
                    placeholder="Enter topic description"
                    style={{ height: '80px' }}
                    value={newTopicData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FloatingLabel controlId="link" label="Link (Optional)" className="mb-3">
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={newTopicData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseNewTopic}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitNewTopic}
            disabled={!newTopicData.topic_name.trim() || !newTopicData.topic_identifier.trim()}
          >
            Create Topic
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Topics Modal */}
      <Modal show={showImportModal} onHide={handleCloseImport} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Topics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <p>Import topics from CSV format. Each line should contain:</p>
            <p><code>Topic Name, Topic Identifier, Category, Max Choosers, Description, Link</code></p>
            <p className="text-muted small">Example: "Database Design, DB001, Technical, 2, Design database schema, https://example.com"</p>
          </div>
          <FloatingLabel controlId="importData" label="CSV Data">
            <Form.Control
              as="textarea"
              placeholder="Enter CSV data here..."
              style={{ height: '200px' }}
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImport}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleImportTopics}
            disabled={!importData.trim()}
          >
            Import Topics
          </Button>
        </Modal.Footer>
      </Modal>

      {deleteState.visible && (
        <DeleteTopics
          assignmentId={assignmentId}
          topicIds={deleteState.ids}
          topicNames={deleteState.names}
          onClose={() => setDeleteState({ visible: false, ids: [], names: [] })}
          onDeleted={onTopicsChanged}
        />
      )}

      {/* Edit Topic Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditTopic} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Topic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <FloatingLabel controlId="editTopicName" label="Topic Name" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter topic name"
                    value={editTopicData.topic_name}
                    onChange={(e) => handleEditInputChange('topic_name', e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="editTopicIdentifier" label="Topic Identifier" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="e.g., E2550"
                    value={editTopicData.topic_identifier}
                    onChange={(e) => handleEditInputChange('topic_identifier', e.target.value)}
                    required
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <FloatingLabel controlId="editCategory" label="Category" className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter category"
                    value={editTopicData.category}
                    onChange={(e) => handleEditInputChange('category', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="editMaxChoosers" label="Max Choosers" className="mb-3">
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="1"
                    value={editTopicData.max_choosers}
                    onChange={(e) => handleEditInputChange('max_choosers', parseInt(e.target.value) || 1)}
                    required
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FloatingLabel controlId="editDescription" label="Description" className="mb-3">
                  <Form.Control
                    as="textarea"
                    placeholder="Enter topic description"
                    style={{ height: '80px' }}
                    value={editTopicData.description}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <FloatingLabel controlId="editLink" label="Link (Optional)" className="mb-3">
                  <Form.Control
                    type="url"
                    placeholder="https://example.com"
                    value={editTopicData.link}
                    onChange={(e) => handleEditInputChange('link', e.target.value)}
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditTopic}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitEditTopic}
            disabled={!editTopicData.topic_name.trim() || !editTopicData.topic_identifier.trim()}
          >
            Update Topic
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default TopicsTab;
