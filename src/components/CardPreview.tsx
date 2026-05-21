import React from "react";
import { InstagramCard, DimensionType, DIMENSIONS } from "../types";
import { MessageSquare, Heart, Send, Bookmark, ArrowRight, Quote } from "lucide-react";

interface CardPreviewProps {
  card: InstagramCard;
  dimensionType: DimensionType;
  themeColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  username: string;
  avatarUrl?: string;
  totalCards: number;
  index: number;
  showInstagramOverlay: boolean;
  imageFitMode: "background" | "side" | "hidden";
  id?: string;
  isEditable?: boolean;
  onUpdateField?: (field: keyof InstagramCard, value: any) => void;
}

const EditableText = ({
  tag: Tag = "div",
  className = "",
  style = {},
  value,
  field,
  isEditable,
  onUpdateField,
  renderFormattedText,
  primaryColor,
  highlightColor
}: any) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    setIsFocused(false);
    if (onUpdateField && e.currentTarget.innerText !== value) {
      onUpdateField(field, e.currentTarget.innerText);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEditable) {
      e.stopPropagation();
      if (!isFocused) setIsFocused(true);
    }
  };

  return (
    <Tag
      className={`${className} ${isEditable && !isFocused ? "cursor-text hover:outline hover:outline-1 hover:outline-dashed hover:outline-white/40 transition-all rounded" : ""} ${isEditable && isFocused ? "outline-none ring-1 ring-purple-500 bg-white/5 rounded" : ""}`}
      style={style}
      contentEditable={isEditable && isFocused}
      suppressContentEditableWarning
      onBlur={handleBlur}
      onClick={handleClick}
    >
      {isFocused ? value : renderFormattedText(value, primaryColor, highlightColor)}
    </Tag>
  );
};

