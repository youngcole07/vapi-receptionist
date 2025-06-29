import axios from 'axios';

interface LeadSMSData {
  businessName: string;
  leadName: string;
  leadPhone: string;
  service?: string;
  preferredTime?: string;
  zipCode?: string;
  recordingUrl?: string | null;
}

export class TwilioService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_SID || process.env.TWILIO_ACCOUNT_SID || "";
    this.authToken = process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN_ENV_VAR || "";
    this.fromNumber = process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER || "";
    
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      console.warn("Twilio credentials not found in environment variables");
    }
  }

  formatLeadSMS(data: LeadSMSData): string {
    const { businessName, leadName, leadPhone, service, preferredTime, zipCode, recordingUrl } = data;
    
    let message = `📞 New Lead for ${businessName}:\n`;
    message += `Name: ${leadName}\n`;
    message += `Phone: ${leadPhone}\n`;
    
    if (service) {
      message += `Service: ${service}\n`;
    }
    
    if (preferredTime) {
      message += `Time: ${preferredTime}\n`;
    }
    
    if (zipCode) {
      message += `Zip: ${zipCode}\n`;
    }
    
    if (recordingUrl) {
      message += `🎧 Recording: ${recordingUrl}`;
    }
    
    return message;
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        new URLSearchParams({
          To: to,
          From: this.fromNumber,
          Body: message,
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      console.log("SMS sent successfully:", response.data.sid);
    } catch (error) {
      console.error("Error sending SMS:", error);
      throw new Error("Failed to send SMS notification");
    }
  }
}
