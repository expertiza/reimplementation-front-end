import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, expect, it, vi } from "vitest";
import TopicsTab from "./TopicsTab";

const baseProps = {
  assignmentName: "Program 4",
  assignmentId: "1",
  topicSettings: {
    allowTopicSuggestions: false,
    enableBidding: false,
    enableAuthorsReview: true,
    allowReviewerChoice: true,
    allowBookmarks: false,
    allowBiddingForReviewers: false,
    allowAdvertiseForPartners: false,
  },
  topicsData: [
    {
      id: "T1",
      databaseId: 10,
      name: "Security Topic",
      assignedTeams: [],
      waitlistedTeams: [],
      questionnaire: "Default rubric",
      numSlots: 2,
      availableSlots: 2,
      bookmarks: [],
    },
  ],
  onTopicSettingChange: vi.fn(),
  onDropTeam: vi.fn(),
  onDeleteTopic: vi.fn(),
  onEditTopic: vi.fn(),
  onCreateTopic: vi.fn(),
  onApplyPartnerAd: vi.fn(),
};

describe("TopicsTab topic rubric selectors", () => {
  it("shows a review rubric dropdown for each topic when topic variation is enabled", () => {
    render(
      <TopicsTab
        {...baseProps}
        varyByTopic
        reviewRubricOptions={[{ label: "Security Rubric", value: 7 }]}
        topicRubricMappings={[
          {
            id: 99,
            questionnaire_id: 7,
            questionnaire_name: "Security Rubric",
            project_topic_id: 10,
            used_in_round: null,
          },
        ]}
      />
    );

    const row = screen.getByText("Security Topic").closest("tr");
    expect(row).not.toBeNull();
    const rubricSelect = within(row as HTMLElement).getByLabelText("Rubric for Security Topic") as HTMLSelectElement;

    expect(rubricSelect.value).toBe("7");
    expect(within(rubricSelect).getByText("Use assignment default rubric")).toBeInTheDocument();
    expect(within(rubricSelect).getByText("Security Rubric")).toBeInTheDocument();
  });

  it("sends topic, questionnaire, and round when a topic rubric changes", () => {
    const onTopicRubricChange = vi.fn();

    render(
      <TopicsTab
        {...baseProps}
        varyByTopic
        varyByRound
        reviewRounds={2}
        reviewRubricOptions={[{ label: "Round Rubric", value: 8 }]}
        onTopicRubricChange={onTopicRubricChange}
      />
    );

    const roundTwoSelect = screen.getByLabelText("Round 2 for Security Topic");
    fireEvent.change(roundTwoSelect, { target: { value: "8" } });

    expect(onTopicRubricChange).toHaveBeenCalledWith(10, 8, 2);
  });

  it("disables only the topic rubric selector currently being saved", () => {
    render(
      <TopicsTab
        {...baseProps}
        varyByTopic
        varyByRound
        reviewRounds={2}
        reviewRubricOptions={[{ label: "Round Rubric", value: 8 }]}
        isTopicRubricMappingPending={(_topicDatabaseId, usedInRound) => usedInRound === 2}
      />
    );

    expect(screen.getByLabelText("Round 1 for Security Topic")).not.toBeDisabled();
    expect(screen.getByLabelText("Round 2 for Security Topic")).toBeDisabled();
  });
});
