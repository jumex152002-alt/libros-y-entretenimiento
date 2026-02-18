import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Item, InsertItem, insertItemSchema } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useEffect } from "react";
import { Star } from "lucide-react";

// Extend schema for form usage (coerce numbers)
const formSchema = insertItemSchema.extend({
  rating: z.coerce.number().min(0).max(5),
  totalEpisodes: z.coerce.number().optional(),
  watchedEpisodes: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertItem) => void;
  initialData?: Item;
  mode: 'create' | 'edit';
  defaultType?: 'series' | 'movie' | 'book';
}

export function ItemDialog({ open, onOpenChange, onSubmit, initialData, mode, defaultType }: ItemDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: defaultType || "series",
      status: "pending",
      rating: 0,
      genre: "",
      platform: "",
      imageUrl: "",
      notes: "",
      totalEpisodes: 0,
      watchedEpisodes: 0,
      isFavorite: false,
    },
  });

  // Reset form when opening or changing initialData
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          title: initialData.title,
          type: initialData.type as any,
          status: initialData.status as any,
          rating: initialData.rating || 0,
          genre: initialData.genre || "",
          platform: initialData.platform || "",
          imageUrl: initialData.imageUrl || "",
          notes: initialData.notes || "",
          totalEpisodes: initialData.totalEpisodes || 0,
          watchedEpisodes: initialData.watchedEpisodes || 0,
          isFavorite: initialData.isFavorite || false,
        });
      } else {
        form.reset({
          title: "",
          type: defaultType || "series",
          status: "pending",
          rating: 0,
          genre: "",
          platform: "",
          imageUrl: "",
          notes: "",
          totalEpisodes: 0,
          watchedEpisodes: 0,
          isFavorite: false,
        });
      }
    }
  }, [open, initialData, defaultType, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const currentType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {mode === 'create' ? 'Add to Library' : 'Edit Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new movie, series, or book to track.' : 'Update details for this item.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Breaking Bad" {...field} className="text-lg font-medium" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="series">Series</SelectItem>
                        <SelectItem value="movie">Movie</SelectItem>
                        <SelectItem value="book">Book</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Sci-Fi" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform / Source</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Netflix, Kindle" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {currentType === 'series' && (
              <div className="p-4 bg-muted/50 rounded-xl space-y-4 border border-border/50">
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-4 bg-primary rounded-full"/> Series Progress
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalEpisodes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Episodes</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="watchedEpisodes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Watched</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Rating</FormLabel>
                    <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                      {field.value} / 5
                    </span>
                  </div>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      <Slider
                        min={0}
                        max={5}
                        step={1}
                        value={[field.value || 0]}
                        onValueChange={(val) => field.onChange(val[0])}
                        className="flex-1"
                      />
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= (field.value || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What did you think?" className="resize-none min-h-[80px]" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" size="lg" className="px-8 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40">
                {mode === 'create' ? 'Add Item' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
