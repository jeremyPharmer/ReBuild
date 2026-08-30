import { NextResponse } from "next/server";
import { todayInTz } from "@/lib/journey";
import { fallbackForTimezone, fetchForecast } from "@/lib/weather";
import { readState } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const state = await readState();
    if (!state.profile) {
      return NextResponse.json({ error: "Not onboarded" }, { status: 400 });
    }

    const url = new URL(req.url);
    const latRaw = url.searchParams.get("lat");
    const lonRaw = url.searchParams.get("lon");
    const labelParam = url.searchParams.get("label");
    const timezone = state.profile.timezone;

    let lat: number;
    let lon: number;
    let locationLabel: string;

    if (latRaw != null && lonRaw != null) {
      lat = Number(latRaw);
      lon = Number(lonRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
      }
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
      }
      locationLabel = labelParam?.trim() || "Your location";
    } else {
      const fb = fallbackForTimezone(timezone);
      lat = fb.lat;
      lon = fb.lon;
      locationLabel = fb.label;
    }

    const forecast = await fetchForecast(lat, lon, timezone, locationLabel);
    const today = todayInTz(timezone);

    return NextResponse.json({ ...forecast, today });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
