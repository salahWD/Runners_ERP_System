import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Truck,
  CheckCircle,
  DollarSign,
  FileText,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  id: string;
  order_id: string;
  timestamp: string;
  type: string;
  title: string;
  description?: string;
  amount_usd?: number;
  amount_lbp?: number;
}

interface OrderTimelineProps {
  orderId: string;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  ORDER_CREATED: <Package className="h-4 w-4" />,
  ASSIGNED: <Truck className="h-4 w-4" />,
  PICKED_UP: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle className="h-4 w-4" />,

  CASH_COLLECTED: <DollarSign className="h-4 w-4" />,

  STATEMENT_ADDED: <FileText className="h-4 w-4" />,
  STATEMENT_PAID: <FileText className="h-4 w-4" />,

  PAYMENT_SENT: <ArrowUp className="h-4 w-4" />,     // we paid client
  PAYMENT_RECEIVED: <ArrowDown className="h-4 w-4" />, // client paid us
};

const EVENT_COLORS: Record<string, string> = {
  ORDER_CREATED: "bg-blue-500",
  ASSIGNED: "bg-yellow-500",
  PICKED_UP: "bg-blue-500",
  DELIVERED: "bg-green-600",

  CASH_COLLECTED: "bg-green-500",

  STATEMENT_ADDED: "bg-purple-500",
  STATEMENT_PAID: "bg-green-600",

  PAYMENT_SENT: "bg-red-500",       // money out
  PAYMENT_RECEIVED: "bg-green-600", // money in
};

export function OrderTimeline({ orderId }: OrderTimelineProps) {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["order-timeline", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_timeline_events")
        .select("*")
        .eq("order_id", orderId)
        .order("timestamp", { ascending: false });

      if (error) throw error;
      return data as TimelineEvent[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4 pb-6 last:pb-0">

            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white",
                  EVENT_COLORS[event.type] || "bg-gray-400"
                )}
              >
                {EVENT_ICONS[event.type] || <Package className="h-4 w-4" />}
              </div>

              {index < events.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{event.title}</p>

                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}

                  {/* 💵 Amount display */}
                  {(event.amount_usd || event.amount_lbp) && (
                    <div className="flex gap-2 mt-2">
                      {event.amount_usd && (
                        <Badge variant="secondary">
                          ${event.amount_usd}
                        </Badge>
                      )}
                      {event.amount_lbp && (
                        <Badge variant="secondary">
                          LL {event.amount_lbp}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}