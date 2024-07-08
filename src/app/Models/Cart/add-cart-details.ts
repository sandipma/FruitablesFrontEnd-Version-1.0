export class AddCartDetails {
  constructor(
    public productImage: string,
    public productName: string,
    public price: number,
    public userId: number,
    public subTotal: number,
    public currentQuant: number
  ) { }
}
