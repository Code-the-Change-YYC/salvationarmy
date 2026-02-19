/** biome-ignore-all lint/style/noNonNullAssertion: its just a seeding script so i think this is fine */
import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { member, organization, type User, user } from "@/server/db/auth-schema";
import { bookings } from "@/server/db/booking-schema";
import { BookingStatus } from "@/types/types";

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  users: args.includes("--users"),
  bookings: args.includes("--bookings"),
  clear: args.includes("--clear"),
};

// If no flags provided, run both
if (!flags.users && !flags.bookings) {
  flags.users = true;
  flags.bookings = true;
}

const DEFAULT_PASSWORD = "Password123!";

// ==================== SEED USERS & ORGANIZATIONS ====================
async function seedUsers() {
  console.log("\n=== SEEDING USERS & ORGANIZATIONS ===\n");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@salvationarmy.com";
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Admin User";

  try {
    // Create admin user
    console.log("Creating admin user...");
    const existingAdmin = await db.select().from(user).where(eq(user.email, adminEmail)).limit(1);

    let adminUser: User;
    if (existingAdmin.length > 0) {
      console.log("Admin user already exists:", adminEmail);
      if (!existingAdmin[0]) {
        throw new Error("Admin user not found in database.");
      }
      adminUser = existingAdmin[0];
    } else {
      const res = await auth.api.signUpEmail({
        body: {
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        },
      });
      console.log("User created:", adminEmail);
      await db.update(user).set({ role: "admin" }).where(eq(user.email, adminEmail));
      console.log("User role updated to admin");
      adminUser = res.user as User;
    }

    // Create organizations
    console.log("\nCreating organizations...");
    const orgs = [
      { name: "Admins", slug: "admins" },
      { name: "Drivers", slug: "drivers" },
      { name: "Agency One", slug: "agency-one" },
      { name: "Agency Two", slug: "agency-two" },
      { name: "Agency Three", slug: "agency-three" },
    ];

    for (const org of orgs) {
      try {
        const existingOrg = await db
          .select()
          .from(organization)
          .where(eq(organization.slug, org.slug))
          .limit(1);

        if (existingOrg.length > 0) {
          console.log(`Organization already exists: ${org.name}`);
          continue;
        }

        const [newOrg] = await db
          .insert(organization)
          .values({
            id: generateId(),
            name: org.name,
            slug: org.slug,
            createdAt: new Date(),
          })
          .returning();

        if (newOrg?.id) {
          await db.insert(member).values({
            id: generateId(),
            organizationId: newOrg.id,
            userId: adminUser.id,
            role: "owner",
            createdAt: new Date(),
          });
          console.log(`Created organization: ${org.name} (admin added as owner)`);
        } else {
          console.error(
            `Failed to create member for organization: ${org.name} (organization not created)`,
          );
        }
      } catch (error) {
        console.error(`Failed to create ${org.name}:`, error);
      }
    }

    // Create driver user
    console.log("\nCreating driver user...");
    const driverEmail = "driver@salvationarmy.com";
    const existingDriver = await db.select().from(user).where(eq(user.email, driverEmail)).limit(1);

    let driverUser: User;
    if (existingDriver.length > 0) {
      console.log("Driver user already exists:", driverEmail);
      if (!existingDriver[0]) {
        throw new Error("Driver user not found in database.");
      }
      driverUser = existingDriver[0];
    } else {
      const res = await auth.api.signUpEmail({
        body: {
          name: "Driver User",
          email: driverEmail,
          password: DEFAULT_PASSWORD,
        },
      });
      await db.update(user).set({ role: "driver" }).where(eq(user.email, driverEmail));
      console.log("Driver user created and role updated to driver");
      driverUser = res.user as User;

      // Add driver to Drivers organization
      const driversOrg = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, "drivers"))
        .limit(1);

      if (driversOrg[0]?.id) {
        await db.insert(member).values({
          id: generateId(),
          organizationId: driversOrg[0].id,
          userId: driverUser.id,
          role: "member",
          createdAt: new Date(),
        });
        console.log("Driver added to Drivers organization");
      }
    }

    // Create agency users
    console.log("\nCreating agency users...");
    const agencies = [
      {
        name: "Agency One User",
        email: "agency-one@salvationarmy.com",
        slug: "agency-one",
      },
      {
        name: "Agency Two User",
        email: "agency-two@salvationarmy.com",
        slug: "agency-two",
      },
      {
        name: "Agency Three User",
        email: "agency-three@salvationarmy.com",
        slug: "agency-three",
      },
    ];

    for (const agency of agencies) {
      const existingAgency = await db
        .select()
        .from(user)
        .where(eq(user.email, agency.email))
        .limit(1);

      if (existingAgency.length > 0) {
        console.log(`Agency user already exists: ${agency.email}`);
        continue;
      }

      const res = await auth.api.signUpEmail({
        body: {
          name: agency.name,
          email: agency.email,
          password: DEFAULT_PASSWORD,
        },
      });
      await db.update(user).set({ role: "agency" }).where(eq(user.email, agency.email));
      console.log(`Agency user created: ${agency.email}`);

      const agencyUser = res.user as User;

      // Add agency user to their organization
      const agencyOrg = await db
        .select()
        .from(organization)
        .where(eq(organization.slug, agency.slug))
        .limit(1);

      if (agencyOrg[0]?.id) {
        await db.insert(member).values({
          id: generateId(),
          organizationId: agencyOrg[0].id,
          userId: agencyUser.id,
          role: "member",
          createdAt: new Date(),
        });
        console.log(`${agency.name} added to ${agency.slug} organization`);
      }
    }

    console.log("\n✅ Users & Organizations seeded successfully!\n");
  } catch (error) {
    console.error("❌ Failed to seed users:", error);
    throw error;
  }
}

