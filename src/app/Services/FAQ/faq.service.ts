import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FAQService {

  // Constructor  initialisation //
  constructor() { }

  //*************Methods***************//

  // Method to get FAQ along with their answers //
  getFAQ(): any[] {
    return [
      { question: "What types of fruits do you offer?", answer: "We offer a wide variety of fresh fruits including apples, oranges, bananas, strawberries, and much more!" },
      { question: "Are your vegetables organic?", answer: "Yes, all of our vegetables are organic and sourced from local farms." },
      { question: "When does Fruitables deliver?", answer: "Your products will be delivered upto 3 hours from the time of placing the order. At the time of checkout while placing an order online, you will be provided with option for choosing delivery from the 5 timeslots. Following are the timeslots available for selection and their respective cut off timings while placing an order with us" },
      { question: "Is there a minimum order value for delivery?", answer: "here is no minimum order value for delivery. However we charge 10% for all orders irrespective of order value." },
      { question: "What is Fruitables delivery process?", answer: "Once order is placed online, after confirmation, it is pushed to the nearest store of your delivery address through an automated process. The order is picked and packed, checked for quality, physical condition, etc. by a dedicated team of trained staff and then sent for delivery at your door step. The order will be delivered in the chosen timeslot by you. Once the order leaves the store for delivery, a notification will be sent on your registered email address and mobile number. In case of any changes in the delivery schedule or ordered quantity, you will be notified well beforehand." },
      { question: "Can I change my order once it has been placed?", answer: "Yes, you can still modify your order once it has been placed. However, once the order has been dispatched from the store upon which a delivery notification will be sent on your registered email address and contact number, no further changes can be made in the order. In case you wish to remove certain products from the order, there always is an option of returning the products. In case you wish to order some additional products, you can always proceed placing a new order." },
      { question: "Can I place an order online and pick up my order from your store which is nearest to me?", answer: "Currently we do not offer this facility." },
      { question: "What if products ordered by me are out of stock?", answer: "In a rare case, where products ordered by you are out of stock, we would be providing Substitutes for the product unavailable. This substitute can be of the same variant but from a different brand. The decision for the substitute is taken by our Food Specialist who has a fair understanding of product catalogue. Our specialist will also suggest alternate products, incase similar products are not available, which could be delivered in place of the ordered products. In case, we are not able to offer substitutes, we will deliver the rest of the products at your convenience and process a refund for the out of stock products in case of prepaid order or modify the Invoice in case of postpaid orders. In case of alternate products selection, the cost of these will be adjusted against original payment received and the balance will be refunded back to you or any extra cost (after confirmation from you) will be collected in cash by our Delivery Expert or will be credited to your online Natures Basket account in case of Prepaid Orders." },
      { question: "Will I be compensated in case of order delay?", answer: "No, in such event of delay, our delivery team only will keep you updated about your delivery." },
      { question: "How do I order products which are available in the store and not available in the webstore?", answer: "Our endeavor is to keep adding products in the webstore. Since we deliver products across the city and in good condition, we have included products that can be delivered in perfect condition. For items not available in the webstore, we request you to drop in to the nearest Nature's Basket outlet. You could go the store locater section on the main website and get details of all our locations including the address and the phone numbers. You could also call our stores and place a home delivery order for your specific requirements." },
      { question: "What is the value of one e-wallet Points?", answer: "Fruitables one e-wallet points equals to one rupee." },
      { question: "Are there any hidden charges I should know about??", answer: "No, the price listed on the product page is all you pay. No Octroi, no additional sales tax, and no other hidden charges. Our philosophy is simple - What you see is what you pay!" },
      { question: "Is it safe to use my credit/ debit card on Fruitables?", answer: "Yes it is absolutely safe to use your card on www.fruitables.com A recent directive from RBI makes it mandatory to have an additional authentication pass code verified by VISA (VBV) or MSC (Master Secure Code) which has to be entered by online shoppers while paying online using visa or master credit card. It means extra security for customers, thus making online shopping safer." },
      { question: "How do I know the payment status?", answer: "It's easy you login to Your Account and view the Payment Status on your order in the My Orders section." },
      { question: "Do I get an invoice for my order?", answer: "No , you will not receive an Invoice on delivery of the products." },
      { question: "How does COD (Cash-On-Delivery) work?", answer: "We offer COD to make your life easy. Simply place your order with us and pay for it when you receive your goods at your doorstep!" },
      { question: "What credit cards do you accept on Card on Delivery?", answer: "We accept only Visa and Mastercard on card on delivery payment option. American Express is not valid on card on delivery payment option." },
      { question: "Can I order Wine/Beer/Liquor?", answer: "We currently don't deliver any wine / beer through online orders other than Kolkata. But you may visit our stores in your city to find the choicest wines and other beverages." },

    ];
  }
}
