import { Group, Modal as MantineModal, type ModalBaseOverlayProps } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { ReactNode } from "react";
import Button from "../button/Button";

interface ModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: ReactNode;
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
  const isMobile = useMediaQuery("(max-width: 50em)");
  const defaultFooter = showDefaultFooter && (
    <Group justify="flex-end" mt="xl">
      <Button variant="secondary" onClick={onClose} disabled={loading}>
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
      fullScreen={isMobile}
      padding="xl"
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
