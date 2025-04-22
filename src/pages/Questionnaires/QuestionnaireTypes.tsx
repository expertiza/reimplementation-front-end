import React, { useCallback, useEffect, useMemo, useState } from "react";
import Table from "components/Table/Table";
import { QuestionnaireTypes, QuestionnaireType } from "./QuestionnaireUtils";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { IoIosAddCircle } from "react-icons/io";


interface TableRow {
  type: QuestionnaireType;
}

const QuestionnaireTypeTable: React.FC = () => {
  const data: TableRow[] = QuestionnaireTypes.map((type) => ({ type }));
  const navigate = useNavigate();

  const onCreate = (type: QuestionnaireType) => {
    // Navigate to the Questionnaire's new form
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
          <IoIosAddCircle
            onClick={() => onCreate(type)}
            style={{
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#3b82f6",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#3b82f6";
            }}
            size={24}
          />
        );
      },
    },
  ];

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