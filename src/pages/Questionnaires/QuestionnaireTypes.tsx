import React, { useCallback, useEffect, useMemo, useState } from "react";
import Table from "components/Table/Table";
import { QuestionnaireTypes, QuestionnaireType } from "./QuestionnaireUtils";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";


interface TableRow {
  type: QuestionnaireType;
}

const QuestionnaireTypeTable: React.FC = () => {
  const data: TableRow[] = QuestionnaireTypes.map((type) => ({ type }));
  const navigate = useNavigate();

  const onCreate = (type: QuestionnaireType) => {
    // FIXME: Navigate to the Questionnaire's new form
    navigate(`/questionnaires/new?type=${encodeURIComponent(type)}`);
  };

  const columns: ColumnDef<TableRow>[] = [
    {
      header: "Questionnaire Type",
      accessorKey: "type",
      cell: (info) => info.getValue(),
      size: 500,
      minSize: 80,
      maxSize: 600,
    },
    {
      header: "Action",
      id: "action",
      cell: ({ row }) => {
        const type = row.original.type;
        return (

          // FIXME: Use "+" button instead (search assets)
          <button
            onClick={() => onCreate(type)}
            className="bg-blue-500 hover:bg-blue-600 text-black px-3 py-1 rounded"
          >
            Create
          </button>
        );
      },
    },
  ];


  // FIXME: Change the width of the table to span the container
  return (
    <Table
      data={data}
      columns={columns}
      showColumnFilter={false}
      showGlobalFilter={false}
      showPagination={data.length >= 10}
    />
  );
};

export default QuestionnaireTypeTable;