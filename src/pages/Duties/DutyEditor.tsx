import { Form as FormikForm, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { Button, Modal, Form as RBForm } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import useAPI from "../../hooks/useAPI";
import FormInput from "components/Form/FormInput";
import { alertActions } from "../../store/slices/alertSlice";
import { HttpMethod } from "utils/httpMethods";
import React, { useState } from "react";

export interface IDutyFormValues {
    id?: number;
    name: string;
    private: boolean;
}

const schema = Yup.object({
    name: Yup.string().required("Required").min(3, "Min 3 chars").max(50, "Max 50 chars"),
});

type DutyEditorProps = {
    mode: "create" | "update";
    initial?: { id?: number; name?: string; private?: boolean };
    onClose?: () => void;
    fetchDuties?: () => void;
};

const DutyEditor: React.FC<DutyEditorProps> = ({ mode, initial, onClose, fetchDuties }) => {
    const { sendRequest } = useAPI();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [localError, setLocalError] = useState<string | null>(null);

    const onSubmit = async (values: IDutyFormValues, helpers: FormikHelpers<IDutyFormValues>) => {
        const payload = {
            name: values.name,
            private: values.private,
        };
        const url = mode === "create" ? "/duties" : `/duties/${initial?.id}`;
        const method = mode === "create" ? "POST" : "PATCH";

        try {
            await sendRequest({ url, method, data: { duty: payload } });
            helpers.setSubmitting(false);
            setLocalError(null);
            if (fetchDuties) {
                fetchDuties(); // Refresh the duties table when provided
            }
            dispatch(
                alertActions.showAlert({
                    variant: "success",
                    message: mode === "create" ? "New duty created successfully!" : "Duty updated successfully!",
                })
            );
            if (onClose) {
                onClose(); // Close the modal when used as a child component
            } else {
                navigate("/duties"); // Fallback when used as a route
            }
        } catch (err: any) {
            setLocalError(err.message || "An error occurred");
            helpers.setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            navigate("/duties");
        }
    };

    return (
        <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{mode === "update" ? "Edit Duty" : "Create Duty"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {localError && <div className="alert alert-danger">{localError}</div>}
                <Formik
                    initialValues={{
                        name: initial?.name || "",
                        private: initial?.private || false,
                    }}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                >
                    {({ values, handleChange, handleSubmit, isSubmitting }) => (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    value={values.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    id="private"
                                    name="private"
                                    className="form-check-input"
                                    checked={values.private}
                                    onChange={handleChange}
                                />
                                <label htmlFor="private" className="form-check-label">
                                    Private
                                </label>
                            </div>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {mode === "update" ? "Update Duty" : "Create Duty"}
                            </Button>
                        </form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default DutyEditor;