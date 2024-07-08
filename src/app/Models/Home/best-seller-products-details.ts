export class BestSellerProductsDetails {
  constructor(
    public productId: number,
    public productName: string,
    public price: number,
    public image: string,
    public rate: number,
    public selectedOption: string,
    public isAddedToCart: boolean = false
  ) { }
}
