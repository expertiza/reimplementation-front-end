export type DutyFormValues = {
  id?: number;
  name: string;
  visibility: string[];        // <-- array for FormCheckBoxGroup
  instructor_id?: number;
};

export const toBooleanPrivate = (visibility: string[]) => visibility?.includes("true");

export const transformDutyRequest = (data: DutyFormValues) => {
  const privateFlag = toBooleanPrivate(data.visibility);
  return { duty: { name: data.name, private: privateFlag, instructor_id: data.instructor_id } };
};