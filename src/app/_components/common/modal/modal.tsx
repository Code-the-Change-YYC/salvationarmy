import { Button, Group, Modal as MantineModal, type ModalBaseOverlayProps } from "@mantine/core";
import type { ReactNode } from "react";

interface ModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  children: ReactNode;
  size?: string | number;
  centered?: boolean;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  showDefaultFooter?: boolean;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  overlayProps?: ModalBaseOverlayProps;
}

export default function Modal({
  opened,
  onClose,
  title,
  children,
  size = "md",
  centered = true,
  withCloseButton = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  footer,
  showDefaultFooter = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading = false,
  overlayProps,
}: ModalProps) {
  const defaultFooter = showDefaultFooter && (
    <Group justify="flex-end" mt="md">
      <Button variant="subtle" onClick={onClose} disabled={loading}>
        {cancelText}
      </Button>
      <Button onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </Group>
  );

  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      centered={centered}
      withCloseButton={withCloseButton}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      overlayProps={overlayProps}
    >
      {children}
      {footer || defaultFooter}
    </MantineModal>
  );
}
