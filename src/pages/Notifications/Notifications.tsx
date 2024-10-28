import { useCallback, useMemo, useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Row as TRow } from "@tanstack/react-table";
import useAPI from "hooks/useAPI";
import Table from "components/Table/Table";
import { notificationColumns as NOTIFICATION_COLUMNS } from "./NotificationColumns";
import axiosClient from "../../utils/axios_client";
import NotificationDelete from "./NotificationDelete";
import { BsPlusSquareFill } from "react-icons/bs";
import { INotification } from "../../utils/interfaces";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import React from "react";

// Mock Data to be used instead of actual API calls
const mockNotifications: INotification[] = [
    {
        id: "1",
        course: "CS101",
        subject: "New Homework",
        description: "Homework 1 due next week",
        expirationDate: "2024-10-31",
        isActive: true,
    },
    {
        id: "2",
        course: "CS102",
        subject: "Class Canceled",
        description: "No class tomorrow",
        expirationDate: "2024-11-01",
        isActive: false,
    },
    {
        id: "3",
        course: "CS103",
        subject: "Exam scheduled",
        description: "Please prepare for the exam",
        expirationDate: "2024-11-05",
        isActive: true,
    },
    // Add more mock notifications as needed
];

const mockAssignedCourses = ["CS101", "CS102", "CS103"]; // Courses assigned to the TA

const Notifications = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Fetch the current authenticated user
    const auth = useSelector(
        (state: RootState) => state.authentication,
        (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );

    // const { error, isLoading, data: notificationsResponse, sendRequest: fetchNotifications } = useAPI();

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
        visible: boolean;
        data?: INotification;
    }>({ visible: false });

    // Filter notifications based on assigned courses
    const filteredNotifications = mockNotifications.filter((notification) =>
        mockAssignedCourses.includes(notification.course)
    );

    /*
    useEffect(() => {
        if (!showDeleteConfirmation.visible) fetchNotifications({ url: `/notifications/${auth.user.id}` });
    }, [fetchNotifications, location, showDeleteConfirmation.visible, auth.user.id]);
    */

    // Error alert
    /*
    useEffect(() => {
        if (error) {
            dispatch(alertActions.showAlert({ variant: "danger", message: error }));
        }
    }, [error, dispatch]);
     */

    // Use mock data instead of fetching from an API
    // const notificationsResponse = { data: mockNotifications };

    const onDeleteNotificationHandler = useCallback(
        () => setShowDeleteConfirmation({ visible: false }),
        []
    );

    const onEditHandle = useCallback(
        (row: TRow<INotification>) => navigate(`edit/${row.original.id}`),
        [navigate]
    );

    const onDeleteHandle = useCallback(
        (row: TRow<INotification>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
        []
    );

    const tableColumns = useMemo(
        () => NOTIFICATION_COLUMNS(onEditHandle, onDeleteHandle),
        [onDeleteHandle, onEditHandle]
    );

    /*
    const tableData = useMemo(
        () => (isLoading || !notificationsResponse?.data ? [] : notificationsResponse.data),
        [notificationsResponse?.data, isLoading]
    );
     */

    // Use mock data instead of fetching data
    /*
    const tableData = useMemo(
        () => (notificationsResponse ? notificationsResponse.data : []),
        [notificationsResponse]
    );
     */

    const tableData = useMemo(() => filteredNotifications, [filteredNotifications]);

    return (
        <>
            <Outlet />
            <main>
                <Container fluid className="px-md-4">
                    <Row className="mt-md-2 mb-md-2">
                        <Col className="text-center">
                            <h1>Manage Notifications</h1>
                        </Col>
                        <hr />
                    </Row>
                    <Row>
                        <Col md={{ span: 1, offset: 8 }}>
                            <Button variant="outline-success" onClick={() => navigate("new")}>
                                <BsPlusSquareFill />
                            </Button>
                        </Col>
                        {showDeleteConfirmation.visible && (
                            <NotificationDelete
                                notificationData={showDeleteConfirmation.data!}
                                onClose={onDeleteNotificationHandler}
                            />
                        )}
                    </Row>
                    <Row>
                        <Table
                            data={tableData}
                            columns={tableColumns}
                            showColumnFilter={false}
                            columnVisibility={{ id: false }}
                            tableSize={{ span: 8, offset: 3 }}
                        />
                    </Row>
                </Container>
            </main>
        </>
    );
};

/*
export async function loadNotifications() {
    const notificationsResponse = await axiosClient.get("/notifications");
    return await notificationsResponse.data;
}
 */

export default Notifications;
