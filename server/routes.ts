import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertItemSchema } from "@shared/schema";

async function seedDatabase() {
  const existingItems = await storage.getItems();
  if (existingItems.length === 0) {
    console.log("Seeding database with initial data...");
    const seedData = [
      {
        title: "Stranger Things",
        type: "series",
        genre: "Sci-Fi / Horror",
        platform: "Netflix",
        status: "completed",
        rating: 5,
        notes: "Amazing 80s vibes! Can't wait for the final season.",
        totalEpisodes: 34,
        watchedEpisodes: 34,
        isFavorite: true,
        startDate: "2023-01-15",
        endDate: "2023-02-20",
        imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "Dune: Part Two",
        type: "movie",
        genre: "Sci-Fi",
        platform: "Cinema",
        status: "completed",
        rating: 5,
        notes: "Visually stunning. A masterpiece.",
        startDate: "2024-03-01",
        endDate: "2024-03-01",
        isFavorite: true,
        imageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "The Three-Body Problem",
        type: "book",
        genre: "Sci-Fi",
        platform: "Kindle",
        status: "in_progress",
        rating: 4,
        notes: "Mind-bending concepts. A bit dense but rewarding.",
        startDate: "2024-04-10",
        imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "Breaking Bad",
        type: "series",
        genre: "Crime / Drama",
        platform: "Netflix",
        status: "completed",
        rating: 5,
        notes: "Best show ever made.",
        totalEpisodes: 62,
        watchedEpisodes: 62,
        isFavorite: true,
        startDate: "2015-06-01",
        endDate: "2015-08-15",
        imageUrl: "https://images.unsplash.com/photo-1620509657063-e380f3316982?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "Atomic Habits",
        type: "book",
        genre: "Self-help",
        platform: "Audible",
        status: "completed",
        rating: 5,
        notes: "Life changing practical advice.",
        startDate: "2024-01-01",
        endDate: "2024-01-15",
        isFavorite: true,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "The Office",
        type: "series",
        genre: "Comedy",
        platform: "Peacock",
        status: "in_progress",
        rating: 5,
        notes: "Watching for the 5th time.",
        totalEpisodes: 201,
        watchedEpisodes: 45,
        isFavorite: false,
        startDate: "2024-05-01",
        imageUrl: "https://images.unsplash.com/photo-1522069169871-92ea293eda4b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
      {
        title: "Inception",
        type: "movie",
        genre: "Sci-Fi",
        platform: "Blu-ray",
        status: "completed",
        rating: 5,
        notes: "Classic Nolan.",
        startDate: "2010-07-16",
        endDate: "2010-07-16",
        isFavorite: true,
        imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
       {
        title: "Project Hail Mary",
        type: "book",
        genre: "Sci-Fi",
        platform: "Audible",
        status: "pending",
        rating: 0,
        notes: "Heard great things about this one.",
        imageUrl: "https://images.unsplash.com/photo-1614726365723-49cfae56345d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      },
    ];

    for (const item of seedData) {
      await storage.createItem(item);
    }
    console.log("Database seeded successfully.");
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // List items
  app.get(api.items.list.path, async (req, res) => {
    const { type, status, search, sort } = req.query;
    const items = await storage.getItems({
      type: type as string,
      status: status as string,
      search: search as string,
      sort: sort as string,
    });
    res.json(items);
  });

  // Get single item
  app.get(api.items.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const item = await storage.getItem(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);
  });

  // Create item
  app.post(api.items.create.path, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Update item
  app.put(api.items.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const input = api.items.update.input.parse(req.body);
      const updated = await storage.updateItem(id, input);
      if (!updated) return res.status(404).json({ message: "Item not found" });
      res.json(updated);
    } catch (err) {
       if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: err.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Delete item
  app.delete(api.items.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    await storage.deleteItem(id);
    res.status(204).send();
  });

  // Stats
  app.get(api.items.stats.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed DB on start
  seedDatabase().catch(err => console.error("Failed to seed database:", err));

  return httpServer;
}
