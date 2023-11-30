import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosClient from "../../utils/axios_client";
import useAPI from "hooks/useAPI";


const Etc = () => {
    return (
        <>   
        <Outlet />
        </>
    );
};

// export async function loadAssignReviewers() {
//     const etcResponse = await axiosClient.get('assignments/etc/assignReviewer')
//     return etcResponse.data;
// }

export default Etc;