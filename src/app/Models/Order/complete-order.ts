export class CompleteOrder {
    constructor(
        public orderId: number,
        public razorpayOrderId: string,
        public paymentId: string,
        public signature: string,
        public modeOfPayment: string,
        public userId: number
    ) { }
}
