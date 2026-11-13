"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./button";
import { Dialog } from "./dialog";
import { Field } from "./field";
import { Input } from "./input";

/**
 * Confirmation for destructive actions. When `confirmText` is given, the user must
 * type it exactly (e.g. the product name) before the action unlocks.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmText,
  typeToConfirmLabel,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  confirmText?: string;
  typeToConfirmLabel?: ReactNode;
  loading?: boolean;
}) {
  const [typed, setTyped] = useState("");
  const unlocked = !confirmText || typed.trim() === confirmText;
  return (
    <Dialog
      open={open}
      onClose={() => {
        setTyped("");
        onClose();
      }}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" disabled={!unlocked} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {confirmText ? (
        <Field label={typeToConfirmLabel}>
          {(control) => (
            <Input {...control} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} />
          )}
        </Field>
      ) : null}
    </Dialog>
  );
}
