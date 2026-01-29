export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}
