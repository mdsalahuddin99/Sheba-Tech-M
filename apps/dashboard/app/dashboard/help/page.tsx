import { Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Help & Support | Tech Baria POS",
};

export default function HelpPage() {
  return <HelpClient />;
}
