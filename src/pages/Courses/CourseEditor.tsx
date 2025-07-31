import FormCheckBoxGroup from "components/Form/FormCheckBoxGroup";
import FormInput from "components/Form/FormInput";
import FormSelect from "components/Form/FormSelect";
import { Form, Formik, FormikHelpers } from "formik";
import useAPI from "hooks/useAPI";
import React, { useEffect, useState } from "react";
import { Button, InputGroup, Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice"; // Success message utility
import { HttpMethod } from "utils/httpMethods";
import * as Yup from "yup";
import { RootState } from "../../store/store";
import { IEditor, ROLE } from "../../utils/interfaces";
import { ICourseFormValues, courseVisibility, noSpacesSpecialCharsQuotes, transformCourseRequest } from "./CourseUtil";

/**
 * @author Suraj Raghu Kumar, on Oct, 2024 
 * @author Yuktasree Muppala on Oct, 2024
 * @author Harvardhan Patil on Oct, 2024
 */
 

// Initial form values
const initialValues: ICourseFormValues = {
  name: "",
  directory: "",
  private: [],
  institution_id: 0,
  instructor_id: 0,
  info: "",
};

// Validation schema for the course form
const validationSchema = Yup.object({
  name: Yup.string()
    .required("Required")
    .min(3, "Course name must be at least 3 characters")
    .max(20, "Course name must be at most 20 characters"),
  info: Yup.string().required("Required").nonNullable(),
  directory: Yup.string()
    .required("Required")
    .nonNullable()
    .test("no-spaces-special-chars-quotes", "Invalid characters", noSpacesSpecialCharsQuotes),
  institution_id: Yup.string().required("Required").nonNullable(),
});

const CourseEditor: React.FC<IEditor> = ({ mode }) => {
  const { data: courseResponse, error: courseError, sendRequest } = useAPI();
  const { data: users, sendRequest: fetchusers } = useAPI();
  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const { courseData, institutions }: any = useLoaderData();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

 useEffect(() => {
    
      fetchusers({ url: "/users" });
    
  }, [auth.user, fetchusers]);
// Success handler for course editing and creating
const handleCourseSuccess = () => {
  if (courseResponse && courseResponse.status >= 200 && courseResponse.status < 300) {
    dispatch(
      alertActions.showAlert({
        variant: "success",
        message: `Course ${courseData.name} ${mode}d successfully!`,
      })
    );
    navigate(location.state?.from ? location.state.from : "/courses");
  }
};
// Error handler for course editing and creating
const handleCourseError = () => {
  if (courseError) {
    dispatch(alertActions.showAlert({ variant: "danger", message: courseError }));
  }
};
// useEffect to monitor success response
useEffect(() => {
  handleCourseSuccess();
}, [courseResponse]);
// useEffect to monitor error response
useEffect(() => {
  handleCourseError();
}, [courseError]);

  // Function to handle form submission
  const onSubmit = (values: ICourseFormValues, submitProps: FormikHelpers<ICourseFormValues>) => {
    let method: HttpMethod = HttpMethod.POST;
    let url: string = "/courses";

    if (mode === "update") {
      url = `/courses/${values.id}`;
      method = HttpMethod.PATCH;
    }

    // to be used to display message when course is created
    courseData.name = values.name;
    
    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformCourseRequest,
    });

    submitProps.setSubmitting(false);
  };

  // Function to close the modal
  const handleClose = () => navigate(location.state?.from ? location.state.from : "/courses");
  // Render the CourseEditor modal
  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{mode === "update" ? "Update Course" : "Create Course"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {courseError && <p className="text-danger">{courseError}</p>}
        
        <Formik
          
          
         initialValues={{
          ...courseData,
          private: courseData.private || [], // Ensure array default
          institution_id: courseData.institution_id 
            ?? (auth.user?.institution_id ?? initialValues.institution_id),
          instructor_id: courseData.instructor_id 
            ?? (auth.user?.id ?? initialValues.instructor_id),
        }}
            
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={true}
          enableReinitialize={true}
        >
          {(formik) => {

            return (
              <Form>
                <FormSelect
                  controlId="course-institution"
                  name="institution_id"
                  disabled={true}
                  options={
                    institutions.map((i: any) => ({
                      label: i.label,
                      value: String(i.value)
                    }))
                  }
                  inputGroupPrepend={
                    <InputGroup.Text id="course-inst-prep">Institution</InputGroup.Text>
                  }
                />
                <FormSelect
                  controlId="course-instructor"
                  name="instructor_id"
                  disabled={true}
                  options={
                    users?.data
                      ?.filter((user: any) => user.role.name === "Instructor")
                      .map((user: any) => ({
                        label: user.name,
                        value: String(user.id),
                      })) || []
                  }
                  inputGroupPrepend={
                    <InputGroup.Text id="course-inst-prep">Instructors</InputGroup.Text>
                  }
                />
                <FormInput
                  controlId="name"
                  label="Name"
                  name="name"
                  disabled={mode === "update"}
                />
                <FormInput
                  controlId="directory"
                  label="Course Directory (Mandatory field. No Spaces, Special Characters, or quotes)"
                  name="directory"
                />
                <FormInput controlId="info" label="Course Information" name="info" />
                <FormCheckBoxGroup
                  controlId="course-visibility"
                  label="Course Visibility"
                  name="private"
                  options={courseVisibility}
                />

                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={handleClose}>
                    Close
                  </Button>

                  <Button
                    variant="outline-success"
                    type="submit"
                    disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                  >
                    {mode === "update" ? "Update Course" : "Create Course"}
                  </Button>
                </Modal.Footer>
              </Form>
            );
          }}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};
export default CourseEditor;
