"use client";

import Button from "@/app/_components/common/button/Button";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notifications";

export const CreateOrgsButton = () => {
  const handleCreateOrgs = async () => {
    const orgs = [
      { name: "Admins", slug: "admins" },
      { name: "Drivers", slug: "drivers" },
      { name: "Agency One", slug: "agency-one" },
      { name: "Agency Two", slug: "agency-two" },
      { name: "Agency Three", slug: "agency-three" },
    ];

    for (const org of orgs) {
      try {
        await authClient.organization.create({
          name: org.name,
          slug: org.slug,
        });
        console.log(`Created organization: ${org.name}`);
        notify.success(`Created organization: ${org.name}`);
      } catch (error) {
        console.error(`Failed to create ${org.name}:`, error);
        notify.error(`Failed to create ${org.name}`);
      }
    }
  };

  return <Button onClick={handleCreateOrgs}>Seed Organizations</Button>;
};
