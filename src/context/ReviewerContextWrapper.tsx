// src/context/ReviewerContextWrapper.tsx
import React from "react";
import { ReviewerProvider } from "./ReviewerContext";

interface Props {
  children: React.ReactNode;
}

const ReviewerContextWrapper: React.FC<Props> = ({ children }) => {
  return <ReviewerProvider>{children}</ReviewerProvider>;
};

export default ReviewerContextWrapper;