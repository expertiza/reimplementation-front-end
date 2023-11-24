import { MdOutlineExpandMore } from "react-icons/md";
export const ExpendableButton = ({ isOpen, toggle }) => {
  return (
    <button onClick={toggle}>
        <MdOutlineExpandMore size={25}/>
    </button>
  );
};