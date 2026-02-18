import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ItemDialog } from "@/components/ItemDialog";
import { Item } from "@shared/schema";

export default function Dashboard() {
  const { data: items, isLoading } = useItems({ sort: 'date' });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  // Get recent 4 items
  const recentItems = items?.slice(0, 4) || [];

  const handleEdit = (item: Item) => setEditingItem(item);
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem.mutate(id);
    }
  };
  const handleToggleStatus = (item: Item) => {
    const newStatus = item.status === 'completed' ? 'pending' : 'completed';
    updateItem.mutate({ id: item.id, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-72 p-4 md:p-8 lg:p-12 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 text-lg">Welcome back to your collection.</p>
            </div>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full h-12 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 text-base font-semibold transition-all hover:scale-105"
            >
              <Plus className="mr-2 h-5 w-5" /> Add New
            </Button>
          </header>

          <StatsCards />

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold">Recently Added</h2>
              <Button variant="ghost" className="text-primary hover:text-primary/80 hover:bg-primary/5">View All</Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-2xl"/>)}
              </div>
            ) : recentItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-12 text-center">
                <p className="text-muted-foreground mb-4">Your library is empty. Start adding some content!</p>
                <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Add your first item</Button>
              </div>
            )}
          </section>
        </div>
      </main>

      <ItemDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        mode="create"
        onSubmit={(data) => createItem.mutate(data)}
      />

      <ItemDialog 
        open={!!editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)}
        mode="edit"
        initialData={editingItem || undefined}
        onSubmit={(data) => editingItem && updateItem.mutate({ id: editingItem.id, ...data })}
      />
    </div>
  );
}
