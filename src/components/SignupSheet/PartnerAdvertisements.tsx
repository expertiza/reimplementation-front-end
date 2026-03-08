import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SignedUpTeam } from '../../utils/interfaces';
import styles from './PartnerAdvertisements.module.css';

const PartnerAdvertisements: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState<SignedUpTeam[]>([]);
  const [topicName, setTopicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<{ [key: number]: string }>({});

  const fetchAdvertisements = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token') || localStorage.getItem('jwt');
      const response = await axios.get(
        `http://localhost:3002/signed_up_teams`,
        {
          params: { topic_id: topicId },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Filter only teams that are advertising
      const advertisingTeams = response.data.filter(
        (team: SignedUpTeam) => team.advertise_for_partner === true
      );

      setAdvertisements(advertisingTeams);
      if (advertisingTeams.length > 0 && advertisingTeams[0].sign_up_topic) {
        setTopicName(advertisingTeams[0].sign_up_topic.topic_name);
      }
    } catch (err: any) {
      console.error('Error fetching advertisements:', err);
      setError(err.response?.data?.message || 'Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchAdvertisements();
  }, [fetchAdvertisements]);

  const handleRequestToJoin = async (teamId: number, teamName: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('jwt');

      await axios.post(
        'http://152.7.176.23:3002/api/v1/join_team_requests',
        {
          team_id: teamId,
          assignment_id: advertisements[0]?.sign_up_topic?.assignment_id,
          comments: `Request to join ${teamName} for topic: ${topicName}`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequestStatus({ ...requestStatus, [teamId]: 'success' });
      alert(`Join request sent to ${teamName} successfully!`);
    } catch (err: any) {
      console.error('Error sending join request:', err);
      setRequestStatus({ ...requestStatus, [teamId]: 'error' });
      alert(err.response?.data?.message || 'Failed to send join request');
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading advertisements...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>
        Partner Advertisements for Topic: {topicName || `topic${topicId}`}
      </h2>

      {advertisements.length === 0 ? (
        <p className={styles.noAds}>No partner advertisements available for this topic.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Members</th>
              <th>Desired Qualifications</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {advertisements.map((signedUpTeam) => {
              const team = signedUpTeam.team;
              if (!team) return null;

              const members = team.users && team.users.length > 0
                ? team.users.map(u => u.name).join(', ')
                : 'No members yet';

              const qualifications = (signedUpTeam.comments_for_advertisement || 'I want a person').split(' &AND& ').join(', ');

              return (
                <tr key={signedUpTeam.id}>
                  <td>{team.name}</td>
                  <td>{members}</td>
                  <td>{qualifications}</td>
                  <td>
                    <Button
                      variant="link"
                      className={styles.linkButton}
                      onClick={() => handleRequestToJoin(team.id, team.name)}
                      disabled={requestStatus[team.id] === 'success'}
                    >
                      Request Invitation
                      <span className={styles.infoIcon} title="Send a request to join this team">
                        ℹ️
                      </span>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className={styles.actions}>
        <Button variant="link" className={styles.linkButton} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className={styles.footer}>
        <a href="/help" className={styles.link}>Help</a>
        <a href="https://expertiza.ncsu.edu" className={styles.link}>Papers on Expertiza</a>
      </div>
    </div>
  );
};

export default PartnerAdvertisements;
