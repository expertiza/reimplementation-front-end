// import { useCallback, useMemo, useState } from "react";
// import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
// import Table from "components/Table/Table";
// import { Row as TRow } from "@tanstack/react-table";
// import { Tab, Tabs, Col, Container, Row } from "react-bootstrap";
// import { BsPlusSquareFill } from "react-icons/bs";
// import { roleColumns as ROLE_COLUMNS } from "./teamColumns";
// import {ITeam} from "../../../../utils/interfaces";
// const Teams = () => {
//     const tableData = [
//         { id: 1, name: "John", age: 30 },
//         { id: 2, name: "Alice", age: 25 },
//         { id: 3, name: "Bob", age: 35 },
//         { id: 4, name: "Eve", age: 28 },
//       ];
//       const navigate = useNavigate();
//       const roles: any = useLoaderData();
    
      
//       const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
//         visible: boolean;
//         data?: ITeam;
//       }>({ visible: false });
    
//       const onDeleteRoleHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);
    
//       const onEditHandle = useCallback(
//         (row: TRow<ITeam>) => navigate(`edit/${row.original.id}`),
//         [navigate]
//       );
    
//       const onDeleteHandle = useCallback(
//         (row: TRow<ITeam>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
//         []
//       );
    
//       const tableColumns = useMemo(
//         () => ROLE_COLUMNS(onEditHandle, onDeleteHandle),
//         [onDeleteHandle, onEditHandle]
//       );
//     return (
//         <>
//         <Container fluid className="px-md-4">          
//           <Row>
//             <Table
//               data={tableData}
//               columns={tableColumns}
//               tableSize={{ span: 6, offset: 3 }}
//               showColumnFilter={false}
//               showPagination={false}
//             />
//           </Row>
//         </Container>
//         </>
//     )
// };

// export default Teams;

import {info} from "../data/info"
import { TableSection } from "./TableSection";

export const Teams = () => {
  return (
    <table>
      <thead>
        <td></td>
        <th>Team Name</th>
        <th></th>
        <th>Actions</th>
      </thead>
      {info.map((personDetails, index) => (
        <TableSection personDetails={personDetails} index={index} />
      ))}
    </table>
  );
};

export default Teams;