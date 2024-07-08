export class ConfirmOTP {
  constructor(
    public email: string,
    public OTP: number,
    public userRole: string
  ) { }
}
