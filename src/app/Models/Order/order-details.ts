export class OrderDetails {
    constructor(
        public orderId: number,
        public subTotal: number,
        public charges: number,
        public total: number,
        public amountPaid: number,
        public amountDue: number,
        public orderStatus: string,
        public userId: number,
        public razorPayOrderId: string,
        public modeOfPayment: string,
        public createdAt: Date,
        public updatedAt: Date
    ) { }
}