export default function CardPreview({
  card,
  dimensionType,
  themeColor,
  textColor,
  accentColor,
  fontFamily,
  username,
  avatarUrl,
  totalCards,
  index,
  showInstagramOverlay,
  imageFitMode,
  id,
  isEditable,
  onUpdateField,
}: CardPreviewProps) {
  const currentDim = DIMENSIONS[dimensionType];
  const isDark = isColorDark(card.customBgColor || themeColor);

  // Simple contrast decider
  function isColorDark(hexColor: string): boolean {
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return true;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  // Formata texto destacando **palavras** com a cor de destaque (accent)
  const renderFormattedText = (text: string, primaryColor: string, highlightColor: string) => {
    if (!text) return "";
    
    // Expressão regular para capturar **texto** ou *texto*
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong 
            key={i} 
            className="font-bold underline decoration-2" 
            style={{ color: highlightColor }}
          >
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span 
            key={i} 
            className="font-semibold italic" 
            style={{ color: highlightColor }}
          >
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  // Font class switcher
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "Space Grotesk":
        return "font-display";
      case "Playfair Display":
        return "font-serif";
      case "Fira Code":
      case "JetBrains Mono":
        return "font-mono";
      case "Outfit":
        return "font-outfit";
      default:
        return "font-sans";
    }
  };

  // Determine standard colors or overrides for individual slide editing
  const bgStyle = card.customBgColor || themeColor;
  const textStyle = card.customTextColor || textColor;
  const accentStyle = card.customAccentColor || accentColor;
  const titleColor = card.customTitleColor || textStyle;
  const subtitleColor = card.customSubtitleColor || accentStyle;
  const cardTextAlign = card.textAlign ? `text-${card.textAlign}` : "";

  return (
    <div
      id={id || `card-canvas-${card.id}`}
      className={`relative w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${currentDim.ratioClass} border border-white/10`}
      style={{ 
        backgroundColor: bgStyle,
        fontFamily: fontFamily,
      }}
    >
      {/* Background Image / Texture Layer */}
      {card.backgroundImageUrl ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-500 z-0"
            style={{ backgroundImage: `url(${card.backgroundImageUrl})` }}
          />
          <div 
            className="absolute inset-0 transition-opacity duration-300 z-0" 
            style={{ 
              backgroundColor: bgStyle,
              opacity: (card.bgOpacity !== undefined ? card.bgOpacity : 80) / 100,
            }}
          />
        </>
      ) : (
        card.imageUrl && imageFitMode === "background" && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 z-0"
              style={{ 
                backgroundImage: `url(${card.imageUrl})`,
              }}
            />
            {/* Tint overlay so text remains perfectly readable */}
            <div 
              className="absolute inset-0 transition-opacity duration-300 z-0" 
              style={{ 
                backgroundColor: bgStyle,
                opacity: isDark ? 0.75 : 0.85,
              }}
            />
          </>
        )
      )}

      {/* Decorative Geometric Elements — gradiente CSS para compatibilidade perfeita com html2canvas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at -5% -5%, ${accentStyle}40 0%, transparent 45%),
                       radial-gradient(circle at 105% 105%, ${accentStyle}28 0%, transparent 50%)`,
        }}
      />

      {/* Content wrapper depending on Layout */}
      <div 
        className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 z-10"
        style={{ color: textStyle }}
      >
        {/* Card Header: Brand / Profile Info */}
        <div className="flex items-center justify-between pointer-events-none">
          {!card.hideProfile ? (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="user avatar" 
                  className="w-10 h-10 rounded-full border border-white/20 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-white/20"
                  style={{ backgroundColor: accentStyle, color: isDark ? "#FFFFFF" : "#000000" }}
                >
                  {username ? username.replace("@", "").slice(0, 2).toUpperCase() : "IG"}
                </div>
              )}
              <span className="font-semibold text-sm tracking-wide">
                {username || "@seu.perfil"}
              </span>
            </div>
          ) : <div />}

          {/* Page Counter (e.g. 1 / 5) */}
          {!card.hidePageCounter && (
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md border"
              style={{ 
                borderColor: `${textStyle}20`, 
                backgroundColor: `${bgStyle}80`,
                color: textStyle
              }}
            >
              {index + 1} / {totalCards}
            </div>
          )}
        </div>

        {/* Card Body & Layout Handler */}
        <div className="flex-1 flex flex-col justify-center my-6">
          {card.layoutType === "text-center" && (
            <div 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-4 mx-auto ${getFontFamilyClass()}`}
              style={{ 
                maxWidth: card.textWidth ? `${card.textWidth}%` : '32rem',
                width: '100%',
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'center' 
              }}
            >
              {card.subtitle && !card.hideSubtitle && (
                <EditableText
                  tag="p"
                  className="text-xs uppercase tracking-widest font-bold font-mono"
                  style={{ color: subtitleColor }}
                  value={card.subtitle}
                  field="subtitle"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => val}
                />
              )}
              {!card.hideTitle && (
                <EditableText
                  tag="h2"
                  className="text-2xl md:text-[3.5rem] font-extrabold leading-tight tracking-tight"
                  value={card.title}
                  field="title"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, titleColor, accentStyle)}
                />
              )}
              {card.body && !card.hideBody && (
                <EditableText
                  tag="div"
                  className="text-sm md:text-base opacity-90 leading-relaxed font-normal whitespace-pre-line mt-4"
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                />
              )}
            </div>
          )}

          {card.layoutType === "text-left" && (
            <div 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-left"} space-y-4 ${getFontFamilyClass()}`}
              style={{ 
                maxWidth: card.textWidth ? `${card.textWidth}%` : '36rem',
                width: '100%',
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'left center' 
              }}
            >
              {card.subtitle && !card.hideSubtitle && (
                <EditableText
                  tag="p"
                  className="text-xs uppercase tracking-widest font-bold font-mono"
                  style={{ color: subtitleColor }}
                  value={card.subtitle}
                  field="subtitle"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => val}
                />
              )}
              {!card.hideTitle && (
                <EditableText
                  tag="h2"
                  className="text-2xl md:text-[3.5rem] font-extrabold leading-tight tracking-tight"
                  value={card.title}
                  field="title"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, titleColor, accentStyle)}
                />
              )}
              {card.body && !card.hideBody && (
                <EditableText
                  tag="div"
                  className="text-sm md:text-base opacity-95 leading-relaxed whitespace-pre-line border-l-4 pl-4"
                  style={{ borderColor: accentStyle }}
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                />
              )}
            </div>
          )}

          {card.layoutType === "quote" && (
            <div 
              className={`mx-auto ${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-6 ${getFontFamilyClass()}`}
              style={{ 
                maxWidth: card.textWidth ? `${card.textWidth}%` : '36rem',
                width: '100%',
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'center' 
              }}
            >
              <div className="flex justify-center">
                <Quote className="w-12 h-12 opacity-30" style={{ color: subtitleColor }} />
              </div>
              {!card.hideTitle && (
                <EditableText
                  tag="h2"
                  className="text-xl md:text-[2.5rem] italic font-semibold leading-relaxed"
                  value={card.title}
                  field="title"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => `"${renderFormattedText(val, titleColor, accentStyle)}"`}
                />
              )}
              {card.body && !card.hideBody && (
                <EditableText
                  tag="p"
                  className="text-sm md:text-base opacity-80 font-mono"
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => `— ${val}`}
                />
              )}
            </div>
          )}

          {card.layoutType === "split-vertical" && (
            <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 items-center h-full ${getFontFamilyClass()}`}>
              <div 
                className={`md:col-span-3 space-y-4 ${card.textAlign ? `text-${card.textAlign}` : ""}`}
                style={{ 
                  maxWidth: card.textWidth ? `${card.textWidth}%` : '100%',
                  width: '100%',
                  transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                  transformOrigin: 'left center' 
                }}
              >
                {card.subtitle && !card.hideSubtitle && (
                  <EditableText
                    tag="p"
                    className="text-xs uppercase tracking-widest font-semibold font-mono"
                    style={{ color: subtitleColor }}
                    value={card.subtitle}
                    field="subtitle"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => val}
                  />
                )}
                {!card.hideTitle && (
                  <EditableText
                    tag="h2"
                    className="text-xl md:text-[2.5rem] font-extrabold leading-tight tracking-tight"
                    value={card.title}
                    field="title"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => renderFormattedText(val, titleColor, accentStyle)}
                  />
                )}
                {card.body && !card.hideBody && (
                  <EditableText
                    tag="div"
                    className="text-sm opacity-90 leading-relaxed whitespace-pre-line"
                    value={card.body}
                    field="body"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                  />
                )}
              </div>
              <div className="md:col-span-2 flex justify-center items-center">
                {card.imageUrl && imageFitMode !== "hidden" ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg border border-white/10 group"
                       style={{ 
                         backgroundImage: `url(${card.imageUrl})`,
                         backgroundSize: card.imageObjectFit === "contain" ? "contain" : "cover",
                         backgroundPosition: "center",
                         backgroundRepeat: "no-repeat"
                       }}>
                  </div>
                ) : !card.hideIllustrationSpace && (
                  <div 
                    className="w-full aspect-square rounded-xl flex flex-col items-center justify-center border border-dashed text-xs p-4 text-center"
                    style={{ borderColor: `${textStyle}30`, backgroundColor: `${textStyle}05` }}
                  >
                    <span className="opacity-60 mb-2">Espaço de Ilustração</span>
                    <span className="font-mono text-[10px] opacity-40 px-2 break-all">{card.imagePrompt.slice(0, 45)}...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {card.layoutType === "cta-card" && (
            <div 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-6 mx-auto ${getFontFamilyClass()}`}
              style={{ 
                maxWidth: card.textWidth ? `${card.textWidth}%` : '32rem',
                width: '100%',
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'center' 
              }}
            >
              <span className="inline-block p-1 px-3 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Último slide 🎉
              </span>
              {!card.hideTitle && (
                <EditableText
                  tag="h2"
                  className="text-2xl md:text-4xl font-black leading-none tracking-tight uppercase"
                  value={card.title}
                  field="title"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, titleColor, accentStyle)}
                />
              )}
              {card.body && !card.hideBody && (
                <EditableText
                  tag="p"
                  className="text-sm md:text-base opacity-90 leading-relaxed font-medium"
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                />
              )}
              
              {/* Call to action action elements */}
              <div className="pt-4 flex flex-col gap-2 max-w-xs mx-auto">
                <button 
                  className="py-3 px-6 rounded-xl font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2"
                  style={{ backgroundColor: accentStyle, color: isColorDark(accentStyle) ? "#FFFFFF" : "#0D0E12" }}
                >
                  {card.ctaText || "Clique para aprender mais"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] opacity-60">Siga {username || "@seu.perfil"} para conteúdo diário</p>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: Swipe indicators, Like mockup */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: `${textStyle}15` }}>
          {/* Action indicator */}
          <div className="flex items-center gap-1.5">
            {index < totalCards - 1 ? (
              <div className="flex items-center gap-2 animate-pulse text-xs font-semibold tracking-wide">
                <span>Arraste para o lado</span>
                <ArrowRight className="w-4 h-4" style={{ color: subtitleColor }} />
              </div>
            ) : (
              <span className="text-xs font-semibold opacity-75">Gostou? Deixe o like!</span>
            )}
          </div>

          {/* Social Mockup Interactions (Pristine details) */}
          <div className="flex items-center gap-4 text-xs opacity-70">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span className="font-mono">9.4k</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="font-mono">412</span>
            </div>
            <Send className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Optional Instagram Native App Mock Frame Overlays to view simulated context */}
      {showInstagramOverlay && (
        <div className="absolute top-0 right-0 p-4 pointer-events-none z-20">
          <Bookmark className="w-5 h-5 text-white/55 drop-shadow" />
        </div>
      )}
    </div>
  );
}
