export class ProductDetail {
  constructor(
    public productId: number,
    public finalRating: number,
    public productName: string,
    public categoryName: string,
    public productDescription: string,
    public stockQuantity: number,
    public image: string,
    public price: number,
    public isAddedToCart: boolean = false,
    public selectedOption: string
  ) { }
}
