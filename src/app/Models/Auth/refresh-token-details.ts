export class RefreshTokenDetails {
  constructor(
    public refreshTokenId: number,
    public userId: number,
    public email: string,
    public refreshToken: string,
    public refreshTokenTimePeriod: string,
    public userName: string,
    public userRole: string,
  ) { }
}
