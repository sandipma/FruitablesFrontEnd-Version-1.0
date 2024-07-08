import { Component } from '@angular/core';
import { FAQService } from 'src/app/Services/FAQ/faq.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FAQComponent {
  // Variable declaration //
  faqs: any[] = [];
  activeIndex: number | null = null;
  currentAnswer: string = null;

  // Constructor  initialisation //
  constructor(private faqService: FAQService) {
  }

  // On load event //
  ngOnInit(): void {
    this.faqs = this.faqService.getFAQ();
  }

  // Method for toggle accordion //
  toggleCollapse(index: number): void {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }
}