/**
 * StudentReviewList — the student's review work page for a specific assignment.
 *
 * Reached from:
 *   - StudentTasksList "Revisions" sidebar links
 *   - StudentTaskDetail "Others' work" link (future)
 *
 * Shows:
 *   1. Summary stat cards (total / completed / in-progress reviews)
 *   2. Table of all assigned reviews with reviewee team, topic, and status badge
 *   3. "Request a new review" panel for dynamic assignments, with topic picker
 *      when the assignment requires the student to choose a topic.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from 'utils/axios_client';
import styles from './StudentReviewList.module.css';

interface ReviewEntry {
  mapping_id: number;
  reviewee_team_id: number | null;
  reviewee_team_name: string | null;
  topic_id: number | null;
  topic_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  submission_updated: boolean;
  for_calibration: boolean;
}

interface ReviewListData {
  assignment_id: number;
  assignment_name: string;
  is_calibrated: boolean;
  is_dynamic: boolean;
  can_choose_topic_to_review: boolean;
  topics_assigned_by_bidding: boolean;
  num_reviews_total: number;
  num_reviews_completed: number;
  num_reviews_in_progress: number;
  reviews: ReviewEntry[];
}

interface EligibleTopic {
  id: number;
  topic_name: string;
  review_count: number;
}

const statusBadgeClass = (status: ReviewEntry['status']) => {
  switch (status) {
    case 'completed':  return styles.badgeCompleted;
    case 'in_progress': return styles.badgeInProgress;
    default:           return styles.badgeNotStarted;
  }
};

const statusLabel = (status: ReviewEntry['status']) => {
  switch (status) {
    case 'completed':   return 'Completed';
    case 'in_progress': return 'In Progress';
    default:            return 'Not Started';
  }
};

const StudentReviewList: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [listData, setListData]     = useState<ReviewListData | null>(null);
  const [loading, setLoading]       = useState(true);

  // Topic picker state
  const [showPicker, setShowPicker]         = useState(false);
  const [eligibleTopics, setEligibleTopics] = useState<EligibleTopic[]>([]);
  const [topicsLoading, setTopicsLoading]   = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [requestMsg, setRequestMsg]         = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [requesting, setRequesting]         = useState(false);

  useEffect(() => {
    axiosClient
      .get(`/assignments/${assignmentId}/student_review/list`)
      .then((res) => setListData(res.data))
      .catch((err) => {
        if (err?.response?.status === 403 || err?.response?.status === 404) navigate('/');
        else console.error('Error loading review list:', err);
      })
      .finally(() => setLoading(false));
  }, [assignmentId, navigate]);

  const openTopicPicker = useCallback(() => {
    setShowPicker(true);
    setSelectedTopicId(null);
    setRequestMsg(null);
    setTopicsLoading(true);
    axiosClient
      .get('/review_mappings/eligible_topics', { params: { assignment_id: assignmentId } })
      .then((res) => setEligibleTopics(res.data.eligible_topics || []))
      .catch(() => setEligibleTopics([]))
      .finally(() => setTopicsLoading(false));
  }, [assignmentId]);

  const handleRequestReview = useCallback(() => {
    if (!listData) return;
    setRequesting(true);
    setRequestMsg(null);

    const params: Record<string, any> = { assignment_id: assignmentId };
    if (listData.can_choose_topic_to_review) {
      if (!selectedTopicId) {
        setRequestMsg({ type: 'error', text: 'Please select a topic first.' });
        setRequesting(false);
        return;
      }
      params.topic_id = selectedTopicId;
    } else {
      params.i_dont_care = true;
    }

    axiosClient
      .post('/review_mappings/request_review', null, { params })
      .then(() => {
        setShowPicker(false);
        setRequestMsg(null);
        setLoading(true);
        return axiosClient.get(`/assignments/${assignmentId}/student_review/list`);
      })
      .then((res) => { if (res) setListData(res.data); })
      .catch((err) => {
        const msg = err?.response?.data?.error || 'Could not assign review. Please try again.';
        setRequestMsg({ type: 'error', text: msg });
      })
      .finally(() => {
        setRequesting(false);
        setLoading(false);
      });
  }, [assignmentId, listData, selectedTopicId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading reviews…</div>;
  }

  if (!listData) return null;

  const { assignment_name, num_reviews_total, num_reviews_completed, num_reviews_in_progress, reviews, is_dynamic, can_choose_topic_to_review } = listData;
  const num_not_started = num_reviews_total - num_reviews_completed - num_reviews_in_progress;

  const actionLabel = (status: ReviewEntry['status']) => {
    switch (status) {
      case 'completed':   return 'View';
      case 'in_progress': return 'Update';
      default:            return 'Begin';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Reviews for &ldquo;{assignment_name}&rdquo;</h1>
      </div>

      {/* Stat cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{num_reviews_total}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardCompleted}`}>
          <div className={styles.statNum}>{num_reviews_completed}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardInProgress}`}>
          <div className={styles.statNum}>{num_reviews_in_progress}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>
        <div className={`${styles.statCard} ${styles.statCardNotStarted}`}>
          <div className={styles.statNum}>{num_not_started}</div>
          <div className={styles.statLabel}>Not Started</div>
        </div>
      </div>

      {/* Review list */}
      {reviews.length === 0 ? (
        <p style={{ color: '#666' }}>No reviews assigned yet.</p>
      ) : (
        <table className={styles.reviewTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Topic</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r, idx) => (
              <tr key={r.mapping_id}>
                <td>{idx + 1}</td>
                <td>{r.reviewee_team_name ?? '—'}</td>
                <td>{r.topic_name ?? '—'}</td>
                <td>
                  <span className={`${styles.badge} ${statusBadgeClass(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </td>
                <td>
                  <Link
                    to={`/assignments/${assignmentId}/responses/${r.mapping_id}`}
                    className={styles.actionLink}
                  >
                    {actionLabel(r.status)}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Dynamic assignment: request a new review */}
      {is_dynamic && (
        <div className={styles.requestSection}>
          <div className={styles.requestInner}>
          <h2>Request a new review</h2>

          {!showPicker ? (
            <button
              className={styles.btnPrimary}
              onClick={can_choose_topic_to_review ? openTopicPicker : handleRequestReview}
              disabled={requesting}
            >
              {requesting ? 'Assigning…' : can_choose_topic_to_review ? 'Choose a topic to review' : 'Assign me a review'}
            </button>
          ) : (
            <div className={styles.pickerRow}>
              {topicsLoading ? (
                <span style={{ fontSize: 14, color: '#666' }}>Loading topics…</span>
              ) : (
                <select
                  className={styles.topicSelect}
                  value={selectedTopicId ?? ''}
                  onChange={(e) => setSelectedTopicId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— Select a topic —</option>
                  {eligibleTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.topic_name}
                    </option>
                  ))}
                </select>
              )}
              <button
                className={styles.btnPrimary}
                onClick={handleRequestReview}
                disabled={requesting || topicsLoading || !selectedTopicId}
              >
                {requesting ? 'Assigning…' : 'Confirm'}
              </button>
              <button
                className={styles.btnSecondary}
                onClick={() => { setShowPicker(false); setRequestMsg(null); }}
              >
                Cancel
              </button>
            </div>
          )}

          {requestMsg && (
            <p className={requestMsg.type === 'error' ? styles.error : styles.success}>
              {requestMsg.text}
            </p>
          )}
          </div>
        </div>
      )}

      <Link to="/student_tasks" className={styles.backLink}>
        ← Back to Assignments
      </Link>
    </div>
  );
};

export default StudentReviewList;
