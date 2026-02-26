import { prisma } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import { JobStatusBadge, PriorityBadge } from "@/components/StatusBadge";
import Link from "next/link";
import {
  ClipboardList,
  Package,
  Clock,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    activeJobs,
    completedJobs,
    totalInventory,
    activeUsers,
    clockedInCount,
  ] = await Promise.all([
    prisma.job.count({ where: { status: { in: ["queued", "in_progress", "qc"] } } }),
    prisma.job.count({ where: { status: "complete" } }),
    prisma.inventoryItem.count(),
    prisma.user.count({ where: { active: true } }),
    prisma.timeEntry.count({ where: { clockOut: null } }),
  ]);

  const allItems = await prisma.inventoryItem.findMany({
    where: { minStock: { gt: 0 } },
  });
  const lowStockCount = allItems.filter((item) => item.quantity <= item.minStock).length;

  return {
    activeJobs,
    completedJobs,
    totalInventory,
    lowStockCount,
    activeUsers,
    clockedInCount,
  };
}

async function getRecentJobs() {
  return prisma.job.findMany({
    where: { status: { not: "complete" } },
    include: { assignedTo: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
}

async function getLowStockItems() {
  const items = await prisma.inventoryItem.findMany({
    where: { minStock: { gt: 0 } },
  });
  return items.filter((item) => item.quantity <= item.minStock).slice(0, 5);
}

export default async function Dashboard() {
  const [stats, recentJobs, lowStockItems] = await Promise.all([
    getStats(),
    getRecentJobs(),
    getLowStockItems(),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Shop overview and quick actions"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<ClipboardList size={22} className="text-primary" />}
          label="Active Jobs"
          value={stats.activeJobs}
          sub={`${stats.completedJobs} completed`}
          href="/jobs"
        />
        <StatCard
          icon={<Package size={22} className="text-primary" />}
          label="Inventory Items"
          value={stats.totalInventory}
          sub={stats.lowStockCount > 0 ? `${stats.lowStockCount} low stock` : "All stocked"}
          href="/inventory"
          alert={stats.lowStockCount > 0}
        />
        <StatCard
          icon={<Clock size={22} className="text-primary" />}
          label="Clocked In"
          value={stats.clockedInCount}
          sub="Currently working"
          href="/time"
        />
        <StatCard
          icon={<Users size={22} className="text-primary" />}
          label="Team Members"
          value={stats.activeUsers}
          sub="Active"
          href="/team"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Jobs */}
        <div className="lg:col-span-2 bg-card-bg rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Active Jobs</h2>
            <Link
              href="/jobs"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <ClipboardList size={32} className="mx-auto mb-2 opacity-50" />
              <p>No active jobs</p>
              <Link href="/jobs/new" className="text-primary text-sm hover:underline">
                Create your first job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted">
                        {job.jobNumber}
                      </span>
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <p className="font-medium truncate">{job.title}</p>
                    <p className="text-sm text-muted truncate">
                      {job.customer || "No customer"}{" "}
                      {job.assignedTo && `· ${job.assignedTo.name}`}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-card-bg rounded-xl border border-border">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg">Low Stock Alerts</h2>
            <Link
              href="/inventory"
              className="text-sm text-primary hover:text-primary-hover flex items-center gap-1"
            >
              Inventory <ArrowRight size={14} />
            </Link>
          </div>
          {lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-muted">
              <Package size={32} className="mx-auto mb-2 opacity-50" />
              <p>All items stocked</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.sku && (
                        <p className="text-xs text-muted">{item.sku}</p>
                      )}
                    </div>
                    <AlertTriangle size={16} className="text-warning flex-shrink-0 mt-1" />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-medium text-danger">
                      {item.quantity} {item.unit}
                    </span>
                    <span className="text-xs text-muted">
                      / min {item.minStock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-card-bg rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        {icon}
        {alert && <AlertTriangle size={16} className="text-warning" />}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted mt-0.5">{sub}</p>
    </Link>
  );
}
