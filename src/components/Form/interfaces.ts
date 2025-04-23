import { ElementType, ReactNode } from "react";

/**
 * @author Ankur Mundra on May, 2023
 */
export interface IFormProps {
  name: string;
  label?: string;
  type?: string;
  controlId: string;
  placeholder?: string;
  as?: ElementType;
  md?: number | string;
  disabled?: boolean;
  tooltip?: string;
  tooltipPlacement?: "top" | "right" | "bottom" | "left";
  inputGroupPrepend?: ReactNode;
  inputGroupAppend?: ReactNode;
}

export interface IFormOption {
  label: string;
  value: string | number;
}

export interface IFormPropsWithOption extends IFormProps {
  options: IFormOption[];
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface IFormikFieldProps {
  field: any;
  form: any;
}
