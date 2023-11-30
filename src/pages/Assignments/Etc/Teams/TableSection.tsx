import { ExpendableButton } from "./ExpendableButton";
import { UserRow } from "./UserRow";
import useOpenController from "../../../../hooks/useOpenController"
import {FcPlus} from 'react-icons/fc';
import {GiCrossMark} from 'react-icons/gi';
import {MdOutlineEdit} from 'react-icons/md';

export const TableSection = ({handleAddNewUser,handleDeleteUser ,handleDeleteTeam,handleEditTeamName,personDetails,index}:{handleAddNewUser:any,handleDeleteUser:any ,handleDeleteTeam:any,handleEditTeamName:any,personDetails:any,index:any}): React.ReactNode => {
  
  const { isOpen, toggle } = useOpenController(false);
  return (
    <tbody>
      <tr>
        <td className="button-td">
          <ExpendableButton isOpen={isOpen} toggle={toggle} />
        </td>
        <td>
        
          <b>{index}</b>
        </td>
        <td></td>
        <td>
            {/* Button */}
            <button onClick={() => handleAddNewUser(index)}>
              <FcPlus size={20}/>
            </button>
            <span> </span>
            <button onClick={() => handleDeleteTeam(index)}>
            <GiCrossMark color="red" size={20}/>
            </button>
            <span> </span>
            <button onClick={() => handleEditTeamName(index, prompt('Enter new team name') || index)}>
              <MdOutlineEdit style={{color: '#bf721f'}} size={20}></MdOutlineEdit>
            </button>
          </td>
      </tr>
      {isOpen && <UserRow handleDeleteUser={handleDeleteUser} personDetails={personDetails} teamName={index}/>}
    </tbody>
  );
};
