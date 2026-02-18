import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'series', 'movie', 'book'
  genre: text("genre"),
  platform: text("platform"), // Netflix, Amazon, Physical, etc.
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed'
  rating: integer("rating").default(0), // 1-5
  notes: text("notes"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  totalEpisodes: integer("total_episodes"), // For series
  watchedEpisodes: integer("watched_episodes"), // For series
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

export type CreateItemRequest = InsertItem;
export type UpdateItemRequest = Partial<InsertItem>;

// API Response types
export type ItemResponse = Item;
export type ItemsListResponse = Item[];

export type StatsResponse = {
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  pendingItems: number;
  averageRating: number;
  byType: {
    series: number;
    movie: number;
    book: number;
  };
};
