import React, { Fragment, useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { ROLE } from "../utils/interfaces";
import { hasAllPrivilegesOf } from "../utils/util";
import detective from "../assets/detective.png";

/**
 * @author Ankur Mundra on May, 2023
 */

const Header: React.FC = () => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();

  const [visible, setVisible] = useState(true);

  const CustomBtn = () => {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          color: "#333",
          padding: "10px 4px",
          borderRadius: 4,
          marginRight: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img src={detective} width={25} style={{ marginRight: 4 }} />
          <div>Anonymized View</div>
          <button
            style={{
              background: "none",
              border: "none",
              padding: 1,
              marginLeft: 6,
              backgroundColor: "red",
              borderRadius: 50,
              color: "white",
              width: 18,
              fontSize: 10,
              fontWeight: 800,
            }}
            onClick={() => setVisible(!visible)}
          >
            x
          </button>
        </div>
      </div>
    );
  };

  // useEffect(() => {
  //   console.log(visible, 'Changed');
  // }, [visible]);

  return (
    <Fragment>
      <Navbar
        collapseOnSelect
        bg="wolf-red navbar-dark"
        variant="dark"
        expand="lg"
        sticky="top"
        className="px-4 fw-semibold"
      >
        <Navbar.Brand>
          <img
            src="/assets/images/wolf.png"
            className="d-inline-block align-top"
            alt="wolf"
            height="40"
          />
        </Navbar.Brand>

        {auth.isAuthenticated && (
          <Container>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/">
                  Home
                </Nav.Link>
                {hasAllPrivilegesOf(auth.user.role, ROLE.ADMIN) && (
                  <NavDropdown title="Administration" id="basic-nav-dropdown">
                    <NavDropdown.Item as={Link} to="administrator/roles">
                      Roles
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="administrator/institutions">
                      Institutions
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/instructors">
                      Instructors
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/administrators">
                      Administrators
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/super_administrators">
                      Super Administrators
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/account_request">
                      Pending Requests
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                {hasAllPrivilegesOf(auth.user.role, ROLE.TA) && (
                  <NavDropdown title="Manage" id="basic-nav-dropdown">
                    <NavDropdown.Item as={Link} to="/users">
                      Users
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/courses">
                      Courses
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/assignments">
                      Assignments
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/questionnaire">
                      Questionnaire
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/edit-questionnaire">
                      Edit Questionnaire
                    </NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="/impersonate">
                      Impersonate User
                    </NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="#">
                      Anonymized View
                    </NavDropdown.Item>
                  </NavDropdown>
                )}
                <Nav.Link as={Link} to="/student_tasks">
                  Assignments
                </Nav.Link>
                <Nav.Link as={Link} to="/profile">
                  Profile
                </Nav.Link>
                <Nav.Link as={Link} to="/student_view">
                  Student View
                </Nav.Link>
                <Nav.Link as={Link} to="/view-team-grades">
                  Grades View
                </Nav.Link>
                <Nav.Link as={Link} to="#" onClick={() => setVisible(!visible)}>
                  Anonymized View
                </Nav.Link>
              </Nav>
              {visible ? (
                <Nav.Item className="text-light ps-md-3 pe-md-3">
                  User: {auth.user.full_name}
                </Nav.Item>
              ) : (
                <Nav.Item className="text-light ps-md-3 pe-md-3">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CustomBtn /> User: Student 10592
                  </div>
                </Nav.Item>
              )}
              <Button variant="outline-light" onClick={() => navigate("/logout")}>
                Logout
              </Button>
            </Navbar.Collapse>
          </Container>
        )}
      </Navbar>
    </Fragment>
  );
};

export default Header;
