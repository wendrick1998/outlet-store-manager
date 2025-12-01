import { GoogleGenAI, Type } from "@google/genai";
import { MarketPriceData, SecurityCheckResult } from "../types";

// Ensure API Key is available
const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const GeminiService = {
  /**
   * Pesquisa de Mercado com Schema JSON estrito
   */
  async getMarketEstimate(model: string, capacity: string, condition: string): Promise<MarketPriceData> {
    if (!apiKey) throw new Error("API Key não configurada");

    const prompt = `
      Atue como um especialista em avaliação de iPhones usados no sul do Brasil (Santa Catarina).
      Produto: ${model} ${capacity}, Condição: ${condition}.
      Forneça estimativa de preço de venda (Varejo) em Reais (BRL).
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              avg: { type: Type.NUMBER, description: "Preço médio de mercado" },
              min: { type: Type.NUMBER, description: "Preço mínimo (venda rápida/particular)" },
              max: { type: Type.NUMBER, description: "Preço máximo (loja com garantia)" },
              insight: { type: Type.STRING, description: "Uma frase curta sobre a liquidez atual deste modelo." }
            },
            required: ["avg", "min", "max", "insight"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Resposta vazia da IA");
      return JSON.parse(text) as MarketPriceData;

    } catch (error) {
      console.error("Erro Gemini Market Research:", error);
      throw error;
    }
  },

  /**
   * Identificação de Dispositivo via IMEI/Serial (Decodificação Lógica IA)
   */
  async identifyDevice(code: string): Promise<SecurityCheckResult> {
    if (!apiKey) throw new Error("API Key não configurada");

    const prompt = `
      Analise este código (IMEI ou Serial Apple): ${code}.
      1. Tente identificar a qual modelo de iPhone ele provavelmente pertence baseando-se em padrões de TAC (Type Allocation Code) ou formato de Serial Apple se possível. Se não for possível determinar com certeza, diga "Modelo não identificável apenas pelo código".
      2. Me dê uma avaliação de risco genérica sobre a importância de checar iCloud e Blacklist.
      
      Responda em JSON:
      {
        "identifiedModel": "Ex: iPhone 13 Pro (Provável)",
        "riskAssessment": "Texto curto sobre riscos"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              identifiedModel: { type: Type.STRING },
              riskAssessment: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}") as SecurityCheckResult;
    } catch (e) {
      return { identifiedModel: "Desconhecido", riskAssessment: "Erro na análise IA." };
    }
  },

  /**
   * Gerador de Anúncio
   */
  async generateAd(model: string, specs: string, price: string): Promise<string> {
    if (!apiKey) throw new Error("API Key não configurada");
    
    const prompt = `
      Crie um texto de venda curto e persuasivo para Stories/Status WhatsApp.
      Produto: ${model}. Especificações: ${specs}. Preço: ${price}.
      Use emojis, tom de urgência e foque em "Pronta Entrega" e "Garantia".
      Sem hashtags excessivas. Máximo 3 linhas de parágrafos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar o anúncio.";
  },

  /**
   * Checklist Técnico
   */
  async generateChecklist(model: string): Promise<string> {
    if (!apiKey) throw new Error("API Key não configurada");

    const prompt = `
      Checklist técnico RÁPIDO de entrada para ${model} usado.
      Liste 5-6 pontos cruciais de defeitos crônicos desse modelo específico.
      Use formato de lista com emojis.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  },

  /**
   * Argumentos de Venda (Pitch)
   */
  async generatePitch(model: string, price: string): Promise<string> {
    if (!apiKey) throw new Error("API Key não configurada");

    const prompt = `
      Sou vendedor. O cliente está na dúvida sobre levar um ${model} por ${price}.
      Me dê 3 argumentos curtos e matadores para fechar a venda AGORA.
      Foque em custo-benefício vs modelos novos.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  },

  /**
   * Análise de Estoque
   */
  async analyzeInventory(inventorySummary: string): Promise<string> {
    if (!apiKey) throw new Error("API Key não configurada");

    const prompt = `
      Analise este inventário focado em RISCO DE GARANTIA DE COMPRA (PVPS).
      Lista (Modelo - Custo - Dias Restantes Garantia):
      ${inventorySummary}
      
      Identifique os 3 itens mais críticos que precisam ser vendidos essa semana para não perder a garantia do fornecedor.
      Seja direto e estratégico.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  }
};