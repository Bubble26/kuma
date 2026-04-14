export interface Testimonial {
  quote: string;
  name: string;
  tag: string;
  tagColor: string;
  stars: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "My daughter has eczema and I had no idea her baby wash contained three known triggers. Kuma caught it on the first scan.",
    name: 'Rachel T.',
    tag: 'Eczema mom',
    tagColor: '#ff8a8a',
    stars: 5,
  },
  {
    quote:
      "We removed 4 products Kuma flagged for ADHD-linked additives. The difference in our son's behavior was visible within 2 weeks.",
    name: 'Marcus J.',
    tag: 'ADHD parent',
    tagColor: '#E8A435',
    stars: 5,
  },
  {
    quote:
      "I thought our formula was clean. Kuma found 6 ingredients linked to gut inflammation for celiac kids.",
    name: 'Priya K.',
    tag: 'Celiac mom',
    tagColor: '#ff8a8a',
    stars: 5,
  },
  {
    quote:
      "The water quality alert alone was worth it. Our zip code has elevated lead levels and I had no idea.",
    name: 'Sarah M.',
    tag: 'Mom of 2',
    tagColor: '#E8A435',
    stars: 5,
  },
];
