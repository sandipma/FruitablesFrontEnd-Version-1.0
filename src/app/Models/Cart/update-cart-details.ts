export class UpdateCartDetails {
  constructor(
    public cartId: number,
    public price: number,
    public productName: string,
    public quantity: number,
    public userId: number,
    public subTotal: number,
    public totalQuant: number,
    public increaseOrDecrease: string
  ) { }
}
