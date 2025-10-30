export enum LoginMethod {
  PASSWORD = 'password',
  OPENID = 'openid',
}

export interface LoginMethodData {
  [LoginMethod.PASSWORD]: {
    username: string;
    password: string;
  };

  [LoginMethod.OPENID]: {
    token: string;
    provider: string;
  };
}
