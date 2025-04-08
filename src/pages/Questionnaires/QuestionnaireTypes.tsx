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
          // <button
          //   onClick={() => onCreate(type)}
          //   className="bg-blue-500 hover:bg-blue-600 text-black px-3 py-1 rounded"
          // >
          //   Create
          // </button>
          // <button
          //   onClick={() => onCreate(type)}
          //   className="bg-blue-500 hover:bg-blue-600 text-black px-3 py-1 rounded flex items-center justify-center"
          // >
          //   <IoIosAddCircle size={24} />
          // </button>
          // <IoIosAddCircle
          //   onClick={() => onCreate(type)}
          //   className="text-blue-500 hover:text-blue-600 cursor-pointer"
          //   size={24}
          // />
          // <IoIosAddCircle
          //   onClick={() => onCreate(type)}
          //   className="text-blue-500 hover:text-blue-600 cursor-pointer transition-all"
          //   size={24}
          // />
          <IoIosAddCircle
            onClick={() => onCreate(type)}
            style={{
              cursor: "pointer",
              transition: "all 0.2s",
              color: "#3b82f6", // Tailwind blue-500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#2563eb"; // Tailwind blue-600
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#3b82f6"; // Tailwind blue-500
            }}
            size={24}
          />

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