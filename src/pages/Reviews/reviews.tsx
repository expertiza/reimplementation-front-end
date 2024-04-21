import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import useAPI from "hooks/useAPI";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { BsFileText, BsPersonFillAdd } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { alertActions } from "store/slices/alertSlice";
import { RootState } from "../../store/store";
import { IParticipantResponse, ROLE } from "../../utils/interfaces";
import DeleteAssignment from "../Assignments/AssignmentDelete";
import Assignments from "../Assignments/Assignment";


const reviews = () => {
  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Reviews</h1>
            </Col>
            <hr />
          </Row>

        </Container>
      </main>
    </>
  );
};

export default reviews;
