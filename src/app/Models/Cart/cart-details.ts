export class CartDetails {
  constructor(
    public cartId: number,
    public productImage: string,
    public productName: string,
    public price: number,
    public quantity: number,
    public userId: number,
    public currentQuant: number,
    public isincreaseDisabled: boolean = false
  ) { }
}
