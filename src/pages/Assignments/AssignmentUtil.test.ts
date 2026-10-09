import { describe, it, expect } from "vitest";
import { transformAssignmentResponse, transformAssignmentRequest } from "./AssignmentUtil";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function makeAssignment(overrides: Record<string, any> = {}): string {
  return JSON.stringify({
    id: 1,
    name: "Test Assignment",
    directory_path: "test",
    spec_location: "",
    private: false,
    require_quiz: false,
    has_badge: false,
    staggered_deadline: false,
    is_calibrated: false,
    due_dates: [],
    assignment_questionnaires: [],
    ...overrides,
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// transformAssignmentResponse
// ──────────────────────────────────────────────────────────────────────────────

describe("transformAssignmentResponse", () => {
  // --------------------------------------------------------------------------
  // has_max_review_limit derived from set_allowed_number_of_reviews_per_reviewer
  // --------------------------------------------------------------------------
  describe("has_max_review_limit derivation", () => {
    it("is true when set_allowed_number_of_reviews_per_reviewer is a positive integer", () => {
      const result = transformAssignmentResponse(
        makeAssignment({ set_allowed_number_of_reviews_per_reviewer: 3 })
      );
      expect(result.has_max_review_limit).toBe(true);
    });

    it("is false when set_allowed_number_of_reviews_per_reviewer is 0", () => {
      const result = transformAssignmentResponse(
        makeAssignment({ set_allowed_number_of_reviews_per_reviewer: 0 })
      );
      expect(result.has_max_review_limit).toBe(false);
    });

    it("is false when set_allowed_number_of_reviews_per_reviewer is null", () => {
      const result = transformAssignmentResponse(
        makeAssignment({ set_allowed_number_of_reviews_per_reviewer: null })
      );
      expect(result.has_max_review_limit).toBe(false);
    });

    it("is false when set_allowed_number_of_reviews_per_reviewer is undefined", () => {
      const result = transformAssignmentResponse(makeAssignment());
      expect(result.has_max_review_limit).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // apply_late_policy derived from is_penalty_calculated
  // --------------------------------------------------------------------------
  describe("apply_late_policy derivation", () => {
    it("is true when is_penalty_calculated is true", () => {
      const result = transformAssignmentResponse(makeAssignment({ is_penalty_calculated: true }));
      expect(result.apply_late_policy).toBe(true);
    });

    it("is false when is_penalty_calculated is false", () => {
      const result = transformAssignmentResponse(makeAssignment({ is_penalty_calculated: false }));
      expect(result.apply_late_policy).toBe(false);
    });

    it("defaults to false when is_penalty_calculated is absent", () => {
      const result = transformAssignmentResponse(makeAssignment());
      expect(result.apply_late_policy).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // use_*_deadline toggles derived from presence of due_date records
  // --------------------------------------------------------------------------
  describe("use_*_deadline toggle derivation", () => {
    const SIGNUP = 8;
    const DROP_TOPIC = 7;
    const TEAM_FORMATION = 9;

    it("use_signup_deadline is true when a signup due_date exists", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 1,
              deadline_type_id: SIGNUP,
              due_at: "2025-01-01T00:00:00Z",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
              deadline_name: "signup",
            },
          ],
        })
      );
      expect(result.use_signup_deadline).toBe(true);
    });

    it("use_drop_topic_deadline is true when a drop_topic due_date exists", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 2,
              deadline_type_id: DROP_TOPIC,
              due_at: "2025-01-01T00:00:00Z",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
              deadline_name: "drop_topic",
            },
          ],
        })
      );
      expect(result.use_drop_topic_deadline).toBe(true);
    });

    it("use_team_formation_deadline is true when a team_formation due_date exists", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 3,
              deadline_type_id: TEAM_FORMATION,
              due_at: "2025-01-01T00:00:00Z",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
              deadline_name: "team_formation",
            },
          ],
        })
      );
      expect(result.use_team_formation_deadline).toBe(true);
    });

    it("all three toggles are false when due_dates is empty", () => {
      const result = transformAssignmentResponse(makeAssignment({ due_dates: [] }));
      expect(result.use_signup_deadline).toBe(false);
      expect(result.use_drop_topic_deadline).toBe(false);
      expect(result.use_team_formation_deadline).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // Named deadline regex: underscore-separated names from the serializer
  // --------------------------------------------------------------------------
  describe("named deadline date_time mapping", () => {
    const DROP_TOPIC = 7;
    const TEAM_FORMATION = 9;
    const SIGNUP = 8;
    const DUE_AT = "2025-06-15T10:00:00.000Z";

    it("maps drop_topic (underscore) deadline to date_time[drop_topic_deadline]", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 10,
              deadline_type_id: DROP_TOPIC,
              due_at: DUE_AT,
              deadline_name: "drop_topic",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
            },
          ],
        })
      );
      expect(result.date_time?.drop_topic_deadline).toBeInstanceOf(Date);
      expect((result.date_time?.drop_topic_deadline as Date).toISOString()).toBe(DUE_AT);
    });

    it("maps team_formation (underscore) deadline to date_time[team_formation_deadline]", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 11,
              deadline_type_id: TEAM_FORMATION,
              due_at: DUE_AT,
              deadline_name: "team_formation",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
            },
          ],
        })
      );
      expect(result.date_time?.team_formation_deadline).toBeInstanceOf(Date);
    });

    it("maps signup deadline to date_time[signup_deadline]", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 12,
              deadline_type_id: SIGNUP,
              due_at: DUE_AT,
              deadline_name: "signup",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
            },
          ],
        })
      );
      expect(result.date_time?.signup_deadline).toBeInstanceOf(Date);
    });

    it('maps "drop topic" (space-separated) as well as "drop_topic"', () => {
      // The regex should handle either form gracefully
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 13,
              deadline_type_id: DROP_TOPIC,
              due_at: DUE_AT,
              deadline_name: "drop topic",
              submission_allowed_id: 3,
              review_allowed_id: 3,
              teammate_review_allowed_id: 3,
            },
          ],
        })
      );
      expect(result.date_time?.drop_topic_deadline).toBeInstanceOf(Date);
    });
  });

  // --------------------------------------------------------------------------
  // submission_allowed / review_allowed / teammate_allowed maps
  // --------------------------------------------------------------------------
  describe("allowed maps for named deadlines", () => {
    const DROP_TOPIC = 7;

    it("populates submission_allowed map for named deadlines", () => {
      const result = transformAssignmentResponse(
        makeAssignment({
          due_dates: [
            {
              id: 20,
              deadline_type_id: DROP_TOPIC,
              due_at: "2025-01-01T00:00:00Z",
              deadline_name: "drop_topic",
              submission_allowed_id: 1,
              review_allowed_id: 2,
              teammate_review_allowed_id: 3,
            },
          ],
        })
      );
      expect((result as any).submission_allowed?.drop_topic_deadline).toBe("1");
      expect((result as any).review_allowed?.drop_topic_deadline).toBe("2");
      expect((result as any).teammate_allowed?.drop_topic_deadline).toBe("3");
    });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// transformAssignmentRequest
// ──────────────────────────────────────────────────────────────────────────────

describe("transformAssignmentRequest", () => {
  const baseValues = {
    name: "Test",
    directory_path: "test",
    spec_location: "",
    private: false,
    show_template_review: false,
    require_quiz: false,
    has_badge: false,
    staggered_deadline: false,
    is_calibrated: false,
  };

  function parse(values: Record<string, any>) {
    return JSON.parse(transformAssignmentRequest(values as any)).assignment;
  }

  // --------------------------------------------------------------------------
  // apply_late_policy → is_penalty_calculated mapping
  // --------------------------------------------------------------------------
  describe("apply_late_policy → is_penalty_calculated", () => {
    it("sets is_penalty_calculated true when apply_late_policy is true", () => {
      const body = parse({ ...baseValues, apply_late_policy: true });
      expect(body.is_penalty_calculated).toBe(true);
    });

    it("sets is_penalty_calculated false when apply_late_policy is false", () => {
      const body = parse({ ...baseValues, apply_late_policy: false });
      expect(body.is_penalty_calculated).toBe(false);
    });

    it("does NOT include apply_late_policy as its own key in the payload", () => {
      const body = parse({ ...baseValues, apply_late_policy: true });
      expect(body).not.toHaveProperty("apply_late_policy");
    });
  });

  // --------------------------------------------------------------------------
  // has_max_review_limit should not appear in the payload
  // --------------------------------------------------------------------------
  describe("has_max_review_limit", () => {
    it("is not included in the request payload (backend attr_writer no-op)", () => {
      const body = parse({
        ...baseValues,
        has_max_review_limit: true,
        set_allowed_number_of_reviews_per_reviewer: 5,
      });
      expect(body).not.toHaveProperty("has_max_review_limit");
    });

    it("still includes set_allowed_number_of_reviews_per_reviewer", () => {
      const body = parse({
        ...baseValues,
        has_max_review_limit: true,
        set_allowed_number_of_reviews_per_reviewer: 5,
      });
      expect(body.set_allowed_number_of_reviews_per_reviewer).toBe(5);
    });
  });

  // --------------------------------------------------------------------------
  // named deadline due_dates_attributes
  // --------------------------------------------------------------------------
  describe("named deadline due_dates_attributes", () => {
    it("includes drop_topic_deadline when a date and existing id are present", () => {
      const values = {
        ...baseValues,
        number_of_review_rounds: 1,
        date_time: { drop_topic_deadline: new Date("2025-06-01T00:00:00Z") },
        due_dates: [{ id: 99, deadline_type_id: 7 }],
      };
      const body = parse(values);
      const dd = body.due_dates_attributes?.find((d: any) => d.deadline_type_id === 7);
      expect(dd).not.toBeUndefined();
      expect(dd.id).toBe(99);
      expect(dd.due_at).toContain("2025-06-01");
    });

    it("includes existing named deadline record even when no new date is set (dropdown-only update)", () => {
      const values = {
        ...baseValues,
        number_of_review_rounds: 1,
        date_time: {},
        due_dates: [{ id: 77, deadline_type_id: 9 }],
      };
      const body = parse(values);
      const dd = body.due_dates_attributes?.find((d: any) => d.deadline_type_id === 9);
      expect(dd).not.toBeUndefined();
      expect(dd.id).toBe(77);
      expect(dd.due_at).toBeUndefined();
    });

    it("omits a named deadline when there is no date and no existing record", () => {
      const values = {
        ...baseValues,
        number_of_review_rounds: 1,
        date_time: {},
        due_dates: [],
      };
      const body = parse(values);
      const hasDropTopic = (body.due_dates_attributes ?? []).some(
        (d: any) => d.deadline_type_id === 7
      );
      expect(hasDropTopic).toBe(false);
    });
  });
});
