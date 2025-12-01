export enum UserRole {
  ADMIN = "admin",
  GUEST = "guest",
}

export interface User {
  _id?: string;
  userName: string;
  password: string;
  role: UserRole;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  _id: string;
  userName: string;
  role: UserRole;
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
