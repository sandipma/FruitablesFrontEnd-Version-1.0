export class RatingsDetails {
  constructor(
    public ratingId: number,
    public review: string,
    public userName: string,
    public createdAt: Date,
    public rate: number
  ) { }
}
