import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { VapiService } from "./services/vapi";
import { TwilioService } from "./services/twilio";
import { insertLeadSchema, updateUserSchema } from "@shared/schema";
import fs from "fs";
import path from "path";
import axios from "axios";
import multer from "multer";

// Initialize services lazily to ensure environment variables are loaded
let vapiService: VapiService | null = null;
let twilioService: TwilioService | null = null;

function getVapiService() {
  if (!vapiService) {
    vapiService = new VapiService();
  }
  return vapiService;
}

function getTwilioService() {
  if (!twilioService) {
    twilioService = new TwilioService();
  }
  return twilioService;
}

// Configure multer for file uploads (recordings)
const recordingsDir = path.join(process.cwd(), "recordings");
if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = updateUserSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Agent setup routes
  app.post('/api/agent/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const {
        greetingMessage,
        serviceList,
        preferredVoice,
        faqs,
        primaryPhone,
        backupDelay
      } = req.body;

      // Build dynamic prompt
      const prompt = getVapiService().buildPrompt({
        businessName: user.businessName || "Your Business",
        greetingMessage,
        serviceList,
        faqs,
      });

      // Create or update Vapi agent
      let agentId = user.agentId;
      let phoneNumber = user.vapiPhoneNumber;

      if (!agentId) {
        // Create new agent
        const agent = await getVapiService().createAgent({
          name: `${user.businessName} AI Receptionist`,
          prompt,
          voice: preferredVoice,
          model: "gpt-4o",
          webhookUrl: `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/api/webhook/vapi`,
        });
        agentId = agent.id;

        // Assign phone number
        const phone = await getVapiService().assignPhoneNumber(agentId);
        phoneNumber = phone.number;
      } else {
        // Update existing agent
        await getVapiService().updateAgent(agentId, {
          prompt,
          voice: preferredVoice,
        });
      }

      // Update user in database
      const updatedUser = await storage.updateUser(userId, {
        greetingMessage,
        serviceList,
        preferredVoice,
        faqs,
        primaryPhone,
        backupDelay,
        agentId,
        vapiPhoneNumber: phoneNumber,
        agentStatus: 'active',
      });

      res.json({
        message: "Agent setup completed successfully",
        user: updatedUser,
        agentId,
        phoneNumber,
      });
    } catch (error) {
      console.error("Error setting up agent:", error);
      res.status(500).json({ message: "Failed to setup agent" });
    }
  });

  // Webhook endpoint for Vapi
  app.post('/api/webhook/vapi', async (req, res) => {
    try {
      const { agent_id, call, variables, recording_url, transcript } = req.body;

      // Find user by agent_id
      const user = await storage.getUserByAgentId(agent_id);
      if (!user) {
        console.error("User not found for agent_id:", agent_id);
        return res.status(404).json({ message: "User not found" });
      }

      // Extract lead data from call variables
      const leadData = {
        userId: user.id,
        name: variables?.name || "Unknown",
        phone: variables?.phone || "Unknown",
        service: variables?.service || "",
        zipCode: variables?.zip || variables?.zipCode || "",
        preferredTime: variables?.preferredTime || variables?.time || "",
        recordingPath: "",
        transcript: transcript || "",
        callDuration: call?.duration || 0,
      };

      // Download and save recording if available
      if (recording_url) {
        try {
          const timestamp = Date.now();
          const filename = `${user.email}_${timestamp}.mp3`;
          const filePath = path.join(recordingsDir, filename);
          
          const response = await axios({
            method: 'GET',
            url: recording_url,
            responseType: 'stream'
          });
          
          const writer = fs.createWriteStream(filePath);
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          leadData.recordingPath = `/recordings/${filename}`;
        } catch (error) {
          console.error("Error downloading recording:", error);
        }
      }

      // Save lead
      const lead = await storage.createLead(leadData);

      // Send SMS notification
      if (user.notificationPhone) {
        const smsMessage = getTwilioService().formatLeadSMS({
          businessName: user.businessName || "Your Business",
          leadName: lead.name,
          leadPhone: lead.phone,
          service: lead.service,
          preferredTime: lead.preferredTime,
          zipCode: lead.zipCode,
          recordingUrl: lead.recordingPath ? 
            `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}/api${lead.recordingPath}` : 
            null,
        });

        await getTwilioService().sendSMS(user.notificationPhone, smsMessage);
      }

      // Log the call
      await storage.createCallLog({
        userId: user.id,
        agentId: agent_id,
        callId: call?.id || "",
        callType: "missed", // Assuming this is a backup call
        duration: call?.duration || 0,
        recordingUrl: recording_url,
        status: "completed",
      });

      res.json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Failed to process webhook" });
    }
  });

  // Leads routes
  app.get('/api/leads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { search, service, limit = 50, offset = 0 } = req.query;
      
      const leads = await storage.getLeads(userId, {
        search: search as string,
        service: service as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.put('/api/leads/:id/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const leadId = parseInt(req.params.id);
      const { isFavorite } = req.body;
      
      const lead = await storage.updateLead(leadId, userId, { isFavorite });
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Statistics route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Recordings route - secured file serving
  app.get('/api/recordings/:filename', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const filename = req.params.filename;
      
      // Verify user owns this recording
      const user = await storage.getUser(userId);
      if (!user || !filename.startsWith(user.email || '')) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const filePath = path.join(recordingsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Recording not found" });
      }
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } catch (error) {
      console.error("Error serving recording:", error);
      res.status(500).json({ message: "Failed to serve recording" });
    }
  });

  // Test agent route
  app.post('/api/agent/test', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.agentId) {
        return res.status(400).json({ message: "No agent configured" });
      }

      // This would typically trigger a test call via Vapi
      // For now, we'll just confirm the agent exists
      const agentExists = await getVapiService().getAgent(user.agentId);
      
      res.json({ 
        message: "Agent test initiated", 
        agentStatus: agentExists ? "active" : "inactive" 
      });
    } catch (error) {
      console.error("Error testing agent:", error);
      res.status(500).json({ message: "Failed to test agent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
