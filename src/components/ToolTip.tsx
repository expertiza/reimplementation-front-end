import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { InfoIcon } from "./Icons";

/**
 * @author Ankur Mundra on May, 2023
 */

interface ToolTipProps {
  id: string;
  info: string;
  placement?: "top" | "right" | "bottom" | "left";
}

const ToolTip: React.FC<ToolTipProps> = (props) => {
  const tooltip = <Tooltip id={`tooltip-${props.id}`}>{props.info}</Tooltip>;

  return (
    <OverlayTrigger
      placement={props.placement || "right"}
      delay={{ show: 150, hide: 300 }}
      overlay={tooltip}
    >
      <span>
        <InfoIcon />
      </span>
    </OverlayTrigger>
  );
};

export default ToolTip;
