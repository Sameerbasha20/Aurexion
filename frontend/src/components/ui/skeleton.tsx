import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-[#63f5e8]/5 animate-pulse rounded-md border border-[#63f5e8]/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
