import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

export interface ServiceItem { name: string; price: number; }
export interface PricingCategory { title: string; items: ServiceItem[]; }

@Component({
  selector: 'app-visitor-dashboard',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './visitor-dashboard.component.html',
  styleUrl: './visitor-dashboard.component.css'
})
export class VisitorDashboardComponent {

  reviewImages: string[] = [
    '/review-1.jpg',
    '/review-2.jpg',
    '/review-3.jpg',
    '/review-4.jpg',
    '/review-5.jpg',
    '/review-6.jpg',
    '/review-7.jpg'
  ];

  pricingData: PricingCategory[] = [
    { title: 'Bridal - including airbrush and false lashes', items: [{ name: 'Makeup + Hair', price: 600 }, { name: 'Makeup', price: 300 }, { name: 'Hair', price: 300 }] },
    { title: 'Trial', items: [{ name: 'Makeup + Hair', price: 300 }, { name: 'Makeup', price: 150 }, { name: 'Hair', price: 150 }] },
    { title: 'Bridemaids, mom - including false lashes', items: [{ name: 'Makeup + Hair', price: 250 }, { name: 'Makeup', price: 150 }, { name: 'Hair', price: 150 }] },
    { title: 'Fees', items: [{ name: 'Travel fee - round trip (per mile)', price: 2 }, { name: 'Early fee - start before salon hour (per hour)', price: 50 }] }
  ];

  faqs = [
    {
      question: 'How can I book an appointment?',
      answer: 'Please create an account to book, it is just a simple step and will not take long, but provide us some necessary information.',
      isOpen: true
    },
    {
      question: 'How far in advance should I book?',
      answer: 'For weddings, we recommend booking 6 to 12 months in advance to secure your date. For special occasions or photoshoots, 2 to 4 weeks is usually sufficient.',
      isOpen: false
    },
    {
      question: 'Do you offer on-site services for bridal parties?',
      answer: 'Yes! We travel to your hotel, home, or venue to ensure your day is as relaxing and stress-free as possible.',
      isOpen: false
    },
    {
      question: 'What happens during a bridal trial?',
      answer: 'The trial is a 2-3 hour session where we test your vision. We recommend bringing reference photos of makeup and hair styles you love, as well as a photo of your dress.',
      isOpen: false
    },
    {
      question: 'How should I prepare my skin and hair for the appointment?',
      answer: 'Please arrive with a clean, moisturized face. For hair styling, we recommend washing your hair the night before so it is completely dry.',
      isOpen: false
    },
    {
      question: 'Can you accommodate large bridal parties?',
      answer: 'Absolutely. For larger groups, I bring an assistant or a second lead artist to ensure everyone is ready on time without rushing the quality.',
      isOpen: false
    },
    {
      question: 'Is a deposit required to hold my date?',
      answer: 'Yes, a non-refundable retainer and a signed contract are required to officially book your wedding date. This amount is then applied toward your final balance.',
      isOpen: false
    }
  ];

  toggleFaq(faq: any) {
    faq.isOpen = !faq.isOpen;
  }
}
