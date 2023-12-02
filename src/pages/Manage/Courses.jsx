import { useState } from "react";
import MUIDataTable from "mui-datatables";
import { BsHouseAddFill } from "react-icons/bs";
import {Table,TableContainer,TableHead,TableBody,TableRow,TableCell,Paper,} from "@mui/material";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CustomTooltip from "./utils/Tooltip";
import EditModal from "./utils/Modal";
import { staticTableData, staticInnerrowData } from "./utils/data";

function Courses() {
  const [tableData, setTableData] = useState(staticTableData);
  const [innerrowData, setinnerrowData] = useState(staticInnerrowData);
  const [showModal, setShowModal] = useState(false);
  const [showInnerModal, setShowInnerModal] = useState(false);
  const [editRowData, setEditRowData] = useState({});
  const [editInnerRowData, setEditInnerRowData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [editedRowIndex, setEditedRowIndex] = useState(null);
  const [editedInnerRowIndex, setEditedInnerRowIndex] = useState(null);

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
    setShowModal(true);
    setEditRowData(tableData[rowData]);
    setEditedRowIndex(rowData);
  };

  const handleInnerEdit = (rowData, index) => {
    setShowInnerModal(true);
    setEditInnerRowData(rowData);
    setEditedInnerRowIndex(index);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditedData({});
  };

  const handleCloseInnerModal = () => {
    setShowInnerModal(false);
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

  const handleSaveInnerEdit = () => {
    let updatedInnerTableData = innerrowData;
    const editInnerRowDataArray = Object.values(editInnerRowData);
    updatedInnerTableData[editedInnerRowIndex] = editInnerRowDataArray;
    setinnerrowData(updatedInnerTableData);
    setShowInnerModal(false);
    setEditedData({});
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    setEditRowData({ ...editRowData, [index]: value });
  };

  const handleInnerInputChange = (e, index) => {
    const value = e.target.value;
    setEditInnerRowData({ ...editInnerRowData, [index]: value });
  };

  const handleDelete = (index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this course?");

    if (isConfirmed) {
      const updatedData = [...tableData];
      updatedData.splice(index, 1);
      setTableData(updatedData);
    }
  };

  const handleDelete_inner = (index) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this action?");

    if (isConfirmed) {
      const updatedData = [...innerrowData];
      updatedData.splice(index, 1);
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

  const action_inner = (rowData, index) => [
    <CustomTooltip
      key="edit"
      title="Edit"
      handler={handleInnerEdit}
      rowData={rowData}
      index={index}
      src="/assets/icons/edit.png"
    />,
    <CustomTooltip
      key="delete"
      title="Delete"
      handler={handleDelete_inner}
      rowData={rowData}
      src="/assets/icons/delete.png"
    />,
    <CustomTooltip
      key="copy"
      title="Copy"
      handler={handleCopy_inner}
      rowData={rowData}
      src="/assets/icons/copy.png"
    />,
    <CustomTooltip
      key="remove-from-course"
      title="Remove From Course"
      handler={handleCopy_inner}
      rowData={rowData}
      src="/assets/icons/book.PNG"
    />,
    <br />,
    <CustomTooltip
      key="add-participants"
      title="Add Participants"
      handler={handleAddPerson}
      rowData={rowData}
      src="/assets/icons/add-participant-24.png"
    />,
    <CustomTooltip
      key="create-teams"
      title="Create Teams"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/create-teams-24.png"
    />,
    <CustomTooltip
      key="assign-reviewers"
      title="Assign Reviewers"
      handler={handleAddGroup}
      rowData={rowData}
      src="/assets/icons/assign-reviewers-24.png"
    />,
    <CustomTooltip
      key="view-submission"
      title="View Submission"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/view-submissions-24.png"
    />,
    <CustomTooltip
      key="view-scores"
      title="View Scores"
      handler={handleLanguage}
      rowData={rowData}
      index={index}
      src="/assets/icons/view-scores-24.png"
    />,
    <br />,
    <CustomTooltip
      key="view-report"
      title="View Reports"
      handler={handleLanguage}
      rowData={rowData}
      index={index}
      src="/assets/icons/view-review-report-24.png"
    />,
  ];

  const action = (rowData, index) => [
    <CustomTooltip
      key="edit"
      title="Edit Course"
      handler={handleEdit}
      rowData={rowData}
      index={index}
      src="/assets/icons/edit.png"
    />,
    <CustomTooltip
      key="delete"
      title="Delete Course"
      handler={handleDelete}
      rowData={rowData}
      src="/assets/icons/delete.png"
    />,
    <CustomTooltip
      key="copy"
      title="Copy Course"
      handler={handleCopy}
      rowData={rowData}
      src="/assets/icons/copy.png"
    />,
    <br />,
    <CustomTooltip
      key="add-ta"
      title="Add TA"
      handler={handleAddPerson}
      rowData={rowData}
      src="/assets/icons/add_professor.png"
    />,
    <CustomTooltip
      key="create-assignment"
      title="Create Assignment"
      handler={handleAddGroup}
      rowData={rowData}
      src="/assets/icons/add_analytics.png"
    />,
    <CustomTooltip
      key="add-participants"
      title="Add Participant"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/add-participant-24.png"
    />,
    <CustomTooltip
      key="create-teams"
      title="Create Teams"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/create-teams-24.png"
    />,
    <CustomTooltip
      key="view-grade-summary"
      title="View Grade Summary"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/earth.png"
    />,
    <CustomTooltip
      key="view-aggregated-teammate-and-mentor-review"
      title="View Aggregated Teammate And Mentor Review"
      handler={handleLanguage}
      rowData={rowData}
      src="/assets/icons/view-submissions-24.png"
    />,
  ];

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
                    <TableCell align="left">
                      <strong>Institution</strong>
                    </TableCell>
                    <TableCell align="left">
                      <strong>Creation Date</strong>
                    </TableCell>
                    <TableCell align="left">
                      <strong>Updated Date</strong>
                    </TableCell>
                    <TableCell align="left">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {innerrowData.map((row, index) => (
                    <TableRow
                      key={index}
                      style={{ backgroundColor: index % 2 === 0 ? "white" : "#f9f9f9" }}
                    >
                      <TableCell component="th" scope="row">
                        {row[0]}
                      </TableCell>
                      <TableCell align="left">{row[1]}</TableCell>
                      <TableCell align="left">{row[2]}</TableCell>
                      <TableCell align="left">{row[3]}</TableCell>
                      <TableCell align="left">{action_inner(row, index)} </TableCell>
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
      <EditModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleSaveEdit={handleSaveEdit}
        handleInputChange={handleInputChange}
        editRowData={editRowData}
      />
      <EditModal
        showModal={showInnerModal}
        handleCloseModal={handleCloseInnerModal}
        handleSaveEdit={handleSaveInnerEdit}
        handleInputChange={handleInnerInputChange}
        editRowData={editInnerRowData}
      />
      <center style={{ padding: "20px" }}>
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable data={tableData} columns={columns} options={options} />
        </ThemeProvider>
      </center>
    </>
  );
}

export default Courses;
