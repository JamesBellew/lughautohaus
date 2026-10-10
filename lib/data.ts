/*
 * Lugh Autohaus content.
 * Copy and prices are from the client brief ("Website Lugh Autohaus.pdf").
 * Anything marked PLACEHOLDER is not from the brief and must be confirmed.
 */

export type ServiceId = "ppf" | "correction" | "ceramic" | "tint" | "detailing";

export type Service = {
  id: ServiceId;
  name: string;
  short: string;
  tagline: string;
  body: string;
  image: string;
  imageAlt: string;
  specs: { label: string; value: string }[];
  from: string;
};

export const services: Service[] = [
  {
    id: "ppf",
    name: "Paint Protection Film",
    short: "PPF",
    tagline: "The most durable protection your paint can have.",
    body: "Advanced transparent and coloured film technologies from Stek protect your paint from stone chips, road debris and car-park mishaps — and can change your car's colour entirely while preserving the factory finish beneath.",
    image: "/images/ppf-install-xl.jpg",
    imageAlt: "Gloved hands applying protective film to a car panel with a squeegee",
    specs: [
      { label: "Turnaround", value: "1–6 days" },
      { label: "Finishes", value: "50+" },
      { label: "Coverage", value: "Full · front end · impact areas" },
      { label: "Warranty", value: "10–12 years" },
    ],
    from: "From €150",
  },
  {
    id: "correction",
    name: "Paint Correction",
    short: "Correction",
    tagline: "Reverse years of swirls, haze and fading.",
    body: "Dull paint from neglect, automatic car washes and sun exposure is safely restored using years of experience across polishing and sanding techniques — bringing your vehicle back to factory fresh.",
    image: "/work/correction-after.jpg",
    imageAlt: "Deep, swirl-free black metallic paint after correction",
    specs: [
      { label: "Turnaround", value: "1–6 days" },
      { label: "Packages", value: "4 levels of correction" },
      { label: "Aftercare", value: "Guide + products available" },
      { label: "Protection", value: "6 months free as standard" },
    ],
    from: "From €250",
  },
  {
    id: "ceramic",
    name: "Ceramic Coating",
    short: "Ceramic",
    tagline: "Lock in the shine. Make washing effortless.",
    body: "For a new car or freshly corrected paint, a professional ceramic coating adds deep gloss and real hydrophobic protection that lasts — from one year to ten.",
    image: "/images/ceramic-beading-xl.jpg",
    imageAlt: "Water beading into tight droplets on coated red paint",
    specs: [
      { label: "Turnaround", value: "1–2 days" },
      { label: "Cure time", value: "12 hours" },
      { label: "Durability", value: "1 · 5 · 10 years" },
      { label: "Brands", value: "Feynlab · Titan Coatings" },
    ],
    from: "From €180",
  },
  {
    id: "tint",
    name: "Window & Light Tints",
    short: "Tints",
    tagline: "The number one modification — style and comfort.",
    body: "Ceramic tint from Stek rejects heat and UV, protecting your interior and keeping passengers comfortable through summer. Headlight and taillight tints add a stealthier look and are NCT passable.",
    image: "/images/tint-headlights-xl.jpg",
    imageAlt: "Dark car with tinted glass and glowing headlights at night",
    specs: [
      { label: "Turnaround", value: "1 day" },
      { label: "VLT", value: "5% to 80%" },
      { label: "Films", value: "Carbon · ceramic · graphene" },
      { label: "Lights", value: "NCT passable" },
    ],
    from: "From €150",
  },
  {
    id: "detailing",
    name: "Detailing",
    short: "Detailing",
    tagline: "Nothing looks right until it's truly clean.",
    body: "Interior and exterior detailing packages, bespoke to your vehicle's needs — from a deep restorative clean to regular maintenance details.",
    image: "/images/foam-wash-xl.jpg",
    imageAlt: "Car covered in thick snow foam during a detail wash",
    specs: [
      { label: "Turnaround", value: "2–8 hours" },
      { label: "Interior", value: "Deep clean" },
      { label: "Exterior", value: "Deep clean" },
      { label: "Ongoing", value: "Maintenance details" },
    ],
    from: "Quote on request",
  },
];

export type Package = {
  name: string;
  note?: string;
  body: string;
  price: string;
  image?: string;
  popular?: boolean;
};

export type PackageGroup = { id: string; label: string; intro: string; items: Package[] };

