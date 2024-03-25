import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { loadAssignment } from 'pages/Assignments/AssignmentUtil';

// Lazy load the StudentTaskView component
const LazyStudentTaskView = React.lazy(() => import('./StudentTaskView'));

const LazyLoadedStudentTaskView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<any>(null); // State for assignment data

  useEffect(() => { // Fetch assignment data on component mount
    const fetchAssignment = async () => {
      try {
        const assignmentData = await loadAssignment({ params: { id } });
        setAssignment(assignmentData);
      } catch (error) {
        console.error('Error fetching assignment:', error);
      }
    };

    fetchAssignment(); // Call fetchAssignment function

    return () => {
      // Cleanup code here
    };
  }, [id]); // Include id in the dependency array to re-fetch assignment data when ID changes

  if (!assignment) { // If assignment data hasn't been fetched yet, display loading message
    return <div>Loading...</div>;
  }

  return (
    <Suspense fallback={<div>Loading Student Task View...</div>}>
      <LazyStudentTaskView />
    </Suspense>
  );
};

export default LazyLoadedStudentTaskView;
