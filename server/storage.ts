import { db } from "./db";
import { items, type InsertItem, type Item, type UpdateItemRequest } from "@shared/schema";
import { eq, desc, asc, like, and } from "drizzle-orm";

export interface IStorage {
  getItems(params?: { type?: string; status?: string; search?: string; sort?: string }): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, updates: UpdateItemRequest): Promise<Item>;
  deleteItem(id: number): Promise<void>;
  getStats(): Promise<{
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
  }>;
}

export class DatabaseStorage implements IStorage {
  async getItems(params?: { type?: string; status?: string; search?: string; sort?: string }): Promise<Item[]> {
    let query = db.select().from(items);
    const filters = [];

    if (params?.type && params.type !== 'all') {
      filters.push(eq(items.type, params.type));
    }

    if (params?.status && params.status !== 'all') {
      filters.push(eq(items.status, params.status));
    }

    if (params?.search) {
      filters.push(like(items.title, `%${params.search}%`));
    }

    if (filters.length > 0) {
      // @ts-ignore
      query.where(and(...filters));
    }

    if (params?.sort) {
      if (params.sort === 'rating') {
        query.orderBy(desc(items.rating));
      } else if (params.sort === 'title') {
        query.orderBy(asc(items.title));
      } else {
        query.orderBy(desc(items.createdAt));
      }
    } else {
        query.orderBy(desc(items.createdAt));
    }

    return await query;
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async updateItem(id: number, updates: UpdateItemRequest): Promise<Item> {
    const [item] = await db.update(items).set(updates).where(eq(items.id, id)).returning();
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async getStats() {
    const allItems = await db.select().from(items);
    
    const totalItems = allItems.length;
    const completedItems = allItems.filter(i => i.status === 'completed').length;
    const inProgressItems = allItems.filter(i => i.status === 'in_progress').length;
    const pendingItems = allItems.filter(i => i.status === 'pending').length;
    
    const ratedItems = allItems.filter(i => i.rating && i.rating > 0);
    const averageRating = ratedItems.length > 0 
      ? ratedItems.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedItems.length 
      : 0;

    const byType = {
      series: allItems.filter(i => i.type === 'series').length,
      movie: allItems.filter(i => i.type === 'movie').length,
      book: allItems.filter(i => i.type === 'book').length,
    };

    return {
      totalItems,
      completedItems,
      inProgressItems,
      pendingItems,
      averageRating,
      byType,
    };
  }
}

export const storage = new DatabaseStorage();
