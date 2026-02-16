// Database seed script
// Run: npx tsx scripts/seed.ts

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/smart-city-management";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;

  // Clear existing data
  const collections = [
    "users",
    "departments",
    "complaintcategories",
    "complaints",
    "complaintstatuslogs",
    "areas",
  ];
  for (const col of collections) {
    try {
      await db.collection(col).drop();
    } catch {
      // Collection doesn't exist
    }
  }

  // Create departments
  const departments = await db.collection("departments").insertMany([
    {
      name: "Road Department",
      code: "ROAD",
      description: "Handles road maintenance and infrastructure",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Water Department",
      code: "WATER",
      description: "Handles water supply and sewage issues",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Electricity Department",
      code: "ELEC",
      description: "Handles electrical and power supply issues",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const deptIds = Object.values(departments.insertedIds);
  console.log("Departments created:", deptIds.length);

  // Create categories
  await db.collection("complaintcategories").insertMany([
    {
      name: "Pothole",
      code: "POTHOLE",
      departmentId: deptIds[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Road Damage",
      code: "ROAD_DAMAGE",
      departmentId: deptIds[0],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Street Light",
      code: "STREET_LIGHT",
      departmentId: deptIds[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Water Leak",
      code: "WATER_LEAK",
      departmentId: deptIds[1],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Water Supply",
      code: "WATER_SUPPLY",
      departmentId: deptIds[1],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Power Outage",
      code: "POWER_OUTAGE",
      departmentId: deptIds[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Drainage Block",
      code: "DRAINAGE",
      departmentId: deptIds[1],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Categories created");

  // Create areas
  await db.collection("areas").insertMany([
    {
      name: "City Center",
      location: { type: "Point", coordinates: [72.8777, 19.076] },
      radius: 3000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "North Zone",
      location: { type: "Point", coordinates: [72.85, 19.12] },
      radius: 4000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "South Zone",
      location: { type: "Point", coordinates: [72.83, 19.02] },
      radius: 4000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Areas created");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 12);

  await db.collection("users").insertMany([
    {
      name: "Super Admin",
      email: "superadmin@scm.com",
      phone: "9000000001",
      password: hashedPassword,
      role: "super-admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Road Admin",
      email: "roadadmin@scm.com",
      phone: "9000000002",
      password: hashedPassword,
      role: "admin",
      departmentId: deptIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Water Admin",
      email: "wateradmin@scm.com",
      phone: "9000000003",
      password: hashedPassword,
      role: "admin",
      departmentId: deptIds[1],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Road Worker 1",
      email: "roadworker1@scm.com",
      phone: "9000000004",
      password: hashedPassword,
      role: "worker",
      departmentId: deptIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Road Worker 2",
      email: "roadworker2@scm.com",
      phone: "9000000005",
      password: hashedPassword,
      role: "worker",
      departmentId: deptIds[0],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Water Worker 1",
      email: "waterworker1@scm.com",
      phone: "9000000006",
      password: hashedPassword,
      role: "worker",
      departmentId: deptIds[1],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Citizen User",
      email: "citizen@scm.com",
      phone: "9000000007",
      password: hashedPassword,
      role: "citizen",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log("Users created");

  // Create indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ phone: 1 }, { unique: true });
  await db.collection("departments").createIndex({ code: 1 }, { unique: true });
  await db
    .collection("complaintcategories")
    .createIndex({ code: 1 }, { unique: true });
  await db.collection("complaints").createIndex({ location: "2dsphere" });
  await db.collection("areas").createIndex({ location: "2dsphere" });
  console.log("Indexes created");

  console.log("\n--- Seed Complete ---");
  console.log("Login credentials (all passwords: password123):");
  console.log("  Super Admin:  superadmin@scm.com");
  console.log("  Road Admin:   roadadmin@scm.com");
  console.log("  Water Admin:  wateradmin@scm.com");
  console.log("  Road Worker:  roadworker1@scm.com");
  console.log("  Water Worker: waterworker1@scm.com");
  console.log("  Citizen:      citizen@scm.com");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
