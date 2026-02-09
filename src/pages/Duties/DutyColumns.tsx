import { createColumnHelper, Row } from "@tanstack/react-table";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

export interface IDuty {
    id: number;
    name: string;
    instructor_id: number;
    private: boolean;
}

type Fn = (row: Row<IDuty>) => void;

const ch = createColumnHelper<IDuty>();

export const dutyColumns = (handleEdit: Fn, handleDelete: Fn) => [
    ch.accessor("name", {
        id: "name",
        header: () => (
            <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>
                Name
            </span>
        ),
        cell: info => <div className="text-start py-2">{info.getValue()}</div>,
        enableSorting: true,
        enableColumnFilter: true,
        enableGlobalFilter: true,
    }),
    ch.display({
        id: "actions",
        header: () => (
            <span className="text-start fw-bold" style={{ color: "#000", fontSize: "1.17em" }}>
                Actions
            </span>
        ),
        cell: ({ row }) => (
            <div className="d-flex justify-content-start gap-2 py-2">
                <OverlayTrigger overlay={<Tooltip>Edit Duty</Tooltip>}>
                    <Button variant="link" onClick={() => handleEdit(row)} aria-label="Edit Duty" className="p-0">
                        <img src={"/assets/images/edit-icon-24.png"} alt="Edit" style={{ width: 25, height: 20 }} />
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger overlay={<Tooltip>Delete Duty</Tooltip>}>
                    <Button variant="link" onClick={() => handleDelete(row)} aria-label="Delete Duty" className="p-0">
                        <img src={"/assets/images/delete-icon-24.png"} alt="Delete" style={{ width: 25, height: 20 }} />
                    </Button>
                </OverlayTrigger>
            </div>
        ),
    }),
];