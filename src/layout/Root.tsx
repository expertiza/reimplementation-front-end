import AlertMessage from "components/Alert";
import { FC, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "store/store";
import Header from "./Header";

/**
 * @author Ankur Mundra on May, 2023
 */
const RootLayout: FC = () => {
  const dispatch = useDispatch();
  const alert = useSelector((state: RootState) => state.alert);

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
