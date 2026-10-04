import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Table from "components/Table/Table";
import { dutyColumns, IDuty } from "./DutyColumns";
import useAPI from "../../hooks/useAPI";
import { alertActions } from "../../store/slices/alertSlice";
import DutyEditor from "./DutyEditor";
import DutyDelete from "./DutyDelete";
import { RootState } from "store/store";
import { ROLE } from "utils/interfaces";

const Duties = () => {
    const { data: dutiesRes, error, isLoading, sendRequest: fetchDuties } = useAPI();
    const { data: usersRes, sendRequest: fetchUsers } = useAPI();
    const [showEditor, setShowEditor] = useState<{ visible: boolean; mode?: "create" | "update"; initial?: any }>({ visible: false });
    const [showDelete, setShowDelete] = useState<{ visible: boolean; duty?: IDuty }>({ visible: false });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const auth = useSelector((s: RootState) => s.authentication);

    // fetch duties (both public + mine). Support optional search/mine filters later via querystring
    useEffect(() => {
        fetchDuties({ url: `/duties` });
        fetchUsers({ url: `/users` });
        console.log("Fetching duties...");
    }, [fetchDuties, fetchUsers, location]);
    useEffect(() => {
        if (error) {
            dispatch(alertActions.showAlert({ variant: "danger", message: error }));
        }
    }, [error, dispatch]);

    // map duties with creator name
    const usersById = useMemo(() => {
        const arr = usersRes?.data || [];
        return new Map(arr.map((u: any) => [u.id, u.full_name || u.name || `User #${u.id}`]));
    }, [usersRes?.data]);

    const allDuties: IDuty[] = useMemo(() => (dutiesRes?.data || []), [dutiesRes?.data]);

    // “By creator” should list MY roles on top
    const sortWithMineOnTop = useCallback((rows: IDuty[]) => {
        const myId = auth.user?.id;
        return [...rows].sort((a, b) => {
            const aMine = a.instructor_id === myId ? 0 : 1;
            const bMine = b.instructor_id === myId ? 0 : 1;
            if (aMine !== bMine) return aMine - bMine; // mine first
            // default secondary sort by name
            return (a.name || "").localeCompare(b.name || "");
        });
    }, [auth.user?.id]);

    const tableData = useMemo(() => {
        const userId = auth.user?.id;
        const filteredDuties = (allDuties || []).filter(d => !d.private || d.instructor_id === userId);
        console.log("Table Data:", filteredDuties); // Debugging
        return filteredDuties;
    }, [allDuties, auth.user?.id]);

    // handlers
    const onEdit = useCallback((row: any) => {
        setShowEditor({ visible: true, mode: "update", initial: row.original });
    }, []);
    const onDelete = useCallback((row: any) => {
        setShowDelete({ visible: true, duty: row.original });
    }, []);
    const onCloseEditor = useCallback(() => setShowEditor({ visible: false }), []);
    const onCloseDelete = useCallback(() => setShowDelete({ visible: false }), []);

    const columns = useMemo(() => dutyColumns(onEdit, onDelete), [onEdit, onDelete]);

    return (
        <>
            <Outlet />
            <main>
                <Container fluid className="px-md-4">
                    <Row className="mt-4 mb-4">
                        <Col className="text-center">
                            <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: 600 }}>
                                Manage Duties
                            </h1>
                        </Col>
                    </Row>

                    {/* create new (+) like Courses/Assignments */}
                    <Row>
                        <Col md={{ span: 1, offset: 11 }} style={{ paddingBottom: "10px" }}>
                            <Button variant="outline-success" onClick={() => setShowEditor({ visible: true, mode: "create" })}>
                                +
                            </Button>
                        </Col>
                    </Row>

                    <Row>
                        <Table
                            data={tableData}
                            columns={columns}
                            showGlobalFilter={false}
                            showColumnFilter={true}
                            showPagination={true}
                        // your shared Table handles sorting/filtering/pagination/selection/expanders:contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5}:contentReference[oaicite:6]{index=6}
                        />
                    </Row>
                </Container>
            </main>

            {showEditor.visible && (
                <DutyEditor
                    mode={showEditor.mode!}
                    initial={showEditor.initial}
                    onClose={onCloseEditor}
                    fetchDuties={() => fetchDuties({ url: `/duties` })}
                />
            )}
            {showDelete.visible && showDelete.duty && (
                <DutyDelete duty={{ id: showDelete.duty.id, name: showDelete.duty.name }} onClose={onCloseDelete} fetchDuties={() => fetchDuties({ url: `/duties` })}  />
            )}
        </>
    );
};

export default Duties;