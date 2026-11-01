import { Spinner } from "@/shared/presentation/ui/spinner";
import { cn } from "@/shared/lib/utils";

interface LoadingStateProps {
  /** Texto que se muestra (y que leen los lectores de pantalla). */
  label: string;
  /** Ocupa toda la pantalla; útil mientras se decide a dónde redirigir. */
  fullScreen?: boolean;
}

export function LoadingState({ label, fullScreen = false }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-sm text-muted-foreground",
        fullScreen ? "min-h-screen" : "py-16",
      )}
    >
      <Spinner className="size-5" />
      <span>{label}</span>
    </div>
  );
}
