import React, { useState } from "react";
import MUIDataTable from "mui-datatables";
import { BsHouseAddFill } from "react-icons/bs";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { Button, Col, Container, Modal, Row, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function Courses() {
  const [tableData, setTableData] = useState([
    [
      "CSC/ECE 517, Fall 2023",
      "North Carolina State University",
      "Aug 31 2023 - 10:09 PM",
      "Aug 31 2023 - 10:09 PM",
    ],
    [
      "CSC/ECE 506, Summer 2023",
      "North Carolina State University",
      "May 23 2023 - 06:04 PM",
      "May 23 2023 - 06:04 PM",
    ],
    [
      "CSC/ECE 517, Spring 2023",
      "North Carolina State University",
      "Dec 29 2022 - 11:40 PM",
      "Dec 29 2022 - 11:40 PM",
    ],
    [
      "CSC/ECE 506, Spring 2023",
      "North Carolina State University",
      "Dec 29 2022 - 11:39 PM",
      "Dec 29 2022 - 11:39 PM",
    ],
  ]);

  const [innerrowData, setinnerrowData] = useState([
    ["Final project (and design doc)", "-", "2023-11-10", "2023-11-10"],
    ["Design exercise", "-", "2023-10-05", "2023-10-06"],
    ["OSS Project and documentation", "-", "2023-09-30", "2023-09-30"],
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editRowData, setEditRowData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [editedRowIndex, setEditedRowIndex] = useState(null);

  const navigate = useNavigate();
  const getMuiTheme = () =>
    createTheme({
      components: {
        MUIDataTable: {
          styleOverrides: {
            root: {
              backgroundColor: "#A8A8A8",
            },
            head: {
              fontWeight: "bold",
              backgroundColor: "#A8A8A8",
            },
          },
        },

        MuiTableCell: {
          styleOverrides: {
            head: {
              fontWeight: "bold",
              backgroundColor: "#A8A8A8",
            },
          },
        },
      },
    });
  const handleEdit = (rowData) => {
    console.log(rowData)
    setShowModal(true);
    setEditRowData(tableData[rowData]);
    setEditedRowIndex(rowData);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    let updatedTableData = tableData;
    const editRowDataArray = Object.values(editRowData);
    updatedTableData[editedRowIndex] = editRowDataArray;
    setTableData(updatedTableData);
    setShowModal(false);
    setEditedData({});
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    setEditRowData({ ...editRowData, [index]: value });
  };

  const handleDelete = (index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this course?");

    if (isConfirmed) {
      const updatedData = [...tableData];
      console.log(updatedData)
      updatedData.splice(index, 1);
      setTableData(updatedData);
    }
  };

  const handleDelete_inner = (index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this assignment?");
    
    if (isConfirmed) {
      const updatedData = [...innerrowData];
      console.log(updatedData)
      updatedData.splice(index, 1);
      console.log(updatedData)
      setinnerrowData(updatedData);
    }
  };

  const handleAddPerson = (rowData) => {
    console.log("Add Person:", Math.random());
  };

  const handleAddGroup = (rowData) => {
    console.log("Add Group:", Math.random());
  };

  const handleLanguage = (rowData) => {
    console.log("Language:", Math.random());
  };

  const handleCopy = (rowData) => {
    console.log("Copy row:", rowData);
    const copiedRowData = tableData[rowData];
    const updatedTableData = [...tableData];
    updatedTableData.splice(rowData + 1, 0, [...copiedRowData]);
    setTableData(updatedTableData);
  };

  const handleCopy_inner = (rowData) => {
    console.log("Copy row:", rowData);
    const rowIndex = innerrowData.findIndex((row) => row === rowData);
    const copiedRowData = innerrowData[rowIndex];
    const updatedTableData = [...innerrowData];
    updatedTableData.splice(rowIndex + 1, 0, [...copiedRowData]);
    setinnerrowData(updatedTableData);
  };

  const action_inner = (rowData) => [
    <Tooltip key="edit" title="Edit Course">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleEdit(rowData)}
      >
        <img
          src="/assets/icons/edit.png"
          alt="Edit"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="delete" title="Delete Course">
    <Button
      style={{
        padding: '6px',
        color: 'default',
        backgroundColor: 'white',
        border: 'none',
      }}
      onClick={() => handleDelete_inner(rowData)}
    >
      <img
        src="/assets/icons/delete.png"
        alt="Delete"
        style={{ width: '20px', height: '20px' }}
      />
    </Button>
  </Tooltip>,
    <Tooltip key="copy" title="Copy Course">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleCopy_inner(rowData)}
      >
        <img
          src="/assets/icons/copy.png"
          alt="Copy"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="add-person" title="Add Person">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleAddPerson(rowData)}
      >
        <img
          src="/assets/icons/add-participant-24.png"
          alt="Add Person"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="add-analytics" title="Add Group">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleAddGroup(rowData)}
      >
        <img
          src="/assets/icons/add_analytics.png"
          alt="Add Analytics"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="add-professor" title="Add Professor">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img
          src="/assets/icons/add_professor.png"
          alt="Add Professor"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="create-teams" title="Create Teams">
    <Button
      style={{
        padding: '6px',
        color: 'default',
        backgroundColor: 'white',
        border: 'none',
      }}
      onClick={() => handleLanguage(rowData)}
    >
      <img
        src="/assets/icons/create-teams-24.png"
        alt="Create Teams"
        style={{ width: '20px', height: '20px' }}
      />
    </Button>
  </Tooltip>,
  <Tooltip key="earth" title="Earth">
  <Button
    style={{
      padding: '6px',
      color: 'default',
      backgroundColor: 'white',
      border: 'none',
    }}
    onClick={() => handleLanguage(rowData)}
  >
    <img
      src="/assets/icons/earth.png"
      alt="Earth"
      style={{ width: '20px', height: '20px' }}
    />
  </Button>
</Tooltip>,
<Tooltip key="view-submission" title="View Submission">
      <Button
        style={{
          padding: '6px',
          color: 'default',
          backgroundColor: 'white',
          border: 'none',
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img
          src="/assets/icons/view-submissions-24.png"
          alt="View Submission"
          style={{ width: '20px', height: '20px' }}
        />
      </Button>
    </Tooltip>,
  ];


  const action = (rowData) => [
    <Tooltip key="edit" title="Edit Course">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleEdit(rowData)}
      >
        <img src="/assets/icons/edit.png" alt="Edit" style={{ width: "20px", height: "20px" }} />
      </Button>
    </Tooltip>,
    <Tooltip key="delete" title="Delete Course">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleDelete(rowData)}
      >
        <img
          src="/assets/icons/delete.png"
          alt="Delete"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="copy" title="Copy Course">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleCopy(rowData)}
      >
        <img src="/assets/icons/copy.png" alt="Copy" style={{ width: "20px", height: "20px" }} />
      </Button>
    </Tooltip>,
    <Tooltip key="add-person" title="Add Person">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleAddPerson(rowData)}
      >
        <img
          src="/assets/icons/add-participant-24.png"
          alt="Add Person"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="add-analytics" title="Add Group">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleAddGroup(rowData)}
      >
        <img
          src="/assets/icons/add_analytics.png"
          alt="Add Analytics"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="add-professor" title="Add Professor">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img
          src="/assets/icons/add_professor.png"
          alt="Add Professor"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="create-teams" title="Create Teams">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img
          src="/assets/icons/create-teams-24.png"
          alt="Create Teams"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
    <Tooltip key="earth" title="Earth">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img src="/assets/icons/earth.png" alt="Earth" style={{ width: "20px", height: "20px" }} />
      </Button>
    </Tooltip>,
    <Tooltip key="view-submission" title="View Submission">
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => handleLanguage(rowData)}
      >
        <img
          src="/assets/icons/view-submissions-24.png"
          alt="View Submission"
          style={{ width: "20px", height: "20px" }}
        />
      </Button>
    </Tooltip>,
  ];


  // function createData(name, institution, creation_date, updated_date, action) {
  //   return { name, institution, creation_date, updated_date, action };
  // }

  // const rows = [
  //   createData("Final project (and design doc)", "-", "2023-11-10", "2023-11-10", action_inner),
  //   createData("Design exercise", "-", "2023-10-05", "2023-10-06", action_inner),
  //   createData("OSS Project and documentation", "-", "2023-09-30", "2023-09-30", action_inner),
  // ]; 

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
      options: {
        customBodyRenderLite: action,
      },
    },
  ];

  const options = {
    download: false,
    print: false,
    viewColumns: false,
    stripedRows: true,
    filter: false,
    selectableRows: "none",
    filterType: "dropdown",
    responsive: "scrollMaxHeight",
    rowsPerPage: 10,
    expandableRows: true,
    renderExpandableRow: (rowData, rowMeta) => {
      const colSpan = rowData.length + 1;
      return (
        <TableRow>
          <TableCell colSpan={colSpan}>
            <TableContainer component={Paper}>
              <Table>
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
                  {innerrowData.map((row, index) => (
                    <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9' }}>
                      <TableCell component="th" scope="row">
                        {row[0]} {/* Display Assignment Name */}
                      </TableCell>
                      <TableCell align="right">
                        {row[1]} {/* Display Institution */}
                      </TableCell>
                      <TableCell align="right">
                        {row[2]} {/* Display Creation Date */}
                      </TableCell>
                      <TableCell align="right">
                        {row[3]} {/* Display Updated Date */}
                      </TableCell>
                      <TableCell align="right">
                        {action_inner(row)} {/* Pass the entire row data to the action function */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TableCell>
        </TableRow>
      );
    },
  };


  return (
    <>
      <Container fluid className="px-md-4">
        <Row className="mt-md-2 mb-md-2">
          <Col className="text-center">
            <h1>Manage Courses</h1>
          </Col>
          <hr />
        </Row>
        <Row>
          <Col md={{ span: 1, offset: 11 }}>
            <Button variant="outline-success" onClick={() => navigate("new")}>
              <BsHouseAddFill />
            </Button>
          </Col>
        </Row>
      </Container>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Row</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                defaultValue={editRowData[0]}
                onChange={(e) => handleInputChange(e, 0)}
              />
            </Form.Group>
            <Form.Group controlId="institution">
              <Form.Label>Institution</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Institution"
                defaultValue={editRowData[1]}
                onChange={(e) => handleInputChange(e, 1)}
              />
            </Form.Group>
            <Form.Group controlId="creationDate">
              <Form.Label>Creation Date</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Creation Date"
                defaultValue={editRowData[2]}
                onChange={(e) => handleInputChange(e, 2)}
              />
            </Form.Group>
            <Form.Group controlId="updatedDate">
              <Form.Label>Updated Date</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Updated Date"
                defaultValue={editRowData[3]}
                onChange={(e) => handleInputChange(e, 3)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <center style={{ padding: "20px" }}>
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable data={tableData} columns={columns} options={options} />
        </ThemeProvider>
      </center>
    </>
  );
}

export default Courses;
