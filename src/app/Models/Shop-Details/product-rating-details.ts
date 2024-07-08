import { ProductDetail } from "./product-detail";
import { RatingsDetails } from "./ratings-details";

export class ProductRatingDetails {
  constructor(
    public retDetails: RatingsDetails[],
    public prodDetails: ProductDetail,
  ) { }
}
