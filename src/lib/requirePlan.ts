import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requirePlan(
  userId: string,
  requiredPlans: string[]
): Promise<{ allowed: boolean; plan: string | null; error?: string }> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, role")
    .eq("user_id", userId)
    .is("parent_profile_id", null)
    .single();

  if (!profile) {
    return { allowed: false, plan: null, error: "Profile not found" };
  }

  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const plan = subscription?.plan as string || "free";
  const isFree = plan === "free";

  if (isFree && !requiredPlans.includes("free")) {
    return {
      allowed: false,
      plan: "free",
      error: `This feature requires a ${requiredPlans.join(" or ")} plan. Please upgrade from the settings page.`,
    };
  }

  if (!requiredPlans.includes(plan)) {
    return {
      allowed: false,
      plan,
      error: `This feature requires a ${requiredPlans.join(" or ")} plan. Your current plan is ${plan}.`,
    };
  }

  return { allowed: true, plan };
}
