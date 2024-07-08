export class TopProductsDetails {
  constructor(
    public productId: number,
    public categoryName: string,
    public productName: string,
    public productDescription: string,
    public price: number,
    public imageData: string,
    public productImage: string,
    public selectedOption: string,
    public stockQuantity: number,
    public isQuantityAvailable: string = null,
    public isAddedToCart: boolean = false
  ) { }
}
