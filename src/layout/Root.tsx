import AlertMessage from "../components/Alert";
import { FC, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { alertActions } from "../store/slices/alertSlice";
import { RootState } from "../store/store";
import Header from "./Header";
import { getTokenDuration } from "../utils/auth";

/**
 * @author Ankur Mundra on May, 2023
 */
const RootLayout: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const alert = useSelector(
    (state: RootState) => state.alert,
    (prev, next) => prev.show === next.show
  );
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

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => dispatch(alertActions.hideAlert()), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert.show, dispatch]);

  return (
    <Fragment>
      <Header />
      {alert.show && (
        <AlertMessage variant={alert.variant} message={alert.message} title={alert.title} />
      )}
      <main>
        <Outlet />
      </main>
    </Fragment>
  );
};

export default RootLayout;
