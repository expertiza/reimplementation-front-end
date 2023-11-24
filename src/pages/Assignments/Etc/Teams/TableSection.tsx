import { ExpendableButton } from "./ExpendableButton";
import { TableRow } from "./TableRow";
import useOpenController from "../../../../hooks/useOpenController";
import {FcPlus} from 'react-icons/fc';
import {GiCrossMark} from 'react-icons/gi';
import {MdOutlineEdit} from 'react-icons/md';

export const TableSection = ({ personDetails, index }) => {
  const { isOpen, toggle } = useOpenController(false);
  return (
    <tbody>
      <tr>
        <td className="button-td">
          <ExpendableButton isOpen={isOpen} toggle={toggle} />
        </td>
        <td>
          <b>Team : {index}</b>
        </td>
        <td></td>
        <td></td>
        <td>
          {/* Button */}
          <FcPlus size={20}/>
          <span> </span>
          <GiCrossMark color="red" size={20}/>
          <span> </span>
            <MdOutlineEdit style={{color: '#bf721f'}} size={20}></MdOutlineEdit>
        </td>
      </tr>
      {isOpen && <TableRow personDetails={personDetails} />}
    </tbody>
  );
};
