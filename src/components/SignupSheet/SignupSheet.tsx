import React, { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useSignupSheet } from '../../hooks/useSignupSheet';
import AdvertisementModal from './AdvertisementModal';
import { AdvertisementDetails, SignedUpTeam } from '../../utils/interfaces';
import styles from './SignupSheet.module.css';

const SignupSheet: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { topics, loading, error, refresh } = useSignupSheet(assignmentId || '');

  const [showModal, setShowModal] = useState(false);
  const [selectedAdvertisement, setSelectedAdvertisement] = useState<AdvertisementDetails | null>(null);

  // Get student ID from Redux store
  const user = useSelector((state: any) => state.authentication.user);
  const studentId = user?.id?.toString() || '';

  const handleAdvertisementClick = (
    signedUpTeam: SignedUpTeam,
    topic: AdvertisementDetails['topic']
  ) => {
    setSelectedAdvertisement({
      signedUpTeam,
      topic,
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAdvertisement(null);
  };

  const handleRequestSent = () => {
    // Refresh the signup sheet data
    refresh();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p style={{ marginTop: '15px' }}>Loading signup sheet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '50px' }}>
        <Alert variant="danger">
          <Alert.Heading>Error Loading Signup Sheet</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleBack}
              style={{
                background: 'transparent',
                border: '1px solid #dc3545',
                borderRadius: '3px',
                padding: '6px 12px',
                color: '#dc3545',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={styles.signupSheetContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: '1px solid #000',
              borderRadius: '3px',
              padding: '4px 8px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <h1 className={styles.title}>Signup Sheet</h1>
        </div>
      </div>

      {topics.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No topics available for signup at this time.
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.signupTable}>
            <thead>
              <tr>
                <th className={styles.narrowColumn}>#</th>
                <th>Topic name(s)</th>
                <th className={styles.narrowColumn}>Num. of slots</th>
                <th className={styles.narrowColumn}>Available slots</th>
                <th className={styles.narrowColumn}>Num. on waitlist</th>
                <th className={styles.narrowColumn}>Bookmarks</th>
                <th className={styles.narrowColumn}>Actions</th>
                <th className={styles.advertisementColumn}>Advertisement(s)</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topicData, index: number) => {
                const topic = topicData.topic;
                const advertisingTeams = topicData.signedUpTeams.filter(
                  (team: SignedUpTeam) => team.advertise_for_partner
                );

                return (
                  <tr key={topic.id}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    <td>
                      <div 
                        className={styles.topicName}
                        style={{ cursor: 'pointer', color: '#0066cc' }}
                        onClick={() => navigate(`/topics/${topic.id}/partner_advertisements`)}
                        title="Click to view partner advertisements for this topic"
                      >
                        {topic.topic_name}
                      </div>
                      {topic.description && (
                        <div className={styles.topicDescription}>{topic.description}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{topic.max_choosers || 0}</td>
                    <td style={{ textAlign: 'center' }}>
                      {topicData.availableSlots}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {topicData.waitlistCount}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button className={styles.iconButton}>
                        🔖
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        disabled={topicData.availableSlots === 0}
                        className={styles.actionButton}
                      >
                        Sign Up
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {advertisingTeams.length > 0 ? (
                        <div className={styles.advertisementCell}>
                          {advertisingTeams.map((team: SignedUpTeam, teamIndex: number) => (
                            <button
                              key={`${team.id}-${teamIndex}`}
                              className={styles.trumpetButton}
                              onClick={() => handleAdvertisementClick(team, topic)}
                              title="View teammate advertisement"
                            >
                              <span className={styles.trumpetIcon}>📢</span>
                            </button>
                          ))}
                          {advertisingTeams.length > 1 && (
                            <span className={styles.countBadge}>
                              {advertisingTeams.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Advertisement Modal */}
      <AdvertisementModal
        show={showModal}
        onHide={handleModalClose}
        advertisementData={selectedAdvertisement}
        assignmentId={assignmentId || ''}
        studentId={studentId}
        onRequestSent={handleRequestSent}
      />

      {/* Legend/Info Section */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Legend:</div>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>📢</span>
            <span>Team is advertising for partners</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSheet;
