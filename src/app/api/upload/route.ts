import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("user_id") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or user_id" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "png";
    const filename = `question-images/${userId}/${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("assignments")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Generate public URL (bucket is private so use signed URL)
    const { data: signedUrl } = await supabaseAdmin.storage
      .from("assignments")
      .createSignedUrl(filename, 60 * 60 * 24 * 365); // 1 year

    return NextResponse.json({
      url: signedUrl?.signedUrl || null,
      path: filename,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
