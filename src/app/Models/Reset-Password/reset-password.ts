export class ResetPassword {
  constructor(
    public password: string,
    public userId: string,
    public code: string
  ) { }
}
