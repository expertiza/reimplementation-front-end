import React, { FC, useState } from 'react';
import { Button, Alert, Spinner, Form } from 'react-bootstrap';
import { AdvertisementDetails } from '../../utils/interfaces';
import axios from 'axios';
import styles from './AdvertisementSection.module.css';

interface AdvertisementSectionProps {
  advertisementData: AdvertisementDetails | null;
  assignmentId: string;
  studentId: string;
  onClose: () => void;
  onShowAlert: (message: string, type: 'success' | 'danger') => void;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api/v1';

const AdvertisementSection: FC<AdvertisementSectionProps> = ({
  advertisementData,
  assignmentId,
  studentId,
  onClose,
  onShowAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const [extendedTeamMembers, setExtendedTeamMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [comment, setComment] = useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  // Auto-resize textarea when comment changes
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [comment]);

  React.useEffect(() => {
    const fetchMembers = async () => {
      if (!advertisementData) return;
      const { signedUpTeam, topic } = advertisementData;
      const team = signedUpTeam.team;
      
      if (!team) return;

      // If members are already present, no need to fetch
      if (team.users && team.users.length > 0) return;
      if ((team as any).members && (team as any).members.length > 0) return;
      if ((team as any).participants && (team as any).participants.length > 0) return;

      setLoadingMembers(true);
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt');
        const response = await axios.get(
          `${API_BASE_URL}/signed_up_teams`,
          {
            params: { topic_id: topic.id },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        const matchingTeam = response.data.find((t: any) => t.team_id === signedUpTeam.team_id);
        if (matchingTeam && matchingTeam.team && matchingTeam.team.users) {
          setExtendedTeamMembers(matchingTeam.team.users);
        }
      } catch (err) {
        console.error('Error fetching extended team details:', err);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [advertisementData]);

  const handleRequestToJoin = async () => {
    if (!advertisementData) return;

    setLoading(true);
    setLoading(true);

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
          comments: comment,
        },
        { headers }
      );

      onShowAlert('Join request sent successfully!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Error sending join team request:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to send join team request';
      
      onShowAlert(errorMessage, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (!advertisementData) return null;

  const { signedUpTeam, topic } = advertisementData;
  const team = signedUpTeam.team;
  console.log('DEBUG: AdvertisementSection team:', team);

  // Calculate members to display and check membership
  const membersToDisplay = extendedTeamMembers.length > 0 
    ? extendedTeamMembers 
    : (team?.users || (team as any)?.members || (team as any)?.participants || []);

  const isMember = membersToDisplay.some((member: any) => {
    // Check for various possible ID fields depending on the object structure
    const memberId = member.id || member.user_id || member.user?.id;
    return memberId && memberId.toString() === studentId.toString();
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>📢</span>
          Teammate Advertisement
        </h3>
        <Button variant="link" size="sm" onClick={onClose} className={styles.linkButton}>
          Close
        </Button>
      </div>



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
              <div className={styles.infoRow}>
                <span className={styles.label}>Team Members:</span>
                <span className={styles.value}>
                  {(() => {
                    let membersList: string[] = [];
                    if (Array.isArray(membersToDisplay)) {
                      membersList = membersToDisplay.map((u: any) => u.name || u.user_name || u.username || u.full_name || u.user?.name || u.user?.username || u.user?.full_name);
                    }

                    return membersList.length > 0 ? membersList.join(', ') : (loadingMembers ? 'Loading members...' : 'No members information available');
                  })()}
                </span>
              </div>
            </>
          )}
        </div>

        {signedUpTeam.comments_for_advertisement && (
          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>Advertisement Message</h5>
            <div className={styles.advertisementMessage}>
              {signedUpTeam.comments_for_advertisement.split(' &AND& ').join(', ')}
            </div>
          </div>
        )}

        {!isMember && (
          <div className={styles.section}>
            <h5 className={styles.sectionTitle}>Message to Team (Optional)</h5>
            <Form.Group controlId="comment" style={{ width: '100%' }}>
              <Form.Control
                as="textarea"
                ref={textareaRef}
                rows={1}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Write a message to the team..."
                style={{ resize: 'none', overflow: 'hidden' }}
              />
            </Form.Group>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <Button variant="link" onClick={onClose} disabled={loading} className={styles.linkButton}>
          Close
        </Button>
        {!isMember && (
          <Button
            variant="link"
            onClick={handleRequestToJoin}
            disabled={loading}
            className={styles.linkButton}
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
                Request to Join Team
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdvertisementSection;
