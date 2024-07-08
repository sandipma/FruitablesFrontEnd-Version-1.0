import { OrderCartDetails } from "./order-cart-details";
export class AddOrderDetails {
    constructor(
        public cartDetails: OrderCartDetails[],
        public subTotal: number,
        public charges: number,
        public total: number,
        public userId: number,
        public modeOfPayment: string
    ) { }
}
