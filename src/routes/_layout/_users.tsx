
import GetAllUsers from "@/components/users";
import { createFileRoute } from "@tanstack/react-router";


export const Route = createFileRoute("/_layout/_users")({
  component: GetAllUsers,
});
