import RootLayout from "layout/Root";
import Home from "pages/Home";
import React from "react";
import PendingRequests from "pages/PendingRequests/PendingRequests";
import RequestForm from "pages/AccountRequest/RequestForm";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "account_request", element: <PendingRequests /> },
        { path: "request_form", element: <RequestForm /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
