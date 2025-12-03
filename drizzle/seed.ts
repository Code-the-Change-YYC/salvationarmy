import { generateId } from "better-auth";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { member, organization, type User, user } from "@/server/db/auth-schema";

async function main() {
  console.log("Starting seed...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@salvationarmy.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Password123!";
  const adminName = process.env.ADMIN_NAME || "Admin User";

  try {
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

      console.log("User role updated to ADMIN");

      adminUser = res.user as User;
    }

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
        // Check if organization already exists
        const existingOrg = await db
          .select()
          .from(organization)
          .where(eq(organization.slug, org.slug))
          .limit(1);

        if (existingOrg.length > 0) {
          console.log(`Organization already exists: ${org.name}`);
          continue;
        }

        // Create organization directly in database
        const [newOrg] = await db
          .insert(organization)
          .values({
            id: generateId(),
            name: org.name,
            slug: org.slug,
            createdAt: new Date(),
          })
          .returning();

        // Add admin user as owner of the organization
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

    // ==================== SUMMARY ====================
    console.log("\nSeed completed successfully!\n");
    console.log("Summary:");
    console.log(`Admin user: ${adminEmail}`);
    console.log(`Organizations created: ${orgs.length}`);
    console.log("\nLogin credentials:");
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log("remember to change this email in prod");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
