import { api } from "@/trpc/react";

/**
 * Hook to fetch vehicles from the database.
 * @returns Array of vehicle options in { value, label } format
 */
export function useVehicles() {
  const { data: dbVehicles, isLoading } = api.vehicles.getAll.useQuery(undefined, {
    retry: 1,
  });

  return {
    vehicleOptions:
      dbVehicles?.map((vehicle) => ({
        value: vehicle.name,
        label: vehicle.name,
      })) ?? [],
    isLoading,
    hasDbVehicles: (dbVehicles?.length ?? 0) > 0,
  };
}
