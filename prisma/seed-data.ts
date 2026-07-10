export type SeedProduct = Readonly<{
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageKeys: string[];
  inStock: boolean;
}>;

export type SeedCategory = Readonly<{
  name: string;
  slug: string;
  description: string;
  products: SeedProduct[];
}>;

const imagePathByCategory = {
  phones: "placeholders/catalog/phones.svg",
  laptops: "placeholders/catalog/laptops.svg",
  audio: "placeholders/catalog/audio.svg",
  accessories: "placeholders/catalog/accessories.svg",
} as const;

export const seedCategories: SeedCategory[] = [
  {
    name: "Phones",
    slug: "phones",
    description: "Everyday smartphones with fast displays, capable cameras, and all-day batteries.",
    products: [
      {
        name: "Compact 5G Phone",
        slug: "compact-5g-phone",
        description:
          "A pocket-friendly 5G phone with a bright OLED display, dual cameras, and fast charging.",
        priceCents: 59900,
        imageKeys: [imagePathByCategory.phones],
        inStock: true,
      },
      {
        name: "Pro Camera Phone",
        slug: "pro-camera-phone",
        description:
          "A flagship phone built around advanced photo controls, optical zoom, and a vivid screen.",
        priceCents: 99900,
        imageKeys: [imagePathByCategory.phones],
        inStock: true,
      },
      {
        name: "Foldable Work Phone",
        slug: "foldable-work-phone",
        description:
          "A flexible productivity phone with a large inner display and durable hinge design.",
        priceCents: 149900,
        imageKeys: [imagePathByCategory.phones],
        inStock: false,
      },
    ],
  },
  {
    name: "Laptops",
    slug: "laptops",
    description: "Portable computers for school, creative work, and everyday productivity.",
    products: [
      {
        name: "Ultralight 14 Laptop",
        slug: "ultralight-14-laptop",
        description:
          "A thin 14-inch laptop with quiet performance, long battery life, and a crisp display.",
        priceCents: 119900,
        imageKeys: [imagePathByCategory.laptops],
        inStock: true,
      },
      {
        name: "Creator 16 Laptop",
        slug: "creator-16-laptop",
        description:
          "A high-performance 16-inch laptop for editing, rendering, and multitasking-heavy work.",
        priceCents: 219900,
        imageKeys: [imagePathByCategory.laptops],
        inStock: true,
      },
      {
        name: "Student Chromebook",
        slug: "student-chromebook",
        description:
          "A simple, durable laptop with quick startup, cloud-first storage, and classroom-ready battery life.",
        priceCents: 34900,
        imageKeys: [imagePathByCategory.laptops],
        inStock: true,
      },
    ],
  },
  {
    name: "Audio",
    slug: "audio",
    description: "Headphones, earbuds, and speakers for focused listening and portable sound.",
    products: [
      {
        name: "Noise Canceling Headphones",
        slug: "noise-canceling-headphones",
        description:
          "Over-ear wireless headphones with adaptive noise canceling and soft all-day cushions.",
        priceCents: 32900,
        imageKeys: [imagePathByCategory.audio],
        inStock: true,
      },
      {
        name: "Portable Bluetooth Speaker",
        slug: "portable-bluetooth-speaker",
        description:
          "A water-resistant speaker with room-filling sound, a carry loop, and weekend battery life.",
        priceCents: 12900,
        imageKeys: [imagePathByCategory.audio],
        inStock: true,
      },
      {
        name: "True Wireless Earbuds",
        slug: "true-wireless-earbuds",
        description:
          "Compact earbuds with transparency mode, wireless charging, and a pocket-sized case.",
        priceCents: 17900,
        imageKeys: [imagePathByCategory.audio],
        inStock: false,
      },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Chargers, cables, and portable power essentials for daily device use.",
    products: [
      {
        name: "65W USB-C Charger",
        slug: "65w-usb-c-charger",
        description:
          "A compact wall charger with enough power for phones, tablets, and many lightweight laptops.",
        priceCents: 4900,
        imageKeys: [imagePathByCategory.accessories],
        inStock: true,
      },
      {
        name: "Magnetic Power Bank",
        slug: "magnetic-power-bank",
        description:
          "A slim snap-on battery pack with pass-through charging and an integrated charge indicator.",
        priceCents: 7900,
        imageKeys: [imagePathByCategory.accessories],
        inStock: true,
      },
      {
        name: "Braided USB-C Cable",
        slug: "braided-usb-c-cable",
        description: "A durable braided cable rated for fast charging and daily travel bag use.",
        priceCents: 1900,
        imageKeys: [imagePathByCategory.accessories],
        inStock: true,
      },
    ],
  },
];
