import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import useAPI from "../../hooks/useAPI";
import { useDispatch } from "react-redux";
import { alertActions } from "../../store/slices/alertSlice";

const DutyDelete: React.FC<{ duty: { id: number; name: string }; onClose: () => void; fetchDuties: () => void }> = ({
    duty,
    onClose,
    fetchDuties,
}) => {
    const { sendRequest } = useAPI();
    const dispatch = useDispatch();

    const [localError, setLocalError] = useState<string | null>(null);
    const [show, setShow] = useState(true);

    const deleteHandler = async () => {
        try {
            await sendRequest({ url: `/duties/${duty.id}`, method: "DELETE" });
            setShow(false);
            setLocalError(null);
            fetchDuties(); // Refresh the duties table
            dispatch(alertActions.showAlert({ variant: "success", message: `Duty ${duty.name} deleted successfully!` }));
            onClose();
        } catch (err: any) {
            setLocalError(err.message || "Failed to delete duty");
        }
    };

    const closeHandler = () => {
        setShow(false);
        onClose();
    };

    return (
        <Modal show={show} onHide={closeHandler} centered>
            <Modal.Header closeButton>
                <Modal.Title>Delete Duty</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {localError && <div className="alert alert-danger">{localError}</div>}
                Are you sure you want to delete <b>{duty.name}</b>?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={closeHandler}>
                    Cancel
                </Button>
                <Button variant="outline-danger" onClick={deleteHandler}>
                    Delete
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DutyDelete;