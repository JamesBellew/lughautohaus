/*
 * Stek DYNO film range, as shown in the supplier brochure.
 * Swatch colours are close approximations for on-screen preview only —
 * the studio should always show real film samples before an install.
 */

export type Surface = "gloss" | "matte";

export type Finish = {
  id: string;
  name: string;
  /** Solid colour, or a CSS gradient for pearlescent/flip films */
  color: string;
  /** Darker companion used for body shading and the swatch edge */
  shade?: string;
  surface: Surface;
  /** Optional procedural texture */
  pattern?: "carbon" | "forged" | "camo" | "damascus";
  /** Seamless image tile for photographic patterns; overrides the drawn texture */
  tile?: string;
  /** Transparent film laid over the chosen paint rather than replacing it */
  overlay?: boolean;
  /** Tile laid over this finish's own paint colour (overlay blend), e.g. camo */
  film?: { size: string; strength?: number };
  /** Texture ink colour (pattern films) */
  ink?: string;
  /** Prism films shift colour; drawn with a gradient */
  flip?: [string, string];
};

export type Series = {
  id: "clear" | "color" | "pattern" | "black" | "light";
  label: string;
  title: string;
  lede: string;
  body: string;
  features: string[];
  groups: { label?: string; finishes: Finish[] }[];
};

const g = (id: string, name: string, color: string, shade?: string, extra: Partial<Finish> = {}): Finish => ({
  id,
  name,
  color,
  shade,
  surface: "gloss",
  ...extra,
});
const m = (id: string, name: string, color: string, shade?: string, extra: Partial<Finish> = {}): Finish => ({
  id,
  name,
  color,
  shade,
  surface: "matte",
  ...extra,
});

