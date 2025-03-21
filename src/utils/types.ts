export interface BiddingTopic {
  topicId: number;
  topicName: string;
  bidding: {
    '#1': string[];
    '#2': string[];
    '#3': string[];
  };
  totalBids: number;
  percentageFirstBids: number;
}

export interface BiddingSummary {
  topics: BiddingTopic[];
} 