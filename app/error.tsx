"use client";

import { useEffect } from "react";
import Message from "@/components/Message";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Message
      icon="error"
      title="Something broke"
      text="This page hit an error. Trying again usually sorts it out."
    >
      <button className="button button--tonal" type="button" onClick={reset}>
        Try again
      </button>
    </Message>
  );
}
