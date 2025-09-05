import React, { useState, useRef } from 'react';
import { Schedule, Employee } from '../../types';
import { Button, Card, Modal, Input } from '../../components/ui';
import { CalendarHeader } from '../../components/admin/CalendarHeader';
import { getTextColorForBackground } from '../../utils';

export const ScheduleView = ({ schedules, employees, onSchedulesChange }: { schedules: Schedule[], employees: Employee[], onSchedulesChange: (schedules: Schedule[]) => void }) => {
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [newScheduleData, setNewScheduleData] = useState<{
        employeeId: string;
        startDate: string;
        patterns: { id: number; startTime: string; endTime: string; days: number[] }[];
    } | null>(null);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    
    // New states for detail modal and multi-select
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([]);
    const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
    const [isEditScopeModalOpen, setIsEditScopeModalOpen] = useState(false);
    const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
    // FIX: Initialize useRef with a typed initial value to resolve the argument error.
    const longPressTimeout = useRef<number | undefined>(undefined);

    const activeEmployees = employees.filter(e => e.status === '재직');

    const handleOpenModal = (schedule?: Schedule, date?: Date) => {
        if (schedule) {
            setSelectedSchedule(schedule);
            setNewScheduleData(null);
        } else {
            setSelectedSchedule(null);
            setNewScheduleData({
                employeeId: activeEmployees[0]?.id.toString() || '',
                startDate: (date || new Date()).toISOString().split('T')[0],
                patterns: [{ id: Date.now(), startTime: '09:00', endTime: '18:00', days: [] }]
            });
        }
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSchedule(null);
        setNewScheduleData(null);
    };

    const handleSaveSimpleSchedule = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const employeeId = Number(formData.get('employeeId'));
        const date = formData.get('date') as string;
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;
        const breakMinutes = Number(formData.get('breakMinutes'));

        if (!employeeId || !date || !startTime || !endTime || !selectedSchedule) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const employee = employees.find(e => e.id === employeeId);

        const updatedSchedule: Schedule = {
            ...selectedSchedule,
            employeeId,
            employeeName: employee?.name || 'Unknown',
            start: new Date(`${date}T${startTime}`),
            end: new Date(`${date}T${endTime}`),
            breakMinutes,
        };
        
        const updatedSchedules = schedules.map(s => s.id === selectedSchedule.id ? updatedSchedule : s);
        onSchedulesChange(updatedSchedules);
        handleCloseModal();
    };
    
    const handleSaveRecurringSchedule = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newScheduleData) return;

        const { employeeId, startDate, patterns } = newScheduleData;
        if (!employeeId || !startDate || patterns.length === 0) {
            alert('근로자, 시작일, 근무 패턴을 모두 입력해주세요.');
            return;
        }

        const employee = employees.find(e => e.id === Number(employeeId));
        if (!employee) {
            alert('선택된 직원을 찾을 수 없습니다.');
            return;
        }

        const newSchedules: Schedule[] = [];
        const loopStartDate = new Date(startDate + 'T00:00:00');
        
        const year = loopStartDate.getFullYear();
        const month = loopStartDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = loopStartDate.getDate(); day <= daysInMonth; day++) {
            const currentDateInLoop = new Date(year, month, day);
            const dayOfWeek = currentDateInLoop.getDay(); // 0: Sunday, 6: Saturday

            for (const pattern of patterns) {
                if (pattern.days.includes(dayOfWeek) && pattern.startTime && pattern.endTime) {
                    const [startHour, startMinute] = pattern.startTime.split(':').map(Number);
                    const [endHour, endMinute] = pattern.endTime.split(':').map(Number);

                    const scheduleStart = new Date(currentDateInLoop);
                    scheduleStart.setHours(startHour, startMinute, 0, 0);

                    const scheduleEnd = new Date(currentDateInLoop);
                    scheduleEnd.setHours(endHour, endMinute, 0, 0);

                    if (scheduleEnd <= scheduleStart) continue; // Invalid time range

                    newSchedules.push({
                        id: Date.now() + Math.random(),
                        employeeId: Number(employeeId),
                        employeeName: employee.name,
                        start: scheduleStart,
                        end: scheduleEnd,
                        breakMinutes: 60, // Default break time
                        // FIX: Added missing 'storeId' property to satisfy the Schedule type.
                        storeId: employee.storeId || 'sample-store',
                    });
                }
            }
        }
        onSchedulesChange([...schedules, ...newSchedules]);
        handleCloseModal();
    };

    const handleDeleteSchedule = () => {
        if (!selectedSchedule || !selectedSchedule.id) return;
        const updatedSchedules = schedules.filter(s => s.id !== selectedSchedule.id);
        onSchedulesChange(updatedSchedules);
        setIsConfirmDeleteOpen(false);
        handleCloseModal();
    };
    
    const handleUpdateNewScheduleData = (field: keyof typeof newScheduleData, value: any) => {
        setNewScheduleData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleAddPattern = () => {
        if (!newScheduleData) return;
        const newPattern = { id: Date.now(), startTime: '09:00', endTime: '18:00', days: [] as number[] };
        handleUpdateNewScheduleData('patterns', [...newScheduleData.patterns, newPattern]);
    };
    
    const handleRemovePattern = (id: number) => {
        if (!newScheduleData) return;
        handleUpdateNewScheduleData('patterns', newScheduleData.patterns.filter(p => p.id !== id));
    };

    const handleUpdatePattern = (id: number, field: string, value: string) => {
        if (!newScheduleData) return;
        const updatedPatterns = newScheduleData.patterns.map(p => p.id === id ? { ...p, [field]: value } : p);
        handleUpdateNewScheduleData('patterns', updatedPatterns);
    };

    const handleToggleDay = (id: number, dayIndex: number) => {
        if (!newScheduleData) return;
        const updatedPatterns = newScheduleData.patterns.map(p => {
            if (p.id === id) {
                const newDays = p.days.includes(dayIndex) ? p.days.filter(d => d !== dayIndex) : [...p.days, dayIndex];
                return { ...p, days: newDays.sort() };
            }
            return p;
        });
        handleUpdateNewScheduleData('patterns', updatedPatterns);
    };

    const handleBulkDelete = () => {
        const updatedSchedules = schedules.filter(s => !selectedScheduleIds.includes(s.id));
        onSchedulesChange(updatedSchedules);
        setIsConfirmBulkDeleteOpen(false);
        setIsDetailModalOpen(false);
        setIsSelectionMode(false);
        setSelectedScheduleIds([]);
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
            const date = new Date(year, month, day);
            const dateSchedules = schedules.filter(s => 
                s.start.getFullYear() === year && s.start.getMonth() === month && s.start.getDate() === day
            );
            
            const uniqueEmployeesOnDay = Array.from(new Set(dateSchedules.map(s => s.employeeId)))
                .map(id => employees.find(e => e.id === id))
                .filter((e): e is Employee => !!e);

            calendarDays.push(
                <div key={day} className="border-r border-b p-1 min-h-[120px] relative cursor-pointer hover:bg-sky-50 transition-colors"
                    onClick={() => {
                        setSelectedDate(date);
                        setIsDetailModalOpen(true);
                    }}
                >
                    <p className="font-semibold text-sm">{day}</p>
                    <ul className="mt-1 space-y-0.5">
                       {uniqueEmployeesOnDay.map(employee => {
                            const bgColor = employee.color || '#e0e7ff';
                            const textColor = getTextColorForBackground(bgColor);
                            return (
                                <li 
                                    key={employee.id} 
                                    className="p-1 rounded-md whitespace-nowrap overflow-hidden text-[10px] leading-tight truncate"
                                    style={{ backgroundColor: bgColor, color: textColor }}
                                >
                                    {employee.name}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            );
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
        const daySchedules = schedules.filter(s => s.start.toDateString() === currentDate.toDateString());
        const employeesOnDay = activeEmployees.filter(emp => daySchedules.some(s => s.employeeId === emp.id));
        
        if (employeesOnDay.length === 0) {
            return <p className="text-center text-slate-500 py-16">등록된 스케줄이 없습니다.</p>;
        }

        const hourHeight = 50;

        return (
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="flex">
                    <div className="w-16 shrink-0 border-b border-r bg-slate-50"></div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${employeesOnDay.length}, minmax(0, 1fr))` }}>
                        {employeesOnDay.map(emp => {
                             const bgColor = emp.color || '#f9fafb';
                             const textColor = getTextColorForBackground(bgColor);
                             return (
                                 <div key={emp.id} style={{ backgroundColor: bgColor, color: textColor }} className="p-2 font-bold text-center border-b border-r truncate">{emp.name}</div>
                             );
                        })}
                    </div>
                </div>
                <div className="flex">
                    <div className="w-16 text-center text-xs shrink-0">
                        {Array.from({ length: 24 }).map((_, hour) => (
                            <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b border-r flex items-center justify-center bg-slate-50 text-slate-500">
                                {String(hour).padStart(2, '0')}:00
                            </div>
                        ))}
                    </div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${employeesOnDay.length}, minmax(0, 1fr))` }}>
                        {employeesOnDay.map(employee => (
                            <div key={employee.id} className="relative border-r">
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b"></div>
                                ))}
                                {daySchedules.filter(s => s.employeeId === employee.id).map(s => {
                                    const startDecimal = s.start.getHours() + s.start.getMinutes() / 60;
                                    const endDecimal = s.end.getHours() + s.end.getMinutes() / 60;
                                    const top = startDecimal * hourHeight;
                                    const height = Math.max((endDecimal - startDecimal) * hourHeight, 20);
                                    
                                    const employeeForColor = employees.find(e => e.id === s.employeeId);
                                    const bgColor = employeeForColor?.color ? `${employeeForColor.color}E6` : '#eff6ff'; // with opacity
                                    const borderColor = employeeForColor?.color || '#60a5fa';
                                    const textColor = getTextColorForBackground(employeeForColor?.color);


                                    return (
                                        <div
                                            key={s.id}
                                            onClick={() => handleOpenModal(s)}
                                            className="absolute p-1 text-xs rounded cursor-pointer border-l-4 overflow-hidden"
                                            style={{ top: `${top}px`, height: `${height}px`, left: '2px', right: '2px', backgroundColor: bgColor, borderColor: borderColor, color: textColor }}
                                        >
                                            <p className="font-semibold">{s.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p>{s.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const DayOfWeekSelector = ({ pattern, onToggle }: { pattern: { id: number, days: number[] }, onToggle: (id: number, dayIndex: number) => void }) => {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return (
            <div className="flex justify-center gap-1">
                {days.map((day, index) => (
                    <button
                        key={day}
                        type="button"
                        onClick={() => onToggle(pattern.id, index)}
                        className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${pattern.days.includes(index) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                        {day}
                    </button>
                ))}
            </div>
        );
    };

    const dailySchedules = selectedDate ? schedules.filter(s => s.start.toDateString() === selectedDate.toDateString()) : [];

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold">스케줄 관리</h2>
        </div>
        <Card>
            <CalendarHeader
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                viewMode={viewMode}
                setViewMode={setViewMode}
            >
                <Button onClick={() => handleOpenModal(undefined, currentDate)} size="md">스케줄 추가</Button>
            </CalendarHeader>
            <div className="overflow-x-auto">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'day' && renderDayView()}
            </div>
        </Card>

        {/* Schedule Detail Modal */}
        <Modal
            isOpen={isDetailModalOpen}
            onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedDate(null);
                setIsSelectionMode(false);
                setSelectedScheduleIds([]);
            }}
            title={selectedDate ? `${selectedDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} 스케줄` : '스케줄'}
            size="md"
        >
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {dailySchedules.length > 0 ? dailySchedules.map(schedule => {
                    const isSelected = selectedScheduleIds.includes(schedule.id);
                    const employee = employees.find(e => e.id === schedule.employeeId);

                    const handleMouseDown = () => {
                        clearTimeout(longPressTimeout.current);
                        longPressTimeout.current = window.setTimeout(() => {
                            if (!isSelectionMode) {
                                setIsSelectionMode(true);
                                setSelectedScheduleIds(prev => [...prev, schedule.id]);
                            }
                        }, 1000); // 1-second long press
                    };

                    const handleMouseUp = () => {
                        clearTimeout(longPressTimeout.current);
                    };
                    
                    const handleClick = () => {
                        if (isSelectionMode) {
                            setSelectedScheduleIds(prev => 
                                prev.includes(schedule.id)
                                    ? prev.filter(id => id !== schedule.id)
                                    : [...prev, schedule.id]
                            );
                        } else {
                            setScheduleToEdit(schedule);
                            setIsEditScopeModalOpen(true);
                        }
                    };

                    return (
                        <div
                            key={schedule.id}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onClick={handleClick}
                            className={`p-3 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${isSelected ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-slate-50 hover:bg-slate-100'}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={isSelected}
                        >
                            {isSelectionMode && (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    readOnly
                                    className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 pointer-events-none"
                                    aria-label={`Select schedule for ${schedule.employeeName}`}
                                />
                            )}
                            <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: employee?.color || '#ccc' }}></div>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800">{schedule.employeeName}</p>
                                <p className="text-sm text-slate-600">
                                    {schedule.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {schedule.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                }) : <p className="text-center text-slate-500 py-8">해당 날짜에 스케줄이 없습니다.</p>}
            </div>
            <div className="flex justify-between items-center pt-4 mt-4 border-t">
                {isSelectionMode ? (
                    <>
                        <Button variant="secondary" onClick={() => {
                            setIsSelectionMode(false);
                            setSelectedScheduleIds([]);
                        }}>
                            취소
                        </Button>
                        <Button
                            variant="danger"
                            disabled={selectedScheduleIds.length === 0}
                            onClick={() => setIsConfirmBulkDeleteOpen(true)}
                        >
                            {selectedScheduleIds.length}개 삭제
                        </Button>
                    </>
                ) : (
                    <div className="w-full flex justify-end gap-3">
                        <Button onClick={() => {
                            setIsDetailModalOpen(false);
                            handleOpenModal(undefined, selectedDate || undefined);
                        }}>
                            스케줄 추가
                        </Button>
                         <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                            닫기
                        </Button>
                    </div>
                )}
            </div>
        </Modal>

        {/* Edit Scope Modal */}
        <Modal
            isOpen={isEditScopeModalOpen}
            onClose={() => setIsEditScopeModalOpen(false)}
            title="수정 범위 선택"
            size="sm"
        >
            <p className="mb-4 text-center">이 스케줄의 수정 범위를 선택해주세요.</p>
            <div className="flex flex-col gap-2">
                <Button className="w-full" onClick={() => {
                    setIsEditScopeModalOpen(false);
                    setIsDetailModalOpen(false);
                    handleOpenModal(scheduleToEdit || undefined);
                }}>
                    이 날의 스케줄만 수정
                </Button>
                <Button className="w-full" variant="secondary" onClick={() => alert('반복 스케줄 전체 수정 기능은 준비 중입니다.')}>
                    반복 스케줄 전체 수정
                </Button>
            </div>
        </Modal>

        {/* Bulk Delete Confirmation Modal */}
        <Modal
            isOpen={isConfirmBulkDeleteOpen}
            onClose={() => setIsConfirmBulkDeleteOpen(false)}
            title="삭제 확인"
            size="sm"
        >
            <p>선택한 {selectedScheduleIds.length}개의 스케줄을 정말로 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                <Button variant="secondary" onClick={() => setIsConfirmBulkDeleteOpen(false)}>취소</Button>
                <Button variant="danger" onClick={handleBulkDelete}>삭제</Button>
            </div>
        </Modal>

        {/* Existing Add/Edit/Delete Modals */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedSchedule ? "스케줄 수정" : "스케줄 추가"} size="lg">
            {selectedSchedule && (
                 <form onSubmit={handleSaveSimpleSchedule}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">근로자</label>
                            <select id="employeeId" name="employeeId" defaultValue={selectedSchedule?.employeeId} className="w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm" required>
                                {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <Input label="날짜" name="date" type="date" defaultValue={selectedSchedule?.start?.toISOString().split('T')[0]} required/>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="시작 시간" name="startTime" type="time" step="600" defaultValue={selectedSchedule?.start?.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} required />
                            <Input label="종료 시간" name="endTime" type="time" step="600" defaultValue={selectedSchedule?.end?.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })} required />
                        </div>
                        <Input label="휴게 시간(분)" name="breakMinutes" type="number" step="15" defaultValue={selectedSchedule?.breakMinutes} required />
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-6 border-t">
                        <div>
                            <Button type="button" variant="danger" onClick={() => setIsConfirmDeleteOpen(true)}>삭제</Button>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="secondary" onClick={handleCloseModal}>취소</Button>
                            <Button type="submit">저장</Button>
                        </div>
                    </div>
                </form>
            )}
            {newScheduleData && (
                <form onSubmit={handleSaveRecurringSchedule}>
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="employeeIdNew" className="block text-sm font-medium text-slate-700 mb-1">근로자</label>
                                <select id="employeeIdNew" name="employeeId" value={newScheduleData.employeeId} onChange={(e) => handleUpdateNewScheduleData('employeeId', e.target.value)} className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm" required>
                                    <option value="" disabled>선택하세요</option>
                                    {activeEmployees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <Input label="시작일" name="startDate" type="date" value={newScheduleData.startDate} onChange={(e) => handleUpdateNewScheduleData('startDate', e.target.value)} required/>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 border-b pb-2">근무 시간 설정</h4>
                            {newScheduleData.patterns.map((pattern, index) => (
                                <div key={pattern.id} className="p-4 bg-slate-50 rounded-lg space-y-3 relative">
                                    {newScheduleData.patterns.length > 1 && (
                                        <button type="button" onClick={() => handleRemovePattern(pattern.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold">&times;</button>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="시작 시간" type="time" value={pattern.startTime} onChange={e => handleUpdatePattern(pattern.id, 'startTime', e.target.value)} required />
                                        <Input label="종료 시간" type="time" value={pattern.endTime} onChange={e => handleUpdatePattern(pattern.id, 'endTime', e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-center text-slate-700 mb-2">반복 요일</label>
                                        <DayOfWeekSelector pattern={pattern} onToggle={handleToggleDay} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="button" onClick={handleAddPattern} variant="secondary" className="w-full">
                           <span role="img" aria-hidden="true">➕</span> 근무 시간 추가
                        </Button>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>취소</Button>
                        <Button type="submit">저장</Button>
                    </div>
                </form>
            )}
        </Modal>

        <Modal isOpen={isConfirmDeleteOpen} onClose={() => setIsConfirmDeleteOpen(false)} title="삭제 확인" size="sm">
            <p>이 스케줄을 정말로 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>취소</Button>
                <Button variant="danger" onClick={handleDeleteSchedule}>삭제</Button>
            </div>
        </Modal>
      </div>
    );
};