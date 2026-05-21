import React, { useState, useEffect, useRef } from "react";
import { 
  InstagramCard, 
  DimensionType, 
  DIMENSIONS, 
  PRESET_STYLES, 
  CarouselData 
} from "./types";
import CardPreview from "./components/CardPreview";
import html2canvas from "html2canvas-pro";
import { 
  Sparkles, 
  Download, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  Type as FontIcon, 
  Layout, 
  Palette, 
  HelpCircle, 
  Image as ImageIcon, 
  Eye, 
  RotateCcw, 
  Chrome, 
  Check, 
  Copy, 
  User, 
  Upload, 
  Layers,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock
} from "lucide-react";

export default function App() {
  // Inputs Form State
  const [theme, setTheme] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const [size, setSize] = useState<DimensionType>("portrait"); // portrait (4:5) is highly recommended for Instagram
  const [selectedStyleIndex, setSelectedStyleIndex] = useState(0);
  const [customPrompt, setCustomPrompt] = useState("");

  // Global Style customization states (initialized from Preset Style 0)
  const [themeColor, setThemeColor] = useState(PRESET_STYLES[0].bg);
  const [textColor, setTextColor] = useState(PRESET_STYLES[0].text);
  const [accentColor, setAccentColor] = useState(PRESET_STYLES[0].accent);
  const [fontFamily, setFontFamily] = useState(PRESET_STYLES[0].font);

  // User Branding Profile
  const [username, setUsername] = useState("@seu.perfil");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Loaded Carousel state
  const [carouselData, setCarouselData] = useState<CarouselData | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showInstagramOverlay, setShowInstagramOverlay] = useState(true);
  const [imageFitMode, setImageFitMode] = useState<"background" | "side" | "hidden">("background");

  // Loading, success & error flags
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [generatingCardImageId, setGeneratingCardImageId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  // Caption generated alongside the post
  const [instagramCaption, setInstagramCaption] = useState("");
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Exporting screen/state feedback
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // References for avatar file input
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cardCustomImageRefs = useRef<Record<number, HTMLInputElement>>({});

  // Real-time Clock for status indicator as per aesthetic standards
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update design colors when Preset changes
  const applyPreset = (index: number) => {
    setSelectedStyleIndex(index);
    const preset = PRESET_STYLES[index];
    setThemeColor(preset.bg);
    setTextColor(preset.text);
    setAccentColor(preset.accent);
    setFontFamily(preset.font);
  };

  // Avatar Image upload conversion to Base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger avatar ref click
  const triggerAvatarRef = () => {
    avatarInputRef.current?.click();
  };

  // Clear design customizer completely
  const resetStyles = () => {
    applyPreset(0);
  };

  // Generate Instagram Caption on Client-side or append to prompt
  const makeInstagramCaption = (themeInput: string, objectiveInput: string, audienceInput: string, cards: InstagramCard[]) => {
    let caption = `💡 **${themeInput.toUpperCase()}**\n\n`;
    caption += `Você já parou para pensar sobre isso? Arraste para o lado e confira os conceitos fundamentais para te ajudar nessa jornada!\n\n`;
    
    cards.forEach((card, idx) => {
      if (idx > 0 && idx < cards.length - 1) {
        caption += `📌 **No slide ${idx + 1}**: ${card.title} - ${card.body.slice(0, 100)}...\n`;
      }
    });

    caption += `\n🏁 **Ação final**: ${cards[cards.length - 1]?.title || "Siga para mais!"}\n\n`;
    caption += `🎯 Conteúdo focado em: *${audienceInput}*\n`;
    caption += `📢 Objetivo do post: *${objectiveInput}*\n\n`;
    caption += `#marketingdigital #instagrammarketing #growth #criarconteudo #design #instagramcarousel #dicas #canva #inteligenciaartificial`;
    return caption;
  };

  // Trigger content generation (Server-side Gemini Call)
  const handleGenerateOutline = async () => {
    if (!theme || !audience || !objective) {
      setErrorMessage("Por favor, preencha o tema, o público-alvo e o objetivo.");
      return;
    }

    setIsGeneratingStructure(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/carousel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme,
          audience,
          objective,
          cardCount,
          size,
          style: PRESET_STYLES[selectedStyleIndex]?.name || "Custom",
          customPrompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao conectar com o serviço do Gemini.");
      }

      const data = await response.json();
      
      // Map properties matching structure
      // Pre-populate some demo mock images or let users generate dynamically
      const fetchedCards: InstagramCard[] = data.cards.map((c: any, index: number) => ({
        id: c.id || index + 1,
        title: c.title || "",
        subtitle: c.subtitle || "",
        body: c.body || "",
        imagePrompt: c.imagePrompt || "Abstract futuristic art backdrop, matching the theme",
        layoutType: c.layoutType || "text-left",
        ctaText: c.ctaText || "Arraste para o lado",
      }));

      const newCarousel: CarouselData = {
        themeColor: data.themeColor || themeColor,
        textColor: data.textColor || textColor,
        accentColor: data.accentColor || accentColor,
        cards: fetchedCards
      };

      setCarouselData(newCarousel);
      
      // Update global colors with the elegant AI selections if returned
      if (data.themeColor) setThemeColor(data.themeColor);
      if (data.textColor) setTextColor(data.textColor);
      if (data.accentColor) setAccentColor(data.accentColor);

      // Reset to slide 1
      setActiveCardIndex(0);

      // Create a nice Instagram caption
      const generatedCaption = makeInstagramCaption(theme, objective, audience, fetchedCards);
      setInstagramCaption(generatedCaption);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Não foi possível gerar a estrutura do carrossel.");
    } finally {
      setIsGeneratingStructure(false);
    }
  };

  // Single card AI Image Generation using 'gemini-2.5-flash-image' (nano banana)
  const handleGenerateImageForCard = async (cardId: number, index: number) => {
    const card = carouselData?.cards[index];
    if (!card) return;

    setGeneratingCardImageId(cardId);
    setErrorMessage("");

    try {
      const response = await fetch("/api/carousel/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: card.imagePrompt,
          aspectRatio: DIMENSIONS[size].aspectRatio // "1:1" or "3:4" or "9:16"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "A geração de imagem falhou. Verifique se o Gemini está disponível.");
      }

      const result = await response.json();
      
      setCarouselData(prev => {
        if (!prev) return prev;
        const updatedCards = [...prev.cards];
        updatedCards[index] = { ...updatedCards[index], imageUrl: result.imageUrl };
        return { ...prev, cards: updatedCards };
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Erro ao gerar imagem: ${err.message || "Erro de rede no Gemini nano banana."}`);
    } finally {
      setGeneratingCardImageId(null);
    }
  };

  // Upload custom file as slide image
  const handleCustomSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file && carouselData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const imageUrl = reader.result;
          setCarouselData(prev => {
            if (!prev) return prev;
            const updatedCards = [...prev.cards];
            updatedCards[index] = { ...updatedCards[index], imageUrl };
            return { ...prev, cards: updatedCards };
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Individual Card modifications
  const handleUpdateCardField = (index: number, field: keyof InstagramCard, value: any) => {
    setCarouselData(prev => {
      if (!prev) return prev;
      const updatedCards = [...prev.cards];
      updatedCards[index] = { ...updatedCards[index], [field]: value };
      return { ...prev, cards: updatedCards };
    });
  };

  // Reset slide level color overrides
  const handleResetCardColors = (index: number) => {
    setCarouselData(prev => {
      if (!prev) return prev;
      const updatedCards = [...prev.cards];
      updatedCards[index] = {
        ...updatedCards[index],
        customBgColor: undefined,
        customTextColor: undefined,
        customAccentColor: undefined,
      };
      return { ...prev, cards: updatedCards };
    });
  };

  // Swap slides positions
  const moveCard = (index: number, direction: "left" | "right") => {
    if (!carouselData) return;
    const newCards = [...carouselData.cards];
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= newCards.length) return;

    const temp = newCards[index];
    newCards[index] = newCards[targetIdx];
    newCards[targetIdx] = temp;

    setCarouselData({
      ...carouselData,
      cards: newCards
    });
    setActiveCardIndex(targetIdx);
  };

  // Add card dynamically
  const addNewCard = () => {
    if (!carouselData) return;
    const currentLength = carouselData.cards.length;
    const newCard: InstagramCard = {
      id: Date.now(),
      title: "Novo Título Exemplo",
      subtitle: "Subtítulo do slide",
      body: "Insira suas ideias ou digite as informações principais aqui em tópicos detalhados.",
      imagePrompt: "Isometric bright 3D illustration, minimal visual layout, dark aesthetic backdrops",
      layoutType: "text-center",
    };

    setCarouselData({
      ...carouselData,
      cards: [...carouselData.cards, newCard]
    });
    setActiveCardIndex(currentLength);
  };

  // Delete card safely
  const deleteCard = (index: number) => {
    if (!carouselData) return;
    if (carouselData.cards.length <= 2) {
      setErrorMessage("Um carrossel precisa ter pelo menos 2 cards.");
      return;
    }

    const updatedCards = [...carouselData.cards];
    updatedCards.splice(index, 1);

    setCarouselData({
      ...carouselData,
      cards: updatedCards
    });

    if (activeCardIndex >= updatedCards.length) {
      setActiveCardIndex(updatedCards.length - 1);
    }
  };

  // Copy caption to clipboard
  const copyCaptionToClipboard = () => {
    navigator.clipboard.writeText(instagramCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // HTML2Canvas sequence exporter — captura dos elementos ocultos em resolução real Instagram
  const handleExportAllPng = async () => {
    if (!carouselData) return;
    setIsExportingAll(true);
    setExportProgress(0);

    try {
      await document.fonts.ready;

      for (let i = 0; i < carouselData.cards.length; i++) {
        setExportProgress(Math.round((i / carouselData.cards.length) * 100));

        const element = document.getElementById(`export-canvas-${carouselData.cards[i].id}`);
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            width: DIMENSIONS[size].width,
            height: DIMENSIONS[size].height,
          });

          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `slide-${i + 1}-instagram.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Pequeno delay para o browser não bloquear múltiplos downloads
          await new Promise((r) => setTimeout(r, 300));
        }
      }
      setExportProgress(100);
    } catch (err) {
      console.error("Erro durante exportação das imagens:", err);
      setErrorMessage("Erro ao salvar os arquivos das imagens. Tente novamente.");
    } finally {
      setTimeout(() => {
        setIsExportingAll(false);
      }, 1000);
    }
  };

  // Download singular do slide ativo em resolução 2x (@2x retina)
  const handleExportSinglePng = async (cardId: number, index: number) => {
    const element = document.getElementById(`export-canvas-${cardId}`);
    if (!element) return;

    try {
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: DIMENSIONS[size].width,
        height: DIMENSIONS[size].height,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `slide-${index + 1}-single.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setErrorMessage("Não foi possível renderizar a imagem deste slide específico.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E12] text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Dynamic Aesthetic Action Header */}
      <header className="border-b border-white/[0.06] bg-[#11131A]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Criador de Carrossel Instagram
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Roteiros Inteligentes & Ilustração Imagen / Gemini</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[10px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded flex items-center gap-1">
                <Clock className="w-3 h-3 text-pink-400" />
                {currentTimeStr}
              </span>
            </p>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          {carouselData && (
            <button
              onClick={handleExportAllPng}
              disabled={isExportingAll}
              className={`py-2 px-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 active:scale-95 shadow-md ${
                isExportingAll ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isExportingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gerando {exportProgress}%
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar Todos (PNGs)
                </>
              )}
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-lg border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1.5" />
            <span className="text-[10px] uppercase tracking-wider font-mono px-2 text-slate-300">
              Chave API Pronta
            </span>
          </div>
        </div>
      </header>

      {/* Primary Workspace Layout Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-y-auto">
        
        {/* Left Control Panel Container (Inputs, Configurations) */}
        <section className="lg:col-span-5 xl:col-span-4 border-r border-white/[0.06] bg-[#11131A] p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs leading-relaxed flex items-start gap-2.5 animate-bounce">
              <span className="font-bold flex-shrink-0">⚠️ Ops:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Collapsible Panel Section 1: Post Strategy Outline */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                1. Estratégia do Post
              </h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                  <span>Tema / Assunto Principal</span>
                  <span className="text-[10px] text-slate-500">Ex: 5 erros fatais de SEO</span>
                </label>
                <input
                  type="text"
                  placeholder="Sobre o que você quer falar?"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Público-Alvo
                  </label>
                  <input
                    type="text"
                    placeholder="Quem vai ler?"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Objetivo Final
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Seguir / Curtir"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Medidas (Instagram Layout Sizes) Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Medida / Proporção do Layout
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(DIMENSIONS) as DimensionType[]).map((dimKey) => {
                    const active = size === dimKey;
                    return (
                      <button
                        key={dimKey}
                        onClick={() => setSize(dimKey)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 ${
                          active 
                            ? "bg-purple-600/10 border-purple-500 text-slate-100 font-bold" 
                            : "bg-slate-900/40 border-white/5 text-slate-400 text-xs hover:bg-slate-900/80 hover:border-white/10"
                        }`}
                      >
                        <span className="text-xs block mb-0.5 font-medium">{DIMENSIONS[dimKey].name.split(" ")[0]}</span>
                        <span className="text-[10px] font-mono block opacity-60 font-normal">{DIMENSIONS[dimKey].aspectRatio}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Número de Cards ({cardCount})
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    step={1}
                    value={cardCount}
                    onChange={(e) => setCardCount(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>2 (Mín)</span>
                    <span>10 (Máx)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono text-right">
                    Relação recomendada
                  </label>
                  <div className="text-[11px] text-yellow-400/80 text-right font-medium">
                    {cardCount <= 4 ? "Leituras Rápidas ⚡" : cardCount <= 7 ? "Post Ideal 💎" : "Guia Completo 📚"}
                  </div>
                </div>
              </div>

              {/* Instruções Adicionais Customizadas (Prompt) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex justify-between">
                  <span>Instruções adicionais / Prompt (Opcional)</span>
                  <span className="text-[10px] text-purple-400 font-mono">Poder do Gemini</span>
                </label>
                <textarea
                  placeholder="Ex: Use um tom descontraído e humorado, foque em 3 soluções práticas e inclua hashtags específicas no final..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Action Trigger button to communicate with Gemini */}
            <div className="pt-2">
              <button
                onClick={handleGenerateOutline}
                disabled={isGeneratingStructure}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white font-bold text-sm tracking-wide shadow-md shadow-purple-950/20 active:scale-98 transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingStructure ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Redigindo no Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span>Gerar Roteiro do Carrossel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Panel Section 2: Visual Branding & Presets */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  2. Estilos & Identidade
                </h3>
              </div>
              <button 
                onClick={resetStyles}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                title="Resetar Cores"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Flat presets list */}
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paletas Prontas (Presets)
              </span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_STYLES.map((preset, idx) => {
                  const active = selectedStyleIndex === idx;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(idx)}
                      className={`p-2 rounded-xl text-left border flex items-center gap-2.5 transition-all duration-150 ${
                        active 
                          ? "bg-slate-800/80 border-pink-500/50 shadow-md" 
                          : "bg-slate-900/30 border-white/5 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center flex-shrink-0 -space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.bg }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.text }} />
                        <div className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.accent }} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] block font-semibold text-slate-100 truncate">{preset.name}</span>
                        <span className="text-[9px] block text-slate-500 truncate font-mono">{preset.font}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Palette parameters (Live interactive states) */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/40 p-3 rounded-xl border border-white/5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold truncate leading-none">
                  Fundo
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="min-w-0 text-[10px] uppercase font-mono bg-transparent text-slate-300 focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold truncate leading-none">
                  Texto
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="min-w-0 text-[10px] uppercase font-mono bg-transparent text-slate-300 focus:outline-none w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1 font-semibold truncate leading-none">
                  Destaque
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="min-w-0 text-[10px] uppercase font-mono bg-transparent text-slate-300 focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Typography selection */}
            <div>
              <span className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <FontIcon className="w-3.5 h-3.5" />
                <span>Tipografia (Fonte das Headlines)</span>
              </span>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Inter">Inter (Sans-Serif Clean)</option>
                <option value="Space Grotesk">Space Grotesk (Tech Editorial)</option>
                <option value="Outfit">Outfit (Display Modern)</option>
                <option value="Playfair Display">Playfair Display (Editorial Citações)</option>
                <option value="JetBrains Mono">JetBrains Mono (Focado em Código)</option>
              </select>
            </div>
          </div>

          {/* Panel Section 3: Brand Branding Info Overlay */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
              <User className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                3. Identidade da Conta
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  @ Usuário / Perfil
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@seu.nome"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Foto do Perfil (Avatar)
                </label>
                <button
                  type="button"
                  onClick={triggerAvatarRef}
                  className="w-full py-2 px-3 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-white/10 rounded-xl text-xs text-slate-400 font-medium transition-colors flex items-center justify-center gap-2 truncate"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {avatarUrl ? "Foto Vinculada ✓" : "Carregar Logo"}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2 bg-slate-900/20 p-3 rounded-xl border border-white/5">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex justify-between">
                <span>Visualização das Imagens nas Slides</span>
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setImageFitMode("background")}
                  className={`p-1.5 text-[10px] font-bold rounded-lg border text-center transition-all ${
                    imageFitMode === "background"
                      ? "bg-purple-500/10 border-purple-500/80 text-slate-200"
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950"
                  }`}
                >
                  Fundo Inteiro
                </button>
                <button
                  onClick={() => setImageFitMode("side")}
                  className={`p-1.5 text-[10px] font-bold rounded-lg border text-center transition-all ${
                    imageFitMode === "side"
                      ? "bg-purple-500/10 border-purple-500/80 text-slate-200"
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950"
                  }`}
                >
                  Lateral split
                </button>
                <button
                  onClick={() => setImageFitMode("hidden")}
                  className={`p-1.5 text-[10px] font-bold rounded-lg border text-center transition-all ${
                    imageFitMode === "hidden"
                      ? "bg-purple-500/10 border-purple-500/80 text-slate-200"
                      : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-950"
                  }`}
                >
                  Ocultar Imagem
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400">Mostrar simulação de curtidas</span>
                <input
                  type="checkbox"
                  checked={showInstagramOverlay}
                  onChange={(e) => setShowInstagramOverlay(e.target.checked)}
                  className="rounded bg-slate-950 border-white/15 text-purple-600 focus:ring-opacity-40"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Active Card Preview & Edit Workspace Panel */}
        <section className="lg:col-span-7 xl:col-span-8 bg-[#0D0E12] p-6 lg:p-8 flex flex-col items-center justify-between overflow-y-auto max-h-[calc(100vh-73px)]">
          
          {carouselData ? (
            <div className="w-full flex flex-col h-full gap-8">
              
              {/* Timeline Header (Carousel navigation) */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                      Slides do Carrossel ({carouselData.cards.length} cards)
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-purple-400 font-medium">Use **palavra** para destacar com cor de destaque</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/5">
                    <button
                      onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
                      disabled={activeCardIndex === 0}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono px-1">
                      {activeCardIndex + 1} / {carouselData.cards.length}
                    </span>
                    <button
                      onClick={() => setActiveCardIndex(prev => Math.min(carouselData.cards.length - 1, prev + 1))}
                      disabled={activeCardIndex === carouselData.cards.length - 1}
                      className="p-1 rounded text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Horizontal mini slides view */}
                <div className="flex items-stretch gap-3 overflow-x-auto pb-4.5 pt-1 scroll-smooth">
                  {carouselData.cards.map((card, idx) => {
                    const isActive = idx === activeCardIndex;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setActiveCardIndex(idx)}
                        className={`flex-shrink-0 w-28 p-2 rounded-xl border text-left cursor-pointer transition-all duration-300 flex flex-col justify-between h-28 relative ${
                          isActive 
                            ? "border-purple-500 bg-slate-900 shadow-lg shadow-purple-950/20 scale-[1.03]" 
                            : "border-white/5 bg-slate-900/40 hover:bg-slate-900/80 hover:border-white/10"
                        }`}
                      >
                        {/* Little index bubble */}
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-mono text-[8px] font-bold">
                          {idx + 1}
                        </span>

                        <div className="min-h-0 pr-2">
                          <span className="text-[10px] block font-semibold text-slate-300 line-clamp-2 leading-tight">
                            {card.title || "(Sem título)"}
                          </span>
                          <span className="text-[8px] font-mono block opacity-50 mt-1 uppercase text-slate-400">
                            {card.layoutType}
                          </span>
                        </div>

                        {/* Thumbnail Background image preview indicator if any */}
                        <div className="mt-2 flex items-center justify-between">
                          {card.imageUrl ? (
                            <div className="w-6 h-6 rounded bg-cover bg-center border border-white/20" style={{ backgroundImage: `url(${card.imageUrl})` }} />
                          ) : (
                            <span className="text-[8px] font-mono text-slate-500 italic truncate max-w-[50px]">{card.imagePrompt.slice(0, 15)}...</span>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCard(idx);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors bg-black/20"
                            title="Deletar slide"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Slide Option */}
                  <button
                    onClick={addNewCard}
                    className="flex-shrink-0 w-24 rounded-xl border border-dashed border-white/10 bg-slate-950/40 hover:bg-slate-900/60 hover:border-purple-500/50 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-purple-400 gap-1"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Adicionar</span>
                  </button>
                </div>
              </div>

              {/* Main Interactive Work Area: Split screen Slide Preview on Left and Detailed Custom Editor on Right */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Visual rendering panel */}
                <div className="xl:col-span-6 flex flex-col items-center">
                  <div className="w-full max-w-[340px] md:max-w-[400px]">
                    
                    {/* Live Preview Wrapper */}
                    <div className="p-1 background-neon-border rounded-3xl overflow-hidden shadow-2xl relative">
                      <CardPreview
                        card={carouselData.cards[activeCardIndex]}
                        dimensionType={size}
                        themeColor={themeColor}
                        textColor={textColor}
                        accentColor={accentColor}
                        fontFamily={fontFamily}
                        username={username}
                        avatarUrl={avatarUrl}
                        totalCards={carouselData.cards.length}
                        index={activeCardIndex}
                        showInstagramOverlay={showInstagramOverlay}
                        imageFitMode={imageFitMode}
                      />
                    </div>

                    {/* Quick export active button under preview */}
                    <div className="mt-4 flex gap-2 justify-center">
                      <button
                        onClick={() => handleExportSinglePng(carouselData.cards[activeCardIndex].id, activeCardIndex)}
                        className="py-1.5 px-3.5 rounded-lg border border-white/10 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Baixar apenas este slide PNG
                      </button>
                    </div>

                  </div>
                </div>

                {/* Live Card Editor fields panel */}
                <div className="xl:col-span-6 bg-slate-900/50 rounded-2xl border border-white/[0.05] p-5 space-y-4.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                      Editando Slide #{activeCardIndex + 1}
                    </h4>

                    {/* Swap buttons */}
                    <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-md">
                      <button
                        onClick={() => moveCard(activeCardIndex, "left")}
                        disabled={activeCardIndex === 0}
                        className="p-1 rounded text-[10px] font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Mover para esquerda"
                      >
                        Mover Antes
                      </button>
                      <span className="text-slate-700 text-xs">|</span>
                      <button
                        onClick={() => moveCard(activeCardIndex, "right")}
                        disabled={activeCardIndex === carouselData.cards.length - 1}
                        className="p-1 rounded text-[10px] font-bold text-slate-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Mover para direita"
                      >
                        Mover Depois
                      </button>
                    </div>
                  </div>

                  {/* Editors fields */}
                  <div className="space-y-3.5">
                    
                    {/* Card Layout Switcher */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                        <Layout className="w-3 h-3" />
                        <span>Layout Visual Recomendado</span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {[
                          { id: "text-center", label: "Centro" },
                          { id: "text-left", label: "Esquerda" },
                          { id: "split-vertical", label: "Split" },
                          { id: "quote", label: "Citação" },
                          { id: "cta-card", label: "Ação (CTA)" },
                        ].map((layout) => {
                          const active = carouselData.cards[activeCardIndex].layoutType === layout.id;
                          return (
                            <button
                              key={layout.id}
                              onClick={() => handleUpdateCardField(activeCardIndex, "layoutType", layout.id)}
                              className={`p-1.5 rounded-lg border text-[10px] font-bold text-center transition-all ${
                                active 
                                  ? "bg-purple-500/10 border-purple-500/60 text-slate-200 shadow" 
                                  : "bg-slate-950/20 border-white/5 text-slate-400 hover:bg-slate-900"
                              }`}
                            >
                              {layout.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Título do Slide
                      </label>
                      <input
                        type="text"
                        value={carouselData.cards[activeCardIndex].title}
                        onChange={(e) => handleUpdateCardField(activeCardIndex, "title", e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Subtítulo / Apoio
                      </label>
                      <input
                        type="text"
                        value={carouselData.cards[activeCardIndex].subtitle}
                        onChange={(e) => handleUpdateCardField(activeCardIndex, "subtitle", e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-semibold text-slate-400">
                          Texto Principal (Máx. recomendação de 1-3 tópicos)
                        </label>
                        <span className="text-[9px] text-slate-500">Aceita quebras de linha</span>
                      </div>
                      <textarea
                        rows={3}
                        value={carouselData.cards[activeCardIndex].body}
                        onChange={(e) => handleUpdateCardField(activeCardIndex, "body", e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                      />
                    </div>

                    {carouselData.cards[activeCardIndex].layoutType === "cta-card" && (
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                          Texto do Botão CTA de Ação
                        </label>
                        <input
                          type="text"
                          value={carouselData.cards[activeCardIndex].ctaText || ""}
                          onChange={(e) => handleUpdateCardField(activeCardIndex, "ctaText", e.target.value)}
                          placeholder="Ex: Clique no link da Bio"
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    {/* Gemini Image generator tool per slide! */}
                    <div className="p-3 bg-[#11131A] rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>Imagem de Arte (Gerador Gemini Nano Banana)</span>
                        </label>
                        
                        {/* Custom files upload */}
                        <button
                          onClick={() => cardCustomImageRefs.current[carouselData.cards[activeCardIndex].id]?.click()}
                          className="text-[9px] text-slate-400 hover:text-slate-100 underline flex items-center gap-1"
                        >
                          <Upload className="w-2.5 h-2.5" />
                          Enviar Imagem Local
                        </button>
                        <input
                          ref={(el) => {
                            if (el) cardCustomImageRefs.current[carouselData.cards[activeCardIndex].id] = el;
                          }}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleCustomSlideImageUpload(e, activeCardIndex)}
                          className="hidden"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <textarea
                          rows={2}
                          value={carouselData.cards[activeCardIndex].imagePrompt}
                          onChange={(e) => handleUpdateCardField(activeCardIndex, "imagePrompt", e.target.value)}
                          placeholder="Escreva o prompt da imagem em inglês..."
                          className="w-full bg-slate-950 border border-white/5 rounded-lg p-2 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none"
                        />
                        
                        <button
                          onClick={() => handleGenerateImageForCard(carouselData.cards[activeCardIndex].id, activeCardIndex)}
                          disabled={generatingCardImageId !== null}
                          className="w-full py-1.5 rounded-lg bg-purple-700/80 hover:bg-purple-700 active:scale-95 disabled:opacity-50 text-[10px] font-bold uppercase tracking-wide text-white transition-all flex items-center justify-center gap-2"
                        >
                          {generatingCardImageId === carouselData.cards[activeCardIndex].id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>IA pintando a imagem...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Gerar Ilustração por IA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Card style overrides */}
                    <div className="pt-1.5 flex gap-2">
                      <div className="w-full">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Cores Únicas para este slide? Ex: Fundo Diferente
                        </span>
                        
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
                            <span className="text-[9px] text-slate-400">BG:</span>
                            <input
                              type="color"
                              value={carouselData.cards[activeCardIndex].customBgColor || themeColor}
                              onChange={(e) => handleUpdateCardField(activeCardIndex, "customBgColor", e.target.value)}
                              className="w-4 h-4 cursor-pointer p-0 bg-transparent border-0"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
                            <span className="text-[9px] text-slate-400">Texto:</span>
                            <input
                              type="color"
                              value={carouselData.cards[activeCardIndex].customTextColor || textColor}
                              onChange={(e) => handleUpdateCardField(activeCardIndex, "customTextColor", e.target.value)}
                              className="w-4 h-4 cursor-pointer p-0 bg-transparent border-0"
                            />
                          </div>

                          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-white/5">
                            <span className="text-[9px] text-slate-400">Destaque:</span>
                            <input
                              type="color"
                              value={carouselData.cards[activeCardIndex].customAccentColor || accentColor}
                              onChange={(e) => handleUpdateCardField(activeCardIndex, "customAccentColor", e.target.value)}
                              className="w-4 h-4 cursor-pointer p-0 bg-transparent border-0"
                            />
                          </div>
                          
                          {(carouselData.cards[activeCardIndex].customBgColor || carouselData.cards[activeCardIndex].customTextColor) && (
                            <button
                              onClick={() => handleResetCardColors(activeCardIndex)}
                              className="text-[9px] text-[#FA5454] hover:underline"
                            >
                              Limpar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Instagram Caption & Strategy Suggestions drawer below */}
              {instagramCaption && (
                <div className="w-full bg-slate-900/40 p-5 rounded-2xl border border-white/[0.05] space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/[0.05]">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Chrome className="w-4 h-4 text-purple-400" />
                      <span>Legenda do Instagram Gerada ✓</span>
                    </h5>
                    <button
                      onClick={copyCaptionToClipboard}
                      className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-[10px] text-slate-300 uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                      {copiedCaption ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Legenda</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-300 leading-relaxed max-h-44 overflow-y-auto font-sans whitespace-pre-wrap selection:bg-purple-900/50">
                    {instagramCaption}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            
            /* Initial Welcome state when carousel is not generated yet */
            <div className="w-full h-full max-w-lg mx-auto flex flex-col items-center justify-center text-center p-8 space-y-6 self-center my-auto">
              
              {/* Instagram styled post box animation mock */}
              <div className="relative w-56 aspect-square rounded-2xl bg-[#11131A] border border-white/10 shadow-2xl flex flex-col justify-between p-5 scale-95 md:scale-100">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-500 to-purples-700" />
                    <div className="w-14 h-2 bg-slate-800 rounded" />
                  </div>
                  <div className="w-6 h-2 bg-slate-800 rounded" />
                </div>
                
                <div className="space-y-2 text-left my-2">
                  <div className="w-full h-3 bg-purple-500/20 rounded animate-pulse" />
                  <div className="w-[85%] h-3 bg-purple-500/20 rounded animate-pulse" />
                  <div className="w-[50%] h-2.5 bg-slate-800 rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-16 h-2.5 bg-slate-800 rounded" />
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded bg-slate-800" />
                    <div className="w-3 h-3 rounded bg-slate-800" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-100">
                  Nenhum Carrossel Gerado Ainda
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Preencha os campos de estratégia na barra lateral esquerda e clique em <span className="text-purple-400 font-bold">"Gerar Roteiro do Carrossel"</span> para redigir o roteiro perfeito e slides com a IA do Gemini.
                </p>
              </div>

              {/* Instructions steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
                <div className="bg-[#11131A] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs font-mono font-bold text-pink-500">01. Tema e Audiência</span>
                  <p className="text-[10px] text-slate-500">Defina os tópicos e o público para focar a estratégia.</p>
                </div>
                <div className="bg-[#11131A] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs font-mono font-bold text-purple-500">02. Geração Inteligente</span>
                  <p className="text-[10px] text-slate-500">O Gemini formula títulos cativantes e chamadas marcantes.</p>
                </div>
                <div className="bg-[#11131A] p-3 rounded-xl border border-white/5 space-y-1">
                  <span className="text-xs font-mono font-bold text-indigo-400">03. Ilustração com IA</span>
                  <p className="text-[10px] text-slate-500">Crie imagens personalizadas de fundo (Gemini nano banana).</p>
                </div>
              </div>

            </div>
          )}

        </section>
      </main>

      {/* Container oculto fora da tela — renderiza todos os cards em resolução real Instagram (1080px)
          para que html2canvas capture com layout correto, sem depender do activeCardIndex */}
      {carouselData && (
        <div
          style={{
            position: "fixed",
            left: "-9999px",
            top: 0,
            zIndex: -9999,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {carouselData.cards.map((card, idx) => (
            <div
              key={card.id}
              style={{
                width: `${DIMENSIONS[size].width}px`,
                height: `${DIMENSIONS[size].height}px`,
                overflow: "hidden",
              }}
            >
              <CardPreview
                id={`export-canvas-${card.id}`}
                card={card}
                dimensionType={size}
                themeColor={themeColor}
                textColor={textColor}
                accentColor={accentColor}
                fontFamily={fontFamily}
                username={username}
                avatarUrl={avatarUrl}
                totalCards={carouselData.cards.length}
                index={idx}
                showInstagramOverlay={false}
                imageFitMode={imageFitMode}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
