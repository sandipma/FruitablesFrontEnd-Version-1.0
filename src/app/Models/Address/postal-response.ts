import { PostOffice } from "./post-office";
export class PostalResponse {
  constructor(
    public Message: string,
    public Status: string,
    public PostOffice: PostOffice[],
  ) { }
}
