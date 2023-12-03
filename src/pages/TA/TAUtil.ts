import { ITARequest } from "../../utils/interfaces";

/**
 * @author Ankur Mundra on April, 2023
 */

export interface ITAFormValues {
  id?: number;
  name: string;
}

export const transformTARequest = (values: ITAFormValues) => {
  // const parent_id = values.parent_id ? values.parent_id : null;
  const TA: ITARequest = {
    name: values.name,
  };
  return JSON.stringify(TA);
};
