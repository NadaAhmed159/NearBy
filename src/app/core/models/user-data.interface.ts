export interface UserDataResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export interface UserData {
  token: string;
  tokenType: string;
  expiresIn: string;
  user: UserInfo;
}

export interface UserInfo {
  _id: string;
  name: string;
  username: string;
  email: string;
  photo: string;
  cover: string;
}
