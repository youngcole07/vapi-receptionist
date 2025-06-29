import axios from 'axios';

interface AgentConfig {
  name: string;
  prompt: string;
  voice: string;
  model: string;
  webhookUrl: string;
}

interface PromptData {
  businessName: string;
  greetingMessage: string;
  serviceList: string[];
  faqs: Array<{ question: string; answer: string }>;
}

export class VapiService {
  private apiKey: string;
  private baseUrl = 'https://api.vapi.ai';

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || "";
    console.log("VAPI API Key loaded:", this.apiKey ? "✓ Present" : "✗ Missing");
    if (!this.apiKey) {
      console.warn("VAPI_API_KEY not found in environment variables");
      console.log("Available env vars:", Object.keys(process.env).filter(key => key.includes('VAPI')));
    }
  }

  buildPrompt(data: PromptData): string {
    const { businessName, greetingMessage, serviceList, faqs } = data;
    
    let prompt = `You are the AI receptionist for ${businessName}.
Greet callers with: "${greetingMessage}"
Ask what service they need from this list: ${serviceList.join(', ')}.
Collect their name, phone number, zip code, and preferred day/time for service.

`;

    if (faqs && faqs.length > 0) {
      prompt += "If the caller asks any of the following questions, respond exactly as shown:\n\n";
      faqs.forEach((faq, index) => {
        prompt += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
    }

    prompt += "If unsure, politely say you'll have someone follow up shortly.";
    
    return prompt;
  }

  async createAgent(config: AgentConfig) {
    try {
      const payload = {
        name: config.name,
        prompt: config.prompt,
        voice: config.voice,
        model: config.model,
        record: true,
        webhookUrl: config.webhookUrl,
      };

      console.log("Creating agent with payload:", JSON.stringify(payload, null, 2));
      console.log("Using API key:", this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "MISSING");

      const response = await axios.post(`${this.baseUrl}/assistant`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Vapi API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw new Error("Failed to create agent");
    }
  }

  async updateAgent(agentId: string, updates: Partial<AgentConfig>) {
    try {
      const response = await axios.patch(`${this.baseUrl}/assistant/${agentId}`, updates, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating agent:", error);
      throw new Error("Failed to update agent");
    }
  }

  async getAgent(agentId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/assistant/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching agent:", error);
      return null;
    }
  }

  async assignPhoneNumber(agentId: string) {
    try {
      const response = await axios.post(`${this.baseUrl}/phone-numbers`, {
        agentId,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error assigning phone number:", error);
      throw new Error("Failed to assign phone number");
    }
  }
}
