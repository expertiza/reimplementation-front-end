import React from "react";

/**
 * @author Ankur Mundra on May, 2023
 */

export const EditIcon = () => {
  return <img src={process.env.PUBLIC_URL + "/assets/icons/pencil.svg"} alt="edit" />;
};

export const RemoveUserIcon = () => {
  return <img src={process.env.PUBLIC_URL + "/assets/icons/user-remove.svg"} alt="remove" />;
};

export const AddUserIcon = () => {
  return <img src={process.env.PUBLIC_URL + "/assets/icons/user-add.svg"} alt="add" />;
};

export const InfoIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/info.svg"}
      alt="info"
      height="12"
      width="12"
    />
  );
};

export const AssignReviewerIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/assign-reviewers-24.png"}
      alt="assign-reviewers"
    />
  );
};

export const AssignSurveyIcon = () => {
  return (
    <img src={process.env.PUBLIC_URL + "/assets/icons/assign-survey-24.png"} alt="assign-survey" />
  );
};

export const AddParticipantIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/add-participant-24.png"}
      alt="add-participant"
    />
  );
};

export const CreateTeamIcon = () => {
  return (
    <img src={process.env.PUBLIC_URL + "/assets/icons/create-teams-24.png"} alt="create-team" />
  );
};

export const ViewReportIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/view-review-report-24.png"}
      alt="view-report"
    />
  );
};

export const ViewScoreIcon = () => {
  return <img src={process.env.PUBLIC_URL + "/assets/icons/view-scores-24.png"} alt="view-score" />;
};

export const ViewSurveyIcon = () => {
  return (
    <img src={process.env.PUBLIC_URL + "/assets/icons/view-survey-24.png"} alt="view-survey" />
  );
};

export const ViewSubmissionIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/view-submissions-24.png"}
      alt="view-submission"
    />
  );
};

export const ViewDelayedJobsIcon = () => {
  return (
    <img
      src={process.env.PUBLIC_URL + "/assets/icons/view-delayed-mailer.png"}
      alt="view-delayed-jobs"
    />
  );
};
