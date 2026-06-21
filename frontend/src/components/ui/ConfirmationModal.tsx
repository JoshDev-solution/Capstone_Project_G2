"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationType = "danger" | "warning" | "info" | "success";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="w-5 h-5 text-danger" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
  };

  const bgColors = {
    danger: "bg-danger/10",
    warning: "bg-warning/10",
    info: "bg-primary-50 dark:bg-primary-500/10",
    success: "bg-success/10",
  };

  const buttonClasses = {
    danger: "btn bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20",
    warning: "btn bg-warning/10 text-warning hover:bg-warning/20 border border-warning/20",
    info: "btn btn-primary",
    success: "btn btn-primary",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={!isLoading ? onClose : undefined}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm card p-6 z-10 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn-icon btn-ghost rounded-xl w-8 h-8 flex items-center justify-center disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", bgColors[type])}>
              {icons[type]}
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-secondary flex-1"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn("flex-1", buttonClasses[type])}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
