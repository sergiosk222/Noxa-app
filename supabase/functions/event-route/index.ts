declare const Deno: {
  env: { get: (key: string) => string | undefined };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type RoutePoint = { latitude: number; longitude: number };

type OpenRouteServiceRouteResponse = {
  features?: Array<{
    geometry?: { coordinates?: unknown };
    properties?: {
      summary?: {
        distance?: unknown;
        duration?: unknown;
      };
    };
  }>;
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidPoint(value: unknown): value is RoutePoint {
  if (!value || typeof value !== "object") return false;
  const point = value as Partial<RoutePoint>;
  return (
    typeof point.latitude === "number" &&
    typeof point.longitude === "number" &&
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

function normalizeCoordinates(coordinates: unknown) {
  if (!Array.isArray(coordinates)) return null;
  const normalized = coordinates
    .map((coordinate) => {
      if (!Array.isArray(coordinate) || coordinate.length < 2) return null;
      const [longitude, latitude] = coordinate;
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return null;
      }
      return { latitude, longitude };
    })
    .filter((coordinate): coordinate is RoutePoint => Boolean(coordinate));
  return normalized.length >= 2 ? normalized : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openRouteServiceApiKey = Deno.env.get("OPENROUTESERVICE_API_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return json({ error: "Server configuration is missing." }, 500);
  }

  if (!openRouteServiceApiKey) {
    return json({ error: "Route provider is not configured." }, 500);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return json({ error: "Authentication required." }, 401);
  }

  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: authorization,
      apikey: supabaseAnonKey,
    },
  });
  if (!authResponse.ok) {
    return json({ error: "Authentication required." }, 401);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (_error) {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const { origin, destination } = (body ?? {}) as {
    origin?: unknown;
    destination?: unknown;
  };

  if (!isValidPoint(origin) || !isValidPoint(destination)) {
    return json({ error: "Valid origin and destination are required." }, 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",
        headers: {
          Authorization: openRouteServiceApiKey,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json",
        },
        body: JSON.stringify({
          coordinates: [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude],
          ],
        }),
        signal: controller.signal,
      },
    );
    const data = (await response
      .json()
      .catch(() => ({}))) as OpenRouteServiceRouteResponse;

    if (!response.ok) {
      return json(
        { error: "Route provider request failed." },
        response.status === 429 ? 429 : response.status >= 500 ? 502 : 400,
      );
    }

    const feature = data.features?.[0];
    const coordinates = normalizeCoordinates(feature?.geometry?.coordinates);
    const distance = feature?.properties?.summary?.distance;
    const duration = feature?.properties?.summary?.duration;
    if (
      !feature ||
      !coordinates ||
      typeof distance !== "number" ||
      typeof duration !== "number" ||
      !Number.isFinite(distance) ||
      !Number.isFinite(duration)
    ) {
      return json({ error: "No route found." }, 404);
    }

    return json({
      coordinates,
      distanceMeters: distance,
      durationSeconds: duration,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return json({ error: "Route request timed out." }, 504);
    }
    return json({ error: "Route request failed." }, 502);
  } finally {
    clearTimeout(timeout);
  }
});
