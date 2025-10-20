import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { dutyColumns, IDuty } from "./DutyColumns";
import { on, emit, EVENTS } from "utils/events";
import DutyDelete from "./DutyDelete";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

const Duties = () => {
    const { error, isLoading, data: DutiesResponse, sendRequest: fetchDuties } = useAPI();
    const auth = useSelector((s: RootState) => s.authentication);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [showDelete, setShowDelete] = useState<{ visible: boolean; data?: IDuty }>({ visible: false });
    const { data: UsersResponse, sendRequest: fetchUsers } = useAPI();

    useEffect(() => {
        fetchDuties({ url: `/duties` });   // baseURL adds /api/v1
    }, [fetchDuties, location]);

    useEffect(() => {
        fetchUsers({ url: `/users` });
    }, [fetchUsers]);


    useEffect(() => {
        const off = on(EVENTS.DUTIES_CHANGED, () => {
            fetchDuties({ url: `/duties` });
        });
        return off;
    }, [fetchDuties]);
    useEffect(() => {
        if (error) {
            // show the same alert style as Courses
            dispatch(alertActions.showAlert({ variant: "danger", message: error }));
        }
    }, [error, dispatch]);

    const onDeleteClose = useCallback(() => setShowDelete({ visible: false }), []);

    const onEditHandle = useCallback(
        (row: TRow<IDuty>) => navigate(`edit/${row.original.id}`),
        [navigate]
    );

    const onDeleteHandle = useCallback(
        (row: TRow<IDuty>) => setShowDelete({ visible: true, data: row.original }),
        []
    );

    const onRubricsHandle = useCallback((row: TRow<IDuty>) => {
        // Placeholder per your request — wire later
        dispatch(
            alertActions.showAlert({
                variant: "info",
                message: `Rubrics action for role "${row.original.name}" (ID ${row.original.id}) is coming soon.`,
            })
        );
    }, [dispatch]);

    const usersMap = useMemo(() => {
        const list = UsersResponse?.data || [];
        const map: Record<number, string> = {};
        for (const u of list) {
            map[u.id] = u.full_name || u.name || `User ${u.id}`;
        }
        return map;
    }, [UsersResponse?.data]);


    const tableColumns = useMemo(
        () => dutyColumns(onEditHandle, onDeleteHandle, onRubricsHandle, auth.user.id),
        [onDeleteHandle, onEditHandle, onRubricsHandle, auth.user.id]
    );

    const rawTableData: IDuty[] = useMemo(
        () => (isLoading || !DutiesResponse?.data ? [] : DutiesResponse.data),
        [DutiesResponse?.data, isLoading]
    );

    const enrichedData = useMemo(
        () =>
            rawTableData.map((d) => ({
                ...d,
                created_by: usersMap[d.instructor_id],
                created_at_fmt: d.created_at ? new Date(d.created_at).toLocaleDateString() : "",
            })),
        [rawTableData, usersMap]
    );

    // apply your “public + mine” filter AFTER enrichment
    const tableData = useMemo(
        () => enrichedData.filter((d) => !d.private || d.instructor_id === auth.user.id),
        [enrichedData, auth.user.id]
    );

    return (
        <>
            <Outlet />
            <main>
                <Container fluid className="px-md-4">
                    <Row className="mt-4 mb-4">
                        <Col className="text-center">
                            <h1 className="text-dark" style={{ fontSize: "2rem", fontWeight: 600 }}>
                                Manage Roles (Duties)
                                <OverlayTrigger
                                    placement="right"
                                    overlay={
                                        <Tooltip id="roles-duties-tooltip">
                                            Roles define a user's position and permissions within the system and are global across the application. Duties, on the other hand, represent specific tasks or responsibilities that are contextually assigned to users within assignments or teams.
                                        </Tooltip>
                                    }
                                >
                                    <Button
                                        variant="link"
                                        style={{
                                            textDecoration: "none",
                                            color: "#007bff",
                                            marginLeft: "8px",
                                            padding: "0",
                                            fontSize: "1.2rem",
                                        }}
                                    >
                                        ℹ️
                                    </Button>
                                </OverlayTrigger>
                            </h1>
                        </Col>
                    </Row>

                    {/* Create Role (Duty) */}
                    <Row>
                        <Col md={{ span: 1, offset: 11 }} style={{ paddingBottom: 10 }}>
                            <Button variant="outline-success" onClick={() => navigate("new")}>
                                +
                            </Button>
                        </Col>
                    </Row>

                    {/* Delete Modal */}
                    {showDelete.visible && (
                        <DutyDelete dutyData={showDelete.data!} onClose={onDeleteClose} />
                    )}

                    <Row>
                        <Table
                            showGlobalFilter={false}
                            data={tableData}
                            columns={tableColumns}
                            columnVisibility={{ id: false }}
                        />
                    </Row>
                </Container>
            </main>
        </>
    );
};

export default Duties;

// Lazy import at bottom to avoid circulars

