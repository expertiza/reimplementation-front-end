// src/utils/reviewPermissions.ts
import { ROLE } from "./interfaces";

export const canViewTeammateReviews = (
  userRole: string,
  showTeammateReviews: boolean,
  viewMode: 'given' | 'received'
): boolean => {
  // 教师总是可以查看所有评审
  if (userRole === ROLE.INSTRUCTOR || userRole === ROLE.ADMIN || userRole === ROLE.SUPER_ADMIN) {
    return true;
  }
  
  // 学生查看自己收到的评审需要检查showTeammateReviews设置
  if (userRole === ROLE.STUDENT && viewMode === 'received') {
    return showTeammateReviews;
  }
  
  // 学生总是可以查看自己给出的评审
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
  if (percentage >= 90) return '#28a745';  // 绿色
  if (percentage >= 80) return '#17a2b8';  // 蓝绿色
  if (percentage >= 70) return '#ffc107';  // 黄色
  if (percentage >= 60) return '#fd7e14';  // 橙色
  return '#dc3545';  // 红色
};