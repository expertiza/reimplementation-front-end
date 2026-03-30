import { useEffect, useMemo, useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import ToolTip from "components/ToolTip";

interface ReviewStrategyTabProps {
  hasTopics?: boolean;
  hasTeams?: boolean;
  initialStrategy?: string;
  initialRequiredReviews?: number;
  initialAllowedReviews?: number;
  initialReviewTopicThreshold?: number;
  initialIsReviewAnonymous?: boolean;
  initialIsSelfReviewsRequired?: boolean;
  initialIsReviewRoleBased?: boolean;
  initialIsReviewDoneByTeams?: boolean;
  initialIsImportingSpreadsheet?: boolean;
  onSave?: (payload: {
    review_assignment_strategy: string;
    num_reviews_required: number;
    num_reviews_allowed: number;
    review_topic_threshold?: number;
    is_anonymous: boolean;
    is_selfreview_enabled: boolean;
    team_members_have_duty: boolean;
  }) => void;
  isSaving?: boolean;
}

const normalizeStrategy = (strategy?: string): string => {
  if (strategy === "Auto-Selected") return "Dynamic";
  if (strategy === "Instructor-Selected") return "Static";
  if (strategy === "Dynamic" || strategy === "Static") return strategy;
  return "Static";
};

const ReviewStrategyTab = ({
  hasTopics = false,
  hasTeams = false,
  initialStrategy = "Static",
  initialRequiredReviews = 0,
  initialAllowedReviews = 0,
  initialReviewTopicThreshold = 1,
  initialIsReviewAnonymous = false,
  initialIsSelfReviewsRequired = false,
  initialIsReviewRoleBased = false,
  initialIsReviewDoneByTeams = false,
  onSave,
  isSaving = false,
}: ReviewStrategyTabProps) => {
  const [reviewStrategy, setReviewStrategy] = useState<string>(normalizeStrategy(initialStrategy));
  const [requiredReviews, setRequiredReviews] = useState<number>(initialRequiredReviews);
  const [allowedReviews, setAllowedReviews] = useState<number>(Math.max(initialAllowedReviews, initialRequiredReviews));
  const [reviewTopicThreshold, setReviewTopicThreshold] = useState<number>(initialReviewTopicThreshold);
  const [isReviewAnonymous, setIsReviewAnonymous] = useState<boolean>(initialIsReviewAnonymous);
  const [isSelfReviewsRequired, setIsSelfReviewsRequired] = useState<boolean>(initialIsSelfReviewsRequired);
  const [isReviewRoleBased, setIsReviewRoleBased] = useState<boolean>(initialIsReviewRoleBased);
  const [isReviewDoneByTeams, setIsReviewDoneByTeams] = useState<boolean>(initialIsReviewDoneByTeams);
  const [staticStrategy, setStaticStrategy] = useState<string>("");

  useEffect(() => {
    setReviewStrategy(normalizeStrategy(initialStrategy));
    setRequiredReviews(initialRequiredReviews);
    setAllowedReviews(Math.max(initialAllowedReviews, initialRequiredReviews));
    setReviewTopicThreshold(initialReviewTopicThreshold);
    setIsReviewAnonymous(initialIsReviewAnonymous);
    setIsSelfReviewsRequired(initialIsSelfReviewsRequired);
    setIsReviewRoleBased(initialIsReviewRoleBased);
    setIsReviewDoneByTeams(initialIsReviewDoneByTeams);
  }, [
    initialStrategy,
    initialRequiredReviews,
    initialAllowedReviews,
    initialReviewTopicThreshold,
    initialIsReviewAnonymous,
    initialIsSelfReviewsRequired,
    initialIsReviewRoleBased,
    initialIsReviewDoneByTeams,
  ]);

  const isDynamic = reviewStrategy === "Dynamic";

  const topicThresholdValue = useMemo(() => {
    if (reviewTopicThreshold <= 0) return 1;
    return reviewTopicThreshold;
  }, [reviewTopicThreshold]);

  return (
    <Row className="mt-4">
      <Col>
        <div className="mb-3" style={{ display: "flex", alignItems: "center", columnGap: "10px" }}>
          <label htmlFor="assignment-review_strategy" className="form-label mb-0">Review strategy:</label>
          <Form.Select
            id="assignment-review_strategy"
            value={reviewStrategy}
            onChange={(event) => {
              const selectedStrategy = event.target.value;
              setReviewStrategy(selectedStrategy);
              if (selectedStrategy === "Dynamic" && allowedReviews === 0) {
                setAllowedReviews(requiredReviews);
              }
            }}
            style={{ maxWidth: "280px" }}
          >
            <option value="Static">Static</option>
            <option value="Dynamic">Dynamic</option>
          </Form.Select>
        </div>

        {isDynamic ? (
          <>
            <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "max-content 100px", alignItems: "center", columnGap: "10px", rowGap: "10px" }}>
              <label htmlFor="assignment-required_reviews" className="form-label mb-0">Number of reviews each reviewer is required to do:</label>
              <Form.Control
                id="assignment-required_reviews"
                type="number"
                value={requiredReviews}
                min={0}
                onChange={(event) => {
                  const value = Number(event.target.value || 0);
                  setRequiredReviews(value);
                  if (allowedReviews < value) {
                    setAllowedReviews(value);
                  }
                }}
              />

              <label htmlFor="assignment-allowed_reviews" className="form-label mb-0">Max. number of reviews each reviewer is allowed to do:</label>
              <Form.Control
                id="assignment-allowed_reviews"
                type="number"
                value={allowedReviews}
                min={requiredReviews}
                onChange={(event) => {
                  const value = Number(event.target.value || 0);
                  setAllowedReviews(Math.max(value, requiredReviews));
                }}
              />
            </div>

            {hasTopics && (
              <div className="mb-3" style={{ display: "flex", alignItems: "center", columnGap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", columnGap: "5px" }}>
                  <label htmlFor="assignment-review_topic_threshold" className="form-label mb-0">Review topic threshold (k):</label>
                  <ToolTip
                    id="assignment-review-topic-threshold-k-tooltip"
                    info="A topic is reviewable if the minimum number of reviews already done for the submissions on that topic is within k of the minimum number of reviews done on the least-reviewed submission on any topic."
                  />
                </div>
                <Form.Control
                  id="assignment-review_topic_threshold"
                  type="number"
                  min={1}
                  value={topicThresholdValue}
                  onChange={(event) => setReviewTopicThreshold(Number(event.target.value || 1))}
                  style={{ width: "100px" }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="alert alert-secondary">
              Static review strategy selected. Static form controls can be added here next.
            </div>

        
              <div className="mb-3">
                <Form.Check 
                   id="assignment-is-round-robin"
                   type="radio"
                   label="Round Robin Assignment"
                   name="static-strategy"
                   checked = {staticStrategy === "round-robin"}
                  onChange={() => {
                    setStaticStrategy("round-robin");
                  }}
                />
                <Form.Check 
                  id="assignment-is-random"
                  type="radio"
                  label="Random Assignment"
                  name = "static-strategy"
                  checked = {staticStrategy === "random"}
                  onChange={() => {
                    setStaticStrategy("random");
                  }}
                />
                <Form.Check 
                  id="assignment-is-spreadsheet-upload"
                  type="radio"
                  label="Import Spreadsheet"
                  name = "static-strategy"
                  checked = {staticStrategy === "spreadsheet"}
                  onChange={() => {
                    setStaticStrategy("spreadsheet");
                  }}
                      />
              </div>
          
            
            
            
            {staticStrategy === "spreadsheet" && (
              <>
                <div className="alert alert-info">
                  Spreadsheet importing selected. Spreadsheet upload form controls can be added here.
                </div>
                <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "max-content 200px", alignItems: "center", columnGap: "10px", rowGap: "10px" }}>
                  <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Import Spreadsheet Here:</Form.Label>
                    <Form.Control type="file" />
                  </Form.Group>
                </div>
                
              </>
            )}

            {staticStrategy !== "spreadsheet" && (
              <>
                <div className="mb-3" style={{ display: "grid", gridTemplateColumns: "max-content 100px", alignItems: "center", columnGap: "10px", rowGap: "10px" }}>
                  <label htmlFor="assignment-required_reviews" className="form-label mb-0">Number of reviews each reviewer is required to do:</label>
                  <Form.Control
                    id="assignment-required_reviews"
                    type="number"
                    value={requiredReviews}
                    min={0}
                    onChange={(event) => {
                      const value = Number(event.target.value || 0);
                      setRequiredReviews(value);
                      if (allowedReviews < value) {
                        setAllowedReviews(value);
                      }
                    }}
                  />
                </div>

                <Form.Check
                  id="assignment-is_submitted"
                  type="checkbox"
                  defaultChecked={true}
                  label="Assign reviewers to review projects that have not yet been submitted?"
                />
              </>
            )}
          </>
          

          
        )}

        <div className="mt-3">
          <div className="mb-2" style={{ display: "flex", alignItems: "center", columnGap: "6px" }}>
            <Form.Check
              id="assignment-is_review_anonymous"
              type="checkbox"
              checked={isReviewAnonymous}
              onChange={(event) => setIsReviewAnonymous(event.target.checked)}
              label="Is reviewing anonymous?"
            />
            <ToolTip id="assignment-is-review-anonymous-tooltip" info="If it is anonymous, students can't see who is reviewing them." />
          </div>

          <div className="mb-2" style={{ display: "flex", alignItems: "center", columnGap: "6px" }}>
            <Form.Check
              id="assignment-self_reviews_required"
              type="checkbox"
              checked={isSelfReviewsRequired}
              onChange={(event) => setIsSelfReviewsRequired(event.target.checked)}
              label="Are self-reviews required?"
            />
            <ToolTip id="assignment-self-reviews-required-tooltip" info="If this is checked, reviewers will be required to review themselves (or their team) as well as to review submissions by others." />
          </div>

          {hasTeams && (
            <>
              <div className="mb-2" style={{ display: "flex", alignItems: "center", columnGap: "6px" }}>
                <Form.Check
                  id="assignment-review_role_based"
                  type="checkbox"
                  checked={isReviewRoleBased}
                  onChange={(event) => setIsReviewRoleBased(event.target.checked)}
                  label="Is reviewing role based?"
                />
                <ToolTip id="assignment-review-role-based-tooltip" info="If this is chosen, every team member will need to choose a role, and team members will review their contributions based on the rubric for that role." />
              </div>

              <div className="mb-2" style={{ display: "flex", alignItems: "center", columnGap: "6px" }}>
                <Form.Check
                  id="assignment-review_done_by_teams"
                  type="checkbox"
                  checked={isReviewDoneByTeams}
                  onChange={(event) => setIsReviewDoneByTeams(event.target.checked)}
                  label="Are reviews to be done by teams?"
                />
                <ToolTip id="assignment-review-done-by-teams-tooltip" info="If this is chosen, teams (not individuals) will be assigned to review other teams." />
              </div>
            </>
          )}
        </div>

        {isDynamic && (
          <div className="mt-3">
            <Button
              variant="outline-secondary"
              disabled={isSaving}
              onClick={() => {
                onSave?.({
                  review_assignment_strategy: reviewStrategy,
                  num_reviews_required: requiredReviews,
                  num_reviews_allowed: Math.max(allowedReviews, requiredReviews),
                  review_topic_threshold: hasTopics ? topicThresholdValue : undefined,
                  is_anonymous: isReviewAnonymous,
                  is_selfreview_enabled: isSelfReviewsRequired,
                  team_members_have_duty: hasTeams ? isReviewRoleBased : false,
                  team_reviewing_enabled: hasTeams ? isReviewDoneByTeams : false,
                });
              }}
            >
              {isSaving ? "Saving..." : "Save Review Strategy"}
            </Button>
          </div>
        )}

        {!isDynamic 
        
        }
      </Col>
    </Row>
  );
};

export default ReviewStrategyTab;
