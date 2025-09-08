
import React, { useState, useRef, useEffect } from 'react';
import { Button, DatePicker } from '../ui';

interface CalendarHeaderProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    viewMode: 'month' | 'day';
    setViewMode: (mode: 'month' | 'day') => void;
    children?: React.ReactNode;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ currentDate, setCurrentDate, viewMode, setViewMode, children }) => {
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) setIsYearPickerOpen(false);
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) setIsMonthPickerOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateChange = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (viewMode === 'month') {
                newDate.setDate(1);
                newDate.setMonth(newDate.getMonth() + amount);
            } else {
                newDate.setDate(newDate.getDate() + amount);
            }
            return newDate;
        });
    };
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    const handleYearChange = (newYear: number) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(newYear);
        setCurrentDate(newDate);
        setIsYearPickerOpen(false);
    };

    const handleMonthChange = (newMonth: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newMonth - 1);
        setCurrentDate(newDate);
        setIsMonthPickerOpen(false);
    };
    
    const yearRange = Array.from({ length: 11 }, (_, i) => year - 5 + i);

    return (
        <div className="space-y-3 mb-4">
            <div className="flex justify-center items-center gap-4">
                <Button onClick={() => handleDateChange(-1)} size="sm" variant="secondary">◀</Button>
                 {viewMode === 'month' ? (
                    <div className="flex items-center gap-4 text-xl font-bold">
                        <div className="relative" ref={yearPickerRef}>
                            <button onClick={() => { setIsYearPickerOpen(p => !p); setIsMonthPickerOpen(false); }} className="px-2 py-1 rounded-md hover:bg-slate-100">
                                {year}년
                            </button>
                            {isYearPickerOpen && (
                                <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-32 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
                                    <ul>
                                        {yearRange.map(y => (
                                            <li key={y} className={`px-3 py-2 text-base text-center cursor-pointer hover:bg-slate-100 ${y === year ? 'bg-blue-100 font-bold' : ''}`} onClick={() => handleYearChange(y)}>
                                                {y}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={monthPickerRef}>
                             <button onClick={() => { setIsMonthPickerOpen(p => !p); setIsYearPickerOpen(false); }} className="px-2 py-1 rounded-md hover:bg-slate-100">
                                {month}월
                            </button>
                            {isMonthPickerOpen && (
                                <div className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-24 bg-white rounded-md shadow-lg border max-h-60 overflow-y-auto">
                                    <ul>
                                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                                            <li key={m} className={`px-3 py-2 text-base text-center cursor-pointer hover:bg-slate-100 ${m === month ? 'bg-blue-100 font-bold' : ''}`} onClick={() => handleMonthChange(m)}>
                                                {m}월
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <button onClick={() => setIsDatePickerOpen(p => !p)} className="text-xl font-bold text-center whitespace-nowrap px-2 py-1 rounded-md hover:bg-slate-100">
                            {`${year}년 ${month}월 ${day}일`}
                        </button>
                        {isDatePickerOpen && <DatePicker currentDate={currentDate} onDateSelect={(date) => { setCurrentDate(date); setIsDatePickerOpen(false); }} onClose={() => setIsDatePickerOpen(false)} />}
                    </div>
                )}
                <Button onClick={() => handleDateChange(1)} size="sm" variant="secondary">▶</Button>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-200 rounded-md p-0.5">
                        <Button onClick={() => setViewMode('month')} size="sm" variant={viewMode === 'month' ? 'primary' : 'secondary'} className={viewMode !== 'month' ? 'bg-transparent border-0 shadow-none' : ''}>월</Button>
                        <Button onClick={() => setViewMode('day')} size="sm" variant={viewMode === 'day' ? 'primary' : 'secondary'} className={viewMode !== 'day' ? 'bg-transparent border-0 shadow-none' : ''}>일</Button>
                    </div>
                    <Button onClick={() => setCurrentDate(new Date())} size="sm" variant="secondary">오늘</Button>
                </div>
                 <div>
                    {children}
                </div>
            </div>
        </div>
    );
};
