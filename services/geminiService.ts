import { GoogleGenAI, Type } from "@google/genai";
import { ServiceItem } from '../types';

let genAI: GoogleGenAI | null = null;

const initializeGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.API_KEY || ''; // In a real app, ensure this is set safely
    if (apiKey) {
      genAI = new GoogleGenAI({ apiKey });
    }
  }
  return genAI;
};

export const getProposalRecommendations = async (
  clientDescription: string,
  availableServices: ServiceItem[]
): Promise<string[]> => {
  const ai = initializeGenAI();
  if (!ai) return [];

  const serviceList = availableServices
    .filter(s => s.active)
    .map(s => `${s.id}: ${s.name} (${s.subcategory}) - ${s.price} INR`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a sales expert for a creative agency. 
        Based on the client description below, recommend the 5 most relevant service IDs from our catalog.
        
        Client Description: ${clientDescription}
        
        Service Catalog:
        ${serviceList}
        
        Return ONLY a JSON array of string IDs. Example: ["wc-1", "sm-3"]
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

export const generateExecutiveSummary = async (
  clientName: string,
  selectedServices: ServiceItem[]
): Promise<string> => {
  const ai = initializeGenAI();
  if (!ai) return "We are pleased to submit this proposal for your review.";

  const items = selectedServices.map(s => s.name).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional, 2-sentence executive summary for a proposal to ${clientName}. 
      The proposal includes: ${items}. 
      Tone: Professional, enthusiastic, value-driven.`,
    });
    return response.text || "Attached is the proposal for your selected services.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Attached is the proposal for your selected services.";
  }
};
