import { AccessTokenDetails } from "./access-token-details";
import { RefreshTokenDetails } from "./refresh-token-details";

export class TokenDetails {
  constructor(
    public accessTokenDetails: AccessTokenDetails,
    public refreshTokenDetails: RefreshTokenDetails,
  ) { }
}
