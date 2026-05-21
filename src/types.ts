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
  titleScale?: number;
  subtitleScale?: number;
  bodyScale?: number;
  textWidth?: number; // Largura do container de texto
  textOffsetX?: number;
  textOffsetY?: number;
  hidePageCounter?: boolean;
  hideProfile?: boolean;
  hideTitle?: boolean;
  hideSubtitle?: boolean;
  hideBody?: boolean;
  hideBadge?: boolean;
  hideFooter?: boolean;
  badgeText?: string;
  swipeText?: string;
  likesCount?: string;
  commentsCount?: string;
  fullDesignMode?: boolean;
  
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

export interface PresetStyle {
  id: string;
  name: string;
  bg: string;
  text: string;
  accent: string;
  titleFont: string;
  bodyFont: string;
}

export const PRESET_STYLES: PresetStyle[] = [
  // 💰 Finanças & Riqueza
  { id: "finance-gold", name: "Finanças Premium", bg: "#0D1117", text: "#FFFFFF", accent: "#D4AF37", titleFont: "Playfair Display", bodyFont: "Inter" },
  { id: "wealth-green", name: "Investidor", bg: "#022B18", text: "#F3F4F6", accent: "#10B981", titleFont: "Montserrat", bodyFont: "Roboto" },
  
  // 🩺 Saúde & Bem-Estar
  { id: "health-blue", name: "Clínica Clean", bg: "#FFFFFF", text: "#1E3A8A", accent: "#3B82F6", titleFont: "Poppins", bodyFont: "Inter" },
  { id: "wellness-soft", name: "Bem-Estar", bg: "#F0FDF4", text: "#065F46", accent: "#34D399", titleFont: "Lora", bodyFont: "Nunito" },

  // 💅 Beleza & Feminino
  { id: "beauty-rose", name: "Beleza Rose", bg: "#FFF1F2", text: "#4C1D95", accent: "#F43F5E", titleFont: "Playfair Display", bodyFont: "Montserrat" },
  { id: "delicate-nude", name: "Nude Delicado", bg: "#FDFBF7", text: "#4A4036", accent: "#D4A373", titleFont: "Cormorant Garamond", bodyFont: "Lato" },

  // 🏢 Luxo & Imobiliária
  { id: "luxury-dark", name: "Imóvel Luxo", bg: "#111111", text: "#E5E7EB", accent: "#9CA3AF", titleFont: "Bebas Neue", bodyFont: "Montserrat" },
  { id: "minimalist-beige", name: "Minimalista", bg: "#FAF8F5", text: "#1F2937", accent: "#D97706", titleFont: "Inter", bodyFont: "Inter" },

  // 🚀 Marketing & Agência
  { id: "marketing-vibrant", name: "Agência Agressiva", bg: "#111827", text: "#FFFFFF", accent: "#FBBF24", titleFont: "Oswald", bodyFont: "Roboto" },
  { id: "tech-future", name: "Tech Futurista", bg: "#0B0F19", text: "#F3F4F6", accent: "#3B82F6", titleFont: "Space Grotesk", bodyFont: "Inter" },
  
  // 🌃 Criativo & Outros
  { id: "neon-vibe", name: "Dark Neon", bg: "#0A0515", text: "#FAFAFA", accent: "#EC4899", titleFont: "Outfit", bodyFont: "Fira Code" },
  { id: "editorial-classic", name: "Editorial Elegante", bg: "#112211", text: "#F5F5F0", accent: "#C5A880", titleFont: "Playfair Display", bodyFont: "Playfair Display" },
];
