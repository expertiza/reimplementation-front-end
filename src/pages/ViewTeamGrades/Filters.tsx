import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

const Filters: React.FC = () => {
    const [showSecondDropdown, setShowSecondDropdown] = useState(false);
    const [firstDropdownSelection, setFirstDropdownSelection] = useState("View"); // Default text for the first dropdown button
    const [secondDropdownSelection, setSecondDropdownSelection] = useState("Select Round"); // Default text for the second dropdown button

    // Handle the selection from the first dropdown
    const handleFirstDropdownSelect = (eventKey: string | null) => {
        if (eventKey) {
            setFirstDropdownSelection(eventKey); // Update the first button text with the selected option
        }

        // Show or hide the second dropdown based on the selection
        if (eventKey === "Author Feedback" || eventKey === "Reviews") {
            setShowSecondDropdown(true);
        } else {
            setShowSecondDropdown(false);
            setSecondDropdownSelection("Select Round"); // Reset the second dropdown text when hidden
        }
    };

    // Handle the selection from the second dropdown
    const handleSecondDropdownSelect = (eventKey: string | null) => {
        if (eventKey) {
            setSecondDropdownSelection(eventKey); // Update the second button text with the selected option
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
                        <Dropdown.Item eventKey="None" href="#/action-1">None</Dropdown.Item>
                        <Dropdown.Item eventKey="Author Feedback" href="#/action-2">Author Feedback</Dropdown.Item>
                        <Dropdown.Item eventKey="Reviews" href="#/action-3">Reviews</Dropdown.Item>
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
                            <Dropdown.Item eventKey="Round 1" href="#/round-1">Round 1</Dropdown.Item>
                            <Dropdown.Item eventKey="Round 2" href="#/round-2">Round 2</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            )}
        </div>
    );
}

export default Filters;
