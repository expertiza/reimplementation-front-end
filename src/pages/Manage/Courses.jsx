import React from "react";
import MUIDataTable from "mui-datatables";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import LanguageIcon from "@mui/icons-material/Language";
import Tooltip from "@mui/material/Tooltip";

function Courses() {
  const action = (
    <>
      <Tooltip title="Edit Course">
        <ModeEditIcon className="m-2" />
      </Tooltip>
      <Tooltip title="Delete Course">
        <CloseIcon className="m-2" />
      </Tooltip>
      <Tooltip title="Copy Course">
        <ContentCopyIcon className="m-2" />
      </Tooltip>
      <br />
      <Tooltip title="Add Person">
        <PersonAddIcon className="m-2" />
      </Tooltip>
      <Tooltip title="Add Group">
        <GroupAddIcon className="m-2" />
      </Tooltip>
      <Tooltip title="Language">
        <LanguageIcon className="m-2" />
      </Tooltip>
    </>
  );
  const columns = [
    {
      name: "Name",
    },
    {
      name: "Institution",
    },
    {
      name: "Creation Date",
    },
    {
      name: "Updated Date",
    },
    {
      name: "Actions",
    },
  ];
  const data = [
    [
      "CSC/ECE 517, Fall 2023",
      "North Carolina State University",
      "Aug 31 2023 - 10:09 PM",
      "Aug 31 2023 - 10:09 PM",
      action,
    ],
    [
      "CSC/ECE 506, Summer 2023",
      "North Carolina State University",
      "May 23 2023 - 06:04 PM",
      "May 23 2023 - 06:04 PM",
      action,
    ],
    [
      "CSC/ECE 517, Spring 2023",
      "North Carolina State University",
      "Dec 29 2022 - 11:40 PM",
      "Dec 29 2022 - 11:40 PM",
      action,
    ],
    [
      "CSC/ECE 506, Spring 2023",
      "North Carolina State University",
      "Dec 29 2022 - 11:39 PM",
      "Dec 29 2022 - 11:39 PM",
      action,
    ],
  ];

  function createData(name, institution, creation_date, updated_date, actions) {
    return { name, institution, creation_date, updated_date, actions };
  }

  const rows = [
    createData("Final project (and design doc)", "-", "2023-11-10", "2023-11-10", action),
    createData("Design exercise", "-", "2023-10-05", "2023-10-06", action),
    createData("OSS Project and documentation", "-", "2023-09-30", "2023-09-30", action),
  ];

  const options = {
    filter: true,
    selectableRows: "single",
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    rowsPerPage: 10,
    expandableRows: true,
    renderExpandableRow: () => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={6}>
              <TableContainer component={Paper}>
                <Table style={{ minWidth: "650" }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Assignment Name</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Institution</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Creation Date</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Updated Date</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="right">{row.institution}</TableCell>
                        <TableCell align="right">{row.creation_date}</TableCell>
                        <TableCell align="right">{row.updated_date}</TableCell>
                        <TableCell align="right">{row.actions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </td>
          </tr>
        </React.Fragment>
      );
    },
    page: 1,
  };

  return (
    <>
      <center>
        <MUIDataTable title={"Manage Courses"} data={data} columns={columns} options={options} />
      </center>
    </>
  );
}

export default Courses;
