import { Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAPI from "hooks/useAPI";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "store/store";
import { HttpMethod } from "utils/httpMethods";
import FormInput from "components/Form/FormInput";
import FormCheckBoxGroup from "components/Form/FormCheckBoxGroup";
import React, { useEffect, useMemo } from "react";
import { DutyFormValues, transformDutyRequest } from "./DutyUtil";
import { emit, EVENTS } from "utils/events";

const validationSchema = Yup.object({
    name: Yup.string()
        .required("Required")
        .min(3, "Role name must be at least 3 characters")
        .max(50, "Role name must be at most 50 characters"),
    visibility: Yup.array().of(Yup.string()).required(),   // <—
});

const dutyVisibility = [
    { label: "Private", value: "true" },
];

const DutyEditor: React.FC<{ mode: "create" | "update" }> = ({ mode }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const auth = useSelector((s: RootState) => s.authentication);

    const {
        data: dutyResp,
        error: dutyError,
        sendRequest: sendDutyRequest,
    } = useAPI();

    const {
        data: fetchResp,
        error: fetchErr,
        sendRequest: fetchDuty,
    } = useAPI();

    const isUpdate = mode === "update";

    // Load existing duty for edit
    useEffect(() => {
        if (isUpdate && id) {
            fetchDuty({ url: `/duties/${id}` });
        }
    }, [isUpdate, id, fetchDuty]);

    useEffect(() => {
        if (fetchErr) {
            dispatch(alertActions.showAlert({ variant: "danger", message: fetchErr }));
        }
    }, [fetchErr, dispatch]);

    useEffect(() => {
        if (dutyError) {
            dispatch(alertActions.showAlert({ variant: "danger", message: dutyError }));
        }
    }, [dutyError, dispatch]);

    const initialValues: DutyFormValues = useMemo(() => {
        if (isUpdate && fetchResp?.data) {
            const d = fetchResp.data;
            return {
                id: d.id,
                name: d.name ?? "",
                visibility: d.private ? ["true"] : [],          // <—
                instructor_id: d.instructor_id ?? auth.user?.id,
            };
        }
        return {
            name: "",
            visibility: [],                                    // <—
            instructor_id: auth.user?.id,
        };
    }, [isUpdate, fetchResp?.data, auth.user?.id]);


    // Success → toast + back to /duties
    useEffect(() => {
        if (dutyResp?.status && dutyResp.status >= 200 && dutyResp.status < 300) {
            // NEW: tell the list to refetch
            emit(EVENTS.DUTIES_CHANGED);

            dispatch(
                alertActions.showAlert({
                    variant: "success",
                    message: `Role ${initialValues.name} ${isUpdate ? "updated" : "created"} successfully!`,
                })
            );
            navigate(location.state?.from ? location.state.from : "/duties");
        }
    }, [dutyResp?.status, dispatch, initialValues.name, isUpdate, navigate, location.state]);

    const handleClose = () => navigate(location.state?.from ? location.state.from : "/duties");

    const onSubmit = (values: DutyFormValues, helpers: FormikHelpers<DutyFormValues>) => {
        let method: HttpMethod = HttpMethod.POST;
        let url = `/duties`;

        if (isUpdate && values.id) {
            method = HttpMethod.PATCH;
            url = `/duties/${values.id}`;
        }

        
        sendDutyRequest({
            url,
            method,
            data: transformDutyRequest(values), // <-- send { duty: { ... } }
            headers: { "Content-Type": "application/json" }, // (safe)
        });

        helpers.setSubmitting(false);
    };

    return (
        <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{isUpdate ? "Update Role (Duty)" : "Create Role (Duty)"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {dutyError && <p className="text-danger">{dutyError}</p>}

                <Formik
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    validationSchema={validationSchema}
                    validateOnChange={true}
                    enableReinitialize={true}
                >
                    {(formik) => (
                        <Form>
                            <FormInput controlId="duty-name" label="Name" name="name" />
                            {/* Use same checkbox group control for consistency with Courses */}
                            <FormCheckBoxGroup
                                controlId="duty-visibility"
                                label="Visibility"
                                name="visibility"
                                // Map boolean to checkbox group: checked => true
                                // This control expects array/values; we coerce via value/onChange under the hood in your shared control.
                                options={dutyVisibility}
                            />

                            {/* Placeholder “Rubrics” button as requested (no functionality yet) */}
                            <div className="d-flex justify-content-end mb-3">
                                <Button
                                    variant="outline-primary"
                                    type="button"
                                    onClick={() =>
                                        dispatch(
                                            alertActions.showAlert({
                                                variant: "info",
                                                message: "Rubric creation/editing flow coming soon.",
                                            })
                                        )
                                    }
                                >
                                    Rubrics
                                </Button>
                            </div>

                            <Modal.Footer>
                                <Button variant="outline-secondary" onClick={handleClose}>
                                    Close
                                </Button>
                                <Button
                                    variant="outline-success"
                                    type="submit"
                                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                                >
                                    {isUpdate ? "Update Role" : "Create Role"}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default DutyEditor;
