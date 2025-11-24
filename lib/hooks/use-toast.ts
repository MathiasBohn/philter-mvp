import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

// Direct toast wrapper for use in hooks and non-React contexts
export const toast = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),
  info: (message: string) => sonnerToast.info(message),
  warning: (message: string) => sonnerToast.warning(message),
};

export function useToast() {
  const toastFn = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Error", {
        description,
      });
    } else {
      sonnerToast.success(title || "Success", {
        description,
      });
    }
  };

  return { toast: toastFn };
}
