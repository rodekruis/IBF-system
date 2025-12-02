import { User } from 'src/app/models/user/user.model';

export interface LoginRequest {
  email: string;
  code?: number;
}

export interface UserResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface ErrorResponse {
  error: MessageResponse;
}

export type LoginResponse = MessageResponse | UserResponse;

export type CreateUserResponse = User;
export type ReadUsersResponse = User[];
export type UpdateUserResponse = UserResponse; // REFACTOR: change to User
