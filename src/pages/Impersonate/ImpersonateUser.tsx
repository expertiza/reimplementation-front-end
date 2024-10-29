import React, { useState, useEffect, useMemo } from "react";
import { Col, Row, InputGroup, Form, Button, Dropdown } from "react-bootstrap";
import useAPI from "hooks/useAPI";
import debounce from "lodash.debounce";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import { ILoggedInUser } from "../../utils/interfaces";
import { authenticationActions } from "../../store/slices/authenticationSlice";
import { useLocation, useNavigate } from "react-router-dom";
import { setAuthToken } from "../../utils/auth";
import masqueradeMask from "../../assets/masquerade-mask.png";

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
  const [impersonateActive, setImpersonateActive] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  // const [originalToken, setOriginalToken] = useState("");
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
          <Dropdown.Menu>
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
          <Dropdown.Menu>
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
    // Store only the initial User's JWT token and information
    if (!localStorage.getItem("originalUserToken")) {
      localStorage.setItem("originalUserToken", auth.authToken);
    }

    impersonateUser({
      method: "post",
      url: `/impersonate`,
      data: {
        impersonate_id: fetchSelectedUser?.data.userList[0]?.id,
      },
    });
  };

  // Impersonate user alert
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
      setImpersonateActive(true);
    }
  }, [impersonateUserResponse]);

  // Cancel impersonation
  const handleCancelImpersonate = () => {
    dispatch(
      authenticationActions.setAuthentication({
        authToken: localStorage.getItem("originalUserToken"),
        user: setAuthToken(localStorage.getItem("originalUserToken") || ""),
      })
    );
    localStorage.removeItem("originalUserToken");

    setImpersonateActive(false);
  };

  // Banner at the top of the screen indicating which user is being impersonated
  const ImpersonationBanner = () => {
    return (
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
            <img src={masqueradeMask} width={25} style={{ marginRight: 4 }} />
            <div>
              Impersonating a {impersonateUserResponse?.data.role} named{" "}
              {impersonateUserResponse?.data.name}
            </div>
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
              onClick={handleCancelImpersonate}
            >
              Cancel Impersonation
            </button>
          </div>
        </div>
      )
    );
  };

  return (
    <>
      {impersonateActive && <ImpersonationBanner />}
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
              disabled={!selectedValidUser}
            >
              Impersonate
            </Button>
            {debounceActive && <div className="loader"></div>}
          </InputGroup>
          {displayUserList()}
        </div>
      </div>
      <style>
        {`
          .loader {
            width: 50px;
            aspect-ratio: 1;
            display: grid;
            border-radius: 50%;
            background:
              linear-gradient(0deg ,rgb(0 0 0/50%) 30%,#0000 0 70%,rgb(0 0 0/100%) 0) 50%/8% 100%,
              linear-gradient(90deg,rgb(0 0 0/25%) 30%,#0000 0 70%,rgb(0 0 0/75% ) 0) 50%/100% 8%;
            background-repeat: no-repeat;
            animation: l23 1s infinite steps(12);
          }
          .loader::before,
          .loader::after {
            content: "";
            grid-area: 1/1;
            border-radius: 50%;
            background: inherit;
            opacity: 0.915;
            transform: rotate(30deg);
          }
          .loader::after {
            opacity: 0.83;
            transform: rotate(60deg);
          }
          @keyframes l23 {
            100% {transform: rotate(1turn)}
          }
        `}
      </style>
    </>
  );
};

export default ImpersonateUser;

