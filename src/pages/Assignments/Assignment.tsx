import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tab, Tabs, Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import axiosClient from "../../utils/axios_client";
import useAPI from "hooks/useAPI";
import GeneralView from './GeneralView';
import RubricsView from './RubricsView';
import ReviewStrategyView from './ReviewStrategyView';
import DueDatesView from './DueDatesView';
import BadgesView from './BadgesView';
import EtcView from './EtcView';

const Assignment = () => {
    const [currentView, setCurrentView] = useState("general");

    const auth = useSelector(
        (state: RootState) => state.authentication,
        (prev, next) => prev.isAuthenticated === next.isAuthenticated
    );

    return (
        <>
        <Outlet />
        <div className="container">
            <div className="alert alert-success mt-4" role="alert">
                This is a success alert—check it out!
            </div>
            <div className="alert alert-danger" role="alert">
                This is a danger alert—check it out!
            </div>
            <h1>Editing Assignment: "Assignment_Name" </h1>
            <Tabs
                id="assignment-tab"
                activeKey={currentView}
                onSelect={(k) => setCurrentView(k)}
                className="mb-3"
                >
                <Tab eventKey="general" title="General">
                    <GeneralView />
                </Tab>
                <Tab eventKey="rubrics" title="Rubrics">
                    <RubricsView />
                </Tab>
                <Tab eventKey="review_strategy" title="Review Strategy">
                    <ReviewStrategyView />
                </Tab>
                <Tab eventKey="due_dates" title="Due Dates">
                    <DueDatesView />
                </Tab>
                <Tab eventKey="badges" title="Badges">
                    <BadgesView/>
                </Tab>
                <Tab eventKey="etc" title="Etc">
                    <EtcView />
                </Tab>
            </Tabs> 
            <br></br>
            <Button className="mt-1">Save</Button>|            
            <a href={'/assignments'} style={{margin: "2px"}} >Back</a>
        </div>
        </>
    );
};

  
export default Assignment;