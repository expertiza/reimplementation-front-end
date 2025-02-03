import React, { Fragment, useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import useAPI from "hooks/useAPI";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RootState } from "../store/store";
import { alertActions } from "store/slices/alertSlice";
import { ROLE } from "../utils/interfaces";
import { hasAllPrivilegesOf } from "../utils/util";
import { authenticationActions } from "../store/slices/authenticationSlice";
import { setAuthToken } from "../utils/auth";
import detective from "../assets/detective.png";

/**
 * @author Ankur Mundra on May, 2023
 */

const Header: React.FC = () => {
  const { data: userResponse, sendRequest: fetchUsers } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

const impersonateUserPayload = localStorage.getItem("impersonateBannerMessage");

useEffect(() => {
        fetchUsers({
        method: "get",
        url: `/users/${auth.user.id}/managed`,
      });
    }, [fetchUsers, auth.user.id]);

const ImpersonateBanner = () => {
  const [impersonateName, setImpersonateName] = useState("");
  const { error, data: impersonateUserResponse, sendRequest: impersonateUser } = useAPI();
  const handleImpersonate = (value: string) => {
      if (!userResponse || !userResponse.data) {
          console.error("userResponse is undefined or does not have data.");
          return;
      }
      const matchedUser = userResponse.data.find((user: { name: string }) => user.name === value);
      if (matchedUser) {
          console.log("Match found:", matchedUser.id);
          impersonateUser({
              method: "post",
              url: `/impersonate`,
              data: {
                impersonate_id: matchedUser.id,
              },
          });
      } else {
          console.log("No match found for", value);
          dispatch(
              alertActions.showAlert({
                variant: "danger",
                message: "Invalid Request!",
              })
            );
      }
  };

  // Set Impersonation Message after the impersonateUser POST API call is complete
  useEffect(() => {
    if (impersonateUserResponse?.status === 200) {
      const impersonateMessage =
        "impersonate..."
      localStorage.setItem("impersonateBannerMessage", impersonateMessage);
    }
  }, [impersonateUserResponse]);

  // Handle any uncaught user impersonation errors
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  // Impersonate user authentication
  useEffect(() => {
    if (impersonateUserResponse?.data) {
      dispatch(
        authenticationActions.setAuthentication({
          authToken: impersonateUserResponse.data.token,
          user: setAuthToken(impersonateUserResponse.data.token),
        })
      );

      navigate(location.state?.from ? location.state.from : "/");
      navigate(0);
    }
  }, [impersonateUserResponse]);

  const handleCancelImpersonate = () => {
    dispatch(
      authenticationActions.setAuthentication({
        authToken: localStorage.getItem("originalUserToken"),
        user: setAuthToken(localStorage.getItem("originalUserToken") || ""),
      })
    );

    localStorage.removeItem("originalUserToken");
    localStorage.removeItem("impersonateBannerMessage");

    navigate(location.state?.from ? location.state.from : "/");
    navigate(0);
  };

  return (
      <li id="impersonate" style={{ backgroundColor: 'transparent', padding: 0, listStyle: 'none', marginBottom: -20}}>
        <div className="input-group">
          <input
            type="text"
            id="inputImpersonateBox"
            value={impersonateName}
            placeholder="impersonate..."
            onChange={(e) => setImpersonateName(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    handleImpersonate(impersonateName); // Call the impersonate API on "Enter"
                }
            }}
            style={{
              backgroundColor: 'white',  /* White background */
              border: '1px solid #24a0ed', /* Border */
              padding: '3px 8px',        /* Reduced padding */
              height: '28px',            /* Reduced height */
              fontSize: '14px',          /* Reduced font size */
              width: '110px',            /* Fixed width to fit placeholder */
              outline: 'none',          /* Remove default outline */
            }}
           />
          <span className="input-group-btn" style={{ margin: 0, padding: 0 }}>
            <button
              type="button"
              className="btn btn-primary"
              id="impersonate-button"
              onClick={handleCancelImpersonate}
              style={{
                padding: '3px 8px',  /* Reduced padding */
                height: '28px',      /* Same height as the input */
                fontSize: '14px',    /* Same font size as the input */
                display: 'flex',
                alignItems: 'center', /* Vertically center the text in the button */
              }}
            >
              Revert
            </button>
          </span>
        </div>
      </li>
  );
};

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
            src={`${process.env.PUBLIC_URL}/assets/images/wolf.png`}
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
              {impersonateUserPayload && <ImpersonateBanner />}
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
