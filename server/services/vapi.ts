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
    this.apiKey = process.env.VAPI_API_KEY || process.env.VAPI_API_KEY_ENV_VAR || "";
    if (!this.apiKey) {
      console.warn("VAPI_API_KEY not found in environment variables");
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
      const response = await axios.post(`${this.baseUrl}/agents`, {
        name: config.name,
        prompt: config.prompt,
        voice: config.voice,
        model: config.model,
        record: true,
        webhookUrl: config.webhookUrl,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error creating agent:", error);
      throw new Error("Failed to create agent");
    }
  }

  async updateAgent(agentId: string, updates: Partial<AgentConfig>) {
    try {
      const response = await axios.patch(`${this.baseUrl}/agents/${agentId}`, updates, {
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
      const response = await axios.get(`${this.baseUrl}/agents/${agentId}`, {
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
