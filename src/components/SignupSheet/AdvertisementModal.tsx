import React, { FC, useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { AdvertisementDetails } from '../../utils/interfaces';
import axios from 'axios';
import styles from './AdvertisementModal.module.css';

interface AdvertisementModalProps {
  show: boolean;
  onHide: () => void;
  advertisementData: AdvertisementDetails | null;
  assignmentId: string;
  studentId: string;
  onRequestSent?: () => void;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';

const AdvertisementModal: FC<AdvertisementModalProps> = ({
  show,
  onHide,
  advertisementData,
  assignmentId,
  studentId,
  onRequestSent,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestToJoin = async () => {
    if (!advertisementData) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      await axios.post(
        `${API_BASE_URL}/join_team_requests`,
        {
          team_id: advertisementData.signedUpTeam.team_id,
          assignment_id: assignmentId,
          comments: `Responding to advertisement for ${advertisementData.topic.topic_name}`,
        },
        { headers }
      );

      setSuccess('Join team request sent successfully!');
      
      if (onRequestSent) {
        onRequestSent();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onHide();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error sending join team request:', err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Failed to send join team request'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onHide();
  };

  if (!advertisementData) return null;

  const { signedUpTeam, topic } = advertisementData;
  const team = signedUpTeam.team;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📢</span>
          Teammate Advertisement
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <div className={styles.advertisementContent}>
          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>Topic Information</h5>
            <div className={styles.infoRow}>
              <span className={styles.label}>Topic:</span>
              <span className={styles.value}>{topic.topic_name}</span>
            </div>
            {topic.description && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Description:</span>
                <span className={styles.value}>{topic.description}</span>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>Team Information</h5>
            {team && (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Team Name:</span>
                  <span className={styles.value}>{team.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Current Team Size:</span>
                  <span className={styles.value}>
                    {team.team_size}
                    {team.max_size && ` / ${team.max_size}`}
                  </span>
                </div>
              </>
            )}
          </div>

          {signedUpTeam.comments_for_advertisement && (
            <div className={styles.section}>
              <h5 className={styles.sectionTitle}>Advertisement Message</h5>
              <div className={styles.advertisementMessage}>
                {signedUpTeam.comments_for_advertisement}
              </div>
            </div>
          )}

          <div className={styles.infoBox}>
            <span style={{ marginRight: '8px' }}>ℹ️</span>
            This team is looking for partners to join them for this topic. Click "Request to Join" to send a join request to the team.
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleRequestToJoin}
          disabled={loading || !!success}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Sending...
            </>
          ) : (
            <>
              <span style={{ marginRight: '8px' }}>➕</span>
              Request to Join Team
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AdvertisementModal;
