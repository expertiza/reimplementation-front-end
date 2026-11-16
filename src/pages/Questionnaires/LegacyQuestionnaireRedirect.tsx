import { generatePath, Navigate, useParams } from "react-router-dom";

export default function LegacyQuestionnaireRedirect() {
  const { id } = useParams();
  return <Navigate to={generatePath("/questionnaires/edit/:id", { id: id! })} replace />;
}
