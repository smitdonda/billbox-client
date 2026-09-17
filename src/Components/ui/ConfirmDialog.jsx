import React from "react";
import Modal from "./Modal";
import { Button } from "./Button";
import { AlertTriangleIcon } from "./Icons";

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="sm"
      closeOnBackdrop={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="solidDanger"
            onClick={onConfirm}
            loading={loading}
            loadingText="Deleting..."
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertTriangleIcon size={21} />
        </div>
        <div className="pt-0.5">
          <h2 className="text-base font-semibold text-fg">{title}</h2>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {description}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
