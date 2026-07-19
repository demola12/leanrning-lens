import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, full_name, email, display_name, phone, date_of_birth, country, timezone, bio, subjects, school, teaching_experience, avatar_url } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (display_name !== undefined) updates.display_name = display_name;
    if (phone !== undefined) updates.phone = phone;
    if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth || null;
    if (country !== undefined) updates.country = country;
    if (timezone !== undefined) updates.timezone = timezone;
    if (bio !== undefined) updates.bio = bio;
    if (subjects !== undefined) updates.subjects = subjects;
    if (school !== undefined) updates.school = school;
    if (teaching_experience !== undefined) updates.teaching_experience = teaching_experience;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("user_id", user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
