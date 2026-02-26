"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { JobStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Plus, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  customer: string | null;
  dueDate: string | null;
  assignedTo: { id: string; name: string } | null;
  updatedAt: string;
}

const statusTabs = [
  { value: "all", label: "All" },
  { value: "queued", label: "Queued" },
  { value: "in_progress", label: "In Progress" },
  { value: "qc", label: "QC" },
  { value: "complete", label: "Complete" },
  { value: "on_hold", label: "On Hold" },
];

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [status, search]);

  async function fetchJobs() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (search) params.set("search", search);

    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Manage work orders and job tracking"
        action={
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            New Job
          </Link>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search jobs, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              status === tab.value
                ? "bg-primary text-white"
                : "bg-card-bg text-muted hover:bg-gray-100 border border-border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="bg-card-bg rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <Filter size={32} className="mx-auto mb-2 opacity-50" />
            <p>No jobs found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted">
                      {job.jobNumber}
                    </span>
                    <PriorityBadge priority={job.priority} />
                    {job.dueDate && (
                      <span className="text-xs text-muted">
                        Due {formatDate(job.dueDate)}
                      </span>
                    )}
                  </div>
                  <p className="font-medium truncate">{job.title}</p>
                  <p className="text-sm text-muted truncate">
                    {job.customer || "No customer"}
                    {job.assignedTo && ` · ${job.assignedTo.name}`}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <JobStatusBadge status={job.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
