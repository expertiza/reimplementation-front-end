import React, { Fragment, useState } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next"; // Import i18n hook
import { RootState } from "../store/store";
import { ROLE } from "../utils/interfaces";
import { hasAllPrivilegesOf } from "../utils/util";
import detective from "../assets/detective.png";

/**
 * @author Ankur Mundra on May, 2023
 */

const Header: React.FC = () => {
  const { t, i18n } = useTranslation(); // Initialize translations
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

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
          <div>{t("anonymized_view")}</div>
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
                <Nav.Link as={Link} to="/">{t("home")}</Nav.Link>
                {hasAllPrivilegesOf(auth.user.role, ROLE.ADMIN) && (
                  <NavDropdown title={t("administration")} id="basic-nav-dropdown">
                    <NavDropdown.Item as={Link} to="administrator/roles">{t("roles")}</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item as={Link} to="administrator/institutions">{t("institutions")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/instructors">{t("instructors")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/administrators">{t("administrators")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/super_administrators">{t("super_administrators")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="administrator/account_request">{t("pending_requests")}</NavDropdown.Item>
                  </NavDropdown>
                )}
                {hasAllPrivilegesOf(auth.user.role, ROLE.TA) && (
                  <NavDropdown title={t("manage")} id="basic-nav-dropdown">
                    <NavDropdown.Item as={Link} to="/users">{t("users")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/courses">{t("courses")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/assignments">{t("assignments")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/questionnaire">{t("questionnaire")}</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/edit-questionnaire">{t("edit_questionnaire")}</NavDropdown.Item>
                  </NavDropdown>
                )}
                <Nav.Link as={Link} to="/student_tasks">{t("assignments")}</Nav.Link>
                <Nav.Link as={Link} to="/profile">{t("profile")}</Nav.Link>
                <Nav.Link as={Link} to="/student_view">{t("student_view")}</Nav.Link>
                <Nav.Link as={Link} to="/view-team-grades">{t("grades_view")}</Nav.Link>
                <Nav.Link as={Link} to="#" onClick={() => setVisible(!visible)}>{t("anonymized_view")}</Nav.Link>
              </Nav>

              {/* Language Switcher */}
              <Button variant="outline-light" onClick={() => changeLanguage("en")}>🇺🇸 English</Button>
              <Button variant="outline-light" onClick={() => changeLanguage("hi")}>🇮🇳 हिंदी</Button>

              {visible ? (
                <Nav.Item className="text-light ps-md-3 pe-md-3">
                  {t("user")}: {auth.user.full_name}
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
                    <CustomBtn /> {t("user")}: Student 10592
                  </div>
                </Nav.Item>
              )}

              <Button variant="outline-light" onClick={() => navigate("/logout")}>{t("logout")}</Button>
            </Navbar.Collapse>
          </Container>
        )}
      </Navbar>
    </Fragment>
  );
};

export default Header;
