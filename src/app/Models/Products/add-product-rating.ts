export class AddProductRating {
  constructor(
    public review: string,
    public rate: number,
    public userId: number,
    public productId: number
  ) { }
}
