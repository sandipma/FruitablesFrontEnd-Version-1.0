export class ProductDetails {
  constructor(
    public productId: number,
    public categoryId: number,
    public categoryName: string,
    public productName: string,
    public productDescription: string,
    public price: number,
    public stockQuantity: number,
    public imageData: string,
    public imageName: string
  ) { }
}