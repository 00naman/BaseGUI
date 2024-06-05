// Modal.tsx
import React from 'react';
import Button from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-1/3">
                <p className="text-lg">{message}</p>
                <Button onClick={onClose} label="OK" className="mt-2"/>
            </div>
        </div>
    );
};

export default Modal;
