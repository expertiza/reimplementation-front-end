// Notifications.tsx
import { useCallback, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button, Col, Container, Row } from "react-bootstrap";
import Table from "components/Table/Table";
import { notificationColumns as NOTIFICATION_COLUMNS } from "./NotificationColumns";
import { mockNotifications } from "./mock_data";
import NotificationDelete from "./NotificationDelete";
import { BsPlusSquareFill } from "react-icons/bs";
import { INotification, ROLE } from "../../utils/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { hasAllPrivilegesOf } from "utils/util";
import React from "react";
import { Row as TRow } from "@tanstack/react-table";

const mockAssignedCourses = ["CS101", "CS102", "CS103"]; 

const Notifications = () => {
    const navigate = useNavigate();
    const auth = useSelector((state: RootState) => state.authentication);

    const [notifications, setNotifications] = useState<INotification[]>(mockNotifications);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
        visible: boolean;
        data?: INotification;
    }>({ visible: false });

    const filteredNotifications = useMemo(
        () => notifications.filter((notification) =>
            mockAssignedCourses.includes(notification.course)
        ),
        [notifications]
    );

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

    // Toggle the isActive status of a notification
    const handleToggle = (row: TRow<INotification>, newIsActive: boolean) => {
        setNotifications((prevNotifications) =>
            prevNotifications.map((notification) =>
                notification.id === row.original.id
                    ? { ...notification, isActive: newIsActive }
                    : notification
            )
        );
    };

    const tableColumns = useMemo(
        () => NOTIFICATION_COLUMNS(onEditHandle, onDeleteHandle, true, handleToggle),
        [onDeleteHandle, onEditHandle]
    );

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
                    {hasAllPrivilegesOf(auth.user.role, ROLE.TA) && (
                        <>
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
                                    data={filteredNotifications}
                                    columns={tableColumns}
                                    showColumnFilter={false}
                                    columnVisibility={{ id: false }}
                                    tableSize={{ span: 12, offset: 3 }}
                                />
                            </Row>
                        </>
                    )}
                    {!hasAllPrivilegesOf(auth.user.role, ROLE.TA) && (
                        <h1>Notification changes not allowed</h1>
                    )}
                </Container>
            </main>
        </>
    );
};

export default Notifications;
