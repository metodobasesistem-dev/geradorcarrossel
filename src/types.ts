export type DimensionType = "square" | "portrait" | "story";

export interface DimensionConfig {
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  ratioClass: string;
}

export const DIMENSIONS: Record<DimensionType, DimensionConfig> = {
  square: {
    name: "Quadrado (1:1 Feed)",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    ratioClass: "aspect-square",
  },
  portrait: {
    name: "Retrato (4:5 Feed Vertical)",
    width: 1080,
    height: 1350,
    aspectRatio: "3:4", // Nearest supported by Gemini Flash Image is 3:4 or we center it
    ratioClass: "aspect-[4/5]",
  },
  story: {
    name: "Story / Reels (9:16)",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    ratioClass: "aspect-[9/16]",
  },
};

export interface InstagramCard {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  imagePrompt: string;
  imageUrl?: string; // Generated base64 image or custom upload
  layoutType: "text-center" | "text-left" | "split-vertical" | "quote" | "cta-card";
  ctaText?: string;
  textScale?: number;
  textOffsetX?: number;
  textOffsetY?: number;
  hidePageCounter?: boolean;
  hideProfile?: boolean;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideBody?: boolean;
  
  // Customization Profissional (Nível Canva)
  backgroundImageUrl?: string; // Fundo específico do slide
  bgOpacity?: number; // Opacidade do fundo escurecido (0 a 100)
  hideIllustrationSpace?: boolean; // Para ocultar o pontilhado vazio
  imageObjectFit?: "cover" | "contain"; // Como a imagem lateral se comporta
  textAlign?: "left" | "center" | "right" | "justify";
  customTitleColor?: string;
  customSubtitleColor?: string;
  
  // Slide-level color overrides (optional)
  customBgColor?: string;
  customTextColor?: string;
  customAccentColor?: string;
}

export interface CarouselData {
  themeColor: string;
  textColor: string;
  accentColor: string;
  cards: InstagramCard[];
}

export interface CarouselFormInput {
  theme: string;
  audience: string;
  objective: string;
  cardCount: number;
  size: DimensionType;
  style: string;
}

export const PRESET_STYLES = [
  {
    id: "tech-future",
    name: "Tech Futurista",
    bg: "#0B0F19",
    text: "#F3F4F6",
    accent: "#3B82F6",
    font: "Space Grotesk",
  },
  {
    id: "minimalist-beige",
    name: "Minimalista Minimal",
    bg: "#FAF8F5",
    text: "#1F2937",
    accent: "#D97706",
    font: "Inter",
  },
  {
    id: "vibrant-pop",
    name: "Pop Criativo",
    bg: "#F43F5E",
    text: "#FFFFFF",
    accent: "#FBBF24",
    font: "Outfit",
  },
  {
    id: "editorial-classic",
    name: "Editorial Elegante",
    bg: "#112211",
    text: "#F5F5F0",
    accent: "#C5A880",
    font: "Playfair Display",
  },
  {
    id: "neon-vibe",
    name: "Dark Neon",
    bg: "#0A0515",
    text: "#FAFAFA",
    accent: "#EC4899",
    font: "Fira Code",
  },
];
