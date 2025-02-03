import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, InputGroup, Form, Button, Dropdown } from "react-bootstrap";
import useAPI from "hooks/useAPI";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import { authenticationActions } from "../../store/slices/authenticationSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuthToken } from "../../utils/auth";
import masqueradeMask from "../../assets/masquerade-mask.png";
import "./ImpersonateUser.css";

const ImpersonateUser: React.FC = () => {
  const { data: userResponse, sendRequest: fetchUsers } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { data: fetchSelectedUser, sendRequest: selectedUser } = useAPI();
  const { error, data: impersonateUserResponse, sendRequest: impersonateUser } = useAPI();
  const [searchQuery, setSearchQuery] = useState("");
  const [debounceActive, setDebounceActive] = useState(false);
  const [selectedValidUser, setSelectedValidUser] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user list once on component mount
  useEffect(() => {
    fetchUsers({
      method: "get",
      url: `/users/${auth.user.id}/managed`,
    });
  }, [fetchUsers, auth.user.id]);

  // Handle search query input change and trigger debounce
  const handleSearchQueryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typingTimeout) clearTimeout(typingTimeout);

    setSearchQuery(e.target.value);
    setDebounceActive(true);

    const timeout = setTimeout(() => {
      setDebounceActive(false);
    }, 300);

    setTypingTimeout(timeout);
  };

  // Debounce search query
  const debouncedSearch = useMemo(() => {
    return debounce(handleSearchQueryInput, 300);
  }, []);

  // Cleanup debounce function when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimeout) clearTimeout(typingTimeout);
      debouncedSearch.cancel();
    };
  }, [debouncedSearch, typingTimeout]);

  // Display user list after debounce (autocomplete functionality)
  const displayUserList = () => {
    if (!searchQuery.trim() || !userResponse?.data) {
      return null;
    }

    const userArray = Array.isArray(userResponse.data) ? userResponse.data : [userResponse.data];

    const filteredUserArray = userArray.filter((user: any) =>
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredUserArray.length > 0) {
      return (
        <Dropdown show>
          <Dropdown.Menu style={{ width: "calc(100% - 100px)" }}>
            {filteredUserArray.map((filteredUser: any) => (
              <Dropdown.Item
                key={filteredUser.id}
                onClick={() => setSearchQuery(filteredUser.name)}
              >
                {filteredUser.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return (
        <Dropdown show>
          <Dropdown.Menu style={{ width: "calc(100% - 100px)" }}>
            <Dropdown.Item> No Users Found </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }
  };

  // Fetch selected user based on the Search Query
  useEffect(() => {
    const userArray = Array.isArray(userResponse?.data) ? userResponse?.data : [userResponse?.data];

    const validUser = userArray?.find(
      (user: any) => searchQuery.toLowerCase() === (user?.name?.toLowerCase() || "")
    );

    // Don't initiate a GET if the searchQuery is empty
    if (searchQuery.trim() && validUser) {
      setSelectedValidUser(true);
      selectedUser({
        method: "get",
        url: `/impersonate/${encodeURIComponent(validUser.full_name)}`,
      });
    } else {
      setSelectedValidUser(false);
    }
  }, [selectedUser, searchQuery, userResponse]);

  // Impersonate user
  const handleImpersonate = () => {
    const fetchSelectedUserEntry = fetchSelectedUser?.data.userList[0];

    // Store only the initial User's JWT token and information
    if (!localStorage.getItem("originalUserToken")) {
      localStorage.setItem("originalUserToken", auth.authToken);
    }

    if (fetchSelectedUserEntry) {
      impersonateUser({
        method: "post",
        url: `/impersonate`,
        data: {
          impersonate_id: fetchSelectedUserEntry.id,
        },
      });
    } else {
      dispatch(
        alertActions.showAlert({
          variant: "danger",
          message: "Cannot impersonate the Super Adminstrator!",
        })
      );
    }
  };

  // Set Impersonation Message after the impersonateUser POST API call is complete
  useEffect(() => {
    if (impersonateUserResponse?.status === 200) {
      const fetchSelectedUserEntry = fetchSelectedUser?.data.userList[0];
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
    if (impersonateUserResponse?.data && fetchSelectedUser?.data) {
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
          <InputGroup className="impersonateUserGroup">
            <Form.Control
              id="impersonateUserEntry"
              placeholder="Enter the username of the user you wish to impersonate"
              aria-label="User Impersonation with Submit Button"
              value={searchQuery}
              onChange={handleSearchQueryInput}
            />

            <Button
              variant="secondary"
              id="button-addon2"
              onClick={handleImpersonate}
              disabled={!selectedValidUser}
            >
              Impersonate
            </Button>
            {debounceActive && <div className="loader"></div>}
          </InputGroup>
          {displayUserList()}
        </div>
      </div>
    </>
  );
};

export default ImpersonateUser;