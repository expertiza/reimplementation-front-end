import { TableSection } from "./TableSection.jsx";
import useOpenController from "../../../../hooks/useOpenController.js"
import { useState,useEffect } from "react";
type User = {
  id: number;
  unityId: string;
};

type Team = {
  [teamName: string]: User[];
};


export const TeamTable = ({teams}:{teams:any}) : React.ReactNode => {

  const [teamData, setTeamData] = useState<Team | null>(null);
  const { isOpen, toggle } = useOpenController(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://64460e44ee791e1e29f5be26.mockapi.io/api/v1/name/testing2');
        const data = await response.json();
        delete data[data.length-1].id
        setTeamData(data[data.length-1])
      } catch (error) {
        console.error('Error fetching team data:', error);
      }
    };
    fetchData();
  }, []);

  const handleEditTeamName = (oldTeamName: string, newTeamName: string) => {
    if (teamData && newTeamName !== null && newTeamName.trim() !== '') {
      const updatedTeamData = { ...teamData };
      updatedTeamData[newTeamName] = updatedTeamData[oldTeamName];
      delete updatedTeamData[oldTeamName];
      setTeamData(updatedTeamData);
      sendTeamDataToServer(updatedTeamData);
    }
  };

  const handleAddNewUser = (teamName: string) => {
    if (teamData) {
      const newUnityId = prompt('Enter the Unity ID for the new user');
      if (newUnityId) {
        const newUser: User = {
          id: teamData[teamName].length + 1, // Using timestamp as a simple way to generate a unique ID
          unityId: newUnityId,
        };

        const updatedTeamData = { ...teamData };
        updatedTeamData[teamName].push(newUser);
        setTeamData(updatedTeamData);
        sendTeamDataToServer(updatedTeamData);
      }
    }
  };

  const handleDeleteUser = (teamName: string, userId: number) => {
    if (teamData) {
      const updatedTeamData = { ...teamData };
      updatedTeamData[teamName] = updatedTeamData[teamName].filter((user) => user.id !== userId);
      setTeamData(updatedTeamData);
      sendTeamDataToServer(updatedTeamData);
    }
  };

  const handleCreateNewTeam = () => {
    const newTeamName = prompt('Enter the name for the new team');
    if (newTeamName) {
      if (teamData) {
        const updatedTeamData = { ...teamData, [newTeamName]: [] };
        setTeamData(updatedTeamData);
        sendTeamDataToServer(updatedTeamData);
      }
    }
  };

  const handleDeleteTeam = (teamName: string) => {
    if (teamData) {
      const updatedTeamData = { ...teamData };
      delete updatedTeamData[teamName];
      setTeamData(updatedTeamData);
      sendTeamDataToServer(updatedTeamData);
    }
  };

  const sendTeamDataToServer = async (data: Team) => {
    try {
      // Replace this URL with your server endpoint
      await fetch('https://64460e44ee791e1e29f5be26.mockapi.io/api/v1/name/testing2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error sending team data to the server:', error);
    }
  };

  if (!teamData) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <table>
      <thead>
        <tr>
        <th></th>
        <th>Team Name</th>
        <th></th>
        <th>Actions</th>
        </tr>
      </thead>
      {Object.entries(teamData).map(([teamName, users]) => (
        <TableSection handleAddNewUser={handleAddNewUser} handleDeleteUser={handleDeleteUser} handleDeleteTeam={handleDeleteTeam} handleEditTeamName={handleEditTeamName}personDetails={users} index={teamName} />
      ))}
    </table>
    <button onClick={handleCreateNewTeam}>Create New Team</button>
    </>
  );
};