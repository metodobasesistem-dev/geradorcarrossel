import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

// Initialize GenAI client on the server
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("A chave GEMINI_API_KEY não foi encontrada no ambiente.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set up body parsers with limits for safety
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // REST API endpoints

  // 1. Generate text outline & structure for Instagram Carousel
  app.post("/api/carousel/generate", async (req, res) => {
    try {
      const { theme, audience, objective, cardCount, size, style, customPrompt } = req.body;

      if (!theme || !audience || !objective) {
        return res.status(400).json({ error: "Por favor, preencha o tema, público e objetivo do carrossel." });
      }

      const ai = getAiClient();
      const count = parseInt(cardCount, 10) || 5;

      const systemInstruction = 
        "Você é um redator publicitário de alto nível e especialista em Instagram Growth. " +
        "Seu objetivo é planejar e estruturar carrosséis altamente magnéticos e persuasivos em língua portuguesa (Brasil).\n" +
        "Siga estas regras rigorosamente:\n" +
        "1. Card 1 (Início): Deve conter um gancho (Hook) irresistível de curiosidade ou dor que faça a pessoa querer passar para o lado.\n" +
        "2. Cards Intermediários: Sequência fluida trazendo 1 conceito importante por card. Apresente em tópicos claros e fáceis de ler.\n" +
        "3. Card Final (Último): Uma forte chamada para ação (CTA) alinhada ao objetivo, como convidar a interagir, salvar ou seguir.\n" +
        "4. Escolha uma paleta de cores moderna de 3 cores (tema, texto, destaque) que combine bem com o tema.";

      let prompt = `Crie a estrutura completa de um carrossel do Instagram com exatamente ${count} cards.
      Tema do carrossel: "${theme}"
      Público-alvo: "${audience}"
      Objetivo final: "${objective}"
      Dimensões sugeridas: "${size}"
      Estilo visual desejado: "${style}"`;

      if (customPrompt && customPrompt.trim() !== "") {
        prompt += `\n\nDiretrizes adicionais / Instruções de conteúdo específicas enviadas pelo usuário:\n"${customPrompt}"`;
      }

      prompt += `\n\nGere o resultado estritamente no JSON Schema solicitado. 
      Garanta que 'imagePrompt' para cada slide seja um prompt em inglês detalhado e bem descritivo para que um gerador de imagens IA possa gerar um background ou ilustração abstrata/conceitual condizente com a mensagem daquele slide.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              themeColor: {
                type: Type.STRING,
                description: "Cor hexadecimal elegante para o fundo principal condizente com o estilo (ex: #1A1A1A ou #F5F5F7)."
              },
              textColor: {
                type: Type.STRING,
                description: "Cor hexadecimal para os textos de contraste excelente com o fundo (ex: #FFFFFF ou #1E293B)."
              },
              accentColor: {
                type: Type.STRING,
                description: "Cor hexadecimal vibrante para realçar palavras-chave e elementos importantes (ex: #3B82F6, #F59E0B)."
              },
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    title: { 
                      type: Type.STRING, 
                      description: "Título curto de alto impacto do slide (máx. 8 palavras) em português." 
                    },
                    subtitle: { 
                      type: Type.STRING, 
                      description: "Subtítulo de apoio (máx. 12 palavras) em português." 
                    },
                    body: { 
                      type: Type.STRING, 
                      description: "Texto ou tópicos claros divididos por quebras de linha se necessário (máx. 30 palavras) em português." 
                    },
                    imagePrompt: { 
                      type: Type.STRING, 
                      description: "A highly descriptive, visual art style prompt in English for the background or central element illustration (e.g. '3D render of a golden key floating over a clean glowing tech surface, minimal neon purple aesthetic')." 
                    },
                    layoutType: { 
                      type: Type.STRING, 
                      description: "Tipo de layout recomendado de design. Escolha entre: 'text-center' (somente texto centralizado), 'split-vertical' (texto na metade e espaço para imagem na outra), 'bg-image-opacity' (imagem de fundo escurecida com texto por cima), 'quote' (estilo citação em destaque) ou 'cta-card' (estilo chamada para ação marcante)." 
                    },
                    ctaText: { 
                      type: Type.STRING, 
                      description: "Apenas se for o último card, texto da ação incentivando a curtida/comentário/compartilhamento/salvamento (ex: 'Deixe um comentário!', 'Salve para ver depois')." 
                    }
                  },
                  required: ["id", "title", "subtitle", "body", "imagePrompt", "layoutType"]
                }
              }
            },
            required: ["themeColor", "textColor", "accentColor", "cards"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Nenhum dado retornado do Gemini.");
      }

      try {
        const resultObj = JSON.parse(text);
        return res.json(resultObj);
      } catch (parseErr) {
        console.error("Erro ao analisar JSON de retorno:", text);
        return res.status(500).json({ error: "Erro ao estruturar conteúdo gerado.", rawText: text });
      }
    } catch (err: any) {
      console.error("Erro em /api/carousel/generate:", err);
      return res.status(500).json({ error: err.message || "Erro desconhecido." });
    }
  });

  // 2. Generate Image for a single card using the Gemini model "gemini-2.5-flash-image" (nano banana)
  app.post("/api/carousel/generate-image", async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt de imagem é obrigatório." });
      }

      const ai = getAiClient();

      // Map the selected ratio to what's supported by gemini-2.5-flash-image ("1:1", "3:4", "4:3", "9:16", "16:9")
      let actualRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1";
      if (aspectRatio === "9:16") actualRatio = "9:16";
      else if (aspectRatio === "3:4" || aspectRatio === "4:5") actualRatio = "3:4";
      else if (aspectRatio === "16:9") actualRatio = "16:9";
      else if (aspectRatio === "4:3") actualRatio = "4:3";

      console.log(`Generating image using 'imagen-4.0-generate-001' for prompt: "${prompt}" with ratio: ${actualRatio}`);

      const response = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: `${prompt}, modern design asset in high contrast vibrant colors, digital art mockup studio backdrop, crisp resolution, beautiful graphic design`,
        config: {
          numberOfImages: 1,
          aspectRatio: actualRatio,
          outputMimeType: "image/png"
        }
      });

      let base64Image = "";
      if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
        base64Image = response.generatedImages[0].image.imageBytes;
      }

      if (!base64Image) {
        throw new Error("Nenhum dado de imagem foi recebido do Imagen 3.");
      }

      return res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
    } catch (err: any) {
      console.error("Erro em /api/carousel/generate-image:", err);
      return res.status(500).json({ error: err.message || "Erro desconhecido ao gerar a imagem." });
    }
  });

  // Vite or Static Server Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de carrossel rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Falha ao iniciar o servidor express:", err);
});
