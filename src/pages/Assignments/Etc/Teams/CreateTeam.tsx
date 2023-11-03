import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Tab, Tabs, Col, Container, Row } from "react-bootstrap";

import Table from "components/Table/Table";
import axiosClient from "../../../../utils/axios_client";

import Teams from "./Teams";
/**
 * @author Ankur Mundra on June, 2023
 */

const CreateTeam = () => {
    
    const [currentView, setCurrentView] = useState("teams");
  return (
    <>
      <Outlet />
      <h1>Manage Teams</h1>
      <main>
      <Tabs
                id="assignment-tab"
                activeKey={currentView}
                onSelect={(k) => setCurrentView(k)}
                className="mb-3"
                >
                <Tab eventKey="teams" title="Teams">
                    <Teams />
                </Tab>
                {/* <Tab eventKey="etc" title="Etc">
                    <EtcView />
                </Tab> */}
            </Tabs> 
      </main>
    </>
  );
};

export async function loadTeams() {
  const rolesResponse = await axiosClient.get("/teams");
  return await rolesResponse.data;
}

export default CreateTeam;
