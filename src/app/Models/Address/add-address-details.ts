export class AddAddressDetails {
  constructor(
    public firstName: string,
    public lastName: string,
    public streetAddress: string,
    public postalCode: number,
    public userRole: string,
    public city: string,
    public state: string,
    public country: string,
    public phoneNumber: number,
    public email: string,
    public userId: number,
  ) { }
}
