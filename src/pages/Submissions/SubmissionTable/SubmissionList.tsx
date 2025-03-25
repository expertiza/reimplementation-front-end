import Table from "components/Table/Table";
import { useMemo } from "react";
import SubmissionEntry from "./SubmissionEntry";

const SubmissionList = ({ submissions, onGradeClick }: { submissions: any[], onGradeClick: (id: number) => void }) => {
  
  const columns = useMemo(() => SubmissionEntry({ onGradeClick }), [onGradeClick]);

  return (
    <div className="table-container" style={{ width: "100%", overflowX: "auto", fontSize: "15px", lineHeight: "1.428em" }}>
      <Table
        data={submissions}
        columns={columns}
        columnVisibility={{
          id: false,
        }}
        showGlobalFilter={false}
        showColumnFilter={false}
        disableGlobalFilter={true}
      />
    </div>
  );
};

export default SubmissionList;
