"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { JobStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { formatDate, formatDateTime, getElapsedMinutes, formatHours } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  ChevronRight,
  MessageSquare,
  Trash2,
} from "lucide-react";

interface JobDetail {
  id: string;
  jobNumber: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  customer: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  estimatedHours: number | null;
  createdAt: string;
  assignedTo: { id: string; name: string; role: string } | null;
  createdBy: { id: string; name: string } | null;
  timeEntries: Array<{
    id: string;
    clockIn: string;
    clockOut: string | null;
    user: { name: string };
  }>;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { name: string };
  }>;
}

const statusFlow = ["queued", "in_progress", "qc", "complete"];
const statusLabels: Record<string, string> = {
  queued: "Queued",
  in_progress: "In Progress",
  qc: "QC Review",
  complete: "Complete",
  on_hold: "On Hold",
};

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [id]);

  async function fetchJob() {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) {
      router.push("/jobs");
      return;
    }
    setJob(await res.json());
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchJob();
  }

  async function deleteJob() {
    if (!confirm("Are you sure you want to delete this job?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    router.push("/jobs");
  }

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  if (!job) return null;

  const currentStatusIndex = statusFlow.indexOf(job.status);
  const nextStatus = currentStatusIndex >= 0 && currentStatusIndex < statusFlow.length - 1
    ? statusFlow[currentStatusIndex + 1]
    : null;

  const totalMinutes = job.timeEntries.reduce((sum, entry) => {
    return sum + getElapsedMinutes(entry.clockIn, entry.clockOut);
  }, 0);

  return (
    <>
      <div className="mb-4">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back to Jobs
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono text-muted">{job.jobNumber}</span>
            <JobStatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
          </div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          {job.customer && (
            <p className="text-muted mt-1">Customer: {job.customer}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {job.status !== "on_hold" && nextStatus && (
            <button
              onClick={() => updateStatus(nextStatus)}
              className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
            >
              Move to {statusLabels[nextStatus]}
              <ChevronRight size={16} />
            </button>
          )}
          {job.status !== "on_hold" && job.status !== "complete" && (
            <button
              onClick={() => updateStatus("on_hold")}
              className="px-4 py-2 rounded-lg border border-warning text-warning hover:bg-yellow-50 transition-colors text-sm font-medium"
            >
              Hold
            </button>
          )}
          {job.status === "on_hold" && (
            <button
              onClick={() => updateStatus("queued")}
              className="inline-flex items-center gap-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
            >
              Resume
            </button>
          )}
        </div>
      </div>

      {/* Status Progress Bar */}
      <div className="bg-card-bg rounded-xl border border-border p-4 mb-6">
        <div className="flex items-center gap-2">
          {statusFlow.map((s, i) => {
            const isCurrent = s === job.status;
            const isPast = currentStatusIndex >= 0 && i < currentStatusIndex;
            const isComplete = s === "complete" && job.status === "complete";
            return (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex-1 h-2 rounded-full ${
                    isPast || isComplete
                      ? "bg-success"
                      : isCurrent
                      ? "bg-primary"
                      : "bg-gray-200"
                  }`}
                />
                {i < statusFlow.length - 1 && <div className="w-1" />}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2">
          {statusFlow.map((s) => (
            <span
              key={s}
              className={`text-xs ${
                s === job.status ? "font-medium text-foreground" : "text-muted"
              }`}
            >
              {statusLabels[s]}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {job.description && (
            <div className="bg-card-bg rounded-xl border border-border p-5">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted whitespace-pre-wrap">
                {job.description}
              </p>
            </div>
          )}

          {/* Time Entries */}
          <div className="bg-card-bg rounded-xl border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Time Logged</h3>
              <span className="text-sm font-medium text-primary">
                {formatHours(totalMinutes)} total
                {job.estimatedHours &&
                  ` / ${job.estimatedHours}h estimated`}
              </span>
            </div>
            {job.timeEntries.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                No time logged yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {job.timeEntries.map((entry) => (
                  <div key={entry.id} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{entry.user.name}</span>
                      <span className="text-muted ml-2">
                        {formatDateTime(entry.clockIn)}
                        {entry.clockOut ? ` – ${formatDateTime(entry.clockOut)}` : " (active)"}
                      </span>
                    </div>
                    <span className="font-mono text-xs">
                      {formatHours(getElapsedMinutes(entry.clockIn, entry.clockOut))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-card-bg rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">Comments</h3>
            </div>
            {job.comments.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">
                <MessageSquare size={24} className="mx-auto mb-1 opacity-50" />
                No comments yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {job.comments.map((comment) => (
                  <div key={comment.id} className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted">
                        {formatDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{comment.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="bg-card-bg rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-semibold">Details</h3>

            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-muted" />
              <div>
                <p className="text-muted text-xs">Assigned To</p>
                <p className="font-medium">
                  {job.assignedTo?.name || "Unassigned"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-muted" />
              <div>
                <p className="text-muted text-xs">Due Date</p>
                <p className="font-medium">{formatDate(job.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Clock size={16} className="text-muted" />
              <div>
                <p className="text-muted text-xs">Created</p>
                <p className="font-medium">{formatDate(job.createdAt)}</p>
              </div>
            </div>

            {job.startedAt && (
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-muted" />
                <div>
                  <p className="text-muted text-xs">Started</p>
                  <p className="font-medium">{formatDate(job.startedAt)}</p>
                </div>
              </div>
            )}

            {job.completedAt && (
              <div className="flex items-center gap-3 text-sm">
                <Clock size={16} className="text-success" />
                <div>
                  <p className="text-muted text-xs">Completed</p>
                  <p className="font-medium text-success">
                    {formatDate(job.completedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={deleteJob}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-danger/30 text-danger hover:bg-red-50 transition-colors text-sm"
          >
            <Trash2 size={16} />
            Delete Job
          </button>
        </div>
      </div>
    </>
  );
}
