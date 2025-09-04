import React, { useRef, useEffect } from 'react';

interface ColumnMenuProps {
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const ColumnMenu: React.FC<ColumnMenuProps> = ({ onClose, onRename, onDelete }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="absolute top-full right-0 mt-2 w-48 bg-base-100 rounded-md shadow-lg z-20 border border-base-300"
        >
            <ul className="py-1 text-sm">
                <li>
                    <button onClick={onRename} className="w-full text-left px-4 py-2 hover:bg-base-200">Rename column</button>
                </li>
                 <li>
                    <button onClick={onDelete} className="w-full text-left px-4 py-2 text-error hover:bg-error/10">Delete column</button>
                </li>
            </ul>
        </div>
    );
};
