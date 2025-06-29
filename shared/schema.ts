import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessName: varchar("business_name"),
  notificationPhone: varchar("notification_phone"),
  preferredVoice: varchar("preferred_voice").default("Rachel"),
  greetingMessage: text("greeting_message"),
  serviceList: jsonb("service_list").default([]),
  faqs: jsonb("faqs").default([]),
  agentId: varchar("agent_id"),
  vapiPhoneNumber: varchar("vapi_phone_number"),
  primaryPhone: varchar("primary_phone"),
  backupDelay: integer("backup_delay").default(30),
  agentStatus: varchar("agent_status").default("inactive"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  phone: varchar("phone").notNull(),
  service: varchar("service"),
  zipCode: varchar("zip_code"),
  preferredTime: text("preferred_time"),
  recordingPath: varchar("recording_path"),
  transcript: text("transcript"),
  callDuration: integer("call_duration"),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Call logs table
export const callLogs = pgTable("call_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  agentId: varchar("agent_id"),
  callId: varchar("call_id"),
  callType: varchar("call_type"), // 'missed', 'declined', 'answered'
  duration: integer("duration"),
  recordingUrl: varchar("recording_url"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;
export type CallLog = typeof callLogs.$inferSelect;

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
