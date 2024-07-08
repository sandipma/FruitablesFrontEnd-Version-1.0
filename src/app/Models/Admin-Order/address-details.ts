export class AddressDetails {
    constructor(
        public firstName: string,
        public lastName: string,
        public streetAddress: string,
        public postalCode: number,
        public city: string,
        public state: string,
        public country: string,
        public phoneNumber: number,
        public addressEmail: string,
    ) { }
}
