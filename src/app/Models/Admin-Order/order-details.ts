export class OrderDetails {
    constructor(
        public orderId: number,
        public productImage: string,
        public productName: string,
        public price: number,
        public quantity: number,
        public subTotal: number,
        public total: number,
        public receipt: string,
        public orderDetails: string,
        public razorPayOrderId: string,
        public modeOfPayment: string
    ) { }
}
