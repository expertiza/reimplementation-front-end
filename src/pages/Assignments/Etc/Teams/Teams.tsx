import { useCallback, useMemo, useState } from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router-dom";
import { Tab, Tabs, Col, Container, Row } from "react-bootstrap";
import axiosClient from "../../../../utils/axios_client";
import { TeamTable } from "./TeamTable";

export async function loadTeams() {
  const teamsResponse = await axiosClient.get("/teams");
  console.log(await teamsResponse.data);
  return await teamsResponse.data;
}

const Teams = () => {
  const [currentView, setCurrentView] = useState("teams");
  const teams: any = useLoaderData();
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
            <TeamTable teams={teams}/> 
          </Tab>
        </Tabs>
      </main>
    </>
  );
};



export default Teams;
