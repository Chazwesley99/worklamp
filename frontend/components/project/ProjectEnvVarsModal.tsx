'use client';

import { Modal } from '../ui/Modal';
import EnvVarManager from '../envvar/EnvVarManager';

interface ProjectEnvVarsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function ProjectEnvVarsModal({ isOpen, onClose, projectId }: ProjectEnvVarsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Environment Variables" size="xl">
      <EnvVarManager projectId={projectId} />
    </Modal>
  );
}
