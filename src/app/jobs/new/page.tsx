"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  role: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "normal",
    customer: "",
    dueDate: "",
    estimatedHours: "",
    assignedToId: "",
  });

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((data) => setUsers(data.filter((u: User & { active: boolean }) => u.active)));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);

    // Use first admin/manager as creator, or first user
    const creator = users.find((u) => u.role === "admin" || u.role === "manager") || users[0];
    if (!creator) {
      alert("Please add at least one team member first.");
      setSaving(false);
      return;
    }

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, createdById: creator.id }),
    });

    if (res.ok) {
      const job = await res.json();
      router.push(`/jobs/${job.id}`);
    } else {
      alert("Failed to create job");
      setSaving(false);
    }
  }

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
      <PageHeader title="New Job" description="Create a new work order" />

      <form
        onSubmit={handleSubmit}
        className="bg-card-bg rounded-xl border border-border p-6 max-w-2xl space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Job Title <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Custom bracket fabrication"
            className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Job details, specifications, notes..."
            className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Customer</label>
            <input
              type="text"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              placeholder="Customer name"
              className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Estimated Hours
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={form.estimatedHours}
              onChange={(e) =>
                setForm({ ...form, estimatedHours: e.target.value })
              }
              placeholder="0"
              className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Assign To</label>
          <select
            value={form.assignedToId}
            onChange={(e) =>
              setForm({ ...form, assignedToId: e.target.value })
            }
            className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Job"}
          </button>
          <Link
            href="/jobs"
            className="px-6 py-2.5 rounded-lg border border-border hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
