import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import useAPI from '../../hooks/useAPI';

type QuestionnaireType = 'Review' | 'Teammate Review';

type NormalizedItemType =
    | 'SectionHeader'
    | 'Criterion'
    | 'TextField'
    | 'TextArea'
    | 'Dropdown'
    | 'MultipleChoice'
    | 'Scale'
    | 'Checkbox'
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
    if (rawType === 'criterion' || rawType === 'scoredquestion') return 'Criterion';
    if (rawType === 'textfield') return 'TextField';
    if (rawType === 'textarea') return 'TextArea';
    if (rawType === 'dropdown') return 'Dropdown';
    if (rawType === 'multiplechoice' || rawType === 'multiplechoiceradio' || rawType === 'multiplechoicecheckbox') return 'MultipleChoice';
    if (rawType === 'scale') return 'Scale';
    if (rawType === 'checkbox') return 'Checkbox';
    if (rawType === 'uploadfile' || rawType === 'file') return 'UploadFile';
    return 'Unknown';
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
    const { data: assignmentResponse, sendRequest: fetchAssignment, isLoading: assignmentLoading } = useAPI();
    const { data: itemsResponse, sendRequest: fetchItems, isLoading: itemsLoading } = useAPI();

    const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const assignmentId = Number(query.get('assignment_id'));
    const questionnaireIdFromUrl = Number(query.get('questionnaire_id'));
    const questionnaireTypeFromUrl = query.get('questionnaire_type') as QuestionnaireType | null;
    const questionnaireNameFromUrl = query.get('questionnaire_name');
    const teamName = query.get('team_name') || '';

    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [comments, setComments] = useState<Record<string, string>>({});
    const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
    const [booleanSelections, setBooleanSelections] = useState<Record<string, boolean>>({});
    const [fileSelections, setFileSelections] = useState<Record<string, File | null>>({});

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
        if (questionnaireIdFromUrl) {
            const byId = questionnaires.find((q: any) => Number(q.id) === questionnaireIdFromUrl);
            if (byId) return byId;
        }
        const teammateQ = questionnaires.find((q: any) => isTeammateQuestionnaire(q));
        const normalQ = questionnaires.find((q: any) => !isTeammateQuestionnaire(q));
        if (questionnaireTypeFromUrl === 'Teammate Review') return teammateQ || normalQ;
        if (questionnaireTypeFromUrl === 'Review') return normalQ || teammateQ;
        return normalQ || teammateQ;
    }, [questionnaires, questionnaireIdFromUrl, questionnaireTypeFromUrl]);

    const resolvedQuestionnaireType: QuestionnaireType = useMemo(() => {
        if (resolvedQuestionnaire) return isTeammateQuestionnaire(resolvedQuestionnaire) ? 'Teammate Review' : 'Review';
        if (questionnaireTypeFromUrl === 'Teammate Review') return 'Teammate Review';
        return 'Review';
    }, [resolvedQuestionnaire, questionnaireTypeFromUrl]);

    const resolvedQuestionnaireName = resolvedQuestionnaire?.name
        || questionnaireNameFromUrl
        || `${resolvedQuestionnaireType} Questionnaire`;

    // Fetch questionnaire items once we know the questionnaire id
    useEffect(() => {
        const qId = resolvedQuestionnaire?.id || questionnaireIdFromUrl;
        if (qId) {
            fetchItems({ url: `/questionnaires/${qId}/items`, method: 'GET' });
        }
    }, [resolvedQuestionnaire?.id, questionnaireIdFromUrl, fetchItems]);

    const items: any[] = useMemo(() => {
        const data = itemsResponse?.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
    }, [itemsResponse]);

    if (!assignmentId) {
        return (
            <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem' }}>
                <Alert variant="danger">
                    Missing required review context. Please open this page from Student Tasks.
                </Alert>
            </div>
        );
    }

    const isLoading = assignmentLoading || itemsLoading;

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
            <h4 className="mb-1">{resolvedQuestionnaireName}</h4>
            <div className="mb-3" style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: '4px', color: '#6c757d' }}>
                <div>
                    <Badge bg={resolvedQuestionnaireType === 'Teammate Review' ? 'info' : 'primary'}>
                        {resolvedQuestionnaireType}
                    </Badge>
                </div>
                {teamName && <div>Reviewing: <strong>{teamName}</strong></div>}
                <div>Assignment #{assignmentId}</div>
            </div>

            {isLoading && (
                <div className="d-flex align-items-center gap-2 mb-3">
                    <Spinner size="sm" animation="border" />
                    <span>Loading questionnaire...</span>
                </div>
            )}

            {!isLoading && items.length === 0 && (
                <Alert variant="warning">
                    No questionnaire items found for this review type. The assignment may not have a{' '}
                    {resolvedQuestionnaireType} questionnaire configured yet.
                </Alert>
            )}

            {items.length > 0 && (
                <Form>
                    {items.map((item: any, idx: number) => {
                        const itemId = String(item.id ?? idx);
                        const itemType = normalizeItemType(item);
                        const itemText = item.txt || item.question || item.description || `Item #${itemId}`;
                        const options = parseAlternatives(item);
                        const { min, max } = getScoreBounds(item, resolvedQuestionnaire);
                        const scoreOptions = Array.from({ length: Math.max(0, max - min + 1) }, (_, offset) => String(min + offset));

                        if (itemType === 'SectionHeader') {
                            return (
                                <div key={itemId} className="mb-3">
                                    {item.txt ? <h6 className="mb-2">{item.txt}</h6> : null}
                                    <hr className="my-2" />
                                </div>
                            );
                        }

                        return (
                            <div key={itemId} className="mb-4 p-3 border rounded bg-light d-flex flex-column gap-2">
                                <Form.Label className="fw-semibold mb-0">
                                    {idx + 1}. {itemText}
                                </Form.Label>
                                {item.weight && (
                                    <span className="text-muted" style={{ fontSize: 13 }}>
                                        Weight: {item.weight}
                                    </span>
                                )}

                                {(itemType === 'Criterion' || itemType === 'Scale') && (
                                    <Form.Select
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                        style={{ maxWidth: 180 }}
                                    >
                                        <option value="">Select score ({min}-{max})</option>
                                        {scoreOptions.map((scoreValue) => (
                                            <option key={scoreValue} value={scoreValue}>{scoreValue}</option>
                                        ))}
                                    </Form.Select>
                                )}

                                {itemType === 'Criterion' && (
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Comment (required with criterion)"
                                        value={comments[itemId] ?? ''}
                                        onChange={(e) => setComments(prev => ({ ...prev, [itemId]: e.target.value }))}
                                    />
                                )}

                                {(itemType === 'TextArea' || itemType === 'Unknown') && (
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        placeholder="Your comments..."
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                    />
                                )}

                                {itemType === 'TextField' && (
                                    <Form.Control
                                        type="text"
                                        placeholder="Your response..."
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
                                    />
                                )}

                                {itemType === 'Dropdown' && options.length > 0 && (
                                    <Form.Select
                                        value={answers[itemId] ?? ''}
                                        onChange={(e) => setAnswers(prev => ({ ...prev, [itemId]: e.target.value }))}
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
                                    <div className="d-flex flex-column gap-2">
                                        {options.map((option) => {
                                            const selected = multiSelections[itemId] ?? [];
                                            const isChecked = selected.includes(option);
                                            return (
                                                <Form.Check
                                                    key={`${itemId}-${option}`}
                                                    type="checkbox"
                                                    label={option}
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
                                        label="Selected"
                                        checked={booleanSelections[itemId] ?? false}
                                        onChange={(e) => setBooleanSelections(prev => ({ ...prev, [itemId]: e.target.checked }))}
                                    />
                                )}

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

                    <div className="d-flex gap-2 mt-3">
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Back
                        </Button>
                        <Button variant="primary" disabled>
                            Submit Review
                        </Button>
                    </div>
                    <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
                        Review submission requires backend integration with a persisted response map.
                    </div>
                </Form>
            )}
        </div>
    );
};

export default TeammateReview;
