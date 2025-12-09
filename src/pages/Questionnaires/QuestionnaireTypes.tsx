import React from "react";
import Table from "components/Table/Table";
import { QuestionnaireTypes, QuestionnaireType } from "./QuestionnaireUtils";
import { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { IoIosAddCircle } from "react-icons/io";
import useAPI from "hooks/useAPI";
import { useEffect } from "react";
import { useMemo } from "react";


interface TableRow {
  type: QuestionnaireType;
}

interface QuestionnaireTypeTableProps {
  onCloseModal?: () => void;
}

const QuestionnaireTypeTable: React.FC<QuestionnaireTypeTableProps> = ({ onCloseModal }) => {
  const { data: questionnaireTypes, sendRequest: fetchQuestionnaireTypes } = useAPI();
  useEffect(() => {
      
        fetchQuestionnaireTypes({ url: "/questionnaire_types" });
      
    }, [fetchQuestionnaireTypes]);
  
    const data: TableRow[] = useMemo(() => {
    if (questionnaireTypes?.data?.length) {
      return questionnaireTypes.data.map((t: any) => ({
        type: t.name ?? t // handle case where backend returns object or string
      }));
    }
    return QuestionnaireTypes.map((t) => ({ type: t }));
  }, [questionnaireTypes]);


   const navigate = useNavigate();

  const onCreate = (type: QuestionnaireType) => {
    if (onCloseModal) {
      console.log("Closing modal");
      onCloseModal(); // close the modal
    }
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
