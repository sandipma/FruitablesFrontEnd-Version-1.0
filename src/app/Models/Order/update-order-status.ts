export class UpdateOrderStatus {
    constructor(
        public orderStatus: string,
        public userId: number,
        public productName?: string,
        public orderId?: number,
        public updateByAdminId?: number
    ) { }
}
