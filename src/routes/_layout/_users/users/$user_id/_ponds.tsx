
import UserBasedPonds from "@/components/users/UserBasedPonds";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/_users/users/$user_id/_ponds")({
  component: UserBasedPonds,
});
