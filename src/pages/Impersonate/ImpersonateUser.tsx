import React, { useState } from "react";
import { IUserRequest } from "../../utils/interfaces";
import { Col, Row, InputGroup, Form, Button } from "react-bootstrap";
import useAPI from "hooks/useAPI";

const ImpersonateUser: React.FC = () => {
  const { error, isLoading, data: userResponse, sendRequest: fetchUsers } = useAPI();
  //const [searchQuery, setSearchQuery] = useState<string>("");
  //const [selectedUser, setSelectedUser] = useState<string>("");
  const [impersonate, setImpersonate] = useState<boolean>(true);

  // Impersonation banner
  /* const ImpersonationBanner = () => {
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
  }; */

  return (
    <>
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>Impersonate User</h1>
        </Col>
        <hr />
      </Row>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <InputGroup className="impersonateUserEntry">
            <Form.Control
              placeholder="Enter the username of the user you wish to impersonate"
              aria-label="User Impersonation with Submit Button"
            />
            <Button variant="outline-secondary" id="button-addon2">
              Impersonate
            </Button>
          </InputGroup>
        </div>
      </div>
    </>
  );
};

export default ImpersonateUser;
