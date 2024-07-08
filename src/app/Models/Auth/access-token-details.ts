export class AccessTokenDetails {
  constructor(
    public accessTokenId: number,
    public userId: number,
    public email: string,
    public accessToken: string,
    public accessTokenTimePeriod: string,
    public userName: string,
    public userRole: string
  ) { }
}

