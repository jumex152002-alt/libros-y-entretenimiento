import { Item } from "@shared/schema";
import { Star, MoreVertical, PlayCircle, BookOpen, Clock, CheckCircle2, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (item: Item) => void;
}

export function ItemCard({ item, onEdit, onDelete, onToggleStatus }: ItemCardProps) {
  const isSeries = item.type === 'series';
  const progress = isSeries && item.totalEpisodes && item.watchedEpisodes
    ? Math.min(Math.round((item.watchedEpisodes / item.totalEpisodes) * 100), 100)
    : 0;

  const StatusIcon = {
    pending: Clock,
    in_progress: PlayCircle,
    completed: CheckCircle2,
  }[item.status];

  const statusColor = {
    pending: "text-amber-500 bg-amber-500/10",
    in_progress: "text-blue-500 bg-blue-500/10",
    completed: "text-green-500 bg-green-500/10",
  }[item.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-xl hover:shadow-black/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image Area */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            {isSeries ? <TvIcon className="w-12 h-12 opacity-20" /> : 
             item.type === 'movie' ? <FilmIcon className="w-12 h-12 opacity-20" /> : 
             <BookIcon className="w-12 h-12 opacity-20" />}
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

        {/* Top Actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm">
                <MoreVertical className="w-4 h-4 text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                {item.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Rating Badge */}
        {item.rating && item.rating > 0 && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-white">{item.rating}</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10 text-white flex items-center gap-1.5", 
            item.status === 'completed' ? 'bg-green-500/80' : 
            item.status === 'in_progress' ? 'bg-blue-500/80' : 'bg-amber-500/80'
          )}>
            <StatusIcon className="w-3 h-3" />
            {item.status === 'in_progress' ? 'In Progress' : item.status}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-lg leading-tight line-clamp-1 text-foreground" title={item.title}>
          {item.title}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span className="capitalize">{item.genre || "Unspecified"}</span>
          <span>•</span>
          <span className="capitalize">{item.platform || "Unknown"}</span>
        </div>

        {/* Progress Bar for Series */}
        {isSeries && item.status === 'in_progress' && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-muted-foreground text-right">
              {item.watchedEpisodes} / {item.totalEpisodes || '?'} eps
            </div>
          </div>
        )}
        
        {/* Notes Preview (if any) */}
        {item.notes && !isSeries && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            "{item.notes}"
          </p>
        )}
      </div>
    </motion.div>
  );
}

// Simple icons for fallbacks
function TvIcon(props: any) { return <Tv {...props} /> }
function FilmIcon(props: any) { return <Film {...props} /> }
function BookIcon(props: any) { return <BookOpen {...props} /> }

