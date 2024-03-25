// Define styles for the StudentTaskView component
export const styles = {
    timeline: {
      listStyleType: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    li: {
      transition: 'all 200ms ease-in',
      height: '140px',
    },
    timestamp: {
      marginBottom: '40px', 
    },
    status: {
      display: 'flex',
      justifyContent: 'center',
      borderTop: '2px solid #D6DCE0',
      position: 'relative' as const,
      transition: 'all 200ms ease-in',
    },
    statusP: {
      marginTop: '20px',
      padding: '10px', 
    },
    statusBefore: {
      content: "''",
      width: '25px',
      height: '25px',
      backgroundColor: 'white',
      borderRadius: '25px',
      border: '1px solid #ddd',
      position: 'absolute' as const,
      top: '-15px',
      left: '8%',
      transition: 'all 200ms ease-in',
    },
    completeStatus: {
      borderTop: '2px solid #A90201',
    },
    completeStatusBefore: {
      backgroundColor: '#A90201',
      border: 'none',
      transition: 'all 200ms ease-in',
    },
    scrollable: {
      height: 'auto',
      overflowY: 'auto' as const,
    },
  };
  