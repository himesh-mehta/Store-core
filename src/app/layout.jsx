import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "@auth/create/react";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-white font-inter text-[#111827]">
          {children}
          <Toaster position="top-right" expand={true} richColors />
        </div>
      </QueryClientProvider>
    </SessionProvider>
  );
}
