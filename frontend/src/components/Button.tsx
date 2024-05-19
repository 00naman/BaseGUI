import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  label: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, label, className }) => {
  return (
    <button className={`bg-orange-400 hover:bg-orange-600 text-white py-1 px-4 rounded-lg ${className}`} onClick={onClick}>
      {label}
    </button>
  );
};

export default Button;