export const packages: PackageGroup[] = [
  {
    id: "ppf",
    label: "PPF",
    intro: "Stek DYNOshield, applied by accredited installers in a dust-free wrap studio.",
    items: [
      {
        name: "High traffic areas",
        body: "Door cups, sills, luggage compartment and B pillars — 8mil transparent film that keeps high-contact areas looking new and helps hold value.",
        price: "€150",
        image: "/work/ppf-coverage-high-traffic.jpg",
      },
      {
        name: "Front end",
        body: "Bumper, hood, fenders, A pillars and front roof — stops chips, scratches and rust before they start. Carbon, forged carbon and Damascus films available for accents.",
        price: "From €1,500",
        image: "/work/ppf-coverage-front.jpg",
      },
      {
        name: "Front end extended",
        body: "Everything in Front end, plus the lower sides prone to road rash. Built for motorway miles and spirited driving.",
        price: "From €2,200",
        image: "/work/ppf-coverage-extended.jpg",
      },
      {
        name: "Full body",
        body: "Preserve your original paint in transparent film, or go bold with a complete colour change — with a warranty of up to 12 years.",
        price: "POA",
      },
    ],
  },
  {
    id: "correction",
    label: "Correction",
    intro: "Every package begins with a full decontamination wash and clay bar.",
    items: [
      {
        name: "Gloss enhancement",
        note: "Entry level",
        body: "Removes oxidation and very light scratches to bring the gloss back. Best for older daily drivers. 6-month sealant included.",
        price: "From €250",
      },
      {
        name: "Single stage correction",
        body: "60–90% defect removal in one refined round, with no haze. Best for cars up to 5 years old. 6-month sealant included.",
        price: "From €400",
        popular: true,
      },
      {
        name: "Cut & polish",
        note: "2-step",
        body: "A heavy cut for deep swirls, then a jewelling polish for clarity — 80–95% defect removal. Ideal before a ceramic coating.",
        price: "From €650",
      },
      {
        name: "Multi-stage correction",
        body: "Wet sanding, cutting, polishing and finishing for 90–99% defect removal — a true showroom finish. Pair with a long-term coating.",
        price: "POA",
      },
      {
        name: "Spot sanding",
        body: "Accidents happen. If the paint isn't broken, we can sand and polish most damage away — no body shop needed.",
        price: "POA",
      },
    ],
  },
  {
    id: "ceramic",
    label: "Ceramic",
    intro: "Certified Feynlab and Titan Coatings installer. Prices are body and windows.",
    items: [
      {
        name: "1 year — Feynlab Original",
        body: "A true chemical bond with your paint for real hydrophobic protection, gloss and slickness.",
        price: "From €200",
      },
      {
        name: "5 year — Feynlab Ultra V3",
        body: "Biphasal technology that cures into a self-cleaning, highly hydrophobic layer with depth beyond any single-phase coating.",
        price: "From €400",
      },
      {
        name: "10 year — Titan PX10 + Vulcan TX-155",
        body: "Dark-matter base coat with an omniphobic top coat for unprecedented slickness and chemical resistance.",
        price: "From €800",
      },
      {
        name: "Wheels & callipers",
        body: "Feynlab nano-coating so brake dust and grime release with far less effort. Face only from €200; face, barrel, calliper and arch from €600.",
        price: "From €200",
      },
      {
        name: "Interior coating",
        body: "Protects leather, vinyl, plastics and trim from UV, heat and stains — with no change to the factory look or feel.",
        price: "From €180",
      },
    ],
  },
  {
    id: "tint",
    label: "Tints",
    intro: "Stek films, from a light finishing tint to full VIP privacy.",
    items: [
      {
        name: "Window tinting",
        body: "Ceramic tints with heat and UV rejection to protect your interior and keep passengers comfortable.",
        price: "From €350",
      },
      {
        name: "Headlight & taillight tint",
        body: "A stealthier look that also protects lights from fading and stone chips. NCT passable.",
        price: "From €150",
      },
    ],
  },
];

export const process = [
  {
    title: "Decontaminate",
    body: "An extensive wash removes road grime, iron, tar and sap, followed by a clay bar to lift embedded contaminants.",
  },
  {
    title: "Perfect",
    body: "In our custom-built detail bay, multi-stage correction eliminates defects to reveal a flawless finish.",
  },
  {
    title: "Protect",
    body: "Film is applied in our dust-free wrap studio; coatings cure under controlled conditions. No shortcuts.",
  },
  {
    title: "Preserve",
    body: "Every job is finished by hand and handed over with an aftercare guide — and the products to keep it perfect.",
  },
];

export const partners = ["Stek", "Feynlab", "Titan Coatings", "Koch-Chemie", "CarPro"];

export const faqs = [
  {
    q: "How long will I be without my car?",
    a: "It depends on the work: detailing takes 2–8 hours, tints a single day, ceramic coatings 1–2 days, and paint correction or PPF 1–6 days depending on the package.",
  },
  {
    q: "What warranty comes with PPF?",
    a: "Our Stek film carries a warranty of 10–12 years depending on the product, covering yellowing, cracking and peeling when installed by an accredited installer like us.",
  },
  {
    q: "Should I correct my paint before coating or film?",
    a: "Usually, yes. Coatings and film lock in whatever is underneath, so we recommend correction first. Cut & polish or multi-stage correction pairs best with a long-term ceramic coating.",
  },
  {
    q: "Are tinted lights legal?",
    a: "Our Stek headlight and taillight tints are NCT passable. For windows, we'll advise on legal VLT levels for your vehicle before fitting.",
  },
  {
    q: "How do I look after a ceramic coating?",
    a: "Keep the car dry for 12 hours after application while it cures. After that, gentle hand washes are all it needs — we provide an aftercare guide, and the right products are available from us.",
  },
  {
    q: "Can PPF change my car's colour?",
    a: "Yes. Alongside transparent film, Stek DYNO offers paint-to-match colours, matte finishes and patterns such as forged carbon — all while protecting the original paint underneath.",
  },
];

// PLACEHOLDER — confirm contact details with the client.
export const contact = {
  phone: "+353 00 000 0000",
  phoneHref: "tel:+35300000000",
  email: "hello@lughautohaus.ie",
};
