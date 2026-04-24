import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Form, Spinner, Table as BsTable } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import useAPI from '../../hooks/useAPI';
import axiosClient from '../../utils/axios_client';

type QuestionnaireType = 'Review' | 'Teammate Review' | 'Quiz';

type NormalizedItemType =
    | 'SectionHeader'
    | 'TableHeader'
    | 'ColumnHeader'
    | 'Criterion'
    | 'TextField'
    | 'TextArea'
    | 'Dropdown'
    | 'MultipleChoice'
    | 'Scale'
    | 'Checkbox'
    | 'Grid'
    | 'UploadFile'
    | 'Unknown';

const isTeammateQuestionnaire = (questionnaire: any) => {
    const questionnaireType = String(questionnaire?.questionnaire_type || '');
    const questionnaireName = String(questionnaire?.name || '');
    return (
        /teammatereview/i.test(questionnaireType)
        || /teammate\s*review/i.test(questionnaireType)
        || /teammate\s*review/i.test(questionnaireName)
    );
};

const parseMaybeNumber = (value: any): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

const normalizeItemType = (item: any): NormalizedItemType => {
    const rawType = String(item?.question_type || item?.item_type || item?.type || '')
        .replace(/[_\s-]+/g, '')
        .toLowerCase();

    if (rawType === 'sectionheader' || rawType === 'section_header') return 'SectionHeader';
    if (rawType === 'tableheader' || rawType === 'table_header') return 'TableHeader';
    if (rawType === 'columnheader' || rawType === 'column_header') return 'ColumnHeader';
    if (rawType === 'criterion' || rawType === 'scoredquestion') return 'Criterion';
    if (rawType === 'textfield') return 'TextField';
    if (rawType === 'textarea') return 'TextArea';
    if (rawType === 'dropdown') return 'Dropdown';
    if (rawType === 'multiplechoice' || rawType === 'multiplechoiceradio' || rawType === 'multiplechoicecheckbox') return 'MultipleChoice';
    if (rawType === 'scale') return 'Scale';
    if (rawType === 'checkbox') return 'Checkbox';
    if (rawType === 'grid') return 'Grid';
    if (rawType === 'uploadfile' || rawType === 'upload' || rawType === 'file') return 'UploadFile';
    return 'Unknown';
};

const parseGridNames = (value: any): string[] => {
    if (Array.isArray(value)) return value.map(String).filter(Boolean);
    if (typeof value === 'string' && value.trim()) {
        return value.split(/\||,|;/).map(s => s.trim()).filter(Boolean);
    }
    return [];
};

const parseAlternatives = (item: any): string[] => {
    const rawAlternatives = item?.alternatives ?? item?.options ?? item?.choices;
    if (Array.isArray(rawAlternatives)) {
        return rawAlternatives.map((choice) => String(choice).trim()).filter(Boolean);
    }
    if (typeof rawAlternatives === 'string') {
        return rawAlternatives
            .split(/\r?\n|\||,|;/)
            .map((choice) => choice.trim())
            .filter(Boolean);
    }
    return [];
};

const getScoreBounds = (item: any, questionnaire: any): { min: number; max: number } => {
    const min =
        parseMaybeNumber(item?.min_item_score)
        ?? parseMaybeNumber(item?.min_question_score)
        ?? parseMaybeNumber(item?.min_label)
        ?? parseMaybeNumber(questionnaire?.min_question_score)
        ?? 0;

    const max =
        parseMaybeNumber(item?.max_item_score)
        ?? parseMaybeNumber(item?.max_question_score)
        ?? parseMaybeNumber(item?.max_label)
        ?? parseMaybeNumber(questionnaire?.max_question_score)
        ?? 10;

    return min <= max ? { min, max } : { min: max, max: min };
};

const TeammateReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: assignmentResponse, sendRequest: fetchAssignment, isLoading: assignmentLoading } = useAPI();
    const { data: itemsResponse, sendRequest: fetchItems, isLoading: itemsLoading } = useAPI();
    const auth = useSelector((state: RootState) => state.authentication);
    const currentUser = auth.user;

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const assignmentId = Number(query.get('assignment_id'));
    const questionnaireIdFromUrl = Number(query.get('questionnaire_id'));
    const questionnaireTypeFromUrl = query.get('questionnaire_type') as QuestionnaireType | null;
    // E2619: URL param set by AssignedReviews when navigating here from the quiz gate;
    // after quiz submission the page redirects here to the actual review.
    const redirectAfter = query.get('redirect_after');
    // E2619: true when this page is being used for a quiz rather than a peer review.
    const isQuizMode = questionnaireTypeFromUrl === 'Quiz';
    const questionnaireNameFromUrl = query.get('questionnaire_name');
    const teamName = query.get('team_name') || '';
    const revieweeTeamId = Number(query.get('reviewee_team_id')) || null;
    const [mapId, setMapId] = useState(() => Number(query.get('map_id')));

    // Reset all form state when the URL changes (e.g. after quiz redirect navigates to review)
    useEffect(() => {
        setMapId(Number(query.get('map_id')));
        setAnswers({});
        setComments({});
        setMultiSelections({});
        setBooleanSelections({});
        setFileSelections({});
        setIsSubmitting(false);
        setIsSaving(false);
        setSubmitError(null);
        setSubmitSuccess(false);
        setQuizScore(null);
        setSaveMessage(null);
        setDraftResponseId(null);
        setDraftIsSubmitted(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
    const [booleanSelections, setBooleanSelections] = useState<Record<string, boolean>>({});
    const [fileSelections, setFileSelections] = useState<Record<string, File | null>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    // E2619: stores the total_score returned by the backend after quiz submission.
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [draftResponseId, setDraftResponseId] = useState<number | null>(null);
    const [draftIsSubmitted, setDraftIsSubmitted] = useState(false);
    const [draftLoading, setDraftLoading] = useState(false);

    useEffect(() => {
        if (assignmentId) {
            fetchAssignment({ url: `/assignments/${assignmentId}`, method: 'GET' });
        }
    }, [assignmentId, fetchAssignment]);

    const questionnaires = useMemo(() => {
        const assignmentData = assignmentResponse?.data;
        return Array.isArray(assignmentData?.questionnaires) ? assignmentData.questionnaires : [];
    }, [assignmentResponse?.data]);

    const resolvedQuestionnaire = useMemo(() => {
        // E2619: exclude quiz-type questionnaires when resolving the review questionnaire
        // so that the quiz questionnaire is never accidentally used for the peer review form.
        const isQuizQ = (q: any) => /^quiz/i.test(String(q?.questionnaire_type || ''));
        if (questionnaireIdFromUrl && !isQuizMode) {
            // In review mode, ignore quiz questionnaires even if the id matches.
            const byId = questionnaires.find((q: any) => Number(q.id) === questionnaireIdFromUrl && !isQuizQ(q));
            if (byId) return byId;
        }
        if (isQuizMode) {
            // E2619: quiz questionnaires are team-owned and NOT in the assignment's
            // assignment_questionnaires list. Never fall through to the review questionnaire
            // in quiz mode — that would load review items instead of quiz items.
            if (questionnaireIdFromUrl) {
                const byId = questionnaires.find((q: any) => Number(q.id) === questionnaireIdFromUrl);
                if (byId) return byId;
            }
            return null;
        }
        const teammateQ = questionnaires.find((q: any) => isTeammateQuestionnaire(q));
        const normalQ = questionnaires.find((q: any) => !isTeammateQuestionnaire(q) && !isQuizQ(q));
        if (questionnaireTypeFromUrl === 'Teammate Review') return teammateQ || normalQ;
        if (questionnaireTypeFromUrl === 'Review') return normalQ || teammateQ;
        return normalQ || teammateQ;
    }, [questionnaires, questionnaireIdFromUrl, questionnaireTypeFromUrl, isQuizMode]);

    const resolvedQuestionnaireType: QuestionnaireType = useMemo(() => {
        if (isQuizMode) return 'Quiz';
        if (resolvedQuestionnaire) return isTeammateQuestionnaire(resolvedQuestionnaire) ? 'Teammate Review' : 'Review';
        if (questionnaireTypeFromUrl === 'Teammate Review') return 'Teammate Review';
        return 'Review';
    }, [resolvedQuestionnaire, questionnaireTypeFromUrl, isQuizMode]);

    const resolvedQuestionnaireName = resolvedQuestionnaire?.name
        || questionnaireNameFromUrl
        || `${resolvedQuestionnaireType} Questionnaire`;

    // Fetch questionnaire items once we know the questionnaire id.
    // E2619: in quiz mode always use questionnaireIdFromUrl directly — the quiz questionnaire
    // is team-owned and not in the assignment's questionnaire list, so resolvedQuestionnaire
    // will be null for a quiz. Using resolvedQuestionnaire?.id here would cause items to be
    // fetched for the wrong (review) questionnaire once the assignment data loads.
    useEffect(() => {
        const qId = isQuizMode ? questionnaireIdFromUrl : (resolvedQuestionnaire?.id || questionnaireIdFromUrl);
        if (qId) {
            fetchItems({ url: `/questionnaires/${qId}/items`, method: 'GET' });
        }
    }, [isQuizMode, resolvedQuestionnaire?.id, questionnaireIdFromUrl, fetchItems]);

    const items: any[] = useMemo(() => {
        const data = itemsResponse?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
    }, [itemsResponse]);

    // Load existing draft response on mount
    useEffect(() => {
        if (!mapId) return;
        let cancelled = false;
        setDraftLoading(true);
        axiosClient.get('/responses', { params: { map_id: mapId } })
            .then((res) => {
                if (cancelled) return;
                const resp = res.data?.response;
                if (resp) {
                    setDraftResponseId(resp.id);
                    setDraftIsSubmitted(!!resp.is_submitted);
                    if (resp.is_submitted) {
                        setSubmitSuccess(true);
                    }
                    // Populate form fields from saved answers
                    const savedScores: any[] = resp.scores || [];
                    const newAnswers: Record<string, string> = {};
                    const newComments: Record<string, string> = {};
                    const newMulti: Record<string, string[]> = {};
                    const newBool: Record<string, boolean> = {};
                    savedScores.forEach((score: any) => {
                        const key = String(score.item_id);
                        if (score.answer != null) {
                            newAnswers[key] = String(score.answer);
                        }
                        if (score.comments) {
                            // For Checkbox with multi-selections stored as pipe-delimited
                            newComments[key] = score.comments;
                        }
                    });
                    setAnswers(prev => ({ ...prev, ...newAnswers }));
                    setComments(prev => ({ ...prev, ...newComments }));
                    // Restore multi-selections and booleans from saved data once items are available
                }
            })
            .catch(() => { /* no draft found — that's fine */ })
            .finally(() => { if (!cancelled) setDraftLoading(false); });
        return () => { cancelled = true; };
    }, [mapId]);

    // Once items are loaded and we have saved comments, restore form state from draft
    useEffect(() => {
        if (items.length === 0 || !draftResponseId) return;
        const newMulti: Record<string, string[]> = {};
        const newBool: Record<string, boolean> = {};
        const answersFromComments: Record<string, string> = {};
        items.forEach((item: any) => {
            const itemId = String(item.id ?? '');
            const itemType = normalizeItemType(item);
            const savedComment = comments[itemId];
            if (itemType === 'Checkbox') {
                const options = parseAlternatives(item);
                if (options.length > 0 && savedComment) {
                    newMulti[itemId] = savedComment.split('|').filter(Boolean);
                } else if (options.length === 0) {
                    newBool[itemId] = (answers[itemId] === '1');
                }
            }
            // TextField, TextArea, Dropdown, MultipleChoice store text in comments — restore to answers state
            if (['TextField', 'TextArea', 'Dropdown', 'MultipleChoice', 'Unknown'].includes(itemType)) {
                if (savedComment && !answers[itemId]) {
                    answersFromComments[itemId] = savedComment;
                }
            }
        });
        if (Object.keys(newMulti).length > 0) setMultiSelections(prev => ({ ...prev, ...newMulti }));
        if (Object.keys(newBool).length > 0) setBooleanSelections(prev => ({ ...prev, ...newBool }));
        if (Object.keys(answersFromComments).length > 0) setAnswers(prev => ({ ...prev, ...answersFromComments }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, draftResponseId]);

    const buildScoresAttributes = () => {
        const headerTypes: NormalizedItemType[] = ['SectionHeader', 'TableHeader', 'ColumnHeader'];
        return items
            .filter((item: any) => !headerTypes.includes(normalizeItemType(item)))
            .map((item: any) => {
                const itemId = String(item.id ?? '');
                const itemType = normalizeItemType(item);
                let answerValue: number | null = null;
                let commentsValue: string = '';

                switch (itemType) {
                    case 'Criterion':
                    case 'Scale':
                        answerValue = answers[itemId] ? Number(answers[itemId]) : null;
                        commentsValue = comments[itemId] ?? '';
                        break;
                    case 'TextArea':
                    case 'TextField':
                    case 'Unknown':
                        commentsValue = answers[itemId] ?? '';
                        break;
                    case 'Dropdown':
                    case 'MultipleChoice':
                        commentsValue = answers[itemId] ?? '';
                        break;
                    case 'Checkbox':
                        if ((parseAlternatives(item)).length > 0) {
                            const selections = multiSelections[itemId] ?? [];
                            commentsValue = selections.join('|');
                            answerValue = selections.length > 0 ? 1 : 0;
                        } else {
                            answerValue = booleanSelections[itemId] ? 1 : 0;
                        }
                        break;
                    case 'Grid':
                        commentsValue = answers[itemId] ?? '';
                        break;
                    case 'UploadFile':
                        commentsValue = fileSelections[itemId]?.name ?? '';
                        break;
                }

                return {
                    item_id: Number(item.id),
                    answer: answerValue,
                    comments: commentsValue,
                };
            });
    };

    // Ensure a Response record exists (create or reuse draft) and return its ID.
    // If the response map doesn't exist in the DB yet, create it first.
    const ensureResponseRecord = async (): Promise<number> => {
        if (draftResponseId) return draftResponseId;

        let effectiveMapId = mapId;

        try {
            const createRes = await axiosClient.post('/responses', { map_id: effectiveMapId });
            const resp = createRes.data?.response;
            const id = resp?.id;
            if (!id) throw new Error('Failed to create response record');
            setDraftResponseId(id);
            return id;
        } catch (err: any) {
            // Workaround: if the ResponseMap row doesn't exist yet in the DB (404),
            // create it on-the-fly using the current user, assignment, and reviewee team,
            // then retry creating the Response against the newly created map.
            if (err?.response?.status === 404 && assignmentId && currentUser?.id && revieweeTeamId) {
                const mapRes = await axiosClient.post('/response_maps', {
                    assignment_id: assignmentId,
                    reviewer_user_id: currentUser.id,
                    reviewee_team_id: revieweeTeamId,
                });
                const realMapId = mapRes.data?.id;
                if (!realMapId) throw new Error('Failed to create response map');
                effectiveMapId = realMapId;
                setMapId(effectiveMapId);

                // Now create the response with the real map id
                const createRes2 = await axiosClient.post('/responses', { map_id: effectiveMapId });
                const resp2 = createRes2.data?.response;
                const id2 = resp2?.id;
                if (!id2) throw new Error('Failed to create response record');
                setDraftResponseId(id2);
                return id2;
            }
            throw err;
        }
    };

    // Save answers to an existing or new draft (no submit/lock)
    const handleSaveDraft = async () => {
        if (!mapId) {
            setSubmitError('No response map ID found.');
            return;
        }
        setIsSaving(true);
        setSubmitError(null);
        setSaveMessage(null);

        try {
            const responseId = await ensureResponseRecord();
            const scoresAttributes = buildScoresAttributes();
            await axiosClient.patch(`/responses/${responseId}`, {
                response: { scores_attributes: scoresAttributes },
            });
            setSaveMessage('Draft saved successfully.');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Save failed';
            setSubmitError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!mapId) {
            setSubmitError('No response map ID found. Please navigate here from Student Tasks.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        setSaveMessage(null);

        try {
            const responseId = await ensureResponseRecord();

            // Save answers
            const scoresAttributes = buildScoresAttributes();
            await axiosClient.patch(`/responses/${responseId}`, {
                response: { scores_attributes: scoresAttributes },
            });

            // Submit (lock + score)
            const submitRes = await axiosClient.patch(`/responses/${responseId}/submit`);
            // E2619: capture the quiz score returned by aggregate_questionnaire_score so it
            // can be shown in the success banner before the redirect fires.
            if (isQuizMode) {
                setQuizScore(submitRes.data?.total_score ?? null);
            }

            setSubmitSuccess(true);
            setDraftIsSubmitted(true);
            // E2619: after quiz submission, redirect to the review URL encoded in redirect_after.
            if (redirectAfter) {
                setTimeout(() => navigate(redirectAfter), 1200);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.message || 'Submission failed';
            setSubmitError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!assignmentId) {
        return (
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem' }}>
                <Alert variant="danger">
                    Missing required review context. Please open this page from Student Tasks.
                </Alert>
            </div>
        );
    }

    const resolvedQuestionnaireId = resolvedQuestionnaire?.id || questionnaireIdFromUrl;

    const isLoading = assignmentLoading || (resolvedQuestionnaireId ? itemsLoading : false);

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', fontFamily: 'verdana, arial, helvetica, sans-serif', color: '#333' }}>
            <h2 className="mb-1">{resolvedQuestionnaireName}</h2>
            <div className="mb-3" style={{ fontSize: 13, lineHeight: '30px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#6c757d' }}>
                <div>
                    <Badge bg={resolvedQuestionnaireType === 'Teammate Review' ? 'info' : resolvedQuestionnaireType === 'Quiz' ? 'warning' : 'primary'}>
                        {resolvedQuestionnaireType}
                    </Badge>
                </div>
                {teamName && <div>Reviewing: <strong>{teamName}</strong></div>}
                <div>Assignment #{assignmentId}</div>
            </div>

            {isLoading && (
                <div className="d-flex align-items-center gap-2 mb-3">
                    <Spinner size="sm" animation="border" />
                    <span style={{ fontSize: 13, lineHeight: '30px' }}>Loading questionnaire...</span>
                </div>
            )}

            {!isLoading && items.length === 0 && (
                <Alert variant="warning" className="flash_note">
                    No questionnaire items found for this review type. The assignment may not have a{' '}
                    {resolvedQuestionnaireType} questionnaire configured yet.
                </Alert>
            )}

            {draftLoading && (
                <div className="text-center my-3">
                    <span style={{ fontSize: 13 }}>Loading saved draft...</span>
                </div>
            )}

            {draftIsSubmitted && (
                <Alert variant="info" className="flash_note mt-2">
                    This {isQuizMode ? 'quiz' : 'review'} has already been submitted. The form is read-only.
                </Alert>
            )}

            {items.length > 0 && (
                <fieldset disabled={draftIsSubmitted}>
                <Form>
                    {items.map((item: any, idx: number) => {
                        const itemId = String(item.id ?? idx);
                        const itemType = normalizeItemType(item);
                        const itemText = item.txt || item.question || item.description || `Item #${itemId}`;
                        const options = parseAlternatives(item);
                        const { min, max } = getScoreBounds(item, resolvedQuestionnaire);
                        const scoreOptions = Array.from({ length: Math.max(0, max - min + 1) }, (_, offset) => String(min + offset));

                        if (itemType === 'SectionHeader' || itemType === 'TableHeader' || itemType === 'ColumnHeader') {
                            return (
                                <div key={itemId} className="mb-3">
                                    {item.txt ? <h5 className="mb-2" style={{ fontSize: '1.2em', lineHeight: '18px' }}>{item.txt}</h5> : null}
                                    {itemType === 'SectionHeader' && <hr className="my-2" />}
                                </div>
                            );
                        }

                        return (
                            <div key={itemId} className="mb-4 p-3 border rounded bg-light d-flex flex-column gap-2">
                                {/* Item header row: label on the left, weight on the right */}
                                <div className="d-flex align-items-start justify-content-between gap-2">
                                    {/* Hide the label for single-checkbox items — the name is on the checkbox itself */}
                                    {!(itemType === 'Checkbox' && options.length === 0) && (
                                        <Form.Label className="fw-semibold mb-0 d-flex align-items-center gap-2" style={{ fontSize: 13, lineHeight: '30px', minWidth: 0, flex: 1 }}>
                                            <span style={{ overflowWrap: 'break-word', wordBreak: 'break-word', minWidth: 0 }}>{itemText}</span>
                                            {itemType === 'TextField' && (
                                                <Form.Control
                                                    className="form-control"
                                                    type="text"
                                                    placeholder={item.textarea || item.placeholder || "Your response..."}
                                                    value={answers[itemId] ?? ''}
                                                    onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                                    style={{ fontSize: 13, ...(item.textbox_width ? { width: item.textbox_width } : { flex: 1 }) }}
                                                />
                                            )}
                                        </Form.Label>
                                    )}
                                    {item.weight && (
                                        <span className="text-muted text-end" style={{ fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            Weight: {item.weight}
                                        </span>
                                    )}
                                </div>

                                {(itemType === 'Criterion' || itemType === 'Scale') && (
                                    <Form.Select
                                        className="form-control"
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                        style={{ maxWidth: 180, fontSize: 13 }}
                                    >
                                        <option value="">Select score ({min}-{max})</option>
                                        {scoreOptions.map((scoreValue) => (
                                            <option key={scoreValue} value={scoreValue}>{scoreValue}</option>
                                        ))}
                                    </Form.Select>
                                )}

                                {itemType === 'Criterion' && (
                                    <Form.Control
                                        className="form-control"
                                        as="textarea"
                                        rows={item.textarea_height ?? 3}
                                        placeholder={item.textarea || item.placeholder || "Comment (required with criterion)"}
                                        value={comments[itemId] ?? ''}
                                        onChange={(e) => setComments(prev => ({ ...prev, [itemId]: e.target.value }))}
                                        style={{ fontSize: 13, ...(item.textarea_width ? { width: item.textarea_width } : {}) }}
                                    />
                                )}

                                {(itemType === 'TextArea' || itemType === 'Unknown') && (
                                    <Form.Control
                                        className="form-control"
                                        as="textarea"
                                        rows={item.textarea_height ?? 4}
                                        placeholder={item.textarea || item.placeholder || "Your comments..."}
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                        style={{ fontSize: 13, ...(item.textarea_width ? { width: item.textarea_width } : {}) }}
                                    />
                                )}

                                {itemType === 'TextField' && null}

                                {itemType === 'Dropdown' && options.length > 0 && (
                                    <Form.Select
                                        className="form-control"
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                        style={{ fontSize: 13 }}
                                    >
                                        <option value="">Select an option</option>
                                        {options.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </Form.Select>
                                )}

                                {itemType === 'MultipleChoice' && options.length > 0 && (
                                    <div className="d-flex flex-column gap-2">
                                        {options.map((option) => (
                                            <Form.Check
                                                key={`${itemId}-${option}`}
                                                type="radio"
                                                name={`multiple-choice-${itemId}`}
                                                label={option}
                                                checked={(answers[itemId] ?? '') === option}
                                                onChange={() => setAnswers(prev => ({ ...prev, [itemId]: option }))}
                                            />
                                        ))}
                                    </div>
                                )}

                                {(itemType === 'Dropdown' || itemType === 'MultipleChoice') && options.length === 0 && (
                                    <Alert variant="secondary" className="mb-0 py-2">
                                        No options provided for this item.
                                    </Alert>
                                )}

                                {itemType === 'Checkbox' && options.length > 0 && (
                                    <div className="d-flex flex-column gap-2" style={{ fontSize: 13 }}>
                                        {options.map((option) => {
                                            const selected = multiSelections[itemId] ?? [];
                                            const isChecked = selected.includes(option);
                                            return (
                                                <Form.Check
                                                    key={`${itemId}-${option}`}
                                                    type="checkbox"
                                                    label={<span style={{ fontSize: 13, fontWeight: 600 }}>{option}</span>}
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        setMultiSelections(prev => {
                                                            const existing = prev[itemId] ?? [];
                                                            const updated = e.target.checked
                                                                ? [...existing, option]
                                                                : existing.filter((entry) => entry !== option);
                                                            return { ...prev, [itemId]: updated };
                                                        });
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {itemType === 'Checkbox' && options.length === 0 && (
                                    <Form.Check
                                        type="checkbox"
                                        label={<span style={{ fontSize: 13, fontWeight: 600 }}>{itemText}</span>}
                                        checked={booleanSelections[itemId] ?? false}
                                        onChange={(e) => setBooleanSelections(prev => ({ ...prev, [itemId]: e.target.checked }))}
                                    />
                                )}

                                {itemType === 'Grid' && (() => {
                                    const cols = parseGridNames(item.col_names) || [];
                                    const columnHeaders = cols.length > 0 ? cols : options;
                                    const rows = parseGridNames(item.row_names);
                                    const rowLabels = rows.length > 0 ? rows : [''];
                                    const currentValue = answers[itemId] ?? '';
                                    const rowSelections = currentValue ? currentValue.split('|') : rowLabels.map(() => '');

                                    return (
                                        <table className="table table-striped table-bordered table-sm" style={{ maxWidth: 500, fontSize: 13 }}>
                                            <thead>
                                                <tr>
                                                    {rows.length > 0 && <th></th>}
                                                    {columnHeaders.map((col) => (
                                                        <th key={col} className="text-center" style={{ fontSize: 13 }}>{col}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rowLabels.map((rowLabel, rowIdx) => (
                                                    <tr key={rowIdx}>
                                                        {rows.length > 0 && <td style={{ fontSize: 13 }}>{rowLabel}</td>}
                                                        {columnHeaders.map((col) => (
                                                            <td key={col} className="text-center">
                                                                <Form.Check
                                                                    type="radio"
                                                                    name={`grid-${itemId}-row-${rowIdx}`}
                                                                    checked={rowSelections[rowIdx] === col}
                                                                    onChange={() => {}}
                                                                    onClick={() => {
                                                                        const updated = [...rowSelections];
                                                                        while (updated.length <= rowIdx) updated.push('');
                                                                        updated[rowIdx] = updated[rowIdx] === col ? '' : col;
                                                                        setAnswers(prev => ({ ...prev, [itemId]: updated.join('|') }));
                                                                    }}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    );
                                })()}

                                {itemType === 'UploadFile' && (
                                    <div className="d-flex flex-column gap-2">
                                        <Form.Control
                                            type="file"
                                            onChange={(e) => {
                                                const selectedFile = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                                                setFileSelections(prev => ({ ...prev, [itemId]: selectedFile }));
                                            }}
                                        />
                                        {fileSelections[itemId] && (
                                            <span className="text-muted" style={{ fontSize: 13 }}>
                                                Selected: {fileSelections[itemId]?.name}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {submitError && (
                        <Alert variant="danger" className="flash_note mt-3">{submitError}</Alert>
                    )}
                    {saveMessage && !submitError && (
                        <Alert variant="info" className="flash_note mt-3">{saveMessage}</Alert>
                    )}
                    {submitSuccess && (
                        <Alert variant="success" className="flash_note mt-3">
                            {isQuizMode
                                ? `Quiz submitted! Score: ${quizScore !== null ? quizScore : '—'}. Opening your review\u2026`
                                : 'Review submitted successfully!'}
                        </Alert>
                    )}
                    {draftResponseId && !submitSuccess && !draftIsSubmitted && (
                        <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                            Draft #{draftResponseId} — you can save and come back later.
                        </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="outline-secondary" className="btn btn-md" onClick={() => window.history.back()}>
                            Back
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="btn btn-md"
                            disabled={isSaving || isSubmitting || submitSuccess || draftIsSubmitted || !mapId}
                            onClick={handleSaveDraft}
                        >
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        <Button
                            variant="primary"
                            className="btn btn-md"
                            disabled={isSubmitting || isSaving || submitSuccess || draftIsSubmitted || !mapId}
                            onClick={handleSubmitReview}
                        >
                            {isSubmitting ? 'Submitting...' : submitSuccess || draftIsSubmitted ? 'Submitted' : isQuizMode ? 'Submit Quiz' : 'Submit Review'}
                        </Button>
                    </div>
                    {!mapId && (
                        <div className="mt-2 text-danger" style={{ fontSize: 12 }}>
                            Missing map_id — cannot submit without a valid response map.
                        </div>
                    )}
                </Form>
                </fieldset>
            )}
        </div>
    );
};

export default TeammateReview;
