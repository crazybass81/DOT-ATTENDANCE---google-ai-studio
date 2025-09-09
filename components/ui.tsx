
import React, { ReactNode, useRef, useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Changed type from string to ReactNode to allow JSX elements in the title.
  title: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hideCloseButton?: boolean;
  titleAlign?: 'left' | 'center';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', hideCloseButton = false, titleAlign = 'left' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const titleContainerClasses = `flex items-center p-4 border-b ${
    titleAlign === 'center' ? 'justify-center relative' : 'justify-between'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} flex flex-col`}>
        <div className={titleContainerClasses}>
          <h3 className="text-lg font-semibold">{title}</h3>
          {!hideCloseButton && (
            <button 
                onClick={onClose} 
                className={`text-slate-500 hover:text-slate-800 ${
                    titleAlign === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''
                }`}
            >
              <span className="text-xl" role="img" aria-label="Close">❌</span>
            </button>
          )}
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

// FIX: Extended CardProps with React.HTMLAttributes<HTMLDivElement> and spread props to allow onClick and other div attributes.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseClasses = 'rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-4 py-2',
    };
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 focus:ring-slate-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
  
    return (
      <button ref={ref} className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
});


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, className, ...props }, ref) => {
    const baseClasses = "bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-white";
    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input ref={ref} id={id} className={`${baseClasses} ${className || ''}`} {...props} />
      </div>
    );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <textarea ref={ref} id={id} rows={3} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" {...props}></textarea>
      </div>
    );
});


interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    align?: 'left' | 'center';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, align = 'left' }) => {
    return (
        <div className={`flex border-b ${align === 'center' ? 'justify-center' : ''}`} aria-label="Tabs">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={`whitespace-nowrap py-3 px-4 text-base font-medium border-b-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded-t-md ${
                        tab === activeTab
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export const FilterDropdown: React.FC<{
    options: string[];
    selected: string[];
    onToggle: (option: string) => void;
    onClose: () => void;
}> = ({ options, selected, onToggle, onClose }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={dropdownRef} className="absolute z-20 top-full mt-2 left-0 w-64 bg-white rounded-md shadow-lg border p-3">
            <div className="flex flex-wrap gap-2">
                {options.map(option => {
                    const isSelected = selected.includes(option);
                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onToggle(option)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                isSelected
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export const DatePicker = ({ currentDate, onDateSelect, onClose, triggerRef }: { 
    currentDate: Date; 
    onDateSelect: (date: Date) => void; 
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLElement>;
}) => {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [year, setYear] = useState(currentDate.getFullYear());
    const [month, setMonth] = useState(currentDate.getMonth());
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 5,
                left: rect.left + window.scrollX,
            });
        }
    }, [triggerRef]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(year, month, day);
        onDateSelect(selectedDate);
    };

    const changeMonth = (amount: number) => {
        const newDate = new Date(year, month + amount, 1);
        setYear(newDate.getFullYear());
        setMonth(newDate.getMonth());
    };

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyDays = Array.from({ length: firstDay });

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    
    const baseClasses = "z-30 w-72 bg-white rounded-lg shadow-xl border p-4";
    const positionClasses = triggerRef 
        ? "fixed" 
        : "absolute top-full mt-2 left-1/2 -translate-x-1/2";

    const style = triggerRef && position ? { top: `${position.top}px`, left: `${position.left}px` } : {};

    return (
        <div ref={calendarRef} className={`${baseClasses} ${positionClasses}`} style={style}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="px-2 py-1 rounded hover:bg-slate-100">◀</button>
                <div className="font-bold">{`${year}년 ${month + 1}월`}</div>
                <button onClick={() => changeMonth(1)} className="px-2 py-1 rounded hover:bg-slate-100">▶</button>
            </div>
            <div className="grid grid-cols-7 text-center text-sm">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="font-semibold text-slate-500 py-1">{day}</div>)}
                {emptyDays.map((_, i) => <div key={`empty-${i}`}></div>)}
                {days.map(day => {
                    const isToday = isCurrentMonth && day === today.getDate();
                    const isSelected = day === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear();
                    return (
                        <button 
                            key={day} 
                            onClick={() => handleDateClick(day)} 
                            className={`py-1 rounded-full w-8 h-8 flex items-center justify-center mx-auto my-0.5
                                ${isSelected ? 'bg-blue-600 text-white font-bold' : ''}
                                ${!isSelected && isToday ? 'bg-blue-100 text-blue-800' : ''}
                                ${!isSelected && !isToday ? 'hover:bg-slate-100' : ''}
                            `}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
