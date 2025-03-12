import React from 'react';
//props for averagemarks component
interface Review {
    name: string;
    score: number;
    comment: string;
}

interface Question {
    questionNumber: string;
    questionText: string;
    reviews: Review[];
}

interface Props {
    data: Question[];
}
//calculation for average marks for teammate review
const AverageMarks: React.FC<Props> = ({ data }) => {
    const calculateTotalAverageMarks = (): string => {
        let totalScore = 0;
        let totalReviews = 0;

        data.forEach((question: Question) => {
            question.reviews.forEach((review: Review) => {
                totalScore += review.score;
                totalReviews++;
            });
        });

        const totalAverage = totalScore / totalReviews;
        // Rounding the average to two decimal places and converting it to a string
        return totalAverage.toFixed(2);
    };

    return (
        <div>
            <p>{calculateTotalAverageMarks()}</p>
        </div>
    );
};

export default AverageMarks; //returns the average teammate marks recieved