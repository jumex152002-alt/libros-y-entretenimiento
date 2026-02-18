import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertItem, type UpdateItemRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Fetch all items with optional filters
export function useItems(filters?: { search?: string; type?: string; status?: string; sort?: string }) {
  // Construct query key based on filters to enable caching per filter set
  const queryKey = [api.items.list.path, filters];
  
  // Construct URL with query params
  const url = new URL(api.items.list.path, window.location.origin);
  if (filters) {
    if (filters.search) url.searchParams.append("search", filters.search);
    if (filters.type && filters.type !== "all") url.searchParams.append("type", filters.type);
    if (filters.status && filters.status !== "all") url.searchParams.append("status", filters.status);
    if (filters.sort) url.searchParams.append("sort", filters.sort);
  }

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch items");
      return api.items.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single item
export function useItem(id: number) {
  return useQuery({
    queryKey: [api.items.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      const url = buildUrl(api.items.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      return api.items.get.responses[200].parse(await res.json());
    },
  });
}

// Fetch stats
export function useStats() {
  return useQuery({
    queryKey: [api.items.stats.path],
    queryFn: async () => {
      const res = await fetch(api.items.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.items.stats.responses[200].parse(await res.json());
    },
  });
}

// Create Item
export function useCreateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: InsertItem) => {
      const res = await fetch(api.items.create.path, {
        method: api.items.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create item");
      }
      return api.items.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.stats.path] });
      toast({ title: "Success", description: "Item added successfully to your library." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// Update Item
export function useUpdateItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateItemRequest) => {
      const url = buildUrl(api.items.update.path, { id });
      const res = await fetch(url, {
        method: api.items.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update item");
      }
      return api.items.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.stats.path] });
      toast({ title: "Success", description: "Item updated successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// Delete Item
export function useDeleteItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.items.delete.path, { id });
      const res = await fetch(url, {
        method: api.items.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.items.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.items.stats.path] });
      toast({ title: "Deleted", description: "Item removed from your library." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}
