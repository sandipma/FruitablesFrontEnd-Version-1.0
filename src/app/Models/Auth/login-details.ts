export class LoginDetails {
  constructor(
    public userId: string,
    public userName: string,
    public email: string,
    public userPasswordHash: string,
    public userRole: string,
    public token: string,
    public tokenExpireTimePeriod: string,
    public convertedTokenTime: string
  ) { }
}
