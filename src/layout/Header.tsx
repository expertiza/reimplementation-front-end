import { Fragment } from "react";
import { Button, Container, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

/**
 * @author Ankur Mundra on May, 2023
 */

const Header = () => {
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
        <Navbar.Brand as={Link} to="/">
          <img
            src={`${process.env.PUBLIC_URL}/assets/images/wolf.png`}
            className="d-inline-block align-top"
            alt="wolf"
            height="40"
          />
        </Navbar.Brand>
        <Container>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <NavDropdown title="Administration" id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="roles">
                  Roles
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="institutions">
                  Institutions
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="instructors">
                  Instructors
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="administrators">
                  Administrators
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="super_administrators">
                  Super Administrators
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="account_request">
                  Pending Requests
                </NavDropdown.Item>
              </NavDropdown>

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
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/impersonate">
                  Impersonate User
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="#">
                  Anonymized View
                </NavDropdown.Item>
              </NavDropdown>
              <Nav.Link as={Link} to="/student_tasks">
                Assignments
              </Nav.Link>
              <Nav.Link as={Link} to="/profile">
                Profile
              </Nav.Link>
              <Nav.Link as={Link} to="/student_view">
                Student View
              </Nav.Link>
            </Nav>

            <Form className="d-flex">
              <Form.Control
                type="search"
                placeholder="Search"
                className="me-2"
                aria-label="Search"
              />
              <Button variant="dark">Search</Button>
            </Form>
            <Nav.Item className="text-light ps-md-3">User: Ankur</Nav.Item>
          </Navbar.Collapse>
        </Container>

        <Nav.Link as={Link} to="/logout" className="text-light">
          Logout
        </Nav.Link>
      </Navbar>
    </Fragment>
  );
};

export default Header;
