export class OTPDetails {
  constructor(
    public userId: number,
    public OTP: number,
    public OTPId: number,
    public email: string,
    public userName: string
  ) { }
}
