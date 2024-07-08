export class UserOrderDetails {
    constructor(
        public orderId: number,
        public productImage: string,
        public productName: string,
        public price: number,
        public quantity: number,
        public modeOfPayment: string,
        public receipt: string,
        public orderStatus: string,
        public created_at: Date,
        public updated_at: Date
    ) { }
}
