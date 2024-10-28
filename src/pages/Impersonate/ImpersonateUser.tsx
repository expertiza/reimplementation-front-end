import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, InputGroup, Form, Button, Dropdown } from "react-bootstrap";
import useAPI from "hooks/useAPI";
import debounce from "lodash.debounce";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const ImpersonateUser: React.FC = () => {
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { data: fetchUsersResponse, sendRequest: fetchUsers } = useAPI();
  const { data: impersonateUserResponse, sendRequest: impersonateUser } = useAPI();
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceActive, setDebounceActive] = useState(false);
  const [impersonateActive, setImpersonateActive] = useState(false);

  // Fetch user list once on component mount
  useEffect(() => {
    fetchUsers({
      method: "get",
      url: `/impersonate/${auth.user.name}`,
    });
  }, [fetchUsers, auth.user.name]);

  // Handle search query input change and trigger debounce
  const handleSearchQueryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setDebounceActive(true);
  };

  // Debounce search query
  const debouncedSearch = useMemo(() => {
    return debounce(handleSearchQueryInput, 300);
  }, []);

  // Cleanup debounce function when component unmounts
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      setDebounceActive(false);
    };
  }, [debouncedSearch]);

  // Display user list after debounce (autocomplete functionality)
  const displayUserList = () => {
    return (
      debounceActive &&
      searchQuery.trim() &&
      fetchUsersResponse?.data && (
        <Dropdown.Menu>
          {fetchUsersResponse.data
            .filter((user: any) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((filteredUser: any) => (
              <Dropdown.Item key={filteredUser.id}>{filteredUser.user_name}</Dropdown.Item>
            ))}
        </Dropdown.Menu>
      )
    );
  };

  // Impersonate user
  const handleImpersonate = () => {
    setImpersonateActive(true);
    impersonateUser({
      method: "post",
      url: "/impersonate",
      data: {
        impersonate_id: searchQuery,
      },
    });
  };

  const ImpersonationBanner = () => {
    impersonateUserResponse?.data && (
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
          <img src={"../../assets/masquerade-mask.png"} width={25} style={{ marginRight: 4 }} />
          <div>Impersonating a {impersonateUserResponse?.data.role} named {impersonateUserResponse?.data.name}</div>
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
          >
            x
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {impersonateActive && ImpersonationBanner}
      <Row className="mt-md-2 mb-md-2">
        <Col className="text-center">
          <h1>Impersonate User</h1>
        </Col>
        <hr />
      </Row>
      <div className="row justify-content-center">
        <div className="col-md-6">
          <InputGroup className="impersonateUserGroup">
            <Form.Control
              id="impersonateUserEntry"
              placeholder="Enter the username of the user you wish to impersonate"
              aria-label="User Impersonation with Submit Button"
              value={searchQuery}
              onChange={handleSearchQueryInput}
            />
            <Button
              variant="outline-secondary"
              id="button-addon2"
              onClick={handleImpersonate}
              disabled={impersonateActive}
            >
              Impersonate
            </Button>
          </InputGroup>
          {displayUserList()}
        </div>
      </div>
    </>
  );
};

export default ImpersonateUser;
