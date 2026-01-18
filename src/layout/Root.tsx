import { FC, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import AlertMessage from "../components/Alert";
import { RootState } from "../store/store";
import { getTokenDuration } from "../utils/auth";
import Header from "./Header";
import { alertActions } from "../store/slices/alertSlice";

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
  const alertState = useSelector((state: RootState) => state.alert);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const tokenDuration = getTokenDuration();
      const timer = setTimeout(() => navigate("/logout"), tokenDuration);
      return () => clearTimeout(timer);
    }
  }, [auth.isAuthenticated, navigate]);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (!alertState.show) return;
    const timeout = setTimeout(() => {
      dispatch(alertActions.hideAlert());
    }, 5000);
    return () => clearTimeout(timeout);
  }, [alertState.show, dispatch]);

  return (
    <Fragment>
      <Header />
      <main>
        {alertState.show && (
          <div className="w-100 mt-2">
            <AlertMessage
              variant={alertState.variant}
              title={alertState.title}
              message={alertState.message}
            />
          </div>
        )}
        <Outlet />
      </main>
    </Fragment>
  );
};

export default RootLayout;
