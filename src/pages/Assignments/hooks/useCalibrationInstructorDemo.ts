// DEMO_INSTRUCTOR_RESPONSE
//
// Demo-only hook: wires the "Begin" button on the Calibration tab to the
// backend's mock-seeding endpoint. When the instructor clicks "Begin", this
// hook POSTs to `…/:map_id/mock_instructor_response`, which materialises a
// submitted instructor calibration Response (and a small set of peer student
// responses) so the calibration report has data to display.
//
// Lives in its own file (and its own Demo-prefixed hook) so:
//   * AssignmentEditor stays free of mock-data plumbing.
//   * Deleting the demo is a single file delete + removing the import from
//     AssignmentEditor and swapping the Begin <button> back to a plain anchor.
//
// REMOVAL CHECKLIST when the real instructor-review form ships:
//   Every line is tagged `DEMO_INSTRUCTOR_RESPONSE` so a repo-wide search
//   will find them all:
//
//     rg DEMO_INSTRUCTOR_RESPONSE
//
//   Frontend (this repo):
//     1. Delete this file (src/pages/Assignments/hooks/useCalibrationInstructorDemo.ts).
//     2. In AssignmentEditor.tsx:
//        a. Remove `import useCalibrationInstructorDemo from './hooks/useCalibrationInstructorDemo';`
//        b. Remove the `const { handleBeginCalibrationReview } = useCalibrationInstructorDemo(...)` call.
//        c. In the Calibration table's Review column cell, replace the demo <button>:
//              <button onClick={() => handleBeginCalibrationReview(mapId)}>Begin</button>
//           with a plain anchor pointing at the real review form:
//              <a style={linkStyle} href={`${reviewBase}/begin`}>Begin</a>
//
//   Backend (reimplementation-back-end-1):
//     4. Delete app/services/demo/calibration_instructor_seeder.rb.
//     5. Delete app/controllers/demo/calibration_instructor_responses_controller.rb.
//     6. Remove the `mock_instructor_response` route from config/routes.rb.

import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { alertActions } from "../../../store/slices/alertSlice";
import useAPI from "../../../hooks/useAPI";
import { HttpMethod } from "../../../utils/httpMethods";

interface UseCalibrationInstructorDemoOptions {
  assignmentId: number | string | null | undefined;
  onSuccess: () => void; // called after a successful seed so the table refreshes
}

export default function useCalibrationInstructorDemo({
  assignmentId,
  onSuccess,
}: UseCalibrationInstructorDemoOptions) {
  const dispatch = useDispatch();
  const {
    data: beginCalibrationResponse,
    error: beginCalibrationError,
    sendRequest: sendBeginCalibrationRequest,
  } = useAPI();

  const handleBeginCalibrationReview = useCallback(
    (mapId: number | string | null | undefined) => {
      if (!assignmentId || !mapId) return;
      sendBeginCalibrationRequest({
        url: `/assignments/${assignmentId}/review_mappings/${mapId}/mock_instructor_response`,
        method: HttpMethod.POST,
      }).catch(() => {
        // useAPI surfaces the error into beginCalibrationError.
      });
    },
    [assignmentId, sendBeginCalibrationRequest]
  );

  useEffect(() => {
    if (
      beginCalibrationResponse &&
      beginCalibrationResponse.status >= 200 &&
      beginCalibrationResponse.status < 300
    ) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: "Mock instructor and peer calibration responses submitted",
        })
      );
      onSuccess();
    }
  }, [beginCalibrationResponse, dispatch, onSuccess]);

  useEffect(() => {
    beginCalibrationError &&
      dispatch(
        alertActions.showAlert({ variant: "danger", message: beginCalibrationError })
      );
  }, [beginCalibrationError, dispatch]);

  return { handleBeginCalibrationReview };
}
