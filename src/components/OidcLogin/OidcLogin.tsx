import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import axios from "axios";

interface OidcProvider {
  id: string;
  name: string;
}

const OidcLogin: React.FC = () => {
  const [providers, setProviders] = useState<OidcProvider[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/auth/providers")
      .then((response) => setProviders(response.data))
      .catch(() => setProviders([]));
  }, []);

  const handleLogin = (providerId: string) => {
    axios
      .post("http://localhost:3002/auth/client-select", { provider: providerId })
      .then((response) => {
        window.location.href = response.data.redirect_uri;
      })
      .catch((error) => {
        console.error("Failed to initiate OIDC login:", error);
      });
  };

  if (providers.length === 0) return null;

  return (
    <div className="mt-3">
      <hr />
      <Form.Select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) handleLogin(e.target.value);
        }}
      >
        <option value="" disabled>
          Sign in with...
        </option>
        {providers.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default OidcLogin;
