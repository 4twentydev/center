"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { formatDateTime, getElapsedMinutes, formatHours } from "@/lib/utils";
import {
  Clock,
  LogIn,
  LogOut,
  User as UserIcon,
  Timer,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

interface TimeEntry {
  id: string;
  clockIn: string;
  clockOut: string | null;
  breakMins: number;
  notes: string | null;
  type: string;
  user: { id: string; name: string };
  job: { id: string; title: string; jobNumber: string } | null;
}

export default function TimeClockPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activeEntries, setActiveEntries] = useState<TimeEntry[]>([]);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    setLoading(true);
    const [usersRes, activeRes, recentRes] = await Promise.all([
      fetch("/api/team"),
      fetch("/api/time?active=true"),
      fetch("/api/time"),
    ]);
    const usersData = await usersRes.json();
    setUsers(usersData.filter((u: User) => u.active));
    setActiveEntries(await activeRes.json());
    setRecentEntries(await recentRes.json());
    setLoading(false);
  }

  async function clockIn() {
    if (!selectedUser) return;
    await fetch("/api/time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser, type: "shift" }),
    });
    setSelectedUser("");
    fetchData();
  }

  async function clockOut(entryId: string) {
    await fetch(`/api/time/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clockOut: true }),
    });
    fetchData();
  }

  function isUserClockedIn(userId: string) {
    return activeEntries.some((e) => e.user.id === userId);
  }

  const availableUsers = users.filter((u) => !isUserClockedIn(u.id));

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading...</div>;
  }

  return (
    <>
      <PageHeader
        title="Time Clock"
        description="Clock in/out and track work hours"
      />

      {/* Clock In Section */}
      <div className="bg-card-bg rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <LogIn size={20} className="text-success" />
          Clock In
        </h2>
        {availableUsers.length === 0 ? (
          <p className="text-sm text-muted">
            {users.length === 0
              ? "Add team members first to use the time clock."
              : "All team members are currently clocked in."}
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 px-3 py-3 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select team member...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <button
              onClick={clockIn}
              disabled={!selectedUser}
              className="inline-flex items-center justify-center gap-2 bg-success text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 min-w-[140px]"
            >
              <LogIn size={18} />
              Clock In
            </button>
          </div>
        )}
      </div>

      {/* Currently Clocked In */}
      <div className="bg-card-bg rounded-xl border border-border mb-6">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Timer size={20} className="text-primary" />
            Currently Clocked In
            <span className="text-sm font-normal text-muted">
              ({activeEntries.length})
            </span>
          </h2>
        </div>
        {activeEntries.length === 0 ? (
          <div className="p-8 text-center text-muted">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p>No one is clocked in</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activeEntries.map((entry) => {
              const elapsed = getElapsedMinutes(entry.clockIn);
              return (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{entry.user.name}</p>
                      <p className="text-xs text-muted">
                        Clocked in {formatDateTime(entry.clockIn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-2">
                      <p className="font-mono font-medium text-primary">
                        {formatHours(elapsed)}
                      </p>
                    </div>
                    <button
                      onClick={() => clockOut(entry.id)}
                      className="inline-flex items-center gap-1.5 bg-danger text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      <LogOut size={16} />
                      Clock Out
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-card-bg rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">Recent Time Entries</h2>
        </div>
        {recentEntries.filter((e) => e.clockOut).length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            No completed time entries yet
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left p-3 font-medium text-muted">Name</th>
                    <th className="text-left p-3 font-medium text-muted">Clock In</th>
                    <th className="text-left p-3 font-medium text-muted">Clock Out</th>
                    <th className="text-right p-3 font-medium text-muted">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentEntries
                    .filter((e) => e.clockOut)
                    .slice(0, 20)
                    .map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{entry.user.name}</td>
                        <td className="p-3 text-muted">
                          {formatDateTime(entry.clockIn)}
                        </td>
                        <td className="p-3 text-muted">
                          {formatDateTime(entry.clockOut)}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {formatHours(
                            getElapsedMinutes(entry.clockIn, entry.clockOut)
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-border">
              {recentEntries
                .filter((e) => e.clockOut)
                .slice(0, 20)
                .map((entry) => (
                  <div key={entry.id} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium">{entry.user.name}</p>
                      <p className="font-mono text-sm font-medium">
                        {formatHours(
                          getElapsedMinutes(entry.clockIn, entry.clockOut)
                        )}
                      </p>
                    </div>
                    <p className="text-xs text-muted">
                      {formatDateTime(entry.clockIn)} – {formatDateTime(entry.clockOut)}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
