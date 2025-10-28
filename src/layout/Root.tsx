import { FC, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { RootState } from "../store/store";
import { getTokenDuration } from "../utils/auth";
import Header from "./Header";

/**
 * @author Ankur Mundra on May, 2023
 */
const RootLayout: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );

  useEffect(() => {
    if (auth.isAuthenticated) {
      const tokenDuration = getTokenDuration();
      const timer = setTimeout(() => navigate("/logout"), tokenDuration);
      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <Fragment>
      <Header />
      <main>
        <Outlet />
      </main>
    </Fragment>
  );
};

export default RootLayout;
