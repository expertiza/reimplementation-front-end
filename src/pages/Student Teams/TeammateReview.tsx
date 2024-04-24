import React, { useState, FormEvent } from 'react';
import { Form, Button, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const TeammateReview = () => {
    const [lateCount, setLateCount] = useState(0);  // State to track the number of times a teammate was late
    const [comments, setComments] = useState('');  // State for storing user comments
    const navigate = useNavigate();  // Hook for navigation

    // Inline CSS styles for component styling
    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '20px',
            fontSize: '0.85rem',
        },
        header: {
            marginBottom: '20px',
            fontSize: '2rem',
        },
        formLabel: {
            fontSize: '0.85rem',
            fontWeight: 'bold',
            marginBottom: '10px',
        },
        formControl: {
            fontSize: '0.85rem',
            borderColor: 'black',
            borderRadius: '3px',
        },
        submitButton: {
            backgroundColor: 'transparent',
            borderColor: '#000',
            borderStyle: 'solid',
            borderRadius: '0px',
            color: '#000',
            fontSize: '0.85rem',
            padding: '2px 5px',
            marginTop: '20px',
        },
        starRating: {
            cursor: 'pointer',
            fontSize: '1.5rem',  // Larger font size for better clickability and visibility
        },
    };

    // Handles form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Redirect to the view page after submitting the review
        navigate('/student_teams/view');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Teammate Review for Final Project</h2>
            <div style={{ color: '#31708f', backgroundColor: '#d9edf7', padding: '10px', borderRadius: '5px', border: '1px solid #bce8f1', marginBottom: '20px' }}>
                Provide honest feedback about your teammate's performance and reliability.
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label style={styles.formLabel}>How many times was this person late to meetings?</Form.Label>
                    <div>
                        {/* Render stars for late count selection */}
                        {[...Array(5)].map((_, i) => (
                            <span key={i} style={styles.starRating} onClick={() => setLateCount(i + 1)}>
                                {i < lateCount ? '★' : '☆'}
                            </span>
                        ))}
                    </div>
                </Form.Group>
                <Form.Group>
                    <Form.Label style={styles.formLabel}>Comments</Form.Label>
                    <FormControl
                        as="textarea"
                        rows={3}
                        value={comments}
                        onChange={(e) => setComments(e.currentTarget.value)}
                        style={styles.formControl}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" style={styles.submitButton}>
                    Submit Review
                </Button>
            </Form>
        </div>
    );
};

export default TeammateReview;