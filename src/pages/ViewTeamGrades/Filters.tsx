import React, { useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { useEffect } from "react";

type FiltersProps = {
  toggleShowReviews: () => void;
  toggleAuthorFeedback: () => void;
  selectRound: (v: number) => void;
};

const Filters: React.FC<FiltersProps> = ({
  toggleShowReviews,
  toggleAuthorFeedback,
  selectRound,
}) => {
  const [showSecondDropdown, setShowSecondDropdown] = useState(true);
  const [firstDropdownSelection, setFirstDropdownSelection] = useState("Reviews"); // Default text for the first dropdown button
  const [secondDropdownSelection, setSecondDropdownSelection] = useState("All rounds"); // Default text for the second dropdown button

  useEffect(() => {
    if (firstDropdownSelection === "Reviews") {
      toggleShowReviews();
    } else if (firstDropdownSelection === "Author Feedback") {
      toggleAuthorFeedback();
    }
    selectRound(-1); // Set "All Rounds" as default round
  }, []);

  // Handle the selection from the first dropdown
  const handleFirstDropdownSelect = (eventKey: string | null) => {
    if (eventKey) {
      setFirstDropdownSelection((prev) => {
        if (prev === "Author Feedback") {
          toggleAuthorFeedback();
        } else if (prev === "Reviews") {
          toggleShowReviews();
        }
        return eventKey;
      }); // Update the first button text with the selected option
    }

    // Show or hide the second dropdown based on the selection
    if (eventKey === "Author Feedback" || eventKey === "Reviews") {
      if (eventKey === "Author Feedback") {
        toggleAuthorFeedback();
      }
      if (eventKey === "Reviews") {
        toggleShowReviews();
      }
      setShowSecondDropdown(true);
    } else {
      setShowSecondDropdown(false);
      setSecondDropdownSelection("Select Round"); // Reset the second dropdown text when hidden
    }
  };

  // Handle the selection from the second dropdown
  const handleSecondDropdownSelect = (eventKey: string | null) => {
    if (eventKey) {
      setSecondDropdownSelection((prev) => {
        if (eventKey === "All Rounds") {
          selectRound(-1);
        } else if (eventKey === "Round 1") {
          selectRound(1);
        } else if (eventKey === "Round 2") {
          selectRound(2);
        }
        return eventKey;
      }); // Update the second button text with the selected option
    }
  };

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div>
        <Dropdown onSelect={handleFirstDropdownSelect}>
          <Dropdown.Toggle
            id="dropdown-basic"
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid black",
            }}
          >
            {firstDropdownSelection}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item eventKey="Author Feedback" href="#/action-2">
              Author Feedback
            </Dropdown.Item>
            <Dropdown.Item eventKey="Reviews" href="#/action-3">
              Reviews
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {showSecondDropdown && (
        <div>
          <Dropdown onSelect={handleSecondDropdownSelect}>
            <Dropdown.Toggle
              id="dropdown-basic"
              style={{
                backgroundColor: "white",
                color: "black",
                border: "1px solid black",
              }}
            >
              {secondDropdownSelection}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="All Rounds" href="#/all-rounds">
                All rounds
              </Dropdown.Item>
              <Dropdown.Item eventKey="Round 1" href="#/round-1">
                Round 1
              </Dropdown.Item>
              <Dropdown.Item eventKey="Round 2" href="#/round-2">
                Round 2
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default Filters;
