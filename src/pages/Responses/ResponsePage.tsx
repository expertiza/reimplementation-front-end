import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosClient from 'utils/axios_client';
import styles from './ResponsePage.module.css';

// ─── Shape of data returned by GET /assignments/:aid/student_review/:mid/form ───

interface FormItem {
  id: number;
  txt: string;
  question_type: string;
  weight: number;
  seq: number;
}

interface FormQuestionnaire {
  id: number;
  name: string;
  min_item_score: number;
  max_item_score: number;
  items: FormItem[];
}

interface ApiAnswer {
  id: number;
  item_id: number;
  answer: number | null;
  comments: string | null;
}

interface ApiResponse {
  id: number;
  is_submitted: boolean;
  additional_comment: string | null;
  answers: ApiAnswer[];
}

interface FormData {
  assignment_id: number;
  assignment_name: string;
  mapping_id: number;
  reviewee_team_name: string | null;
  topic_name: string | null;
  questionnaire: FormQuestionnaire | null;
  response: ApiResponse | null;
}

// ─── Per-item local answer state ──────────────────────────────────────────────

interface LocalAnswer {
  existingId?: number; // Answer record id if it exists in DB
  answer: number | null;
  comments: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isScoredType = (qt: string) =>
  ['Criterion', 'Scale'].includes(qt);

const isTextOnly = (qt: string) =>
  ['TextArea', 'Text area', 'TextField', 'Text field'].includes(qt);

const isSingleLine = (qt: string) =>
  ['TextField', 'Text field'].includes(qt);

// ─── Component ────────────────────────────────────────────────────────────────

const ResponsePage: React.FC = () => {
  const { assignmentId, mappingId } = useParams<{ assignmentId: string; mappingId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData]           = useState<FormData | null>(null);
  const [responseId, setResponseId]       = useState<number | null>(null);
  const [answers, setAnswers]             = useState<Map<number, LocalAnswer>>(new Map());
  const [additionalComment, setAdditional] = useState('');
  const [isSubmitted, setIsSubmitted]     = useState(false);

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMsg, setSaveMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // keep a ref to clear the save message timeout
  const saveMsgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load form data, create response if none exists ───────────────────────

  useEffect(() => {
    axiosClient
      .get(`/assignments/${assignmentId}/student_review/${mappingId}/form`)
      .then(async (res) => {
        const data: FormData = res.data;
        setFormData(data);
        initLocalState(data);
      })
      .catch((err) => {
        if (err?.response?.status === 403 || err?.response?.status === 404) {
          navigate('/student_tasks');
        } else {
          setError('Failed to load review form. Please try again.');
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, mappingId]);

  const initLocalState = useCallback(async (data: FormData) => {
    let resp = data.response;

    // If no response exists yet, create one
    if (!resp) {
      try {
        const created = await axiosClient.post('/responses', { response_map_id: data.mapping_id });
        resp = {
          id: created.data.response.id,
          is_submitted: false,
          additional_comment: null,
          answers: []
        };
      } catch {
        setError('Could not start review. Please try again.');
        return;
      }
    }

    setResponseId(resp.id);
    setIsSubmitted(resp.is_submitted);
    setAdditional(resp.additional_comment || '');

    // Build answers map: item_id → LocalAnswer
    const map = new Map<number, LocalAnswer>();
    for (const ans of resp.answers) {
      map.set(ans.item_id, {
        existingId: ans.id,
        answer:     ans.answer,
        comments:   ans.comments || ''
      });
    }
    // Pre-populate entries for items without saved answers
    if (data.questionnaire) {
      for (const item of data.questionnaire.items) {
        if (!map.has(item.id)) {
          map.set(item.id, { answer: null, comments: '' });
        }
      }
    }
    setAnswers(map);
  }, []);

  // ─── Save draft ───────────────────────────────────────────────────────────

  const buildScoresAttributes = useCallback(() => {
    const attrs: Record<string, any>[] = [];
    answers.forEach((local, itemId) => {
      const entry: Record<string, any> = {
        item_id:  itemId,
        answer:   local.answer,
        comments: local.comments
      };
      if (local.existingId !== undefined) entry.id = local.existingId;
      attrs.push(entry);
    });
    return attrs;
  }, [answers]);

  const saveDraft = useCallback(async () => {
    if (!responseId || isSubmitted) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const payload = {
        response: {
          additional_comment: additionalComment,
          scores_attributes:  buildScoresAttributes()
        }
      };
      await axiosClient.patch(`/responses/${responseId}`, payload);

      // Reload answers to get DB-assigned ids for new answers
      const refreshed = await axiosClient.get(`/responses/${responseId}`);
      const newMap = new Map<number, LocalAnswer>();
      for (const a of refreshed.data.answers) {
        newMap.set(a.item_id, { existingId: a.id, answer: a.answer, comments: a.comments || '' });
      }
      // keep unsaved items that didn't exist
      answers.forEach((local, itemId) => {
        if (!newMap.has(itemId)) newMap.set(itemId, local);
      });
      setAnswers(newMap);

      setSaveMsg({ type: 'ok', text: 'Draft saved.' });
    } catch {
      setSaveMsg({ type: 'err', text: 'Save failed. Please try again.' });
    } finally {
      setSaving(false);
      if (saveMsgTimer.current) clearTimeout(saveMsgTimer.current);
      saveMsgTimer.current = setTimeout(() => setSaveMsg(null), 4000);
    }
  }, [responseId, isSubmitted, additionalComment, buildScoresAttributes, answers]);

  // ─── Submit review ────────────────────────────────────────────────────────

  const submitReview = useCallback(async () => {
    if (!responseId || isSubmitted) return;
    if (!window.confirm('Once submitted, you cannot edit this review. Proceed?')) return;

    // save first
    setSubmitting(true);
    try {
      await axiosClient.patch(`/responses/${responseId}`, {
        response: {
          additional_comment: additionalComment,
          scores_attributes:  buildScoresAttributes()
        }
      });
      await axiosClient.patch(`/responses/${responseId}/submit`);
      setIsSubmitted(true);
      setSaveMsg({ type: 'ok', text: 'Review submitted successfully.' });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Submission failed. Please try again.';
      setSaveMsg({ type: 'err', text: msg });
    } finally {
      setSubmitting(false);
    }
  }, [responseId, isSubmitted, additionalComment, buildScoresAttributes]);

  // ─── Render helpers ───────────────────────────────────────────────────────

  const setScore = (itemId: number, score: number) =>
    setAnswers(prev => {
      const next = new Map(prev);
      const cur  = next.get(itemId) || { answer: null, comments: '' };
      next.set(itemId, { ...cur, answer: score });
      return next;
    });

  const setComments = (itemId: number, text: string) =>
    setAnswers(prev => {
      const next = new Map(prev);
      const cur  = next.get(itemId) || { answer: null, comments: '' };
      next.set(itemId, { ...cur, comments: text });
      return next;
    });

  const renderQuestion = (item: FormItem, q: FormQuestionnaire, displayNum: number) => {
    const local      = answers.get(item.id) || { answer: null, comments: '' };
    const scored     = isScoredType(item.question_type);
    const singleLine = isSingleLine(item.question_type);

    return (
      <div key={item.id} className={styles.questionBlock}>
        <p className={styles.questionText}>
          <span className={styles.questionSeq}>{displayNum}.</span> {item.txt}
          {scored && item.weight > 1 && (
            <span className={styles.questionWeight}> (weight: {item.weight})</span>
          )}
        </p>

        {scored && (
          <div className={styles.scoreRow}>
            {Array.from(
              { length: q.max_item_score - q.min_item_score + 1 },
              (_, i) => q.min_item_score + i
            ).map(val => (
              <label key={val} className={styles.radioLabel}>
                <input
                  type="radio"
                  name={`score_${item.id}`}
                  value={val}
                  checked={local.answer === val}
                  onChange={() => setScore(item.id, val)}
                  disabled={isSubmitted}
                  className={styles.radioInput}
                />
                {val}
              </label>
            ))}
          </div>
        )}

        {singleLine ? (
          <input
            type="text"
            className={styles.textField}
            value={local.comments}
            onChange={e => setComments(item.id, e.target.value)}
            disabled={isSubmitted}
            placeholder="Comment (optional)"
          />
        ) : isSubmitted ? (
          <div className={styles.readOnlyText}>{local.comments || <em className={styles.noCommentPlaceholder}>No comment</em>}</div>
        ) : (
          <textarea
            className={styles.commentArea}
            value={local.comments}
            onChange={e => setComments(item.id, e.target.value)}
            placeholder="Comment (optional)"
            rows={3}
          />
        )}
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return <div className={styles.loading}>Loading review form…</div>;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorMsg}>{error}</p>
        <Link to="/student_tasks" className={styles.backLink}>← Back to Assignments</Link>
      </div>
    );
  }

  if (!formData) return null;

  const { assignment_name, reviewee_team_name, topic_name, questionnaire } = formData;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>
          {isSubmitted ? 'View' : 'Write'} Review
          {reviewee_team_name ? ` for ${reviewee_team_name}` : ''}
        </h1>
        <p className={styles.subhead}>
          {assignment_name}
          {topic_name ? ` · ${topic_name}` : ''}
        </p>
      </div>

      {isSubmitted && (
        <div className={styles.submittedBanner}>
          This review has been submitted and is read-only.
        </div>
      )}

      {!questionnaire ? (
        <p className={styles.noQuestionnaire}>
          No questionnaire is associated with this assignment yet.
        </p>
      ) : (
        <>
          <div className={styles.rubricHeader}>
            <h2 className={styles.rubricName}>{questionnaire.name}</h2>
            <span className={styles.scoreRange}>
              Score range: {questionnaire.min_item_score}–{questionnaire.max_item_score}
            </span>
          </div>

          {questionnaire.items.map((item, idx) => renderQuestion(item, questionnaire, idx + 1))}

          {/* Additional comments */}
          <div className={styles.questionBlock}>
            <p className={styles.questionText}>Additional Comments</p>
            {isSubmitted ? (
              <div className={styles.readOnlyText}>{additionalComment || <em className={styles.noCommentPlaceholder}>No comment</em>}</div>
            ) : (
              <textarea
                className={styles.commentArea}
                value={additionalComment}
                onChange={e => setAdditional(e.target.value)}
                placeholder="Any overall comments for the author…"
                rows={4}
              />
            )}
          </div>

          {/* Action bar */}
          {!isSubmitted && (
            <div className={styles.actionBar}>
              <button
                className={styles.btnPrimary}
                onClick={saveDraft}
                disabled={saving || submitting}
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                className={styles.btnSubmit}
                onClick={submitReview}
                disabled={saving || submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
              {saveMsg && (
                <span className={saveMsg.type === 'ok' ? styles.saveOk : styles.saveErr}>
                  {saveMsg.text}
                </span>
              )}
            </div>
          )}
          {isSubmitted && saveMsg && (
            <p className={saveMsg.type === 'ok' ? styles.saveOk : styles.saveErr}>
              {saveMsg.text}
            </p>
          )}
        </>
      )}

      <Link to={-1 as any} className={styles.backLink}>← Back</Link>
    </div>
  );
};

export default ResponsePage;
