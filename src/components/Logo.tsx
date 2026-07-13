export default function Logo({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" };
  const iconSizes = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-7 h-7" };
  return (
    <div className={`${sizes[size]} rounded-lg bg-primary flex items-center justify-center shrink-0`}>
      <img src="/logo.png" alt="LearnLens" className={iconSizes[size]} />
    </div>
  );
}
