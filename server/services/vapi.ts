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

  private logApiError(operation: string, error: any, requestBody?: any) {
    console.error(`\n=== VAPI API ERROR - ${operation} ===`);
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Response Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Response Headers:", error.response?.headers);
    if (requestBody) {
      console.error("Request Body:", JSON.stringify(requestBody, null, 2));
    }
    console.error("Full Error:", error.message);
    console.error("=== END ERROR ===\n");
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
      // Use voice as-is, Vapi expects simple voice names like "Rachel"
      const formattedVoice = config.voice;

      // Ensure webhook URL is valid HTTPS
      if (!config.webhookUrl.startsWith('https://')) {
        throw new Error(`Invalid webhook URL: ${config.webhookUrl}. Must be HTTPS.`);
      }

      // Map to OpenAI voice IDs for the voice object
      const voiceMap: Record<string, string> = {
        'Rachel': 'alloy',
        'Sarah': 'nova', 
        'Josh': 'onyx',
        'Brian': 'echo',
        'Nicole': 'shimmer',
        'Emma': 'fable'
      };
      
      const voiceId = voiceMap[formattedVoice] || 'alloy';

      const payload = {
        name: config.name,
        model: config.model,
        voice: {
          provider: 'openai',
          voice_id: voiceId
        },
        prompt: config.prompt.trim(),
        record: true,
        tools: [
          {
            type: 'webhook',
            url: config.webhookUrl,
            method: 'POST'
          }
        ]
      };

      console.log("\n=== CREATING VAPI AGENT ===");
      console.log("Endpoint: POST", `${this.baseUrl}/v1/agents`);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("API Key:", this.apiKey ? `${this.apiKey.substring(0, 8)}...` : "MISSING");
      console.log("========================\n");

      if (!this.apiKey) {
        throw new Error("VAPI_API_KEY is missing");
      }

      const response = await axios.post(`${this.baseUrl}/v1/agents`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      console.log("✓ Agent created successfully:", response.data);
      return response.data;
    } catch (error: any) {
      console.log('\n=== VAPI API ERROR ===');
      console.log('HTTP Status:', error.response?.status);
      console.log('Response Body:', JSON.stringify(error.response?.data, null, 2));
      console.log('Request Config:', JSON.stringify({
        name: config.name,
        voice: config.voice,
        model: config.model,
        webhookUrl: config.webhookUrl
      }, null, 2));
      console.log('=====================\n');
      
      this.logApiError("CREATE AGENT", error, {
        name: config.name,
        voice: config.voice,
        model: config.model,
        webhookUrl: config.webhookUrl
      });
      throw new Error(`Failed to create agent: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateAgent(agentId: string, updates: Partial<AgentConfig>) {
    try {
      const formattedUpdates: any = {};
      
      if (updates.voice) {
        const voiceMap: Record<string, string> = {
          'Rachel': 'alloy-openai',
          'Sarah': 'nova-openai', 
          'Josh': 'onyx-openai',
          'Brian': 'echo-openai',
          'Nicole': 'shimmer-openai',
          'Emma': 'fable-openai'
        };
        formattedUpdates.voice = voiceMap[updates.voice] || 'alloy-openai';
      }
      
      if (updates.prompt) {
        formattedUpdates.model = {
          provider: 'openai',
          model: 'gpt-4o',
          systemPrompt: updates.prompt.trim(),
        };
      }

      console.log(`\n=== UPDATING VAPI AGENT ${agentId} ===`);
      console.log("Updates:", JSON.stringify(formattedUpdates, null, 2));

      const response = await axios.patch(`${this.baseUrl}/v1/agents/${agentId}`, formattedUpdates, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log("✓ Agent updated successfully");
      return response.data;
    } catch (error: any) {
      this.logApiError("UPDATE AGENT", error, { agentId, updates });
      throw new Error(`Failed to update agent: ${error.response?.data?.message || error.message}`);
    }
  }

  async getAgent(agentId: string) {
    try {
      console.log(`\n=== GETTING VAPI AGENT ${agentId} ===`);
      
      const response = await axios.get(`${this.baseUrl}/v1/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        timeout: 10000,
      });

      console.log("✓ Agent retrieved successfully");
      return response.data;
    } catch (error: any) {
      this.logApiError("GET AGENT", error, { agentId });
      return null; // Return null for failed agent lookups
    }
  }

  async assignPhoneNumber(agentId: string, maxRetries: number = 1) {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        console.log(`\n=== ASSIGNING PHONE NUMBER TO AGENT ${agentId} (Attempt ${attempt}) ===`);
        
        const payload = {
          agent_id: agentId
        };
        
        console.log('Endpoint: POST', `${this.baseUrl}/phone-numbers`);
        console.log('Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(`${this.baseUrl}/phone-numbers`, payload, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        });

        console.log("✓ Phone number assigned successfully:", response.data);
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.log('\n=== PHONE NUMBER ASSIGNMENT ERROR ===');
        console.log('HTTP Status:', error.response?.status);
        console.log('Response Body:', JSON.stringify(error.response?.data, null, 2));
        console.log('=======================================\n');
        
        this.logApiError(`ASSIGN PHONE NUMBER (Attempt ${attempt})`, error, { agentId });
        
        if (attempt <= maxRetries) {
          console.log(`Retrying in 2 seconds... (${attempt}/${maxRetries} retries)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    // If all attempts failed, notify user
    const errorMessage = `Failed to assign phone number after ${maxRetries + 1} attempts. This may require manual setup in the Vapi dashboard.`;
    console.error("\n🚨 PHONE NUMBER ASSIGNMENT FAILED 🚨");
    console.error("You may need to manually assign a phone number in your Vapi dashboard.");
    console.error("The agent was created successfully but needs a phone number to receive calls.\n");
    
    throw new Error(errorMessage);
  }
}
