import React from "react";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "react-bootstrap";

function CustomTooltip(props) {
  return (
    <Tooltip key={props.key} title={props.title}>
      <Button
        style={{
          padding: "6px",
          color: "default",
          backgroundColor: "white",
          border: "none",
        }}
        onClick={() => props.handler(props.rowData, props.index)}
      >
        <img src={props.src} alt={props.alt} style={{ width: "20px", height: "20px" }} />
      </Button>
    </Tooltip>
  );
}

export default CustomTooltip;
