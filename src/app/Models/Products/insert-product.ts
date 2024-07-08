export class InsertProduct {
  constructor(
    public categoryId: number,
    public adminId: number,
    public productName: string,
    public productDescription: string,
    public price: number,
    public stockQuantity: number,
    public imageData: File
  ) { }
}
