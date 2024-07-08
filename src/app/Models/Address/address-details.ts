export class AddressDetails {
  constructor(
    public addressId: number,
    public firstName: string,
    public lastName: string,
    public streetAddress: string,
    public postalCode: number,
    public userRole: string,
    public city: string,
    public state: string,
    public country: string,
    public phoneNumber: string,
    public email: string,
    public userId: number,
    public isCurrentSelected: string
  ) { }
}
