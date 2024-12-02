// src/utils/reviewPermissions.ts
import { ROLE } from "./interfaces";

export const canViewTeammateReviews = (
  userRole: string,
  showTeammateReviews: boolean,
  viewMode: 'given' | 'received'
): boolean => {
  
  if (userRole === ROLE.INSTRUCTOR || userRole === ROLE.ADMIN || userRole === ROLE.SUPER_ADMIN) {
    return true;
  }
  

  if (userRole === ROLE.STUDENT && viewMode === 'received') {
    return showTeammateReviews;
  }
  

  if (userRole === ROLE.STUDENT && viewMode === 'given') {
    return true;
  }
  
  return false;
};

export const formatReviewScore = (score: number): string => {
  return score.toFixed(2);
};

export const getReviewColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return '#28a745';  
  if (percentage >= 80) return '#17a2b8';  
  if (percentage >= 70) return '#ffc107';  
  if (percentage >= 60) return '#fd7e14';  
  return '#dc3545';  
};