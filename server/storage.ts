import { 
  users, 
  leads, 
  callLogs,
  type User, 
  type UpsertUser,
  type Lead,
  type InsertLead,
  type CallLog,
  type InsertCallLog
} from "@shared/schema";
import { db } from "./db";
import { eq, like, and, desc, count, avg, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getUserByAgentId(agentId: string): Promise<User | undefined>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(userId: string, filters?: {
    search?: string;
    service?: string;
    limit?: number;
    offset?: number;
  }): Promise<Lead[]>;
  updateLead(id: number, userId: string, updates: Partial<Lead>): Promise<Lead>;
  
  // Call log operations
  createCallLog(callLog: InsertCallLog): Promise<CallLog>;
  
  // Stats operations
  getUserStats(userId: string): Promise<{
    totalCalls: number;
    newLeads: number;
    avgCallTime: string;
    conversionRate: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByAgentId(agentId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.agentId, agentId));
    return user;
  }

  // Lead operations
  async createLead(leadData: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(leadData)
      .returning();
    return lead;
  }

  async getLeads(userId: string, filters?: {
    search?: string;
    service?: string;
    limit?: number;
    offset?: number;
  }): Promise<Lead[]> {
    let query = db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId));

    if (filters?.search) {
      query = query.where(
        and(
          eq(leads.userId, userId),
          like(leads.name, `%${filters.search}%`)
        )
      );
    }

    if (filters?.service) {
      query = query.where(
        and(
          eq(leads.userId, userId),
          eq(leads.service, filters.service)
        )
      );
    }

    query = query
      .orderBy(desc(leads.createdAt))
      .limit(filters?.limit || 50)
      .offset(filters?.offset || 0);

    return await query;
  }

  async updateLead(id: number, userId: string, updates: Partial<Lead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set(updates)
      .where(and(eq(leads.id, id), eq(leads.userId, userId)))
      .returning();
    return lead;
  }

  // Call log operations
  async createCallLog(callLogData: InsertCallLog): Promise<CallLog> {
    const [callLog] = await db
      .insert(callLogs)
      .values(callLogData)
      .returning();
    return callLog;
  }

  // Stats operations
  async getUserStats(userId: string): Promise<{
    totalCalls: number;
    newLeads: number;
    avgCallTime: string;
    conversionRate: string;
  }> {
    // Get total calls from call logs
    const [callStats] = await db
      .select({
        totalCalls: count(callLogs.id),
        avgDuration: avg(callLogs.duration),
      })
      .from(callLogs)
      .where(eq(callLogs.userId, userId));

    // Get leads count for this month
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [leadStats] = await db
      .select({
        newLeads: count(leads.id),
      })
      .from(leads)
      .where(
        and(
          eq(leads.userId, userId),
          sql`${leads.createdAt} >= ${thirtyDaysAgo}`
        )
      );

    const totalCalls = callStats?.totalCalls || 0;
    const newLeads = leadStats?.newLeads || 0;
    const avgDuration = callStats?.avgDuration || 0;

    // Calculate conversion rate
    const conversionRate = totalCalls > 0 
      ? Math.round((newLeads / totalCalls) * 100) 
      : 0;

    // Format average call time
    const avgCallTime = avgDuration 
      ? `${Math.floor(avgDuration / 60)}:${(avgDuration % 60).toString().padStart(2, '0')}`
      : "0:00";

    return {
      totalCalls,
      newLeads,
      avgCallTime,
      conversionRate: `${conversionRate}%`,
    };
  }
}

export const storage = new DatabaseStorage();