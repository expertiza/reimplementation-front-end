import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * @author Rutvik Kulkarni on Nov, 2024
 */

interface ColumnButtonProps {
    id: string;
    label?: string;
    tooltip?: string;
    variant: string;
    size?: "sm" | "lg"; // Matches React-Bootstrap Button prop
    className?: string;
    onClick: () => void;
    icon: React.ReactNode;
  }

  const ColumnButton: React.FC<ColumnButtonProps> = (props) => {
    const {
      id,
      label,
      tooltip,
      variant,
      size,
      className,
      onClick,
      icon,
    } = props;

    const displayButton = (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={onClick}
        aria-label={label}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id={`${id}-tooltip`}>{tooltip}</Tooltip>}
        >
          {displayButton}
        </OverlayTrigger>
      );
    }

    return displayButton;
  };

  export default ColumnButton;