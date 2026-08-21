import React, { useEffect, useState } from "react";
import { Form, Formik, FormikHelpers } from "formik";
import FormSelect from "components/Form/FormSelect";
import FormInput from "../../components/Form/FormInput";
import { Modal, InputGroup, Button } from "react-bootstrap";
import * as Yup from "yup";
import axiosClient from "../../utils/axios_client";

interface OidcProvider {
  id: string;
  name: string;
}

interface OidcFormValues {
  oidc_provider: string;
}

const OidcModal: React.FC = () => {
  const [show, setShow] = useState(false);
  const [modalProviders, setModalProviders] = useState<OidcProvider[]>([]);
  const [hasProviders, setHasProviders] = useState(false);

  useEffect(() => {
    // Fetch providers on component mount or when modal visibility changes
    axiosClient
      .get("/auth/providers", { skipAuth: true })
      .then((response) => {
        const data = response.data || [];
        setModalProviders(data);
        setHasProviders(data.length > 0);
      })
      .catch(() => {
        setModalProviders([]);
        setHasProviders(false);
      });
  }, []);

  const validationSchema = Yup.object({
    user_name: Yup.string().required("Required"),
    oidc_provider: Yup.string().required("Please select a provider"),
  });

  const handleSubmit = (values: OidcFormValues, submitProps: FormikHelpers<OidcFormValues>) => {
    axiosClient
      .post("/auth/client-select", { username: values.user_name, provider: values.oidc_provider }, { skipAuth: true })
      .then((response) => {
        console.log("OIDC login initiated, redirecting to:", response.data.redirect_uri);
        window.location.href = response.data.redirect_uri;
      })
      .catch((error) => {
        console.error("Failed to initiate OIDC login:", error);
      })
      .finally(() => {
        submitProps.setSubmitting(false);
      });
  };

  return (
    <>
      {hasProviders && (
        <div className="px-4">
            <hr />
            <Button
            style={{ width: "100%" }}
            variant="secondary"
            onClick={() => setShow(true)}
            >
            Sign in with SSO
            </Button>
        </div>
      )}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sign in with SSO</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalProviders.length > 0 ? (
            <Formik
              initialValues={{ user_name: "", oidc_provider: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <Form>
                  <FormInput
                      controlId="login-user-name"
                      label="User Name"
                      name="user_name"
                      inputGroupPrepend={<InputGroup.Text id="login-prepend">@</InputGroup.Text>}
                  />
                  <FormSelect
                    controlId="oidc-provider"
                    name="oidc_provider"
                    label="Select a provider:"
                    options={[
                      { label: "Choose a provider...", value: "", disabled: true },
                      ...modalProviders.map((provider) => ({
                        label: provider.name,
                        value: provider.id,
                      })),
                    ]}
                    onChange={(e) => {
                      formik.setFieldValue("oidc_provider", e.target.value);
                    }}
                  />
                  <Button
                    style={{ width: "100%", marginTop: "15px" }}
                    variant="primary"
                    onClick={() => formik.submitForm()}
                    disabled={!formik.values.oidc_provider || formik.isSubmitting}
                  >
                    Continue with SSO
                  </Button>
                </Form>
              )}
            </Formik>
          ) : (
            <p>Loading providers...</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OidcModal;
