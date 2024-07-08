import { CartDetails } from "./cart-details";
import { PriceDetails } from "./price-details";

export class CartWithTotalDetails {
  constructor(
    public cartDetails: CartDetails[],
    public priceDetails: PriceDetails
  ) { }
}
