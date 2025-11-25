import React, { FC, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useSignupSheet } from '../../hooks/useSignupSheet';
import AdvertisementSection from './AdvertisementSection';
import { AdvertisementDetails, SignedUpTeam } from '../../utils/interfaces';
import styles from './SignupSheet.module.css';

const SignupSheet: FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { topics, loading, error, refresh } = useSignupSheet(assignmentId || '');


  const [selectedAdvertisement, setSelectedAdvertisement] = useState<AdvertisementDetails | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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
    // Scroll to bottom to show the advertisement section
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleCloseAdvertisement = () => {
    setSelectedAdvertisement(null);
  };

  const handleRequestSent = () => {
    // Show success toast
    setShowSuccessToast(true);

    // Refresh the signup sheet data
    refresh();

    // Hide toast after 5 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
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
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          minWidth: '300px',
          maxWidth: '500px',
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowSuccessToast(false)}
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #28a745'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <strong>Join Request Sent!</strong>
                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  Your request to join the team has been submitted successfully. The team will review your request.
                </div>
              </div>
            </div>
          </Alert>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="link"
            onClick={handleBack}
            className={styles.linkButton}
          >
            Back
          </Button>
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
                <th className={styles.actionsColumn}>Actions</th>
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
                      <Button
                        variant="link"
                        disabled={topicData.availableSlots === 0}
                        className={styles.linkButton}
                      >
                        Sign Up
                      </Button>
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

      {/* Advertisement Section (Inline) */}
      {selectedAdvertisement && (
        <AdvertisementSection
          advertisementData={selectedAdvertisement}
          assignmentId={assignmentId || ''}
          studentId={studentId}
          onClose={handleCloseAdvertisement}
          onRequestSent={handleRequestSent}
        />
      )}

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
