import { env } from "@/env";

/**
 * Response from Google Maps Distance Matrix API
 */
interface DistanceMatrixResponse {
  status: string;
  rows: Array<{
    elements: Array<{
      status: string;
      duration?: {
        value: number; // Duration in seconds
        text: string; // Human-readable duration
      };
      distance?: {
        value: number; // Distance in meters
        text: string; // Human-readable distance
      };
    }>;
  }>;
  error_message?: string;
}

/**
 * Options for calculating travel time
 */
export interface TravelTimeOptions {
  /** Travel mode (default: "driving") */
  mode?: "driving" | "walking" | "bicycling" | "transit";
  /** Unit system (default: "metric") */
  units?: "metric" | "imperial";
}

/**
 * Calculates travel time between two addresses using Google Maps Distance Matrix API
 *
 * @param originAddress - Origin address as a string
 * @param destinationAddress - Destination address as a string
 * @param options - Optional travel mode and unit settings
 * @returns Travel duration in minutes, or null if calculation fails
 * @throws Error if GOOGLE_MAPS_API_KEY is not configured
 */
export async function getTravelTimeMinutes(
  originAddress: string,
  destinationAddress: string,
  options: TravelTimeOptions = {},
): Promise<number | null> {
  const apiKey = env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }

  const { mode = "driving", units = "metric" } = options;

  // Build the Distance Matrix API URL
  const baseUrl = "https://maps.googleapis.com/maps/api/distancematrix/json";
  const params = new URLSearchParams({
    origins: originAddress,
    destinations: destinationAddress,
    mode,
    units,
    key: apiKey,
  });

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DistanceMatrixResponse;

    // Check for API-level errors
    if (data.status !== "OK") {
      const errorMsg = data.error_message || `API returned status: ${data.status}`;
      console.error("Google Maps Distance Matrix API error:", errorMsg);
      return null;
    }

    // Check if we have valid data
    if (!data.rows?.[0]?.elements?.[0] || data.rows[0].elements[0].status !== "OK") {
      const elementStatus = data.rows[0]?.elements?.[0]?.status || "UNKNOWN";
      console.error("Google Maps Distance Matrix element error:", elementStatus);
      return null;
    }

    const duration = data.rows[0].elements[0].duration;

    if (!duration) {
      console.error("Google Maps Distance Matrix: No duration data returned");
      return null;
    }

    // Convert seconds to minutes and round up
    const minutes = Math.ceil(duration.value / 60);
    return minutes;
  } catch (error) {
    // Log error but return null instead of throwing to allow graceful degradation
    console.error("Error calculating travel time:", error);
    return null;
  }
}
