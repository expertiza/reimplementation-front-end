import React, { useState } from "react";
import ReviewTableRow from "./ReviewTableRow";
import { Button } from "react-bootstrap";
import ToolTip from "components/ToolTip";
import { calculateAverages } from "../../pages/ViewTeamGrades/utils";
import { Review } from "./types";
import { HeatMapQuestion } from "pages/Assignments/AssignmentUtil";



interface ReviewTableContentProps {
    roundData: HeatMapQuestion[];
    roundIndex: number;
    currentUser?: { id: string };
    project?: { student: { id: string } };
    sortOrderRow: "asc" | "desc" | "none";
    toggleSortOrderRow: () => void;
    sortByTotalScore: "asc" | "desc" | "none";
    toggleSortByTotalScore: () => void;
    toggleShowQuestion: () => void;
    showToggleQuestion: boolean;
}

const ReviewTableContent: React.FC<ReviewTableContentProps> = ({
    roundData,
    roundIndex,
    currentUser,
    project,
    sortOrderRow,
    toggleSortOrderRow,
    sortByTotalScore,
    toggleSortByTotalScore,
    showToggleQuestion,
    toggleShowQuestion
}) => {
    const { averagePeerReviewScore, columnAverages, sortedData } = calculateAverages(
        roundData,
        sortOrderRow
    );
    const [showWordComments, setshowWordComments] = useState(0);

    let displayData = [...sortedData];
    if (sortByTotalScore !== "none") {
        displayData.sort((a, b) => {
            const totalA = a.reviews.reduce((sum, r) => sum + r.score, 0);
            const totalB = b.reviews.reduce((sum, r) => sum + r.score, 0);
            return sortByTotalScore === "asc" ? totalA - totalB : totalB - totalA;
        });
    }

    return (
        <div className="flex flex-col mb-6">
            <div className="flex items-center justify-between mb-2 space-x-4">
                <h4 className="text-xl font-semibold">Review (Round: {roundIndex + 1})</h4>
                <div className="d-flex gap-3 align-items-center my-3">
                    <label>
                        <input
                            type="checkbox"
                            checked={showWordComments == 10}
                            onChange={() => setshowWordComments((prev) => prev == 10 ? 0 : 10)}
                        />{" "}
                        &gt; 10 Word Comments
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={showWordComments == 20}
                            onChange={() => setshowWordComments((prev) => prev == 20 ? 0 : 20)}
                        />{" "}
                        &gt; 20 Word Comments
                    </label>
                </div>
                <div className="flex items-center gap-4"> {/* USE gap-4 for EVEN Spacing */}
                    <a
                        href="#"
                        onClick={toggleShowQuestion}
                        className="text-blue-500 underline cursor-pointer px-2"
                    >
                        {showToggleQuestion ? "toggle question list" : "toggle question list"}
                    </a>

                    <a
                        href="#"
                        className="text-blue-500 underline cursor-pointer px-2"
                    >
                        hide tags
                    </a>

                    <span className="text-blue-500 underline cursor-pointer px-2">
                        color legend <ToolTip id="colorLegend" info="Colors are scaled from poor to excellent in the following order: red, orange, yellow, light-green, dark-green" placement="right" />
                    </span>

                    <span className="text-blue-500 underline cursor-pointer px-2">
                        interaction legend <ToolTip id="interactionLegend" info="This legend explains the interaction patterns between reviewers and reviewees." placement="right" />
                    </span>
                </div>

            </div>

            <table className="tbl_heat">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 text-center" style={{ width: "70px" }}>Question No.</th>
                        {showToggleQuestion && (
                            <th className="py-2 px-4 text-center" style={{ width: "150px" }}>Question</th>
                        )}
                        {roundData[0]?.reviews?.map((review, index) => (
                            <th key={index} className="py-2 px-4 text-center" style={{ width: "70px" }}>
                                {currentUser?.id === project?.student?.id
                                    ? `Review ${index + 1}`
                                    : review.name}
                            </th>
                        ))}
                        {showWordComments != 0 && (
                            <th className="py-2 px-4 text-center" style={{ width: "90px" }}>
                                Word Count
                            </th>
                        )}
                        <th
                            className="py-2 px-4 text-center"
                            style={{ width: "70px", cursor: "pointer" }}
                            onClick={toggleSortOrderRow}
                        >
                            Average
                            {sortOrderRow === "none" && <span> ▲▼</span>}
                            {sortOrderRow === "asc" && <span> ▲</span>}
                            {sortOrderRow === "desc" && <span> ▼</span>}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((row, index) => (
                        <ReviewTableRow
                            key={index}
                            row={row}
                            showToggleQuestion={showToggleQuestion}
                            showWordCount={showWordComments}
                        />
                    ))}
                    <tr className="no-bg">
                        <td className="py-2 px-4">Avg</td>
                        {showToggleQuestion && <td></td>}
                        {columnAverages.map((avg, index) => (
                            <td key={index} className="py-2 px-4 text-center">
                                {avg.toFixed(2)}
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
            <div className="d-flex gap-3 align-items-center mb-3 mt-3">
                <Button
                    onClick={toggleSortByTotalScore}
                    style={{ backgroundColor: "#3F51B5", color: "white", fontWeight: "bold" }}
                >
                    Sort by Total Review Score ({sortByTotalScore === "none" ? "Off" : sortByTotalScore})
                </Button>
                Teamates:
                {["Raj Patel", "Aditya Pai", "Parth Kulkarni"].map((teammate, index) => (
                    <span key={index}>
                        {teammate}
                    </span>
                ))}

            </div>
            <div className="mt-2">
                <h5>
                    Average peer review score:{" "}
                    <span style={{ fontWeight: "normal" }}>{averagePeerReviewScore}</span>
                </h5>
            </div>
        </div>
    );
};

export default ReviewTableContent;
