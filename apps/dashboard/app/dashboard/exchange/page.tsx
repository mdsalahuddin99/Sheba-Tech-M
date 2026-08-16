import { HydrationBoundary, dehydrate, QueryClient } from "@tanstack/react-query";
import { ExchangeClient } from "./ExchangeClient";

export default function ExchangePage() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExchangeClient />
    </HydrationBoundary>
  );
}
