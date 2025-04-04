import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";
import { IEditor } from "../../utils/interfaces";
import { QuestionnaireFormValues } from "./QuestionnaireUtils";
import React, { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import useAPI from "hooks/useAPI";

interface IAlertProps {
  variant: string;
  title?: string;
  message: string;
}

const QuestionnaireEditor: React.FC<IEditor> = ({ mode }) => {
  const [alert, setAlert] = useState<IAlertProps | null>(null);
  const token = localStorage.getItem("token");
  const questionnaire :any = useLoaderData();


  // FIXME: Implement form for editing/creating an assignment
  return (
    <div>

    </div>
  )
};

export default QuestionnaireEditor;