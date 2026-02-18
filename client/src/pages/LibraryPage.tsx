import { Sidebar } from "@/components/Sidebar";
import { useItems, useCreateItem, useUpdateItem, useDeleteItem } from "@/hooks/use-items";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, SlidersHorizontal, LayoutGrid, List as ListIcon } from "lucide-react";
import { useState } from "react";
import { ItemDialog } from "@/components/ItemDialog";
import { Item } from "@shared/schema";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface LibraryPageProps {
  type: 'series' | 'movie' | 'book';
  title: string;
}

export default function LibraryPage({ type, title }: LibraryPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("date");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const { data: items, isLoading } = useItems({ 
    type, 
    search: search || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sort
  });

  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const handleEdit = (item: Item) => setEditingItem(item);
  const handleDelete = (id: number) => {
    if (confirm("Delete this item?")) deleteItem.mutate(id);
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
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold text-foreground">{title}</h1>
              <p className="text-muted-foreground mt-1">Manage your {title.toLowerCase()} collection</p>
            </div>
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full h-12 px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 text-base font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" /> Add {type === 'series' ? 'Series' : type === 'movie' ? 'Movie' : 'Book'}
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Search ${title.toLowerCase()}...`}
                className="pl-9 bg-background border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background border-border/50">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[140px] bg-background border-border/50">
                   <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex bg-muted rounded-md p-1 border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-sm", viewMode === 'grid' && "bg-background shadow-sm")}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-sm", viewMode === 'list' && "bg-background shadow-sm")}
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-2xl"/>)}
            </div>
          ) : items && items.length > 0 ? (
            <div className={cn(
              "grid gap-6 animate-in fade-in duration-500",
              viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
            )}>
              {items.map((item) => (
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
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No items found</h3>
                <p className="text-muted-foreground mt-1">Try adjusting your filters or adding a new item.</p>
              </div>
              <Button onClick={() => setIsCreateOpen(true)} variant="outline">
                Add {type}
              </Button>
            </div>
          )}
        </div>
      </main>

      <ItemDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        mode="create"
        defaultType={type}
        onSubmit={(data) => createItem.mutate(data)}
      />

      <ItemDialog 
        open={!!editingItem} 
        onOpenChange={(open) => !open && setEditingItem(null)}
        mode="edit"
        defaultType={type}
        initialData={editingItem || undefined}
        onSubmit={(data) => editingItem && updateItem.mutate({ id: editingItem.id, ...data })}
      />
    </div>
  );
}
