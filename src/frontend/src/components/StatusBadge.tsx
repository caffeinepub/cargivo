import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_quote: {
    label: "Pending Quote",
    className: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  quote_sent: {
    label: "Quote Sent",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  approved: {
    label: "Approved",
    className: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  advance_paid: {
    label: "Advance Paid",
    className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  in_production: {
    label: "In Production",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  delivered: {
    label: "Delivered",
    className: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-500/20 text-red-300 border-red-500/30",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0.5 ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
