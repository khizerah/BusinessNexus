import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'investor' | 'entrepreneur'
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  linkedin: text("linkedin"),
  phone: text("phone"),
  // Investor specific fields
  investmentInterests: text("investment_interests").array(),
  portfolioCompanies: text("portfolio_companies").array(),
  investmentRange: text("investment_range"),
  // Entrepreneur specific fields
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  industry: text("industry"),
  fundingStage: text("funding_stage"),
  fundingGoal: text("funding_goal"),
  pitchDeckUrl: text("pitch_deck_url"),
  teamMembers: jsonb("team_members"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const collaborationRequests = pgTable("collaboration_requests", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  message: text("message"),
  status: text("status").notNull().default("pending"), // 'pending' | 'accepted' | 'declined'
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  updatedAt: true,
});

export const insertCollaborationRequestSchema = createInsertSchema(collaborationRequests).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type CollaborationRequest = typeof collaborationRequests.$inferSelect;
export type InsertCollaborationRequest = z.infer<typeof insertCollaborationRequestSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type UserWithProfile = User & {
  profile: Profile | null;
};
