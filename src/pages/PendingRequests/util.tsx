export interface IPendingTable {
  id: any;
  username: string;
  full_name: string;
  email: string;
  role: { id: string; name: string };
  introduction: string;
  status: string;
  institution: { id: string; name: string };
}
