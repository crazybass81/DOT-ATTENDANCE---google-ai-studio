
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../../types';
import { Card, Modal, Button, Input, DatePicker } from '../../components/ui';
import { CalendarHeader } from '../../components/admin/CalendarHeader';
import { getTextColorForBackground, calculateWorkHours } from '../../utils';

interface AttendanceViewProps {
    employees: Employee[];
    attendance: AttendanceRecord[];
    onEditEmployee: (employeeId: number) => void;
    onUpdateAttendance: (updatedRecord: AttendanceRecord) => void;
    onAddAttendance: (newRecordData: Omit<AttendanceRecord, 'id' | 'isModified'>) => void;
    onDeleteAttendance: (recordIds: number[]) => void;
    isWorker?: boolean;
}

export const AttendanceView = ({ employees, attendance, onEditEmployee, onUpdateAttendance, onAddAttendance, onDeleteAttendance, isWorker = false }: AttendanceViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    const [selectedDateRecords, setSelectedDateRecords] = useState<AttendanceRecord[] | null>(null);
    const [recordForDetail, setRecordForDetail] = useState<AttendanceRecord | null>(null);
    const [isEditingAttendance, setIsEditingAttendance] = useState(false);
    const [editedData, setEditedData] = useState<Partial<AttendanceRecord> | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [dateForNewRecord, setDateForNewRecord] = useState<Date | null>(null);
    const [newRecordEmployeeId, setNewRecordEmployeeId] = useState<number | null>(null);

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportDateRange, setExportDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
    const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);
    const [exportError, setExportError] = useState('');
    const startDateButtonRef = useRef<HTMLButtonElement>(null);
    const endDateButtonRef = useRef<HTMLButtonElement>(null);

    const employeeForDetail = recordForDetail ? employees.find(e => e.id === recordForDetail.employeeId) : null;
    
    const hours = useMemo(() => ['--'].concat(Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))), []);
    const minutes = useMemo(() => ['--'].concat(Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))), []);


    useEffect(() => {
        if (recordForDetail) {
            setEditedData(recordForDetail);
        } else {
            setEditedData(null);
        }
    }, [recordForDetail]);
    
    const attendanceByDate = useMemo(() => {
        return attendance.reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
            const date = record.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(record);
            return acc;
        }, {});
    }, [attendance]);

    useEffect(() => {
        // After adding a new record, if a date was stored, open the list view for that date.
        if (dateForNewRecord && !isAddModalOpen) {
            const dateStr = dateForNewRecord.toISOString().split('T')[0];
            const records = attendanceByDate[dateStr] || [];
            if (records.length > 0) {
                setSelectedDateRecords(records);
                setDateForNewRecord(null); // Reset trigger
            }
        }
    }, [attendanceByDate, dateForNewRecord, isAddModalOpen]);

    const closeListModal = () => {
        setSelectedDateRecords(null);
        setIsDeleteMode(false);
        setSelectedRecordIds([]);
    };

    useEffect(() => {
        if (isAddModalOpen) {
            // Modal is opening
        } else {
            // Modal is closing, reset the pre-selected employee
            setNewRecordEmployeeId(null);
        }
    }, [isAddModalOpen]);

    useEffect(() => {
        // This effect syncs the list modal with the main attendance data after a deletion.
        if (selectedDateRecords) {
            const dateStr = selectedDateRecords[0]?.date;
            if (dateStr) {
                const freshRecords = attendanceByDate[dateStr] || [];
                if (freshRecords.length !== selectedDateRecords.length || !freshRecords.every(fr => selectedDateRecords.some(sr => sr.id === fr.id))) {
                    if (freshRecords.length === 0) {
                        closeListModal();
                    } else {
                        setSelectedDateRecords(freshRecords);
                    }
                }
            }
        }
    }, [attendanceByDate, selectedDateRecords]);


    const handleDayClick = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const clickedDate = new Date(year, month, day);
        setCurrentDate(clickedDate);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const records = attendanceByDate[dateStr] || [];

        if (isWorker) {
            if (records.length === 1) {
                setRecordForDetail(records[0]);
            } else if (records.length > 1) {
                setSelectedDateRecords(records);
            }
            return;
        }

        if (records.length === 0) {
            setDateForNewRecord(clickedDate);
            setIsAddModalOpen(true);
        } else {
            setSelectedDateRecords(records);
        }
    };

    const handleAddNewRecord = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dateForNewRecord) return;
    
        const formData = new FormData(e.currentTarget);
        const employeeId = Number(formData.get('employeeId'));
        const status = formData.get('status') as AttendanceStatus;

        const getTimeFromForm = (namePrefix: string) => {
            const hour = formData.get(`${namePrefix}Hour`) as string;
            const minute = formData.get(`${namePrefix}Minute`) as string;
            return (hour && hour !== '--' && minute && minute !== '--') ? `${hour}:${minute}` : null;
        };

        const clockIn = getTimeFromForm('clockIn');
        const clockOut = getTimeFromForm('clockOut');
        const breakStart = getTimeFromForm('breakStart');
        const breakEnd = getTimeFromForm('breakEnd');
        const awayStart = getTimeFromForm('awayStart');
        const awayEnd = getTimeFromForm('awayEnd');

        const employee = employees.find(e => e.id === employeeId);
        if (!employee) return;
    
        const workHours = calculateWorkHours(clockIn, clockOut, breakStart, breakEnd);
    
        const newRecordData: Omit<AttendanceRecord, 'id' | 'isModified'> = {
            employeeId,
            employeeName: employee.name,
            date: dateForNewRecord.toISOString().split('T')[0],
            clockIn,
            breakStart,
            breakEnd,
            awayStart,
            awayEnd,
            clockOut,
            workHours,
            status,
        };
        
        onAddAttendance(newRecordData);
        setIsAddModalOpen(false);
    };
    
    const handleAddFromList = () => {
        if (selectedDateRecords) {
            const dateStr = selectedDateRecords[0]?.date || currentDate.toISOString().split('T')[0];
            const date = new Date(dateStr.replace(/-/g, '/'));
            setDateForNewRecord(date);
            setIsAddModalOpen(true);
            setSelectedDateRecords(null);
        }
    };

    const handleTimeDropdownChange = (name: keyof AttendanceRecord, part: 'hour' | 'minute', value: string) => {
        setEditedData(prev => {
            if (!prev) return null;
            const existingTime = (prev[name] as string | null);
            let [h, m] = existingTime ? existingTime.split(':') : ['', ''];
    
            if (part === 'hour') h = value;
            if (part === 'minute') m = value;

            if (h === '--' || m === '--') {
                return { ...prev, [name]: null };
            }
    
            const newTime = `${h || '00'}:${m || '00'}`;
            return { ...prev, [name]: newTime };
        });
    };

    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedData || !recordForDetail) return;
        
        const workHours = calculateWorkHours(editedData.clockIn || null, editedData.clockOut || null, editedData.breakStart || null, editedData.breakEnd || null);
        
        const finalRecord: AttendanceRecord = {
            ...recordForDetail,
            ...editedData,
            status: editedData.status || recordForDetail.status,
            workHours,
        };

        onUpdateAttendance(finalRecord);
        setIsEditingAttendance(false);
        setRecordForDetail(finalRecord);
    };

    const handleToggleRecordSelection = (recordId: number) => {
        setSelectedRecordIds(prev =>
            prev.includes(recordId)
                ? prev.filter(id => id !== recordId)
                : [...prev, recordId]
        );
    };

    const handleConfirmDelete = () => {
        onDeleteAttendance(selectedRecordIds);
        setIsConfirmDeleteOpen(false);

        if (recordForDetail && selectedRecordIds.includes(recordForDetail.id)) {
            setRecordForDetail(null);
        }
        
        setSelectedRecordIds([]);
        setIsDeleteMode(false);
    };
    
    const handleEmptyCellClick = (employeeId: number) => {
        setNewRecordEmployeeId(employeeId);
        setDateForNewRecord(currentDate);
        setIsAddModalOpen(true);
    };
    
    const handleDateSelectForExport = (date: Date) => {
        if (activeDatePicker === 'start') {
            setExportDateRange({ start: date, end: null });
            setExportError('');
            setActiveDatePicker('end'); 
        } else if (activeDatePicker === 'end') {
            const startDate = exportDateRange.start;
            if (startDate) {
                const diffTime = date.getTime() - startDate.getTime();
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
                if (diffDays < 0) {
                    setExportError('종료일은 시작일보다 빠를 수 없습니다.');
                    setExportDateRange(prev => ({ ...prev, end: null }));
                } else if (diffDays > 365) {
                    setExportError('기간은 최대 1년을 넘을 수 없습니다.');
                    setExportDateRange(prev => ({ ...prev, end: null }));
                } else {
                    setExportDateRange(prev => ({ ...prev, end: date }));
                    setExportError('');
                }
            } else {
                 setExportDateRange(prev => ({ ...prev, end: date }));
            }
            setActiveDatePicker(null);
        }
    };

    const renderMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="border-r border-b bg-slate-50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const records = attendanceByDate[dateStr] || [];
            
            calendarDays.push(
                <div 
                    key={day} 
                    className="border-r border-b p-1 min-h-[120px] transition-colors cursor-pointer hover:bg-sky-50"
                    onClick={() => handleDayClick(day)}
                >
                    <p className="font-semibold text-sm">{day}</p>
                    <ul className="mt-1 space-y-0.5">
                        {records.slice(0, 5).map(rec => {
                            const employee = employees.find(e => e.id === rec.employeeId);
                            const bgColor = employee?.color || '#e0e7ff';
                            const textColor = getTextColorForBackground(bgColor);
                            return (
                                <li key={rec.id} style={{ backgroundColor: bgColor, color: textColor }} className="px-1 py-0.5 rounded-md whitespace-nowrap overflow-hidden text-[10px] leading-tight truncate">{rec.employeeName}</li>
                            );
                        })}
                         {records.length > 5 && <li className="text-slate-500 text-center text-[10px]">+ {records.length - 5} more</li>}
                    </ul>
                </div>
            );
        }
        
        const totalCells = firstDayOfMonth + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        for (let i=0; i < remainingCells; i++) {
            calendarDays.push(<div key={`empty-end-${i}`} className="border-r border-b bg-slate-50"></div>);
        }

        return (
            <div className="grid grid-cols-7 border-t border-l">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div key={day} className={`text-center font-bold p-2 border-r border-b bg-slate-100 ${index === 0 ? 'text-red-500' : ''} ${index === 6 ? 'text-blue-500' : ''}`}>{day}</div>
                ))}
                {calendarDays}
            </div>
        );
    };
    
    const renderDayView = () => {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayRecords = attendance.filter(rec => rec.date === dateStr);
        const activeEmployees = employees.filter(e => e.status === '재직');
    
        const hourHeight = 40;
        const timeToDecimal = (timeStr: string | null): number => {
            if (!timeStr) return 0;
            const [h, m] = timeStr.split(':').map(Number);
            return h + m / 60;
        };
        
        const gridTemplateColumns = `repeat(${activeEmployees.length}, minmax(90px, 1fr))`;
        const minWidth = `${activeEmployees.length * 90}px`;
    
        return (
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="overflow-auto" style={{ maxHeight: '65vh' }}>
                    <div className="relative" style={{ minWidth }}>
                         <div className="flex sticky top-0 bg-white z-10">
                             <div className="w-16 shrink-0 border-b border-r bg-slate-50 sticky left-0 z-20"></div>
                             <div className="flex-1 grid" style={{ gridTemplateColumns }}>
                                {activeEmployees.map(emp => {
                                    const bgColor = emp.color || '#f9fafb';
                                    const textColor = getTextColorForBackground(bgColor);
                                    return (
                                        <div 
                                            key={emp.id} 
                                            style={{ backgroundColor: bgColor, color: textColor }} 
                                            className="font-bold border-b border-r flex items-center justify-center text-center p-1 h-[50px]"
                                        >
                                            {emp.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex">
                            <div className="w-16 text-center text-xs shrink-0 sticky left-0 bg-slate-50 z-20">
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b border-r flex items-center justify-center text-slate-500">
                                        {String(hour).padStart(2, '0')}:00
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 grid" style={{ gridTemplateColumns }}>
                                {activeEmployees.map(employee => (
                                    <div key={employee.id} className="relative border-r" onClick={isWorker ? undefined : () => handleEmptyCellClick(employee.id)}>
                                        {Array.from({ length: 24 }).map((_, hour) => (
                                            <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b"></div>
                                        ))}
                                        {dayRecords.filter(rec => rec.employeeId === employee.id).map(rec => {
                                            const startDecimal = timeToDecimal(rec.clockIn);
                                            const endDecimal = timeToDecimal(rec.clockOut);
                                            
                                            if (startDecimal === 0 || endDecimal === 0 || endDecimal <= startDecimal) return null;
                                            
                                            const employeeForColor = employees.find(e => e.id === rec.employeeId);
                                            const bgColor = employeeForColor?.color ? `${employeeForColor.color}E6` : '#eff6ff';
                                            const borderColor = employeeForColor?.color || '#60a5fa';
                                            const textColor = getTextColorForBackground(employeeForColor?.color);
            
                                            if (rec.breakStart && rec.breakEnd) {
                                                const breakStartDecimal = timeToDecimal(rec.breakStart);
                                                const breakEndDecimal = timeToDecimal(rec.breakEnd);

                                                if (breakStartDecimal > startDecimal && breakEndDecimal < endDecimal) {
                                                    const top1 = startDecimal * hourHeight;
                                                    const height1 = (breakStartDecimal - startDecimal) * hourHeight;
                                                    const top2 = breakEndDecimal * hourHeight;
                                                    const height2 = (endDecimal - breakEndDecimal) * hourHeight;

                                                    return (
                                                        <React.Fragment key={rec.id}>
                                                            <div
                                                                onClick={(e) => { e.stopPropagation(); if (!isWorker) setRecordForDetail(rec); }}
                                                                className={`absolute p-1 text-xs rounded-t border-l-4 overflow-hidden ${!isWorker && 'cursor-pointer'}`}
                                                                style={{ top: `${top1}px`, height: `${height1}px`, left: '2px', right: '2px', backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
                                                            >
                                                                <p className="font-semibold">{rec.clockIn} - {rec.clockOut}</p>
                                                                <p className={`font-medium ${rec.status === AttendanceStatus.LATE ? 'text-red-700 font-bold' : ''}`}>{rec.status}</p>
                                                            </div>
                                                             <div
                                                                onClick={(e) => { e.stopPropagation(); if (!isWorker) setRecordForDetail(rec); }}
                                                                className={`absolute p-1 text-xs rounded-b border-l-4 overflow-hidden ${!isWorker && 'cursor-pointer'}`}
                                                                style={{ top: `${top2}px`, height: `${height2}px`, left: '2px', right: '2px', backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
                                                            />
                                                        </React.Fragment>
                                                    );
                                                }
                                            }
            
                                            // Fallback for no break or invalid break
                                            const top = startDecimal * hourHeight;
                                            const height = (endDecimal - startDecimal) * hourHeight;
                                            return (
                                                <div
                                                    key={rec.id}
                                                    onClick={(e) => { e.stopPropagation(); setRecordForDetail(rec); }}
                                                    className="absolute p-1 text-xs rounded cursor-pointer border-l-4 overflow-hidden"
                                                    style={{ top: `${top}px`, height: `${height}px`, left: '2px', right: '2px', backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
                                                >
                                                    <p className="font-semibold">{rec.clockIn} - {rec.clockOut}</p>
                                                    <p className={`font-medium ${rec.status === AttendanceStatus.LATE ? 'text-red-700 font-bold' : ''}`}>{rec.status}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                             {activeEmployees.length === 0 && (
                                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                     <p className="text-slate-400 bg-white/70 px-4 py-2 rounded-lg">
                                        재직 중인 근로자가 없습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    

    const DetailItem: React.FC<{ label: string, value?: React.ReactNode }> = ({ label, value }) => (
        <div className="flex flex-col">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-md text-slate-900 font-semibold">{value || '-'}</dd>
        </div>
    );
    
    const TimeSelectGroup = ({ label, namePrefix }: { label: string, namePrefix: string }) => (
        <div className="col-span-1">
            <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
            <div className="flex gap-2 items-center">
                <select name={`${namePrefix}Hour`} defaultValue="--" className="appearance-none text-center w-full bg-white px-2 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="shrink-0 text-xs">시</span>
                <select name={`${namePrefix}Minute`} defaultValue="--" className="appearance-none text-center w-full bg-white px-2 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs">
                    {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span className="shrink-0 text-xs">분</span>
            </div>
        </div>
    );

    const EditTimeSelectGroup = ({ label, name, value }: { label: string, name: keyof AttendanceRecord, value: string | null | undefined }) => {
        const [h, m] = value != null ? value.split(':') : ['--', '--'];
        return (
            <div className="col-span-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="flex gap-2 items-center">
                    <select 
                        value={h} 
                        onChange={e => handleTimeDropdownChange(name, 'hour', e.target.value)} 
                        className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        {hours.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                    </select>
                    <span className="shrink-0">시</span>
                    <select 
                        value={m} 
                        onChange={e => handleTimeDropdownChange(name, 'minute', e.target.value)}
                        className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        {minutes.map(min => <option key={min} value={min}>{min}</option>)}
                    </select>
                    <span className="shrink-0">분</span>
                </div>
            </div>
        );
    };

    return(
        <>
            {!isWorker && <h2 className="text-2xl font-bold mb-4">근태 관리</h2>}
            <div className="space-y-4 pb-20">
                <Card>
                    <CalendarHeader 
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    >
                         {!isWorker && (
                             <Button onClick={() => setIsExportModalOpen(true)} size="sm" variant="secondary">
                                <span role="img" aria-hidden="true" className="mr-1">📄</span>
                                내보내기
                            </Button>
                        )}
                    </CalendarHeader>
                    {viewMode === 'month' ? renderMonthView() : renderDayView()}
                </Card>

                <Modal
                    isOpen={!!selectedDateRecords}
                    onClose={closeListModal}
                    title={selectedDateRecords ? (
                        <div className="text-center py-2">
                            <span className="block text-base font-medium text-slate-600">
                                {new Date((selectedDateRecords[0]?.date || currentDate.toISOString().split('T')[0]).replace(/-/g, '/')).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </span>
                            <span className="block text-2xl font-bold mt-1">근무 현황</span>
                        </div>
                    ) : ''}
                    size="lg"
                    hideCloseButton={true}
                    titleAlign="center"
                >
                    {selectedDateRecords && (
                        <>
                            <div className="max-h-[60vh] overflow-y-auto">
                                {selectedDateRecords.length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white">
                                            <tr className="border-b bg-slate-50">
                                                {isDeleteMode && <th className="p-3 w-12 text-center">선택</th>}
                                                <th className="p-3">이름</th>
                                                <th className="p-3">출근</th>
                                                <th className="p-3">퇴근</th>
                                                <th className="p-3">근무시간</th>
                                                <th className="p-3">상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedDateRecords.map(rec => (
                                                <tr
                                                    key={rec.id}
                                                    className={`border-b ${!isDeleteMode ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                                                    onClick={!isDeleteMode ? () => { setRecordForDetail(rec); setSelectedDateRecords(null); } : undefined}
                                                >
                                                    {isDeleteMode && (
                                                        <td className="p-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRecordIds.includes(rec.id)}
                                                                onChange={() => handleToggleRecordSelection(rec.id)}
                                                                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="p-3 font-semibold flex items-center gap-2">
                                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: employees.find(e => e.id === rec.employeeId)?.color || '#cccccc' }}></span>
                                                        {rec.employeeName}
                                                    </td>
                                                    <td className="p-3">{rec.clockIn || '-'}</td>
                                                    <td className="p-3">{rec.clockOut || '-'}</td>
                                                    <td className="p-3">{rec.workHours > 0 ? `${rec.workHours}시간` : '-'}</td>
                                                    <td className={`p-3 font-medium ${rec.status === AttendanceStatus.LATE ? 'text-red-600' : ''}`}>{rec.status}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="text-center text-slate-500 py-12">해당 날짜의 근무 기록이 없습니다.</p>
                                )}
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-4 border-t">
                                 {isDeleteMode ? (
                                    <>
                                        <Button variant="secondary" onClick={() => { setIsDeleteMode(false); setSelectedRecordIds([]); }}>삭제 취소</Button>
                                        <Button variant="danger" disabled={selectedRecordIds.length === 0} onClick={() => setIsConfirmDeleteOpen(true)}>
                                            {selectedRecordIds.length}개 삭제
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {!isWorker && <Button variant="danger" onClick={() => setIsDeleteMode(true)}>근태 삭제</Button>}
                                        <div className="flex gap-2 ml-auto">
                                            {!isWorker && <Button onClick={handleAddFromList}>근태 추가</Button>}
                                            <Button variant="secondary" onClick={closeListModal}>닫기</Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </Modal>

                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title={dateForNewRecord ? (
                        <div className="text-center py-2">
                            <span className="block text-base font-medium text-slate-600">
                                {dateForNewRecord.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </span>
                            <span className="block text-2xl font-bold mt-1">근태 기록 추가</span>
                        </div>
                    ) : '근태 기록 추가'}
                    size="lg"
                    titleAlign="center"
                    hideCloseButton={false}
                >
                    {dateForNewRecord && (
                        <form onSubmit={handleAddNewRecord}>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="col-span-2">
                                    <label htmlFor="employeeId" className="block text-xs font-medium text-slate-700 mb-1">근로자</label>
                                    <select id="employeeId" name="employeeId" required defaultValue={newRecordEmployeeId || ''} className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs">
                                        <option value="" disabled>근로자를 선택하세요</option>
                                        {employees.filter(e => e.status === '재직').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <TimeSelectGroup label="출근 시간" namePrefix="clockIn" />
                                <TimeSelectGroup label="퇴근 시간" namePrefix="clockOut" />
                                <TimeSelectGroup label="휴게 시작" namePrefix="breakStart" />
                                <TimeSelectGroup label="휴게 종료" namePrefix="breakEnd" />
                                <TimeSelectGroup label="외근 시작" namePrefix="awayStart" />
                                <TimeSelectGroup label="외근 종료" namePrefix="awayEnd" />
                                 <div className="col-span-2">
                                     <label htmlFor="status" className="block text-xs font-medium text-slate-700 mb-1">상태</label>
                                     <select id="status" name="status" defaultValue={AttendanceStatus.NORMAL} className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs">
                                        {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                     </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                                <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>취소</Button>
                                <Button type="submit" variant="primary">저장</Button>
                            </div>
                        </form>
                    )}
                </Modal>

                <Modal
                    isOpen={!!recordForDetail}
                    onClose={() => { setRecordForDetail(null); setIsEditingAttendance(false); }}
                    title={isEditingAttendance ? "근태 기록 수정" : "근태 기록 상세"}
                    size="lg"
                    titleAlign="center"
                >
                    {recordForDetail && employeeForDetail && (
                        !isEditingAttendance ? (
                            <div>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-bold text-lg mb-3 border-b pb-2">근로자 정보</h4>
                                        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
                                            <DetailItem label="이름" value={<span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ backgroundColor: employeeForDetail.color || '#cccccc' }}></span>{employeeForDetail.name}</span>} />
                                            <DetailItem label="직급" value={employeeForDetail.position} />
                                            <DetailItem label="고용형태" value={employeeForDetail.employmentType} />
                                            <DetailItem label="급여형태" value={employeeForDetail.payType} />
                                            <DetailItem label="급여" value={`${employeeForDetail.payRate.toLocaleString()}원`} />
                                        </dl>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-3 border-b pb-2">근태 기록</h4>
                                        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-4">
                                            <DetailItem label="출근 시간" value={recordForDetail.clockIn} />
                                            <DetailItem label="퇴근 시간" value={recordForDetail.clockOut} />
                                            <DetailItem label="휴게 시작" value={recordForDetail.breakStart} />
                                            <DetailItem label="휴게 종료" value={recordForDetail.breakEnd} />
                                            <DetailItem label="외근 시작" value={recordForDetail.awayStart} />
                                            <DetailItem label="외근 종료" value={recordForDetail.awayEnd} />
                                            <DetailItem label="예정 근무 시간" value="-" />
                                            <DetailItem label="총 근무 시간" value={`${recordForDetail.workHours} 시간`} />
                                            <DetailItem label="상태" value={<span className={recordForDetail.status === AttendanceStatus.LATE ? 'text-red-600 font-bold' : ''}>{recordForDetail.status}</span>} />
                                        </dl>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                                    {!isWorker ? (
                                        <>
                                            <Button variant="danger" className="mr-auto" onClick={() => {
                                                setSelectedRecordIds([recordForDetail.id]);
                                                setIsConfirmDeleteOpen(true);
                                            }}>삭제</Button>
                                            <Button variant="secondary" onClick={() => { setRecordForDetail(null); onEditEmployee(employeeForDetail.id); }}>정보 수정</Button>
                                            <Button onClick={() => setIsEditingAttendance(true)}>기록 수정</Button>
                                        </>
                                    ) : (
                                        <Button variant="secondary" onClick={() => { setRecordForDetail(null); setIsEditingAttendance(false); }}>닫기</Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSaveEdit}>
                                <div className="grid grid-cols-2 gap-4">
                                    <EditTimeSelectGroup label="출근 시간" name="clockIn" value={editedData?.clockIn} />
                                    <EditTimeSelectGroup label="퇴근 시간" name="clockOut" value={editedData?.clockOut} />
                                    <EditTimeSelectGroup label="휴게 시작" name="breakStart" value={editedData?.breakStart} />
                                    <EditTimeSelectGroup label="휴게 종료" name="breakEnd" value={editedData?.breakEnd} />
                                    <EditTimeSelectGroup label="외근 시작" name="awayStart" value={editedData?.awayStart} />
                                    <EditTimeSelectGroup label="외근 종료" name="awayEnd" value={editedData?.awayEnd} />
                                    <div className="col-span-2">
                                         <label htmlFor="statusEdit" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                         <select 
                                            id="statusEdit" 
                                            name="status" 
                                            value={editedData?.status} 
                                            onChange={(e) => setEditedData(prev => prev ? { ...prev, status: e.target.value as AttendanceStatus } : null)}
                                            className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {Object.values(AttendanceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                         </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                                    <Button type="button" variant="secondary" onClick={() => setIsEditingAttendance(false)}>취소</Button>
                                    <Button type="submit" variant="primary">저장</Button>
                                </div>
                            </form>
                        )
                    )}
                </Modal>

                <Modal
                    isOpen={isConfirmDeleteOpen}
                    onClose={() => setIsConfirmDeleteOpen(false)}
                    title="삭제 확인"
                    size="sm"
                >
                    <div>
                        <p className="text-center text-slate-600 mb-6">
                            선택한 {selectedRecordIds.length}개의 근태 기록을<br/>정말로 삭제하시겠습니까?
                        </p>
                        <div className="flex justify-center gap-3 pt-4 border-t">
                            <Button variant="secondary" onClick={() => {
                                setIsConfirmDeleteOpen(false);
                                setSelectedRecordIds([]);
                            }}>취소</Button>
                            <Button variant="danger" onClick={handleConfirmDelete}>삭제</Button>
                        </div>
                    </div>
                </Modal>
                <Modal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title="기간 선택하여 다운로드"
                    size="md"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600">다운로드할 기간을 선택해주세요. (최대 1년)</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">시작일</label>
                                <button
                                    ref={startDateButtonRef}
                                    type="button"
                                    onClick={() => setActiveDatePicker(activeDatePicker === 'start' ? null : 'start')}
                                    className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-left font-normal h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {exportDateRange.start ? exportDateRange.start.toLocaleDateString('ko-KR') : <span className="text-slate-400">날짜 선택</span>}
                                </button>
                                {activeDatePicker === 'start' && (
                                    <DatePicker
                                        currentDate={exportDateRange.start || new Date()}
                                        onDateSelect={handleDateSelectForExport}
                                        onClose={() => setActiveDatePicker(null)}
                                        triggerRef={startDateButtonRef}
                                    />
                                )}
                            </div>
                            <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">종료일</label>
                                <button
                                    ref={endDateButtonRef}
                                    type="button"
                                    onClick={() => setActiveDatePicker(activeDatePicker === 'end' ? null : 'end')}
                                    disabled={!exportDateRange.start}
                                    className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-left font-normal h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                                >
                                    {exportDateRange.end ? exportDateRange.end.toLocaleDateString('ko-KR') : <span className="text-slate-400">날짜 선택</span>}
                                </button>
                                {activeDatePicker === 'end' && (
                                    <DatePicker
                                        currentDate={exportDateRange.end || exportDateRange.start || new Date()}
                                        onDateSelect={handleDateSelectForExport}
                                        onClose={() => setActiveDatePicker(null)}
                                        triggerRef={endDateButtonRef}
                                    />
                                )}
                            </div>
                        </div>

                        {exportError && <p className="text-sm text-red-500 text-center">{exportError}</p>}
                        
                        <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>취소</Button>
                            <Button 
                                onClick={() => alert('엑셀 다운로드 기능은 준비 중입니다.')}
                                disabled={!exportDateRange.start || !exportDateRange.end}
                            >
                                다운로드
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};