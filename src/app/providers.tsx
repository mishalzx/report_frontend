"use client";

import { UIProvider } from "@/components/ui/UIContext";
import { ClientProvider } from "@/components/client-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Put any other client providers here too
  return (
    <UIProvider>
      <ClientProvider>{children}</ClientProvider>
    </UIProvider>
  );
}
