import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./Edit.css"; // Importing custom CSS styles
import { Button } from "react-bootstrap"; // Importing Button component from react-bootstrap

// Define initial form values and validation schema using Yup
const Edit: React.FC = () => {
  const initialValues = {
    fullName: "Admin",
    password: "",
    confirmPassword: "",
    email: "",
    institution: "Other",
    actionPreference: "cannotShowActions",
    handle: "",
    timeZone: "GMT-05:00",
    language: "No Preference",
    emailOptions: {
      reviewNotification: true,
      submissionNotification: true,
      metaReviewNotification: true,
    },
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    password: Yup.string().required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    handle: Yup.string().required("Handle is required"),
  });

  // Handle form submission
  const handleSubmit = (values: any, { setSubmitting }: any) => {
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2)); // Display form values as JSON
      setSubmitting(false);
    }, 400);
  };

  return (
    <div className="edit-form-container">
      {" "}
      {/* Container for the entire form */}
      <h2 className="h2-user-profile">User Profile Information</h2> {/* Heading for user profile */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(
          { isSubmitting } // Formik render prop function
        ) => (
          <Form>
            {" "}
            {/* Form component */}
            {/* Form fields with labels, inputs, and error messages */}
            <div className="form-field">
              <label htmlFor="fullName" style={{ fontWeight: 800 }}>
                Full name (last, first[middle]):
              </label>
              <Field type="text" name="fullName" />
              <ErrorMessage name="fullName" component="div" className="error-message" />
            </div>
            {/* Password and Confirm Password fields with validation */}
            <div className="form-field">
              <label htmlFor="password">Password:</label>
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" className="error-message" />
            </div>
            <div className="form-field">
              <label htmlFor="confirmPassword">Confirm your password:</label>
              <Field type="password" name="confirmPassword" />
              <ErrorMessage name="confirmPassword" component="div" className="error-message" />
            </div>
            {/* Note regarding password field */}
            <div className="italics">
              <p>If password field is blank, the password will not be updated</p>
            </div>
            {/* Email field */}
            <div className="form-field">
              <label htmlFor="email" style={{ fontWeight: 800 }}>
                E-mail address:
              </label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            {/* Institution field */}
            <div className="form-field">
              <label htmlFor="institution" style={{ fontWeight: 800 }}>
                Institution:
              </label>
              <Field as="select" name="institution">
                <option value="Other">Other</option>
                <option value="North Carolina State University">
                  North Carolina State University
                </option>
                <option value="Duke University">Duke University</option>
                <option value="Purdue University">Purdue University</option>
                <option value="UT Austin">UT Austin</option>
              </Field>
            </div>
            {/* Action Preference radio buttons */}
            <div className="form-field action-preference custom-column-flex">
              <label style={{ fontWeight: 800 }}>Action Preference:</label>
              <div className="radio-group">
                <label style={{ marginRight: 8 }}>
                  <Field type="radio" name="actionPreference" value="canShowActions" />
                  Homepage can show actions
                </label>
                <label>
                  <Field type="radio" name="actionPreference" value="cannotShowActions" />
                  Homepage cannot show actions
                </label>
              </div>
              <ErrorMessage name="actionPreference" component="div" className="error-message" />
            </div>
            <hr /> {/* Horizontal rule for visual separation */}
            {/* Handle field with instructions */}
            <div className="custom-column-flex">
              <label style={{ fontWeight: 800 }}>Handle</label>
              <div>
                A "handle" can be used to conceal your username from people who view your wiki
                pages. If you have a handle, your wiki account should be named after your handle
                instead of after your user-ID. If you do not have a handle, your Expertiza user-ID
                will be used instead. A blank entry in the field below will cause the handle to be
                set back to your Expertiza user-ID.{" "}
                <div style={{ marginTop: -12 }}>
                  <br />
                </div>
                Note: By using this form, you are changing your default handle, which will be used
                for all future assignments. To change your handle for a specific assignment, select
                that assignment and choose the Change Handle action.
              </div>
            </div>
            {/* Handle input field */}
            <div className="form-field" style={{ marginTop: 28 }}>
              <label htmlFor="handle">Default Handle:</label>
              <Field type="text" name="handle" />
              <ErrorMessage name="handle" component="div" className="error-message" />
            </div>
            {/* Email Options checkboxes */}
            <div className="email-options-container">
              <div className="email-options-header">
                <label className="email-options-heading">Email Options:</label>
                <p className="email-instructions">
                  Check the boxes representing the times when you want to receive e-mail.
                </p>
              </div>
              <div className="checkbox-group">
                <label>
                  <Field type="checkbox" name="emailOptions.reviewNotification" />
                  When someone else reviews my work
                </label>
                <label>
                  <Field type="checkbox" name="emailOptions.submissionNotification" />
                  When someone else submits work I am assigned to review
                </label>
                <label>
                  <Field type="checkbox" name="emailOptions.metaReviewNotification" />
                  When someone else reviews one of my reviews (meta-reviews my work)
                </label>
              </div>
            </div>
            {/* Preferred Time Zone field */}
            <div className="form-field">
              <label htmlFor="timeZone">Preferred Time Zone:</label>
              <Field as="select" name="timeZone">
                <option value="GMT-05:00">GMT-05:00 Eastern Time (US)</option>
                <option value="GMT+01:00">GMT+01:00 Berlin</option>
                <option value="GMT-07:00">GMT-07:00 Arizona (US)</option>
              </Field>
            </div>
            {/* Preferred Language field */}
            <div className="form-field">
              <label htmlFor="language">Preferred Language:</label>
              <Field as="select" name="language">
                <option value="No Preference">No Preference</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </Field>
            </div>
            {/* Submit button */}
            <div className="form-field">
              <Button type="submit" disabled={isSubmitting} variant="outline-success">
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Edit;
