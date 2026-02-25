export type UserInfo = {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  userImg: string;
  gender: string;
  job_role: string;
  department: string;
  address: string;
};

export enum UserRoles  {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
  Employee = 'employee',
};
