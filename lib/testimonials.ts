export type Testimonial = {
  id: string;
  name: string;
  place: string;
  photo: string;
  quote: string;
};

export const HOW_IT_WORKS_TESTIMONIALS: Testimonial[] = [
  {
    id: "maya",
    name: "Maya Brooks",
    place: "Atlanta, USA",
    photo: "/testimonials/maya.png",
    quote:
      "I join on my phone after work. The pay is on the card before I start, so I never guess if a study is worth my time.",
  },
  {
    id: "kenji",
    name: "Kenji Sato",
    place: "Osaka, Japan",
    photo: "/testimonials/kenji.png",
    quote:
      "Signing up took a minute and nobody asked me for a card. I skipped two studies that were not a fit and still got paid for the ones I finished.",
  },
  {
    id: "sofia",
    name: "Sofia Reyes",
    place: "Medellín, Colombia",
    photo: "/testimonials/sofia.png",
    quote:
      "Researchers get my answers, not my name. That is the only reason I keep coming back — it feels like a real conversation, not a data grab.",
  },
  {
    id: "owen",
    name: "Owen Hart",
    place: "Manchester, UK",
    photo: "/testimonials/owen.png",
    quote:
      "Short polls on the train, longer surveys on Sunday. Rewards land in the wallet as money, not points I have to decode.",
  },
  {
    id: "layla",
    name: "Layla Hassan",
    place: "Amman, Jordan",
    photo: "/testimonials/layla.png",
    quote:
      "The English check was fair and the studies actually matched me. I tell friends: join free, take what you like, get paid for an honest take.",
  },
];
