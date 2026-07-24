import { Metadata } from "next";
import { PermissionsClient } from "./PermissionsClient";

export const metadata: Metadata = {
  title: "Roles & Permissions",
};

export default function PermissionsPage() {
  return <PermissionsClient />;
}