// ==================== SEED BOOKINGS ====================
async function seedBookings() {
  console.log("\n=== SEEDING BOOKINGS ===\n");

  try {
    // Clear existing bookings if flag is set
    if (flags.clear) {
      console.log("Clearing existing bookings...");
      await db.delete(bookings);
      console.log("Existing bookings cleared.\n");
    }

    // Get the driver
    const driverEmail = "driver@salvationarmy.com";
    const driverResult = await db.select().from(user).where(eq(user.email, driverEmail)).limit(1);

    if (!driverResult[0]) {
      throw new Error("Driver not found. Please run with --users flag first to create users.");
    }
    const driver = driverResult[0];

    // Get the agency users
    const agencyEmails = [
      "agency-one@salvationarmy.com",
      "agency-two@salvationarmy.com",
      "agency-three@salvationarmy.com",
    ];

    const agencyUsers = await db.select().from(user).where(eq(user.role, "agency"));

    if (agencyUsers.length === 0) {
      throw new Error("No agency users found. Please run with --users flag first to create users.");
    }

    console.log(`Found driver: ${driver.email}`);
    console.log(`Found ${agencyUsers.length} agency users\n`);

    // Sample data for bookings
    const pickupAddresses = [
      "123 Main St, Calgary, AB",
      "456 Oak Ave, Calgary, AB",
      "789 Pine Rd, Calgary, AB",
      "321 Elm St, Calgary, AB",
      "654 Maple Dr, Calgary, AB",
      "987 Cedar Ln, Calgary, AB",
      "147 Birch Ct, Calgary, AB",
      "258 Spruce Way, Calgary, AB",
    ];

    const destinationAddresses = [
      "Downtown Medical Center, Calgary, AB",
      "Foothills Hospital, Calgary, AB",
      "Salvation Army Community Center, Calgary, AB",
      "Calgary Food Bank, Calgary, AB",
      "South Health Campus, Calgary, AB",
      "Peter Lougheed Centre, Calgary, AB",
      "Calgary Job Resource Centre, Calgary, AB",
      "Calgary Public Library, Calgary, AB",
    ];

    const purposes = [
      "Medical appointment",
      "Grocery shopping",
      "Job interview",
      "Food bank visit",
      "Community program",
      "Social services appointment",
    ];

    const passengerNames = [
      "John Smith",
      "Sarah Johnson",
      "Michael Brown",
      "Emily Davis",
      "Robert Wilson",
      "Jennifer Martinez",
      "David Anderson",
      "Lisa Taylor",
    ];

    // Generate bookings with time distribution
    const now = new Date();
    const bookingsToCreate = 18; // Max 20 as requested

    // Distribution: 25% past, 50% today/tomorrow, 25% future
    const pastCount = Math.floor(bookingsToCreate * 0.25);
    const todayCount = Math.floor(bookingsToCreate * 0.5);
    const futureCount = bookingsToCreate - pastCount - todayCount;

    const bookingData = [];

    // Helper function to create random time
    const getRandomHour = () => Math.floor(Math.random() * 10) + 8; // 8 AM to 6 PM
    const getRandomMinutes = () => Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

    // Past bookings (completed or cancelled)
    for (let i = 0; i < pastCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7) + 1; // 1-7 days ago
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() - daysAgo);
      startTime.setHours(getRandomHour(), getRandomMinutes(), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const status: BookingStatus =
        Math.random() > 0.3 ? BookingStatus.COMPLETED : BookingStatus.CANCELLED;
      const agencyUser = agencyUsers[i % agencyUsers.length];

      if (!agencyUser) continue;

      bookingData.push({
        title: `${purposes[i % purposes.length]} - ${passengerNames[i % passengerNames.length]}`,
        pickupAddress: pickupAddresses[i % pickupAddresses.length]!,
        destinationAddress: destinationAddresses[i % destinationAddresses.length]!,
        purpose: purposes[i % purposes.length],
        passengerName: passengerNames[i % passengerNames.length]!,
        phoneNumber: `+1 (403) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        surveyCompleted: status === BookingStatus.COMPLETED ? Math.random() > 0.5 : false,
        status,
        agencyId: agencyUser.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        driverId: driver.id,
        createdBy: agencyUser.id,
      });
    }

    // Today/tomorrow bookings (incomplete or in-progress)
    for (let i = 0; i < todayCount; i++) {
      const daysAhead = Math.random() > 0.7 ? 1 : 0; // 70% today, 30% tomorrow
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + daysAhead);
      startTime.setHours(getRandomHour(), getRandomMinutes(), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const status: BookingStatus =
        Math.random() > 0.7 ? BookingStatus.IN_PROGRESS : BookingStatus.INCOMPLETE;
      const agencyUser = agencyUsers[(pastCount + i) % agencyUsers.length];

      if (!agencyUser) continue;

      bookingData.push({
        title: `${purposes[(pastCount + i) % purposes.length]} - ${passengerNames[(pastCount + i) % passengerNames.length]}`,
        pickupAddress: pickupAddresses[(pastCount + i) % pickupAddresses.length]!,
        destinationAddress: destinationAddresses[(pastCount + i) % destinationAddresses.length]!,
        purpose: purposes[(pastCount + i) % purposes.length],
        passengerName: passengerNames[(pastCount + i) % passengerNames.length]!,
        phoneNumber: `+1 (403) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        surveyCompleted: false,
        status,
        agencyId: agencyUser.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        driverId: driver.id,
        createdBy: agencyUser.id,
      });
    }

    // Future bookings (incomplete)
    for (let i = 0; i < futureCount; i++) {
      const daysAhead = Math.floor(Math.random() * 7) + 2; // 2-8 days ahead
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + daysAhead);
      startTime.setHours(getRandomHour(), getRandomMinutes(), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const agencyUser = agencyUsers[(pastCount + todayCount + i) % agencyUsers.length];

      if (!agencyUser) continue;

      bookingData.push({
        title: `${purposes[(pastCount + todayCount + i) % purposes.length]} - ${passengerNames[(pastCount + todayCount + i) % passengerNames.length]}`,
        pickupAddress: pickupAddresses[(pastCount + todayCount + i) % pickupAddresses.length]!,
        destinationAddress:
          destinationAddresses[(pastCount + todayCount + i) % destinationAddresses.length]!,
        purpose: purposes[(pastCount + todayCount + i) % purposes.length],
        passengerName: passengerNames[(pastCount + todayCount + i) % passengerNames.length]!,
        phoneNumber: `+1 (403) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        surveyCompleted: false,
        status: "incomplete" as BookingStatus,
        agencyId: agencyUser.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        driverId: driver.id,
        createdBy: agencyUser.id,
      });
    }

    // Insert all bookings
    console.log(`Creating ${bookingData.length} bookings...`);
    await db.insert(bookings).values(bookingData);

    console.log("\n✅ Bookings seeded successfully!\n");
    console.log("Summary:");
    console.log(`  Past bookings (completed/cancelled): ${pastCount}`);
    console.log(`  Today/tomorrow (incomplete/in-progress): ${todayCount}`);
    console.log(`  Future bookings (incomplete): ${futureCount}`);
    console.log(`  Total: ${bookingData.length}`);
  } catch (error) {
    console.error("❌ Failed to seed bookings:", error);
    throw error;
  }
}

async function main() {
  console.log("\nStarting seed process...");
  console.log(`Flags: ${JSON.stringify(flags, null, 2)}\n`);

  try {
    if (flags.users) {
      await seedUsers();
    }

    if (flags.bookings) {
      await seedBookings();
    }

    console.log("\n" + "=".repeat(50));
    console.log("SEED COMPLETED SUCCESSFULLY");
    console.log("=".repeat(50));
    console.log("\nLogin Credentials:");
    console.log("  Admin:");
    console.log(`    Email: ${process.env.ADMIN_EMAIL || "admin@salvationarmy.com"}`);
    console.log(`    Password: ${process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD}`);
    console.log("\n  Driver:");
    console.log("    Email: driver@salvationarmy.com");
    console.log(`    Password: ${DEFAULT_PASSWORD}`);
    console.log("\n  Agencies:");
    console.log("    Email: agency-one@salvationarmy.com");
    console.log("    Email: agency-two@salvationarmy.com");
    console.log("    Email: agency-three@salvationarmy.com");
    console.log(`    Password (all): ${DEFAULT_PASSWORD}`);
    console.log("\n️  Remember to change these credentials in production!");
    console.log("=".repeat(50) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
