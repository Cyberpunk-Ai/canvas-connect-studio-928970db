import { useQuery } from "@tanstack/react-query";
import { createSignedUrl, isExternalUrl } from "@/lib/media";
import { initials } from "@/lib/social";
import { cn } from "@/lib/utils";

export function useStorageUrl(value: string | null | undefined) {
  const isPath = !!value && !isExternalUrl(value);
  const { data } = useQuery({
    queryKey: ["signed-url", value],
    enabled: isPath,
    staleTime: 45 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    queryFn: () => createSignedUrl(value!),
  });
  if (!value) return null;
  return isPath ? (data ?? null) : value;
}

export function StorageImage({
  path,
  alt,
  className,
}: {
  path: string;
  alt: string;
  className?: string;
}) {
  const url = useStorageUrl(path);
  if (!url) return <div className={cn("animate-pulse bg-muted", className)} aria-hidden />;
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}

export function Avatar({
  name,
  src,
  className,
  ring = false,
}: {
  name: string;
  src?: string | null;
  className?: string;
  ring?: boolean;
}) {
  const url = useStorageUrl(src);
  const base = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white",
    ring && "ring-2 ring-card",
    className ?? "h-10 w-10 text-xs",
  );

  if (url) {
    return <img src={url} alt={name} loading="lazy" className={cn(base, "object-cover")} />;
  }
  return (
    <span className={cn(base, "bg-gradient-to-br from-brand to-brand-pink")} aria-hidden>
      {initials(name)}
    </span>
  );
}
