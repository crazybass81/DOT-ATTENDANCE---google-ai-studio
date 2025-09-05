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

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <input ref={ref} id={id} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-white" {...props} />
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

export const DatePicker = ({ currentDate, onDateSelect, onClose }: {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
}) => {
    const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
    const pickerRef = useRef<HTMLDivElement>(null);
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
            if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
                setIsYearPickerOpen(false);
            }
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);
    
    const changeMonth = (amount: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const handleYearChange = (newYear: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setFullYear(newYear);
            return newDate;
        });
        setIsYearPickerOpen(false);
    };

    const handleMonthChange = (newMonth: number) => {
        setViewDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newMonth - 1);
            return newDate;
        });
        setIsMonthPickerOpen(false);
    };

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const yearRange = Array.from({ length: 11 }, (_, i) => year - 5 + i);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`}></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isSelected = date.toDateString() === currentDate.toDateString();
        days.push(
            <button
                key={day}
                onClick={() => onDateSelect(date)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'
                }`}
            >
                {day}
            </button>
        );
    }

    return (
        <div ref={pickerRef} className="absolute z-10 top-full mt-2 bg-white rounded-lg shadow-lg border p-4 w-72 left-1/2 -translate-x-1/2">
            <div className="flex justify-between items-center mb-2">
                <Button onClick={() => changeMonth(-1)} size="sm" variant="secondary">◀</Button>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={yearPickerRef}>
                        <button onClick={() => setIsYearPickerOpen(p => !p)} className="font-semibold px-2 py-1 rounded-md hover:bg-slate-100">{year}년</button>
                        {isYearPickerOpen && (
                            <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 w-28 bg-white rounded-md shadow-lg border max-h-48 overflow-y-auto">
                                <ul>{yearRange.map(y => <li key={y} className="px-3 py-1.5 text-sm text-center cursor-pointer hover:bg-slate-100" onClick={() => handleYearChange(y)}>{y}</li>)}</ul>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={monthPickerRef}>
                        <button onClick={() => setIsMonthPickerOpen(p => !p)} className="font-semibold px-2 py-1 rounded-md hover:bg-slate-100">{month + 1}월</button>
                        {isMonthPickerOpen && (
                            <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 w-20 bg-white rounded-md shadow-lg border max-h-48 overflow-y-auto">
                                <ul>{Array.from({length: 12}, (_, i) => i + 1).map(m => <li key={m} className="px-3 py-1.5 text-sm text-center cursor-pointer hover:bg-slate-100" onClick={() => handleMonthChange(m)}>{m}월</li>)}</ul>
                            </div>
                        )}
                    </div>
                </div>
                <Button onClick={() => changeMonth(1)} size="sm" variant="secondary">▶</Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {days}
            </div>
        </div>
    );
};