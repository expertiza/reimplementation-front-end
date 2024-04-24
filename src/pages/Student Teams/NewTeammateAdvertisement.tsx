import React, { useState, FC } from 'react';
import { Form, Button, FormControl } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NewTeammateAdvertisement: FC = () => {
    const [description, setDescription] = useState('');
    const navigate = useNavigate();  // Hook for navigation

    // Styles object for CSS-in-JS
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
            fontSize: '2rem', // Larger font size for the header
        },
        formLabel: {
            fontSize: '0.85rem',
            fontWeight: 'bold',
            marginBottom: '10px', // Space between label and textarea
        },
        formControl: {
            fontSize: '0.85rem',
            borderColor: 'black',
            borderRadius: '3px',
            marginBottom: '20px', // Space between textarea and button
        },
        submitButton: {
            backgroundColor: 'transparent', 
            borderColor: '#000', // black border color
            color: '#000', // text color
            fontSize: '0.85rem', // match the font size of other elements
            padding: '2px 5px', // adjust the vertical and horizontal padding as needed
            borderRadius: '0px', // no border-radius for a square look
            textDecoration: 'none',
        }
    };

    // Handle the form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement functionality to process the advertisement data (e.g., send to server)
        console.log(description); // Logging for demonstration; replace with actual implementation
        navigate('/student_teams/view');
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>New Teammate Advertisement</h1>
            <div style={{ color: '#31708f', backgroundColor: '#d9edf7', padding: '10px', borderRadius: '5px', border: '1px solid #bce8f1', marginBottom: '20px' }}>
                This is a placeholder page and is still in progress.
            </div>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="advertisementDescription">
                    <Form.Label style={styles.formLabel}>Please describe the qualifications you are looking for in a teammate.</Form.Label>
                    <FormControl
                        as="textarea"
                        rows={3}
                        value={description}
                        style={styles.formControl}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Form.Group>
                <Button variant="primary" type="submit" style={styles.submitButton}>
                    Create
                </Button>
            </Form>
        </div>
    );
};

export default NewTeammateAdvertisement;