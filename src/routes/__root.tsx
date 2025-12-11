/// <reference types="vite/client" />
import { ConnectionStatus } from "@/components/internetConnection/ConnectionStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { authMiddleware } from "src/lib/helpers/middleware";
import appCss from "src/styles/app.css?url";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Single Starter" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon_io/favicon-32x32.png" },
    ],
  }),
  component: RootComponent,
  beforeLoad: authMiddleware,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <ConnectionStatus />
        <Outlet />
        <Toaster richColors closeButton position="top-right" />
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export default RootComponent;
