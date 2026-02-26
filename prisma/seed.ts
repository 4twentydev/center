import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create team members
  const admin = await prisma.user.create({
    data: {
      name: "Mike Johnson",
      email: "mike@shop.com",
      pin: "1234",
      role: "admin",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Sarah Williams",
      email: "sarah@shop.com",
      pin: "5678",
      role: "manager",
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      name: "Carlos Rivera",
      pin: "1111",
      role: "technician",
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      name: "Jake Thompson",
      pin: "2222",
      role: "technician",
    },
  });

  const tech3 = await prisma.user.create({
    data: {
      name: "Alex Chen",
      pin: "3333",
      role: "technician",
    },
  });

  console.log("Created 5 team members");

  // Create inventory items
  const items = await Promise.all([
    prisma.inventoryItem.create({
      data: {
        name: '1/4" Mild Steel Plate',
        sku: "MS-250-48x96",
        category: "Raw Material",
        quantity: 12,
        unit: "sheet",
        minStock: 5,
        costPerUnit: 185.0,
        location: "Rack A1",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '1/2" Aluminum Round Bar',
        sku: "AL-500-RB",
        category: "Raw Material",
        quantity: 24,
        unit: "ft",
        minStock: 10,
        costPerUnit: 8.50,
        location: "Rack A3",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "ER70S-6 Welding Wire .035",
        sku: "WW-035-44",
        category: "Consumables",
        quantity: 3,
        unit: "roll",
        minStock: 4,
        costPerUnit: 42.0,
        location: "Shelf B1",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Cutting Disc 4.5 inch",
        sku: "CD-45-25PK",
        category: "Consumables",
        quantity: 47,
        unit: "ea",
        minStock: 20,
        costPerUnit: 2.75,
        location: "Shelf B2",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '3/8"-16 Hex Bolts (Grade 8)',
        sku: "HB-375-16-G8",
        category: "Fasteners",
        quantity: 150,
        unit: "ea",
        minStock: 50,
        costPerUnit: 0.45,
        location: "Bin C4",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Argon/CO2 Mix 75/25 Tank",
        sku: "GAS-7525",
        category: "Gas",
        quantity: 2,
        unit: "ea",
        minStock: 2,
        costPerUnit: 65.0,
        location: "Gas Cage",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: '2" Square Tube 11ga',
        sku: "ST-200-11",
        category: "Raw Material",
        quantity: 8,
        unit: "ft",
        minStock: 20,
        costPerUnit: 4.25,
        location: "Rack A2",
      },
    }),
    prisma.inventoryItem.create({
      data: {
        name: "Flap Disc 60 Grit 4.5 inch",
        sku: "FD-60-45",
        category: "Consumables",
        quantity: 18,
        unit: "ea",
        minStock: 10,
        costPerUnit: 4.50,
        location: "Shelf B2",
      },
    }),
  ]);

  console.log("Created 8 inventory items");

  // Create jobs
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-001",
      title: "Custom mounting brackets (qty 24)",
      description:
        'Fabricate 24 custom L-brackets from 1/4" mild steel. Holes drilled per drawing. Powder coat black.',
      status: "in_progress",
      priority: "high",
      customer: "Acme Manufacturing",
      dueDate: nextWeek,
      startedAt: twoDaysAgo,
      estimatedHours: 16,
      assignedToId: tech1.id,
      createdById: manager.id,
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-002",
      title: "Repair conveyor frame section",
      description:
        "Cut out damaged section of conveyor frame and weld in new 2\" square tube. Needs to be done on-site.",
      status: "queued",
      priority: "urgent",
      customer: "Valley Foods Inc",
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 8,
      assignedToId: tech2.id,
      createdById: admin.id,
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-003",
      title: "Aluminum adapter plates (qty 6)",
      description: 'Machine 6 adapter plates from 1/2" aluminum round bar. CNC program ready.',
      status: "qc",
      priority: "normal",
      customer: "TechParts Co",
      dueDate: nextTwoWeeks,
      startedAt: fiveDaysAgo,
      estimatedHours: 12,
      assignedToId: tech3.id,
      createdById: manager.id,
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-004",
      title: "Weld table repair and leveling",
      description: "Shop maintenance - resurface and level the main welding table.",
      status: "queued",
      priority: "low",
      customer: null,
      estimatedHours: 4,
      createdById: admin.id,
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-005",
      title: "Handrail fabrication - Building B stairs",
      description:
        'Fabricate and install new handrails for Building B exterior stairs. 1.5" pipe rail per code.',
      status: "in_progress",
      priority: "normal",
      customer: "Downtown Properties LLC",
      dueDate: nextTwoWeeks,
      startedAt: twoDaysAgo,
      estimatedHours: 24,
      assignedToId: tech1.id,
      createdById: manager.id,
    },
  });

  await prisma.job.create({
    data: {
      jobNumber: "JOB-2601-006",
      title: "Guard rail sections (qty 12)",
      description: "Standard guard rail sections for warehouse dock area.",
      status: "complete",
      priority: "normal",
      customer: "Valley Foods Inc",
      startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      completedAt: twoDaysAgo,
      estimatedHours: 20,
      assignedToId: tech2.id,
      createdById: admin.id,
    },
  });

  console.log("Created 6 jobs");

  // Create some time entries
  const shiftStart = new Date();
  shiftStart.setHours(7, 0, 0, 0);

  await prisma.timeEntry.create({
    data: {
      userId: tech1.id,
      clockIn: shiftStart,
      type: "shift",
    },
  });

  await prisma.timeEntry.create({
    data: {
      userId: tech3.id,
      clockIn: new Date(shiftStart.getTime() + 30 * 60000),
      type: "shift",
    },
  });

  // A completed entry from yesterday
  const yesterdayStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  yesterdayStart.setHours(7, 0, 0, 0);
  const yesterdayEnd = new Date(yesterdayStart.getTime() + 9 * 60 * 60 * 1000);

  await prisma.timeEntry.create({
    data: {
      userId: tech1.id,
      clockIn: yesterdayStart,
      clockOut: yesterdayEnd,
      type: "shift",
    },
  });

  await prisma.timeEntry.create({
    data: {
      userId: tech2.id,
      clockIn: yesterdayStart,
      clockOut: new Date(yesterdayStart.getTime() + 8.5 * 60 * 60 * 1000),
      type: "shift",
    },
  });

  await prisma.timeEntry.create({
    data: {
      userId: tech3.id,
      clockIn: yesterdayStart,
      clockOut: new Date(yesterdayStart.getTime() + 8 * 60 * 60 * 1000),
      breakMins: 30,
      type: "shift",
    },
  });

  console.log("Created 5 time entries");
  console.log("\nSeed complete! Your shop is ready to go.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
