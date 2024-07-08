export class OrderStatusDetails {
    constructor(
        public orderStatusId: number,
        public orderStatusDetails: string,
        public updateByAdminId: string,
        public created_at: Date,
        public updated_at: Date
    ) { }
}
