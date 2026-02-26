import clsx from "clsx";

const statusStyles: Record<string, string> = {
  queued: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  qc: "bg-purple-100 text-purple-700",
  complete: "bg-green-100 text-green-700",
  on_hold: "bg-yellow-100 text-yellow-700",
};

const statusLabels: Record<string, string> = {
  queued: "Queued",
  in_progress: "In Progress",
  qc: "QC",
  complete: "Complete",
  on_hold: "On Hold",
};

const priorityStyles: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-50 text-blue-600",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export function JobStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusStyles[status] || "bg-gray-100 text-gray-700"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        priorityStyles[priority] || "bg-gray-100 text-gray-600"
      )}
    >
      {priority}
    </span>
  );
}
