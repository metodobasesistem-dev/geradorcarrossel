import React from "react";
import { InstagramCard, DimensionType, DIMENSIONS } from "../types";
import { MessageSquare, Heart, Send, Bookmark, ArrowRight, Quote, Trash2 } from "lucide-react";

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

const ResizableBlock = ({ children, initialWidth, onResizeEnd, isEditable, className, style }: any) => {
  const [width, setWidth] = React.useState(initialWidth || 100);
  const [isResizing, setIsResizing] = React.useState(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  React.useEffect(() => {
    setWidth(initialWidth || 100);
  }, [initialWidth]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isEditable) return;
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const dx = e.clientX - startXRef.current;
    // Base approximation: 1% width is roughly 4px
    const newWidth = Math.max(50, Math.min(250, startWidthRef.current + (dx / 4)));
    setWidth(newWidth);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return;
    setIsResizing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (onResizeEnd) {
      onResizeEnd(Math.round(width));
    }
  };

  return (
    <div 
      className={`relative group ${className}`} 
      style={{ ...style, width: `${width}%`, maxWidth: 'none' }}
    >
      {children}
      {isEditable && (
        <div 
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-10 bg-white/20 hover:bg-purple-500 rounded cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 shadow-lg backdrop-blur-sm active:bg-purple-600"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          title="Arrastar para redimensionar a largura"
        >
          <div className="w-0.5 h-4 bg-white/80 rounded-full" />
        </div>
      )}
    </div>
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
            <ResizableBlock 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-4 mx-auto ${getFontFamilyClass()}`}
              initialWidth={card.textWidth || 100}
              isEditable={isEditable}
              onResizeEnd={(w: number) => onUpdateField && onUpdateField("textWidth", w)}
              style={{ 
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'center' 
              }}
            >
              {card.subtitle && !card.hideSubtitle && (
                <EditableText
                  tag="p"
                  className="text-xs uppercase tracking-widest font-bold font-mono"
                  style={{ color: subtitleColor, zoom: card.subtitleScale || 1 } as React.CSSProperties}
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
                  style={{ zoom: card.titleScale || 1 } as React.CSSProperties}
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
                  style={{ zoom: card.bodyScale || 1 } as React.CSSProperties}
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                />
              )}
            </ResizableBlock>
          )}

          {card.layoutType === "text-left" && (
            <ResizableBlock 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-left"} space-y-4 ${getFontFamilyClass()}`}
              initialWidth={card.textWidth || 100}
              isEditable={isEditable}
              onResizeEnd={(w: number) => onUpdateField && onUpdateField("textWidth", w)}
              style={{ 
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'left center' 
              }}
            >
              {card.subtitle && !card.hideSubtitle && (
                <EditableText
                  tag="p"
                  className="text-xs uppercase tracking-widest font-bold font-mono"
                  style={{ color: subtitleColor, zoom: card.subtitleScale || 1 } as React.CSSProperties}
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
                  style={{ zoom: card.titleScale || 1 } as React.CSSProperties}
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
                  style={{ borderColor: accentStyle, zoom: card.bodyScale || 1 } as React.CSSProperties}
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                />
              )}
            </ResizableBlock>
          )}

          {card.layoutType === "quote" && (
            <ResizableBlock 
              className={`mx-auto ${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-6 ${getFontFamilyClass()}`}
              initialWidth={card.textWidth || 100}
              isEditable={isEditable}
              onResizeEnd={(w: number) => onUpdateField && onUpdateField("textWidth", w)}
              style={{ 
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
                  style={{ zoom: card.titleScale || 1 } as React.CSSProperties}
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
                  style={{ zoom: card.bodyScale || 1 } as React.CSSProperties}
                  value={card.body}
                  field="body"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => `— ${val}`}
                />
              )}
            </ResizableBlock>
          )}

          {card.layoutType === "split-vertical" && (
            <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 items-center h-full ${getFontFamilyClass()}`}>
              <ResizableBlock 
                className={`md:col-span-3 space-y-4 ${card.textAlign ? `text-${card.textAlign}` : ""}`}
                initialWidth={card.textWidth || 100}
                isEditable={isEditable}
                onResizeEnd={(w: number) => onUpdateField && onUpdateField("textWidth", w)}
                style={{ 
                  transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                  transformOrigin: 'left center' 
                }}
              >
                {card.subtitle && !card.hideSubtitle && (
                  <EditableText
                    tag="p"
                    className="text-xs uppercase tracking-widest font-semibold font-mono"
                    style={{ color: subtitleColor, zoom: card.subtitleScale || 1 } as React.CSSProperties}
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
                    style={{ zoom: card.titleScale || 1 } as React.CSSProperties}
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
                    style={{ zoom: card.bodyScale || 1 } as React.CSSProperties}
                    value={card.body}
                    field="body"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => renderFormattedText(val, textStyle, accentStyle)}
                  />
                )}
              </ResizableBlock>
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
            <ResizableBlock 
              className={`${card.textAlign ? `text-${card.textAlign}` : "text-center"} space-y-6 mx-auto ${getFontFamilyClass()}`}
              initialWidth={card.textWidth || 100}
              isEditable={isEditable}
              onResizeEnd={(w: number) => onUpdateField && onUpdateField("textWidth", w)}
              style={{ 
                transform: `translate(${card.textOffsetX || 0}px, ${card.textOffsetY || 0}px) scale(${card.textScale || 1})`, 
                transformOrigin: 'center' 
              }}
            >
              {!card.hideBadge && (
                <div className="relative group/badge inline-block mx-auto">
                  <EditableText
                    tag="span"
                    className="inline-block p-1 px-3 rounded-full text-[10px] font-bold font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    value={card.badgeText !== undefined ? card.badgeText : "Último slide 🎉"}
                    field="badgeText"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => val}
                  />
                  {isEditable && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateField && onUpdateField("hideBadge", true); }}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-0.5 opacity-0 group-hover/badge:opacity-100 transition-opacity z-10"
                      title="Ocultar Badge"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              )}
              {!card.hideTitle && (
                <EditableText
                  tag="h2"
                  className="text-2xl md:text-4xl font-black leading-none tracking-tight uppercase"
                  style={{ zoom: card.titleScale || 1 } as React.CSSProperties}
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
                  style={{ zoom: card.bodyScale || 1 } as React.CSSProperties}
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
            </ResizableBlock>
          )}
        </div>

        {/* Card Footer: Swipe indicators, Like mockup */}
        {!card.hideFooter && (
          <div className="relative group/footer flex items-center justify-between pt-2 border-t" style={{ borderColor: `${textStyle}15` }}>
            {isEditable && (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateField && onUpdateField("hideFooter", true); }}
                className="absolute -top-3 right-0 bg-red-500 rounded-full p-1 opacity-0 group-hover/footer:opacity-100 transition-opacity z-10 shadow-lg"
                title="Ocultar Rodapé"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            )}
            
            {/* Action indicator */}
            <div className="flex items-center gap-1.5">
              {index < totalCards - 1 ? (
                <div className="flex items-center gap-2 animate-pulse text-xs font-semibold tracking-wide">
                  <EditableText
                    tag="span"
                    value={card.swipeText !== undefined ? card.swipeText : "Arraste para o lado"}
                    field="swipeText"
                    isEditable={isEditable}
                    onUpdateField={onUpdateField}
                    renderFormattedText={(val: string) => val}
                  />
                  <ArrowRight className="w-4 h-4" style={{ color: subtitleColor }} />
                </div>
              ) : (
                <EditableText
                  tag="span"
                  className="text-xs font-semibold opacity-75"
                  value={card.swipeText !== undefined ? card.swipeText : "Gostou? Deixe o like!"}
                  field="swipeText"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => val}
                />
              )}
            </div>

            {/* Social Mockup Interactions (Pristine details) */}
            <div className="flex items-center gap-4 text-xs opacity-70">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <EditableText
                  tag="span"
                  className="font-mono"
                  value={card.likesCount !== undefined ? card.likesCount : "9.4k"}
                  field="likesCount"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => val}
                />
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <EditableText
                  tag="span"
                  className="font-mono"
                  value={card.commentsCount !== undefined ? card.commentsCount : "412"}
                  field="commentsCount"
                  isEditable={isEditable}
                  onUpdateField={onUpdateField}
                  renderFormattedText={(val: string) => val}
                />
              </div>
              <Send className="w-4 h-4" />
            </div>
          </div>
        )}
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
