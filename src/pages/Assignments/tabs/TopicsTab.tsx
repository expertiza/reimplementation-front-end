import { Col, Row, Form, Table as BootstrapTable, Button } from "react-bootstrap";
import { BsInfoCircle, BsCheck, BsX, BsBookmark, BsPencil } from "react-icons/bs";

interface TopicSettings {
  allowTopicSuggestions: boolean;
  enableBidding: boolean;
  enableAuthorsReview: boolean;
  allowReviewerChoice: boolean;
  allowBookmarks: boolean;
  allowBiddingForReviewers: boolean;
}

interface TopicData {
  id: string;
  name: string;
  students: string[];
  questionnaire: string;
  numSlots: number;
  availableSlots: number;
  waitlist: number;
}

interface TopicsTabProps {
  topicSettings: TopicSettings;
  topicsData: TopicData[];
  onTopicSettingChange: (setting: string, value: boolean) => void;
}

const TopicsTab = ({ topicSettings, topicsData, onTopicSettingChange }: TopicsTabProps) => {
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

        {/* Hide all teams link */}
        <div className="mb-3">
          <a href="#" className="text-decoration-none">Hide all teams</a>
        </div>

        {/* Topics Table */}
        <BootstrapTable striped bordered hover>
          <thead>
            <tr>
              <th>
                <Form.Check type="checkbox" />
              </th>
              <th>Topic ID</th>
              <th>Topic name(s)</th>
              <th>Questionnaire</th>
              <th>Num. of slots</th>
              <th>Available slots</th>
              <th>Num. on waitlist</th>
              <th>Bookmarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topicsData.map((topic, index) => (
              <tr key={topic.id}>
                <td>
                  <Form.Check type="checkbox" />
                </td>
                <td>{topic.id}</td>
                <td>
                  <div>
                    <div className="d-flex align-items-center">
                      <span>{topic.name}</span>
                      <BsCheck className="text-success ms-2" />
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="text-muted small">
                        {topic.students.join(' ')}
                      </span>
                      <BsX className="text-danger ms-2" />
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div>Review Round 1:</div>
                    <Form.Select size="sm" defaultValue={topic.questionnaire}>
                      <option>{topic.questionnaire}</option>
                    </Form.Select>
                  </div>
                </td>
                <td>{topic.numSlots}</td>
                <td>{topic.availableSlots}</td>
                <td>{topic.waitlist}</td>
                <td>
                  <BsBookmark className="text-muted" />
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <BsPencil className="text-primary" style={{ cursor: 'pointer' }} />
                    <BsX className="text-danger" style={{ cursor: 'pointer' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </BootstrapTable>

        {/* --- NEWLY ADDED BUTTONS --- */}
        <div className="d-flex gap-2 mt-3">
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
        {/* --- END OF NEWLY ADDED BUTTONS --- */}

      </Col>
    </Row>
  );
};

export default TopicsTab;