import type { Metadata } from "next";
import Message from "@/components/Message";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <Message
      icon="explore_off"
      title="Page not found"
      text="That page doesn't exist, or it moved somewhere else."
    />
  );
}
