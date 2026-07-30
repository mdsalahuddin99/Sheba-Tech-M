import { Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Help & Support | Sheba Tech POS",
};

export default function HelpPage() {
  return <HelpClient />;
}
