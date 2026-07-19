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
    const profileId = formData.get("profile_id") as string | null;
    const teacherId = formData.get("teacher_id") as string | null;
    const description = (formData.get("description") as string) || "";

    if (!file || !profileId) {
      return NextResponse.json({ error: "Missing file or profile_id" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() || "bin";
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    const fileType = isImage ? "image" : isPdf ? "pdf" : "other";
    const storagePath = `student-library/${profileId}/${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from("assignments")
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: signedUrl } = await supabaseAdmin.storage
      .from("assignments")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    const { data, error } = await supabaseAdmin
      .from("student_library")
      .insert({
        student_profile_id: profileId,
        teacher_id: teacherId || null,
        file_url: signedUrl?.signedUrl || storagePath,
        file_type: fileType,
        file_name: file.name,
        description,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
