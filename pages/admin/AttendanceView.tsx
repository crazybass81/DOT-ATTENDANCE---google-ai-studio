



import React, { useState, useMemo, useEffect } from 'react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../../types';
import { Card, Modal, Button, Input } from '../../components/ui';
import { CalendarHeader } from '../../components/admin/CalendarHeader';
import { getTextColorForBackground } from '../../utils';

interface AttendanceViewProps {
    employees: Employee[];
    attendance: AttendanceRecord[];
    onEditEmployee: (employeeId: number) => void;
    onUpdateAttendance: (updatedRecord: AttendanceRecord) => void;
    onAddAttendance: (newRecordData: Omit<AttendanceRecord, 'id' | 'isModified'>) => void;
    onDeleteAttendance: (recordIds: number[]) => void;
}

export const AttendanceView = ({ employees, attendance, onEditEmployee, onUpdateAttendance, onAddAttendance, onDeleteAttendance }: AttendanceViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date('2024-08-10'));
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    const [selectedDateRecords, setSelectedDateRecords] = useState<AttendanceRecord[] | null>(null);
    const [recordForDetail, setRecordForDetail] = useState<AttendanceRecord | null>(null);
    const [isEditingAttendance, setIsEditingAttendance] = useState(false);
    const [editedData, setEditedData] = useState<Partial<AttendanceRecord> | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [dateForNewRecord, setDateForNewRecord] = useState<Date | null>(null);

    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

    const employeeForDetail = recordForDetail ? employees.find(e => e.id === recordForDetail.employeeId) : null;

    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), []);
    const minutes = useMemo(() => ['00', '15', '30', '45'], []);

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
        // This effect syncs the list modal with the main attendance data after a deletion.
        if (selectedDateRecords) {
            const dateStr = selectedDateRecords[0]?.date;
            if (dateStr) {
                const freshRecords = attendanceByDate[dateStr] || [];
                if (freshRecords.length !== selectedDateRecords.length || !freshRecords.every(fr => selectedDateRecords.some(sr => sr.id === fr.id))) {
                    if (freshRecords.length === 0) {
                        setSelectedDateRecords(null);
                    } else {
                        setSelectedDateRecords(freshRecords);
                    }
                }
            }
        }
    }, [attendanceByDate]);


    const handleDayClick = (day: number) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const clickedDate = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const records = attendanceByDate[dateStr] || [];

        if (records.length === 0) {
            setDateForNewRecord(clickedDate);
            setIsAddModalOpen(true);
        } else if (records.length === 1) {
            setRecordForDetail(records[0]);
        } else {
            setSelectedDateRecords(records);
        }
    };

    const calculateWorkHours = (clockIn: string | null, clockOut: string | null, breakStart: string | null, breakEnd: string | null): number => {
        if (!clockIn || !clockOut) return 0;
        
        try {
            const start = new Date(`1970-01-01T${clockIn}`);
            const end = new Date(`1970-01-01T${clockOut}`);
            let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            
            if (breakStart && breakEnd) {
                const breakS = new Date(`1970-01-01T${breakStart}`);
                const breakE = new Date(`1970-01-01T${breakEnd}`);
                if (breakE > breakS) {
                    diff -= (breakE.getTime() - breakS.getTime()) / (1000 * 60 * 60);
                }
            }
            return parseFloat(Math.max(0, diff).toFixed(1));
        } catch (e) {
            return 0;
        }
    };

    const handleAddNewRecord = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dateForNewRecord) return;
    
        const formData = new FormData(e.currentTarget);
        const employeeId = Number(formData.get('employeeId'));
        const status = formData.get('status') as AttendanceStatus;

        const getTimeFromForm = (baseName: string) => {
            const hour = formData.get(`${baseName}Hour`) as string;
            const minute = formData.get(`${baseName}Minute`) as string;
            return hour && minute ? `${hour}:${minute}` : null;
        };

        const clockIn = getTimeFromForm('clockIn');
        const clockOut = getTimeFromForm('clockOut');
        const breakStart = getTimeFromForm('breakStart');
        const breakEnd = getTimeFromForm('breakEnd');

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
            clockOut,
            workHours,
            status,
        };
        
        onAddAttendance(newRecordData);
        setIsAddModalOpen(false);
        setDateForNewRecord(null);
    };
    
    const handleAddFromList = () => {
        if (selectedDateRecords && selectedDateRecords.length > 0) {
            const date = new Date(selectedDateRecords[0].date.replace(/-/g, '/'));
            setDateForNewRecord(date);
            setIsAddModalOpen(true);
            setSelectedDateRecords(null);
        }
    };

    const handleTimeEditChange = (field: keyof AttendanceRecord, part: 'hour' | 'minute', value: string) => {
        setEditedData(prev => {
            if (!prev) return null;
            
            const existingTime = prev[field] as string | null;
            let [h, m] = existingTime ? existingTime.split(':') : ['', ''];

            if (part === 'hour') h = value;
            if (part === 'minute') m = value;

            if (h === '' && m === '') {
                return { ...prev, [field]: null };
            }

            const newTime = `${h || '00'}:${m || '00'}`;
            return { ...prev, [field]: newTime };
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

        if (dayRecords.length === 0) {
            return <p className="text-center text-slate-500 py-16">해당 날짜의 근태 기록이 없습니다.</p>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50">
                        <tr className="border-b">
                            <th className="p-3">이름</th>
                            <th className="p-3">출근</th>
                            <th className="p-3">퇴근</th>
                            <th className="p-3">근무시간</th>
                            <th className="p-3">상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dayRecords.map(rec => (
                            <tr key={rec.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setRecordForDetail(rec)}>
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
            </div>
        );
    };

    const DetailItem: React.FC<{ label: string, value?: React.ReactNode }> = ({ label, value }) => (
        <div className="flex flex-col">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 text-md text-slate-900 font-semibold">{value || '-'}</dd>
        </div>
    );
    
    const TimeSelect: React.FC<{ label: string; baseName: string; value: string | null; onChange?: (field: keyof AttendanceRecord, part: 'hour' | 'minute', value: string) => void; }> = ({ label, baseName, value, onChange }) => {
        const [hour, minute] = value ? value.split(':') : ['', ''];
        const selectClasses = "w-full bg-white px-2 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center";
        
        return (
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="flex items-center gap-1.5">
                    <select
                        name={onChange ? undefined : `${baseName}Hour`}
                        value={onChange ? hour : undefined}
                        defaultValue={onChange ? undefined : hour}
                        onChange={onChange ? (e) => onChange(baseName as keyof AttendanceRecord, 'hour', e.target.value) : undefined}
                        className={selectClasses}
                    >
                        <option value="">시</option>
                        {hours.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-slate-600 font-bold">:</span>
                    <select
                        name={onChange ? undefined : `${baseName}Minute`}
                        value={onChange ? minute : undefined}
                        defaultValue={onChange ? undefined : minute}
                        onChange={onChange ? (e) => onChange(baseName as keyof AttendanceRecord, 'minute', e.target.value) : undefined}
                        className={selectClasses}
                    >
                        <option value="">분</option>
                        {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>
        );
    };

    return(
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">근태 관리</h2>
            <Card>
                <CalendarHeader 
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                />
                {viewMode === 'month' ? renderMonthView() : renderDayView()}
            </Card>

            <Modal
                isOpen={!!selectedDateRecords}
                onClose={() => {
                    setSelectedDateRecords(null);
                    setIsDeleteMode(false);
                    setSelectedRecordIds([]);
                }}
                title={selectedDateRecords ? `${new Date(selectedDateRecords[0].date.replace(/-/g, '/')).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 근무 현황` : ''}
                size="lg"
            >
                {selectedDateRecords && (
                    <>
                        <div className="max-h-[60vh] overflow-y-auto">
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
                                    <Button variant="danger" onClick={() => setIsDeleteMode(true)}>근태 삭제</Button>
                                    <div className="flex gap-2">
                                        <Button onClick={handleAddFromList}>근태 추가</Button>
                                        <Button variant="secondary" onClick={() => setSelectedDateRecords(null)}>닫기</Button>
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
                title={dateForNewRecord ? `${dateForNewRecord.toLocaleDateString('ko-KR')} 근태 기록 추가` : '근태 기록 추가'}
                size="lg"
            >
                {dateForNewRecord && (
                    <form onSubmit={handleAddNewRecord}>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="col-span-2">
                                <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 mb-1">근로자</label>
                                <select id="employeeId" name="employeeId" required className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="" disabled selected>근로자를 선택하세요</option>
                                    {employees.filter(e => e.status === '재직').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <TimeSelect label="출근 시간" baseName="clockIn" value={null} />
                            <TimeSelect label="퇴근 시간" baseName="clockOut" value={null} />
                            <TimeSelect label="휴게 시작" baseName="breakStart" value={null} />
                            <TimeSelect label="휴게 종료" baseName="breakEnd" value={null} />
                             <div className="col-span-2">
                                 <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                 <select id="status" name="status" defaultValue={AttendanceStatus.NORMAL} className="w-full bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
                                        <DetailItem label="예정 스케줄" value="-" />
                                        <DetailItem label="출근 시간" value={recordForDetail.clockIn} />
                                        <DetailItem label="퇴근 시간" value={recordForDetail.clockOut} />
                                        <DetailItem label="휴게 시작" value={recordForDetail.breakStart} />
                                        <DetailItem label="휴게 종료" value={recordForDetail.breakEnd} />
                                        <DetailItem label="총 근무" value={`${recordForDetail.workHours} 시간`} />
                                        <DetailItem label="상태" value={<span className={recordForDetail.status === AttendanceStatus.LATE ? 'text-red-600 font-bold' : ''}>{recordForDetail.status}</span>} />
                                    </dl>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 mt-6 border-t">
                                <Button variant="danger" onClick={() => {
                                    setSelectedRecordIds([recordForDetail.id]);
                                    setIsConfirmDeleteOpen(true);
                                }}>삭제</Button>
                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={() => { setRecordForDetail(null); onEditEmployee(employeeForDetail.id); }}>정보 수정</Button>
                                    <Button onClick={() => setIsEditingAttendance(true)}>기록 수정</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveEdit}>
                            <div className="grid grid-cols-2 gap-4">
                                <TimeSelect label="출근 시간" baseName="clockIn" value={editedData?.clockIn || null} onChange={handleTimeEditChange} />
                                <TimeSelect label="퇴근 시간" baseName="clockOut" value={editedData?.clockOut || null} onChange={handleTimeEditChange} />
                                <TimeSelect label="휴게 시작" baseName="breakStart" value={editedData?.breakStart || null} onChange={handleTimeEditChange} />
                                <TimeSelect label="휴게 종료" baseName="breakEnd" value={editedData?.breakEnd || null} onChange={handleTimeEditChange} />

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
        </div>
    );
};