import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { current_password, new_password, user_id } = await req.json();

    if (!current_password || !new_password || !user_id) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Get user email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id);
    if (!userData?.user?.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Sign in with current password to verify
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userData.user.email,
      password: current_password,
    });

    if (signInError) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
