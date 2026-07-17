import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ActivityType =
  | "student_joined"
  | "student_submitted"
  | "student_resubmitted"
  | "assignment_published"
  | "pdf_converted";

interface LogActivityParams {
  teacher_id: string;
  type: ActivityType;
  description: string;
  student_id?: string;
  assignment_id?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  const { error } = await supabaseAdmin.from("activities").insert({
    teacher_id: params.teacher_id,
    type: params.type,
    description: params.description,
    student_id: params.student_id || null,
    assignment_id: params.assignment_id || null,
    metadata: params.metadata || null,
  });

  if (error) {
    console.error("Failed to log activity:", error.message);
  }
}
