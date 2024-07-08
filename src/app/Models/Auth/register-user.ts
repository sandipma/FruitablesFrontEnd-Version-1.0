export class RegisterUser {
  constructor(
    public userName: string,
    public email: string,
    public userPassword: string,
    public userRole: string
  ) { }
}