export const series: Series[] = [
  {
    id: "clear",
    label: "Clear",
    title: "DYNO Clear Series",
    lede: "Clean look, strong protection, lasting shine.",
    body: "Invisible film that keeps your factory paint exactly as it is — only richer, glossier and guarded against chips, scratches and stains. Choose a gloss finish, or go satin-matte without a drop of paint.",
    features: [
      "Deeper, richer colour",
      "Extremely clear finish",
      "Super hydrophobic — stays cleaner for longer",
      "Matte and gloss options",
      "Self-healing, long-lasting protection",
    ],
    groups: [
      {
        finishes: [
          g("clear-gloss", "Clear gloss", "#4c5560", "#262b31"),
          m("clear-matte", "Clear matte", "#4c5560", "#262b31"),
        ],
      },
    ],
  },
  {
    id: "color",
    label: "Colour",
    title: "DYNO Color Series",
    lede: "Bold colours, lasting performance.",
    body: "Vibrant, paint-like shades with exceptional durability and self-healing protection — a full colour change that protects the original paint underneath and can be removed at any time.",
    features: ["Paint-like depth", "Self-healing surface", "Fully reversible colour change"],
    groups: [
      {
        label: "Standard",
        finishes: [
          g("miami-blue", "Miami blue", "#21b8e0", "#0b6f8f"),
          g("orange", "Orange", "#ef5a1c", "#9b2f08"),
          g("gray", "Gray", "#8a948d", "#4c544f"),
          g("black", "Black", "#0d0d0f", "#000000"),
          g("white", "White", "#e9ebe6", "#a9aca6"),
          g("red", "Red", "#c4142c", "#6e0614"),
          g("purple", "Purple", "#3a2160", "#180b2c"),
          g("green", "Green", "#3f9a5c", "#1d5631"),
          g("prism", "Prism", "#e4e6e2", "#9ea4a6", { flip: ["#f2f4f0", "#b8c6cc"] }),
          g("prism-fire", "Prism fire", "#3a0d14", "#12030a", { flip: ["#5c1220", "#14040a"] }),
          g("tanzanite", "Tanzanite", "#1c2f8c", "#0b1548"),
        ],
      },
      {
        label: "Matte",
        finishes: [
          m("matte-green", "Green", "#1f5a3d", "#0e2f1f"),
          m("matte-black", "Black", "#232326", "#0d0d0e"),
          m("matte-white", "White", "#e3e1dc", "#a3a19c"),
          m("matte-prism", "Prism", "#d6d8d4", "#9a9e9c", { flip: ["#e2e4df", "#b3bcc0"] }),
          m("matte-purple", "Purple", "#2c2438", "#140f1c"),
          m("matte-orange", "Orange", "#e5521e", "#93300a"),
        ],
      },
    ],
  },
  {
    id: "pattern",
    label: "Pattern",
    title: "DYNO Pattern Series",
    lede: "Stand out with patterns like never before.",
    body: "Carbon, forged carbon, Damascus and camo — bold texture with the same reliable protection. Perfect for full wraps or accents on mirrors, roofs, splitters and interior trim.",
    features: ["Carbon, forged, Damascus & camo", "Exterior and interior trim", "Protection built in"],
    groups: [
      {
        finishes: [
          g("camo", "Camo", "#5d6268", "#3a3d41", { pattern: "camo", ink: "#9ea39c", tile: "/finishes/camo-v2.webp", film: { size: "20% auto", strength: 0.78 } }),
          g("camo-black", "Camo black", "#121315", "#060607", { pattern: "camo", ink: "#57595c", tile: "/finishes/camo-black-v1.webp" }),
          g("damascus-black", "Damascus black", "#0f1011", "#050506", { pattern: "damascus", ink: "#8b8e92", tile: "/finishes/damascus-black-v3.webp" }),
          g("carbon-clear", "Carbon clear", "#8d939a", "#5b6066", { pattern: "carbon", ink: "#b9bcb8", tile: "/finishes/carbon-clear-v2.webp", overlay: true }),
          m("carbon-matte", "Carbon matte", "#151618", "#08090a", { pattern: "carbon", ink: "#1a1b1c", tile: "/finishes/carbon-matte-v1.webp" }),
          g("carbon-gloss", "Carbon gloss", "#111214", "#050506", { pattern: "carbon", ink: "#121315", tile: "/finishes/carbon-gloss-v1.webp" }),
          g("forged-gloss", "Forged gloss", "#141517", "#060607", { pattern: "forged", ink: "#55585d", tile: "/finishes/forged-gloss-v1.webp" }),
          g("forged-metal", "Forged metal", "#2a2c30", "#121315", { pattern: "forged", ink: "#8d9196", tile: "/finishes/forged-metal-v1.webp" }),
          m("forged-matte", "Forged matte", "#141517", "#070708", { pattern: "forged", ink: "#3c3e41", tile: "/finishes/forged-matte-v1.webp" }),
          g("forged-red", "Forged red wine", "#1d060c", "#0a0204", { pattern: "forged", ink: "#c0203f", tile: "/finishes/forged-red-v3.webp" }),
        ],
      },
    ],
  },
  {
    id: "black",
    label: "DYNOblack",
    title: "DYNOblack",
    lede: "Deep. Bold. Truly black.",
    body: "Made with real automotive paint pigments for the richest, glossiest black finish — deeper and clearer than ordinary paint can achieve, with a commanding presence.",
    features: ["Extreme gloss", "Real paint finish", "Deep black colour"],
    groups: [{ finishes: [g("dynoblack", "DYNOblack", "#060607", "#000000")] }],
  },
  {
    id: "light",
    label: "Lights",
    title: "DYNO Light Protection Series",
    lede: "Enhance your lights, elevate your style.",
    body: "Headlight and taillight film for a sleek, stealthier look — shielding lenses from stone chips, scratches and fading, and NCT passable.",
    features: ["Premium look", "Protection against chips and scratches", "Long-term clarity"],
    groups: [
      {
        finishes: [
          g("storm", "DYNOstorm", "rgba(70,78,88,0.25)"),
          g("smoke", "DYNOsmoke", "rgba(40,44,50,0.45)"),
          g("shadow", "DYNOshadow", "rgba(20,22,26,0.62)"),
          g("shade", "DYNOshade", "rgba(8,9,11,0.78)"),
        ],
      },
    ],
  },
];
