import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosClient from "../../utils/axios_client";
//import TextExample from '../../components/TextExample';
import useAPI from "hooks/useAPI";

import axios from "axios";
const Etc = () => {
    const { error, isLoading, data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
    const auth = useSelector(
        (state: RootState) => state.authentication,
        (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
        
    return (
        <>
        <div className="container">
            <div className="alert alert-success mt-4" role="alert">
                This is a success alert—check it out!
            </div>
            <div className="alert alert-danger" role="alert">
                This is a danger alert—check it out!
            </div>
        </div>
        </>
    );
};

export async function loadEtc() {
    const etcResponse = await axiosClient.get('assignments/etc')
    return etcResponse.data;
}

export default Etc;