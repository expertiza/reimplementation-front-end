export interface SectionHeaderData {
  type: "header";
  txt: string;
}

export interface ReviewData {
  itemNumber: string;
  itemText: string;
  itemType?: string;
  reviews: {
    name?: string;
    score?: number;
    comment?: string;
    textResponse?: string;
    selections?: string[];
    selectedOption?: string;
    fileName?: string;
    fileUrl?: string;
  }[];
  RowAvg: number;
  maxScore: number;
}
