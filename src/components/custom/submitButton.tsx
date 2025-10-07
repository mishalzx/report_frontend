"use client";
import { Button } from "react-bootstrap";
import { useFormStatus } from "react-dom";


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Loader({ text }: { readonly text: string }) {
  return (
    <div className="flex items-center space-x-2">
        Loading
    </div>
  );
}

interface SubmitButtonProps {
  text: string;
  loadingText: string;
  className?: string;
  loading?: boolean;
  children:string;
}

export function SubmitButton({
  text,
  loadingText,
  loading,
  className,
  children
}: Readonly<SubmitButtonProps>) {
  const status = useFormStatus();
  return (
    <Button
      type="submit"
      aria-disabled={status.pending || loading}
      disabled={status.pending || loading}
      className={(className)}
    >
      {status.pending || loading ? <Loader text={loadingText} /> : text}{children}
    </Button>
  );
}