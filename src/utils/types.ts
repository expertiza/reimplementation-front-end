export interface BiddingTopic {
  topicId: number;
  topicName: string;
  firstPriorityBids: number;
  secondPriorityBids: number;
  thirdPriorityBids: number;
  totalBids: number;
  percentageFirstBids: number;
  biddingTeams: string[];
}

export interface BiddingSummary {
  topics: BiddingTopic[];
} 