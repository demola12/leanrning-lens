import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref parameter" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, ref_uuid")
    .eq("ref_uuid", ref.toUpperCase())
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, profile: data });
}
