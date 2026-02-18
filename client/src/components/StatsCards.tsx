import { useStats } from "@/hooks/use-items";
import { BookOpen, Film, Tv, CheckCircle2, Clock, PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export function StatsCards() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) return <StatsSkeleton />;
  if (!stats) return null;

  const typeData = [
    { name: 'Series', value: stats.byType.series, color: '#f97316' }, // orange-500
    { name: 'Movies', value: stats.byType.movie, color: '#8b5cf6' },  // violet-500
    { name: 'Books', value: stats.byType.book, color: '#10b981' },    // emerald-500
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      {/* Overview Card */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-1">
        <div>
          <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider mb-1">Total Collection</h3>
          <p className="text-4xl font-display font-bold text-foreground">{stats.totalItems}</p>
        </div>
        <div className="mt-6 flex gap-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Avg Rating</span>
            <div className="flex items-center gap-1 text-yellow-500 font-bold">
              <span>★</span> {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 col-span-1 md:col-span-1 lg:col-span-1 space-y-4">
        <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider mb-2">Status</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed
          </div>
          <span className="font-bold">{stats.completedItems}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <PlayCircle className="w-4 h-4 text-blue-500" /> In Progress
          </div>
          <span className="font-bold">{stats.inProgressItems}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4 text-amber-500" /> Pending
          </div>
          <span className="font-bold">{stats.pendingItems}</span>
        </div>
      </div>

      {/* Type Breakdown (Pie Chart) */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 col-span-1 md:col-span-3 lg:col-span-2 flex flex-row items-center justify-between relative overflow-hidden">
         <div className="z-10 space-y-4">
            <h3 className="text-muted-foreground font-medium text-sm uppercase tracking-wider">Distribution</h3>
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-sm font-medium">Series ({stats.byType.series})</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-violet-500"></span>
                  <span className="text-sm font-medium">Movies ({stats.byType.movie})</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-sm font-medium">Books ({stats.byType.book})</span>
               </div>
            </div>
         </div>

         <div className="h-[120px] w-[120px] relative">
            {typeData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={typeData}
                     cx="50%"
                     cy="50%"
                     innerRadius={30}
                     outerRadius={55}
                     paddingAngle={5}
                     dataKey="value"
                  >
                     {typeData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                     ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                     itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
               </PieChart>
               </ResponsiveContainer>
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No data</div>
            )}
         </div>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-2xl" />
      ))}
    </div>
  );
}
