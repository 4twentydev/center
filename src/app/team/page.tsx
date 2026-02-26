"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import {
  Plus,
  User as UserIcon,
  Shield,
  Wrench,
  Crown,
  ClipboardList,
  Clock,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string;
  active: boolean;
  _count: {
    assignedJobs: number;
    timeEntries: number;
  };
}

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Crown size={16} className="text-purple-500" />,
  manager: <Shield size={16} className="text-blue-500" />,
  technician: <Wrench size={16} className="text-gray-500" />,
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  technician: "Technician",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const res = await fetch("/api/team");
    setMembers(await res.json());
    setLoading(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    fetchMembers();
  }

  const activeMembers = members.filter((m) => m.active);
  const inactiveMembers = members.filter((m) => !m.active);

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage your shop team members"
        action={
          <Link
            href="/team/new"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
            <Plus size={18} />
            Add Member
          </Link>
        }
      />

      {loading ? (
        <div className="p-8 text-center text-muted">Loading team...</div>
      ) : members.length === 0 ? (
        <div className="bg-card-bg rounded-xl border border-border p-8 text-center">
          <UserIcon size={40} className="mx-auto mb-3 text-muted opacity-50" />
          <p className="text-muted mb-2">No team members yet</p>
          <Link href="/team/new" className="text-primary text-sm hover:underline">
            Add your first team member
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Members */}
          <div>
            <h2 className="text-sm font-medium text-muted mb-3">
              Active Members ({activeMembers.length})
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-card-bg rounded-xl border border-border p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted">
                          {roleIcons[member.role]}
                          <span>{roleLabels[member.role] || member.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {member.email && (
                    <p className="text-xs text-muted mb-3 truncate">{member.email}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <ClipboardList size={14} />
                      {member._count.assignedJobs} jobs
                    </span>
                    {member._count.timeEntries > 0 && (
                      <span className="flex items-center gap-1 text-success">
                        <Clock size={14} />
                        Clocked in
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleActive(member.id, member.active)}
                    className="w-full text-xs text-muted hover:text-danger border border-border rounded-lg py-1.5 hover:border-danger/30 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Inactive Members */}
          {inactiveMembers.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted mb-3">
                Inactive Members ({inactiveMembers.length})
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-card-bg rounded-xl border border-border p-5 opacity-60"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted">
                          {roleLabels[member.role] || member.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(member.id, member.active)}
                      className="w-full text-xs text-primary border border-border rounded-lg py-1.5 hover:border-primary/30 transition-colors"
                    >
                      Reactivate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
