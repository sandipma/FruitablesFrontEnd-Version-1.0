export class AllShopDetails {
  constructor(
    public productId: number,
    public categoryId: number,
    public categoryName: string,
    public productName: string,
    public productDescription: string,
    public price: number,
    public stockQuantity: number,
    public imageData: string,
    public rate: number,
    public isAddedToCart: boolean = false,
    public selectedOption: string,
    public isQuantityAvailable: string = null,
    public createdAt: string
  ) { }
}

