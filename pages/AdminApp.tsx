





// Fix: Corrected React import statement to properly import hooks.
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NewWorkerRequest, Employee, AttendanceRecord, AttendanceStatus, Schedule } from '../types';
import { Button, Card, Input, Modal, Tabs, Textarea } from '../components/ui';

// MOCK DATA
const MOCK_NEW_WORKERS_DATA: NewWorkerRequest[] = [
    { id: 1, name: '박신규', phone: '010-1111-2222', birthdate: '1998-05-15', requestedAt: '2024-08-10 09:30' },
    { id: 2, name: '최지원', phone: '010-3333-4444', birthdate: '2001-11-20', requestedAt: '2024-08-10 14:00' },
];

const MOCK_EMPLOYEES_DATA: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[] = [
    { id: 101, name: '김성실', position: '매니저', status: '재직', infoStatus: '정상', hireDate: '2023-01-15', lastWorkDate: '2024-08-10', phone: '010-1234-5678', birthdate: '1995-02-20', employmentType: '정규', payType: '월급', payRate: 3500000, accountNumber: '국민 111-222-333333', contract: '근로계약서_김성실.pdf', bankAccountCopy: '통장사본_김성실.jpg', color: '#3b82f6' },
    { id: 102, name: '이근면', position: '정직원', status: '재직', infoStatus: '정상', hireDate: '2023-06-01', lastWorkDate: '2024-08-10', phone: '010-9876-5432', birthdate: '1999-07-07', employmentType: '정규', payType: '월급', payRate: 3000000, accountNumber: '신한 444-555-666666', contract: null, bankAccountCopy: '통장사본_이근면.pdf', color: '#10b981' },
    { id: 103, name: '최알바', position: '파트타이머', status: '재직', infoStatus: '미흡', hireDate: '2024-03-10', lastWorkDate: '2024-08-09', phone: '010-5555-6666', birthdate: '2002-12-25', employmentType: '아르바이트', payType: '시급', payRate: 12000, accountNumber: '', contract: null, bankAccountCopy: null, color: '#f59e0b' },
    { id: 104, name: '정퇴사', position: '정직원', status: '퇴사', infoStatus: '정상', hireDate: '2022-08-01', lastWorkDate: '2024-07-31', phone: '010-0000-0000', birthdate: '1993-10-10', employmentType: '정규', payType: '월급', payRate: 3200000, accountNumber: '우리 777-888-999999', contract: '근로계약서_정퇴사.pdf', bankAccountCopy: '통장사본_정퇴사.jpg', color: '#6b7280', reasonForResignation: '개인 사유' },
    { id: 105, name: '박성실', position: '정직원', status: '재직', infoStatus: '정상', hireDate: '2024-01-01', lastWorkDate: '2024-08-10', phone: '010-1111-1111', birthdate: '1997-03-03', employmentType: '정규', payType: '월급', payRate: 2800000, accountNumber: '하나 123-456-789012', contract: '근로계약서_박성실.pdf', bankAccountCopy: null, color: '#8b5cf6' },
    { id: 106, name: '오휴직', position: '정직원', status: '휴직', infoStatus: '정상', hireDate: '2023-02-01', lastWorkDate: '', phone: '010-2222-2222', birthdate: '1996-01-01', employmentType: '정규', payType: '월급', payRate: 3100000, accountNumber: '카카오뱅크 333-333-333333', contract: '근로계약서_오휴직.pdf', bankAccountCopy: '통장사본_오휴직.jpg', color: '#a855f7' }
];

const INITIAL_MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 1, employeeId: 101, employeeName: '김성실', date: '2024-08-10', clockIn: '08:58', breakStart: null, breakEnd: null, clockOut: '18:05', workHours: 8, status: AttendanceStatus.NORMAL, isModified: false },
    { id: 2, employeeId: 102, employeeName: '이근면', date: '2024-08-10', clockIn: '09:05', breakStart: '13:00', breakEnd: '14:00', clockOut: '18:15', workHours: 8, status: AttendanceStatus.LATE, isModified: true },
    { id: 3, employeeId: 103, employeeName: '최알바', date: '2024-08-10', clockIn: '14:00', breakStart: null, breakEnd: null, clockOut: '22:00', workHours: 8, status: AttendanceStatus.NORMAL, isModified: false },
    { id: 4, employeeId: 101, employeeName: '김성실', date: '2024-08-11', clockIn: '09:00', breakStart: null, breakEnd: null, clockOut: '18:00', workHours: 8, status: AttendanceStatus.NORMAL, isModified: false },
    { id: 5, employeeId: 102, employeeName: '이근면', date: '2024-08-11', clockIn: '09:00', breakStart: '13:00', breakEnd: '14:00', clockOut: '18:00', workHours: 8, status: AttendanceStatus.NORMAL, isModified: false },
];

const INITIAL_MOCK_SCHEDULES: Schedule[] = [
    { id: 1, employeeId: 101, employeeName: '김성실', start: new Date('2024-08-12T09:00:00'), end: new Date('2024-08-12T18:00:00'), breakMinutes: 60 },
    { id: 2, employeeId: 102, employeeName: '이근면', start: new Date('2024-08-12T10:00:00'), end: new Date('2024-08-12T19:00:00'), breakMinutes: 60 },
    { id: 3, employeeId: 103, employeeName: '최알바', start: new Date('2024-08-12T14:00:00'), end: new Date('2024-08-12T22:00:00'), breakMinutes: 60 },
    { id: 4, employeeId: 105, employeeName: '박성실', start: new Date('2024-08-13T09:00:00'), end: new Date('2024-08-13T18:00:00'), breakMinutes: 60 },
    { id: 5, employeeId: 101, employeeName: '김성실', start: new Date('2024-08-14T09:00:00'), end: new Date('2024-08-14T18:00:00'), breakMinutes: 60 },
    { id: 6, employeeId: 102, employeeName: '이근면', start: new Date('2024-08-14T10:00:00'), end: new Date('2024-08-14T15:00:00'), breakMinutes: 30 },
];

// --- MOCK DATA GENERATION ---
const generateMockData = () => {
    const schedules: Schedule[] = [];
    const attendance: AttendanceRecord[] = [];
    const activeEmployees = MOCK_EMPLOYEES_DATA.filter(e => e.status === '재직');
    let scheduleIdCounter = (INITIAL_MOCK_SCHEDULES.length || 0) + 1;
    let attendanceIdCounter = (INITIAL_MOCK_ATTENDANCE.length || 0) + 1;

    const addMinutes = (date: Date, minutes: number): Date => {
        return new Date(date.getTime() + minutes * 60000);
    };

    const patterns = [
        { employeeIds: [101, 102, 105], days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', break: 60 }, // Mon-Fri
        { employeeIds: [103], days: [3, 4, 5, 6, 0], start: '14:00', end: '22:00', break: 60 }, // Wed-Sun
    ];

    const scheduleStartDate = new Date('2025-01-01T00:00:00');
    const scheduleEndDate = new Date('2025-12-31T00:00:00');
    
    for (let d = new Date(scheduleStartDate); d <= scheduleEndDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();

        patterns.forEach(pattern => {
            if (pattern.days.includes(dayOfWeek)) {
                pattern.employeeIds.forEach(empId => {
                    const employee = activeEmployees.find(e => e.id === empId);
                    if (employee) {
                        const [startH, startM] = pattern.start.split(':').map(Number);
                        const [endH, endM] = pattern.end.split(':').map(Number);

                        const scheduleStart = new Date(d);
                        scheduleStart.setHours(startH, startM, 0, 0);

                        const scheduleEnd = new Date(d);
                        scheduleEnd.setHours(endH, endM, 0, 0);

                        schedules.push({
                            id: scheduleIdCounter++,
                            employeeId: empId,
                            employeeName: employee.name,
                            start: scheduleStart,
                            end: scheduleEnd,
                            breakMinutes: pattern.break,
                        });
                    }
                });
            }
        });
    }

    const attendanceEndDate = new Date('2025-09-02T00:00:00');
    const schedulesForAttendance = schedules.filter(s => s.start >= scheduleStartDate && s.start <= attendanceEndDate);

    schedulesForAttendance.forEach(schedule => {
        if (Math.random() < 0.05) return; // 5% absent rate

        const clockInDeviation = Math.floor(Math.random() * 25) - 10; // -10 to +14 mins
        const clockOutDeviation = Math.floor(Math.random() * 31) - 15; // -15 to +15 mins

        const clockInTime = addMinutes(schedule.start, clockInDeviation);
        const clockOutTime = addMinutes(schedule.end, clockOutDeviation);
        
        const workDurationMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / 60000;
        const workHours = Math.max(0, (workDurationMinutes - schedule.breakMinutes) / 60);

        const status = clockInTime > schedule.start ? AttendanceStatus.LATE : AttendanceStatus.NORMAL;

        attendance.push({
            id: attendanceIdCounter++,
            employeeId: schedule.employeeId,
            employeeName: schedule.employeeName,
            date: schedule.start.toISOString().split('T')[0],
            clockIn: clockInTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
            breakStart: workHours > 4 ? '13:00' : null,
            breakEnd: workHours > 4 ? '14:00' : null,
            clockOut: clockOutTime.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }),
            workHours: parseFloat(workHours.toFixed(1)),
            status: status,
            isModified: Math.random() < 0.1,
        });
    });

    return {
        schedules: [...INITIAL_MOCK_SCHEDULES, ...schedules],
        attendance: [...INITIAL_MOCK_ATTENDANCE, ...attendance],
    };
};

const { schedules: MOCK_SCHEDULES_DATA, attendance: MOCK_ATTENDANCE } = generateMockData();

// UTILITY FUNCTIONS
const getTextColorForBackground = (hexColor?: string): string => {
    if (!hexColor || hexColor.length < 7) return '#000000';
    try {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    } catch (e) {
        return '#000000';
    }
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Reusable Employee Info Form Component
interface EmployeeFormData extends Partial<Employee> {
    accountNumber?: string;
    contract?: string | null;
    bankAccountCopy?: string | null;
}

interface EmployeeInfoFormProps {
    data: EmployeeFormData;
    onDataChange: (field: keyof EmployeeFormData, value: any) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const KOREAN_BANKS = ['선택', '국민', '신한', '우리', '하나', '기업', '농협', '카카오뱅크', '케이뱅크', '토스뱅크', '새마을금고', '우체국', 'SC제일', '씨티', '수협', '경남', '광주', '대구', '부산', '전북', '제주', '산업', '기타'];

const EmployeeInfoForm: React.FC<EmployeeInfoFormProps> = ({ data, onDataChange, activeTab, onTabChange }) => {
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onDataChange(e.target.name as keyof EmployeeFormData, e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'bankAccountCopy') => {
        if (e.target.files && e.target.files[0]) {
            onDataChange(docType, e.target.files[0].name);
        }
    };

    const getBankName = (accountStr?: string) => {
        if (!accountStr) return '';
        const parts = accountStr.split(' ');
        if (KOREAN_BANKS.includes(parts[0])) return parts[0];
        return '';
    };

    const getAccountNumberOnly = (accountStr?: string) => {
        if (!accountStr) return '';
        const parts = accountStr.split(' ');
        const bankName = getBankName(accountStr);
        if (bankName && parts.length > 1) {
            return parts.slice(1).join('').replace(/-/g, '');
        }
        return accountStr.replace(/-/g, '');
    };
    
    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const currentBank = getBankName(data.accountNumber);
        const currentNumber = getAccountNumberOnly(data.accountNumber);

        let newBank = currentBank;
        let newNumber = currentNumber;

        if (e.target.name === 'bankName') {
            newBank = e.target.value === '선택' ? '' : e.target.value;
        } else if (e.target.name === 'accountNumberOnly') {
            newNumber = e.target.value.replace(/\D/g, ''); // Allow only digits
        }

        onDataChange('accountNumber', `${newBank} ${newNumber}`.trim());
    };
    
    const renderDocumentRow = (label: string, docType: 'contract' | 'bankAccountCopy', docName: string | null | undefined) => (
         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
            <div>
                <p className="font-semibold">{label}</p>
                {docName ? (
                     <p className="text-sm text-blue-600">{docName}</p>
                ) : (
                    <p className="text-sm text-red-500">미제출</p>
                )}
            </div>
            <label className="cursor-pointer">
                <span className="text-sm font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-100">파일 선택</span>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, docType)} />
            </label>
        </div>
    );
    
    const renderTabContent = () => {
        switch (activeTab) {
            case '기본':
                return <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-5">
                    <Input label="이름" name="name" value={data.name || ''} onChange={handleInputChange} />
                    <Input label="연락처" name="phone" value={data.phone || ''} onChange={handleInputChange} />
                    <Input label="생년월일" name="birthdate" type="date" value={data.birthdate || ''} onChange={handleInputChange} />
                    <div>
                        <label htmlFor="employeeColor" className="block text-sm font-medium text-slate-700 mb-1">근로자 색상</label>
                        <div className="relative flex items-center border border-slate-300 bg-white rounded-md shadow-sm">
                             <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <div className="w-6 h-6 rounded border" style={{ backgroundColor: data.color || '#ffffff' }}></div>
                            </div>
                            <input
                                id="employeeColorCode"
                                type="text"
                                name="color"
                                value={data.color || ''}
                                onChange={handleInputChange}
                                className="w-full pl-1 py-2 border-l focus:outline-none focus:ring-0 border-transparent bg-transparent"
                                placeholder="#RRGGBB"
                            />
                            <input
                                id="employeeColor"
                                type="color"
                                value={data.color || '#ffffff'}
                                onChange={handleInputChange}
                                name="color"
                                className="absolute left-0 top-0 w-10 h-10 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>;
            case '고용':
                return (
                    <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-5">
                        <Input label="직급" name="position" value={data.position || ''} onChange={handleInputChange} placeholder="예: 파트타이머" />
                        <Input label="입사일" name="hireDate" type="date" value={data.hireDate || ''} onChange={handleInputChange} />
                        <div>
                            <label htmlFor="employmentTypeEdit" className="block text-sm font-medium text-slate-700 mb-1">고용 형태</label>
                            <select id="employmentTypeEdit" name="employmentType" value={data.employmentType || '아르바이트'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="정규">정규</option>
                                <option value="아르바이트">아르바이트</option>
                            </select>
                        </div>
                        {data.id && (
                            <div>
                                <label htmlFor="statusEdit" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                <select id="statusEdit" name="status" value={data.status || '재직'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="재직">재직</option>
                                    <option value="휴직">휴직</option>
                                    <option value="퇴사">퇴사</option>
                                </select>
                            </div>
                        )}
                        {data.id && data.status === '퇴사' && (
                            <div className="col-span-2">
                                <Textarea label="퇴사 사유" name="reasonForResignation" value={data.reasonForResignation || ''} onChange={handleInputChange} placeholder="퇴사 사유를 입력해주세요." />
                            </div>
                        )}
                    </div>
                );
            case '급여':
                return <>
                    <div>
                        <label htmlFor="payTypeEdit" className="block text-sm font-medium text-slate-700 mb-1">급여 형태</label>
                        <select id="payTypeEdit" name="payType" value={data.payType || '시급'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="시급">시급</option>
                            <option value="월급">월급</option>
                        </select>
                    </div>
                    <Input label="급여액(원)" name="payRate" type="number" value={data.payRate || ''} onChange={handleInputChange} placeholder="예: 12000"/>
                    <div className="col-span-2 grid grid-cols-5 gap-x-3">
                        <div className="col-span-2">
                             <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 mb-1">은행</label>
                             <select id="bankName" name="bankName" value={getBankName(data.accountNumber)} onChange={handleAccountChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                {KOREAN_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                             </select>
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="accountNumberOnly" className="block text-sm font-medium text-slate-700 mb-1">계좌번호</label>
                             <input 
                                id="accountNumberOnly"
                                name="accountNumberOnly"
                                type="text"
                                value={getAccountNumberOnly(data.accountNumber)}
                                onChange={handleAccountChange}
                                className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="숫자만 입력"
                            />
                            <p className="text-xs text-slate-500 mt-1">-를 제외하고 입력해주세요</p>
                        </div>
                    </div>
                </>;
            case '서류':
                return <div className="col-span-2 space-y-3">
                    {renderDocumentRow('근로계약서', 'contract', data.contract)}
                    {renderDocumentRow('통장사본', 'bankAccountCopy', data.bankAccountCopy)}
                </div>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <Tabs tabs={['기본', '고용', '급여', '서류']} activeTab={activeTab} onTabChange={onTabChange} />
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                {renderTabContent()}
            </div>
        </div>
    );
};


// Sub-components for AdminApp
const DashboardView = ({ onNavigate, newWorkers, employees }: {onNavigate: (page: string) => void, newWorkers: NewWorkerRequest[], employees: Employee[]}) => {
    const [modalState, setModalState] = useState({ isOpen: false, title: '', employees: [] as string[] });
    const [isAddWidgetModalOpen, setAddWidgetModalOpen] = useState(false);

    // Calculate attendance status
    const today = new Date().toISOString().split('T')[0]; // Using mock date for consistency with MOCK_ATTENDANCE
    const activeEmployees = employees.filter(emp => emp.status === '재직');
    const todaysAttendance = MOCK_ATTENDANCE.filter(att => att.date === '2024-08-10'); // Keep dashboard static for demo

    const workingEmployees: string[] = [];
    const breakEmployees: string[] = [];
    const doneEmployees: string[] = [];
    
    todaysAttendance.forEach(att => {
        const employee = activeEmployees.find(e => e.id === att.employeeId);
        if (!employee) return; // Skip if not an active employee (e.g., resigned)

        const name = employee.name;

        if (att.clockIn && !att.clockOut) {
            if (att.breakStart && !att.breakEnd) {
                breakEmployees.push(name);
            } else { 
                workingEmployees.push(name);
            }
        } 
        else if (att.clockIn && att.clockOut) {
            doneEmployees.push(name);
        }
    });

    // Calculate attendance issues dynamically
    const lateEmployees = todaysAttendance
        .filter(att => att.status === AttendanceStatus.LATE)
        .map(att => att.employeeName);

    const employeesWithAttendance = new Set(todaysAttendance.map(att => att.employeeId));
    const absentEmployees = activeEmployees
        .filter(emp => !employeesWithAttendance.has(emp.id))
        .map(emp => emp.name);
    
    const overtimeEmployees = todaysAttendance
        .filter(att => att.workHours > 8) // Assuming 8 hours is standard
        .map(att => att.employeeName);


    const calculateTodaysLaborCost = () => {
        const mockToday = '2024-08-10';
        const todaysAttendanceForCost = MOCK_ATTENDANCE.filter(att => att.date === mockToday);
        let totalCost = 0;

        todaysAttendanceForCost.forEach(att => {
            const employee = MOCK_EMPLOYEES_DATA.find(emp => emp.id === att.employeeId);
            if (employee) {
                if (employee.payType === '시급') {
                    totalCost += att.workHours * employee.payRate;
                } else if (employee.payType === '월급' && att.clockIn) {
                    // Assuming 30 days in a month for simplicity, only count if worked
                    totalCost += employee.payRate / 30;
                }
            }
        });
        return Math.round(totalCost);
    };
    
    const todaysLaborCost = calculateTodaysLaborCost();

    const handleStatusClick = (statusType: 'working' | 'break' | 'done' | 'late' | 'absent' | 'overtime') => {
        let title = '';
        let employees: string[] = [];

        switch (statusType) {
            case 'working':
                title = '출근 중인 근로자';
                employees = workingEmployees;
                break;
            case 'break':
                title = '휴게 중인 근로자';
                employees = breakEmployees;
                break;
            case 'done':
                title = '퇴근한 근로자';
                employees = doneEmployees;
                break;
            case 'late':
                title = '지각 근로자';
                employees = lateEmployees;
                break;
            case 'absent':
                title = '결근 근로자';
                employees = absentEmployees;
                break;
            case 'overtime':
                title = '초과근무 근로자';
                employees = overtimeEmployees;
                break;
        }

        setModalState({ isOpen: true, title, employees });
    };

    return (
        <>
            <div className="space-y-6 pb-20">
                <Card>
                    <h3 className="font-bold text-lg mb-4">현재 근태 현황 (2024-08-10 기준)</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <button onClick={() => handleStatusClick('working')} className="bg-green-50 p-4 rounded-lg hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">
                            <p className="text-sm text-slate-500">출근 <span role="img" aria-label="workers present">👥</span></p>
                            <p className="text-3xl font-bold text-green-600">{workingEmployees.length}</p>
                        </button>
                        <button onClick={() => handleStatusClick('break')} className="bg-yellow-50 p-4 rounded-lg hover:bg-yellow-100 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">
                            <p className="text-sm text-slate-500">휴게 <span role="img" aria-label="workers on break">⏰</span></p>
                            <p className="text-3xl font-bold text-yellow-600">{breakEmployees.length}</p>
                        </button>
                        <button onClick={() => handleStatusClick('done')} className="bg-slate-100 p-4 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
                            <p className="text-sm text-slate-500">퇴근 <span role="img" aria-label="workers off work">🚪</span></p>
                            <p className="text-3xl font-bold text-slate-600">{doneEmployees.length}</p>
                        </button>
                    </div>
                </Card>
                <Button onClick={() => onNavigate('employees')} className="w-full relative">신규 근로자 승인<span className="absolute top-0 right-0 -mt-2 -mr-2 px-2.5 py-1 bg-red-500 text-white text-xs rounded-full">{newWorkers.length}</span></Button>
                <Card>
                    <h3 className="font-bold text-lg mb-4">오늘의 근태 특이사항</h3>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <button onClick={() => handleStatusClick('late')} className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
                            <p className="text-sm text-slate-500">지각 <span role="img" aria-label="late">🏃💨</span></p>
                            <p className="text-3xl font-bold text-red-600">{lateEmployees.length}</p>
                        </button>
                        <button onClick={() => handleStatusClick('absent')} className="bg-slate-100 p-4 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
                            <p className="text-sm text-slate-500">결근 <span role="img" aria-label="absent">🤷</span></p>
                            <p className="text-3xl font-bold text-slate-600">{absentEmployees.length}</p>
                        </button>
                        <button onClick={() => handleStatusClick('overtime')} className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <p className="text-sm text-slate-500">초과근무 <span role="img" aria-label="overtime">💪</span></p>
                            <p className="text-3xl font-bold text-blue-600">{overtimeEmployees.length}</p>
                        </button>
                    </div>
                </Card>
                 <Card>
                    <h3 className="font-bold text-lg mb-2">오늘의 예상 인건비</h3>
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="text-4xl font-bold text-blue-600">{todaysLaborCost.toLocaleString()}<span className="text-2xl font-medium ml-1">원</span></p>
                            <p className="text-sm text-slate-500 mt-1">* 당일 근무기록 기반 예상 금액</p>
                        </div>
                        <span className="text-5xl" role="img" aria-label="money">💰</span>
                    </div>
                </Card>
            </div>
            
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
                <button
                    onClick={() => setAddWidgetModalOpen(true)}
                    className="bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="대시보드 위젯 추가"
                >
                    <span role="img" aria-hidden="true">➕</span>
                </button>
            </div>

            <Modal 
                isOpen={isAddWidgetModalOpen} 
                onClose={() => setAddWidgetModalOpen(false)} 
                title="대시보드에 추가하기"
                size="sm"
            >
                <p className="text-sm text-slate-500 mb-4">
                    추가하고 싶은 위젯을 선택하세요.
                </p>
                <ul className="space-y-2">
                    <li className="p-3 hover:bg-slate-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors" onClick={() => setAddWidgetModalOpen(false)}>
                        <span className="text-2xl" role="img" aria-hidden="true">📈</span>
                        <span className="font-medium">주간 근태 요약</span>
                    </li>
                    <li className="p-3 hover:bg-slate-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors" onClick={() => setAddWidgetModalOpen(false)}>
                        <span className="text-2xl" role="img" aria-hidden="true">🏖️</span>
                        <span className="font-medium">휴무 신청 현황</span>
                    </li>
                    <li className="p-3 hover:bg-slate-100 rounded-md cursor-pointer flex items-center gap-3 transition-colors" onClick={() => setAddWidgetModalOpen(false)}>
                        <span className="text-2xl" role="img" aria-hidden="true">📢</span>
                        <span className="font-medium">빠른 공지 보내기</span>
                    </li>
                </ul>
            </Modal>
             
            <Modal isOpen={modalState.isOpen} onClose={() => setModalState({ ...modalState, isOpen: false })} title={modalState.title}>
                <div className="flex flex-col">
                    {modalState.employees.length > 0 ? (
                        <ul className="divide-y divide-slate-200 max-h-60 overflow-y-auto mb-6">
                            {modalState.employees.map((name, index) => (
                                <li key={index} className="py-2 px-1">{name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 text-center py-4 mb-6">해당하는 근로자가 없습니다.</p>
                    )}
                    <div className="flex justify-end pt-4 border-t">
                        <Button onClick={() => setModalState({ ...modalState, isOpen: false })}>확인</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

const FilterDropdown: React.FC<{
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
        <div ref={dropdownRef} className="absolute z-20 top-full mt-1 left-0 w-40 bg-white rounded-md shadow-lg border">
            <ul className="max-h-48 overflow-y-auto">
                {options.map(option => (
                    <li key={option} className="px-3 py-2 text-sm hover:bg-slate-100">
                        <label className="flex items-center cursor-pointer font-normal">
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => onToggle(option)}
                                className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2">{option}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const EmployeeView = ({ newWorkers: initialNewWorkers, employees: initialEmployees, onDataChange, onEditEmployee }: { newWorkers: NewWorkerRequest[], employees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[], onDataChange: (data: { newWorkers: NewWorkerRequest[], employees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[] }) => void, onEditEmployee: (employeeId: number) => void }) => {
    const [activeTab, setActiveTab] = useState('신규 근로자 승인');
    const [isApprovalModalOpen, setApprovalModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<NewWorkerRequest | null>(null);
    const [approvalStep, setApprovalStep] = useState<'initial' | 'infoInput' | 'confirm'>('initial');
    const [newEmployeeData, setNewEmployeeData] = useState<EmployeeFormData>({});
    const [infoTab, setInfoTab] = useState('기본');
    const [showRejectionUI, setShowRejectionUI] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const [filters, setFilters] = useState<{ position: string[]; status: string[]; infoStatus: string[]; }>({
        position: [],
        status: [],
        infoStatus: [],
    });
    const [openFilter, setOpenFilter] = useState<keyof typeof filters | null>(null);

    const positionOptions = useMemo(() => [...new Set(initialEmployees.map(e => e.position))], [initialEmployees]);
    const statusOptions = ['재직', '휴직', '퇴사'];
    const infoOptions = ['정상', '미흡'];
    
    const handleFilterToggle = (filterKey: keyof typeof filters, option: string) => {
        setFilters(prev => {
            const currentFilter = prev[filterKey];
            const newFilter = currentFilter.includes(option)
                ? currentFilter.filter(item => item !== option)
                : [...currentFilter, option];
            return { ...prev, [filterKey]: newFilter };
        });
    };
    
    const filteredEmployees = useMemo(() => {
        return initialEmployees.filter(emp => {
            const positionMatch = filters.position.length === 0 || filters.position.includes(emp.position);
            const statusMatch = filters.status.length === 0 || filters.status.includes(emp.status);
            const infoStatusMatch = filters.infoStatus.length === 0 || filters.infoStatus.includes(emp.infoStatus);
            return positionMatch && statusMatch && infoStatusMatch;
        });
    }, [initialEmployees, filters]);

    const openApprovalModal = (req: NewWorkerRequest) => {
        setSelectedRequest(req);
        setNewEmployeeData({
            name: req.name,
            phone: req.phone,
            birthdate: req.birthdate,
            hireDate: new Date().toISOString().split('T')[0],
            status: '재직',
            employmentType: '아르바이트',
            payType: '시급',
            position: '파트타이머',
            payRate: 10000,
            accountNumber: '',
            contract: null,
            bankAccountCopy: null,
            color: getRandomColor(),
        });
        setApprovalStep('initial');
        setInfoTab('기본');
        setShowRejectionUI(false);
        setRejectionReason('');
        setApprovalModalOpen(true);
    };

    const closeApprovalModal = () => {
        setApprovalModalOpen(false);
        setSelectedRequest(null);
        setTimeout(() => {
            setApprovalStep('initial');
            setNewEmployeeData({});
        }, 300);
    };
    
    const handleFormChange = (field: keyof EmployeeFormData, value: any) => {
        setNewEmployeeData(prev => ({...prev, [field]: value}));
    };

    const handleRegisterEmployee = () => {
        if (!selectedRequest) return;

        const newEmployee: Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; } = {
            id: Math.max(...initialEmployees.map(e => e.id), 0) + 1,
            name: newEmployeeData.name || '',
            position: newEmployeeData.position || '직원',
            status: '재직',
            infoStatus: '정상',
            hireDate: newEmployeeData.hireDate || new Date().toISOString().split('T')[0],
            lastWorkDate: '',
            phone: newEmployeeData.phone || '',
            birthdate: newEmployeeData.birthdate || '',
            employmentType: newEmployeeData.employmentType || '아르바이트',
            payType: newEmployeeData.payType || '시급',
            payRate: Number(newEmployeeData.payRate) || 0,
            accountNumber: newEmployeeData.accountNumber || '',
            contract: newEmployeeData.contract || null,
            bankAccountCopy: newEmployeeData.bankAccountCopy || null,
            color: newEmployeeData.color || '#cccccc',
        };

        const updatedEmployees = [...initialEmployees, newEmployee];
        const updatedNewWorkers = initialNewWorkers.filter(req => req.id !== selectedRequest.id);
        
        onDataChange({ employees: updatedEmployees, newWorkers: updatedNewWorkers });
        closeApprovalModal();
    };

    const handleRejectEmployee = () => {
        if (!selectedRequest || !rejectionReason) return;
        console.log(`Rejecting ${selectedRequest.name} with reason: ${rejectionReason}`);
        const updatedNewWorkers = initialNewWorkers.filter(req => req.id !== selectedRequest.id);
        onDataChange({ employees: initialEmployees, newWorkers: updatedNewWorkers });
        closeApprovalModal();
    };

    const getModalTitle = () => {
        switch(approvalStep) {
            case 'infoInput': return '근로자 정보 입력';
            case 'confirm': return '등록 확인';
            default: return '신규 근로자 승인';
        }
    };
        
    const renderApprovalInitialStep = () => {
        if (!selectedRequest) return null;

        if (showRejectionUI) {
            return (
                <div className="space-y-4">
                    <p className="font-semibold">{selectedRequest.name}님의 신청을 반려하시겠습니까?</p>
                    <Textarea 
                        label="반려 사유 (필수)" 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="반려 사유를 정확하게 입력해주세요."
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <Button variant="secondary" onClick={() => setShowRejectionUI(false)}>뒤로</Button>
                        <Button variant="danger" onClick={handleRejectEmployee} disabled={!rejectionReason}>반려 확정</Button>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <p><strong>이름:</strong> {selectedRequest.name}</p>
                <p><strong>연락처:</strong> {selectedRequest.phone}</p>
                <p><strong>생년월일:</strong> {selectedRequest.birthdate}</p>
                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button variant="danger" onClick={() => setShowRejectionUI(true)}>반려</Button>
                    <Button variant="primary" onClick={() => setApprovalStep('infoInput')}>승인</Button>
                </div>
            </div>
        );
    };

    const FilterableHeader: React.FC<{ title: string, filterKey: keyof typeof filters, options: string[] }> = ({ title, filterKey, options }) => {
      const isActive = filters[filterKey].length > 0;
      return (
          <th className="p-2 relative">
              <button
                  onClick={(e) => { e.stopPropagation(); setOpenFilter(openFilter === filterKey ? null : filterKey);}}
                  className={`flex items-center gap-1 font-bold ${isActive ? 'text-blue-600' : ''}`}
              >
                  {title}
                  <span className="text-xs">▼</span>
              </button>
              {openFilter === filterKey && (
                  <FilterDropdown
                      options={options}
                      selected={filters[filterKey]}
                      onToggle={(option) => handleFilterToggle(filterKey, option)}
                      onClose={() => setOpenFilter(null)}
                  />
              )}
          </th>
      );
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">근로자 관리</h2>
            <Tabs tabs={['신규 근로자 승인', '근로자 리스트']} activeTab={activeTab} onTabChange={setActiveTab} />
            
            {activeTab === '신규 근로자 승인' && (
                <Card>
                    <ul className="divide-y divide-slate-200">
                    {initialNewWorkers.map(req => (
                        <li 
                            key={req.id} 
                            className="py-3 px-2 flex justify-between items-center cursor-pointer hover:bg-slate-50 rounded-md"
                            onClick={() => openApprovalModal(req)}
                        >
                            <div>
                                <p className="font-semibold">{req.name} <span className="text-sm font-normal text-slate-500">{req.phone}</span></p>
                                <p className="text-xs text-slate-500">신청일시: {req.requestedAt}</p>
                            </div>
                        </li>
                    ))}
                     {initialNewWorkers.length === 0 && <p className="text-center text-slate-500 py-4">신규 신청이 없습니다.</p>}
                    </ul>
                </Card>
            )}

            {activeTab === '근로자 리스트' && (
                <Card>
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b">
                                    <th className="p-2 font-bold">이름</th>
                                    <FilterableHeader title="직급" filterKey="position" options={positionOptions} />
                                    <FilterableHeader title="상태" filterKey="status" options={statusOptions} />
                                    <FilterableHeader title="정보" filterKey="infoStatus" options={infoOptions} />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map(emp => (
                                    <tr 
                                        key={emp.id} 
                                        className="border-b hover:bg-slate-50 cursor-pointer"
                                        onClick={() => onEditEmployee(emp.id)}
                                    >
                                        <td className="p-2 font-semibold flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: emp.color || '#cccccc' }}></span>
                                            {emp.name}
                                        </td>
                                        <td className="p-2">{emp.position}</td>
                                        <td className="p-2">
                                            {emp.status === '재직' ? <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">재직</span> : 
                                            emp.status === '휴직' ? <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">휴직</span> : 
                                            <span className="px-2 py-1 text-xs bg-slate-200 text-slate-600 rounded-full">퇴사</span>}
                                        </td>
                                        <td className="p-2">{emp.infoStatus === '미흡' ? <span className="text-red-500 font-bold">미흡</span> : '정상'}</td>
                                    </tr>
                                ))}
                                {filteredEmployees.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-slate-500 py-8">해당 조건의 근로자가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            <Modal isOpen={isApprovalModalOpen} onClose={closeApprovalModal} title={getModalTitle()} size="lg">
                {approvalStep === 'initial' && renderApprovalInitialStep()}

                {selectedRequest && approvalStep === 'infoInput' && <div className="space-y-4">
                     <EmployeeInfoForm 
                        data={newEmployeeData}
                        onDataChange={handleFormChange}
                        activeTab={infoTab}
                        onTabChange={setInfoTab}
                     />
                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <Button variant="secondary" onClick={() => setApprovalStep('initial')}>이전</Button>
                        <Button variant="primary" onClick={() => setApprovalStep('confirm')}>등록 완료</Button>
                    </div>
                </div>}

                {approvalStep === 'confirm' && <div className="space-y-4">
                    <p className="text-center"><strong>{newEmployeeData.name}</strong> 님을 근로자로 등록하시겠습니까?</p>
                    <p className="text-sm text-slate-500 bg-slate-100 p-3 rounded-md">입력된 정보는 등록 후 '근로자 리스트'에서 언제든지 수정할 수 있습니다.</p>
                     <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setApprovalStep('infoInput')}>취소</Button>
                        <Button variant="primary" onClick={handleRegisterEmployee}>확인</Button>
                    </div>
                </div>}
            </Modal>
        </div>
    );
};

const DatePicker = ({ currentDate, onDateSelect, onClose }: {
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

const AttendanceView = ({ employees, onEditEmployee }: { employees: Employee[], onEditEmployee: (employeeId: number) => void}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    const [selectedDateRecords, setSelectedDateRecords] = useState<AttendanceRecord[] | null>(null);
    const [recordForDetail, setRecordForDetail] = useState<AttendanceRecord | null>(null);
    const [isEditingAttendance, setIsEditingAttendance] = useState(false);
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    const employeeForDetail = recordForDetail ? employees.find(e => e.id === recordForDetail.employeeId) : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
                setIsYearPickerOpen(false);
            }
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const attendanceByDate = useMemo(() => {
        return MOCK_ATTENDANCE.reduce<Record<string, AttendanceRecord[]>>((acc, record) => {
            const date = record.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(record);
            return acc;
        }, {});
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
    
    const renderHeader = () => {
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

        const handleDayViewDateSelect = (date: Date) => {
            setCurrentDate(date);
            setIsDatePickerOpen(false);
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
                    ) : ( // Day view
                        <div className="relative">
                            <button onClick={() => setIsDatePickerOpen(p => !p)} className="text-xl font-bold text-center whitespace-nowrap px-2 py-1 rounded-md hover:bg-slate-100">
                                {`${year}년 ${month}월 ${day}일`}
                            </button>
                            {isDatePickerOpen && <DatePicker currentDate={currentDate} onDateSelect={handleDayViewDateSelect} onClose={() => setIsDatePickerOpen(false)} />}
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
                </div>
            </div>
        );
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
                    className={`border-r border-b p-1 min-h-[120px] transition-colors ${records.length > 0 ? 'cursor-pointer hover:bg-sky-50' : 'bg-slate-50'}`}
                    onClick={() => records.length > 0 && setSelectedDateRecords(records)}
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
        const dayRecords = MOCK_ATTENDANCE.filter(rec => rec.date === dateStr);

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

    return(
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">근태 관리</h2>
            <Card>
                {renderHeader()}
                {viewMode === 'month' ? renderMonthView() : renderDayView()}
            </Card>

            <Modal
                isOpen={!!selectedDateRecords}
                onClose={() => setSelectedDateRecords(null)}
                title={selectedDateRecords ? `${new Date(selectedDateRecords[0].date.replace(/-/g, '/')).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} 근무 현황` : ''}
                size="lg"
            >
                {selectedDateRecords && (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-white">
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3">이름</th>
                                    <th className="p-3">출근</th>
                                    <th className="p-3">퇴근</th>
                                    <th className="p-3">근무시간</th>
                                    <th className="p-3">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDateRecords.map(rec => (
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
                            <div className="flex justify-center gap-3 pt-4 mt-6 border-t">
                                <Button variant="secondary" onClick={() => { setRecordForDetail(null); onEditEmployee(employeeForDetail.id); }}>근로자 정보 수정</Button>
                                <Button variant="secondary" onClick={() => setIsEditingAttendance(true)}>근태 기록 수정</Button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); setIsEditingAttendance(false); /* Add save logic here */ }}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="출근 시간" name="clockIn" type="time" step="60" defaultValue={recordForDetail.clockIn || ''} />
                                <Input label="퇴근 시간" name="clockOut" type="time" step="60" defaultValue={recordForDetail.clockOut || ''} />
                                <Input label="휴게 시작" name="breakStart" type="time" step="60" defaultValue={recordForDetail.breakStart || ''} />
                                <Input label="휴게 종료" name="breakEnd" type="time" step="60" defaultValue={recordForDetail.breakEnd || ''} />
                                <div className="col-span-2">
                                     <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                     <select id="status" name="status" defaultValue={recordForDetail.status} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
        </div>
    );
};
const ScheduleView = ({ schedules, employees, onSchedulesChange }: { schedules: Schedule[], employees: Employee[], onSchedulesChange: (schedules: Schedule[]) => void }) => {
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
    const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const yearPickerRef = useRef<HTMLDivElement>(null);
    const monthPickerRef = useRef<HTMLDivElement>(null);

    // New states for detail modal and multi-select
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>([]);
    const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
    const [isEditScopeModalOpen, setIsEditScopeModalOpen] = useState(false);
    const [isConfirmBulkDeleteOpen, setIsConfirmBulkDeleteOpen] = useState(false);
    const longPressTimeout = useRef<number>();

    const activeEmployees = employees.filter(e => e.status === '재직');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (yearPickerRef.current && !yearPickerRef.current.contains(event.target as Node)) {
                setIsYearPickerOpen(false);
            }
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
                setIsMonthPickerOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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

    const renderHeader = () => {
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
        
        const handleDayViewDateSelect = (date: Date) => {
            setCurrentDate(date);
            setIsDatePickerOpen(false);
        };
    
        const yearRange = Array.from({ length: 11 }, (_, i) => year - 5 + i);
    
        return (
            <div className="space-y-3 mb-4">
                {/* Row 1: Date Navigation */}
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
                    ) : ( // Day view
                        <div className="relative">
                            <button onClick={() => setIsDatePickerOpen(p => !p)} className="text-xl font-bold text-center whitespace-nowrap px-2 py-1 rounded-md hover:bg-slate-100">
                                {`${year}년 ${month}월 ${day}일`}
                            </button>
                            {isDatePickerOpen && <DatePicker currentDate={currentDate} onDateSelect={handleDayViewDateSelect} onClose={() => setIsDatePickerOpen(false)} />}
                        </div>
                    )}
    
                    <Button onClick={() => handleDateChange(1)} size="sm" variant="secondary">▶</Button>
                </div>
    
                {/* Row 2: Actions */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-200 rounded-md p-0.5">
                            <Button onClick={() => setViewMode('month')} size="sm" variant={viewMode === 'month' ? 'primary' : 'secondary'} className={viewMode !== 'month' ? 'bg-transparent border-0 shadow-none' : ''}>월</Button>
                            <Button onClick={() => setViewMode('day')} size="sm" variant={viewMode === 'day' ? 'primary' : 'secondary'} className={viewMode !== 'day' ? 'bg-transparent border-0 shadow-none' : ''}>일</Button>
                        </div>
                        <Button onClick={() => setCurrentDate(new Date())} size="sm" variant="secondary">오늘</Button>
                    </div>
                    
                    <div>
                         <Button onClick={() => handleOpenModal()} size="md">스케줄 추가</Button>
                    </div>
                </div>
            </div>
        );
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
            {renderHeader()}
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
const QRView = () => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">QR 관리</h2>
        <Card className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold">매장 QR 코드</h3>
            <p className="text-slate-500 mb-4">근로자가 이 QR 코드를 스캔하여 출퇴근합니다.</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://example.com/worker/store-123" alt="QR Code" className="border p-2 rounded-lg" />
            <div className="flex gap-4 mt-6">
                <Button>PNG 다운로드</Button>
                <Button variant="secondary">PDF 다운로드</Button>
                <Button variant="danger">재발급</Button>
            </div>
        </Card>
    </div>
);

const SettingsView = () => {
    const Section: React.FC<{title: string, children: React.ReactNode, description?: string}> = ({title, children, description}) => (
        <Card>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-500 mb-4 pb-3 border-b">{description}</p>}
            <div className="space-y-4 pt-2">{children}</div>
        </Card>
    );

    const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
        <div className="flex items-center">
            <p className="w-24 font-semibold text-slate-600 shrink-0">{label}</p>
            <p className="text-slate-800">{value}</p>
        </div>
    );
    
    const Toggle: React.FC<{label: string, enabled: boolean}> = ({ label, enabled }) => {
        const [isEnabled, setIsEnabled] = useState(enabled);
        return (
            <div className="flex items-center justify-between py-1">
                <span className="text-slate-700">{label}</span>
                <button onClick={() => setIsEnabled(!isEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'}`} aria-label={label}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
        )
    };
    
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">설정</h2>

            <Section title="개인정보 설정" description="로그인된 관리자 계정 정보입니다.">
                <InfoRow label="이름" value="김관리" />
                <InfoRow label="아이디" value="admin" />
                <InfoRow label="이메일" value="admin@dot-attendance.com" />
                <div className="pt-2">
                    <Button variant="secondary" size="md">비밀번호 변경</Button>
                </div>
            </Section>

            <Section title="기본 설정" description="시스템의 기본 동작 방식을 설정합니다.">
                <div>
                    <label htmlFor="session-timeout" className="block text-sm font-medium text-slate-700">세션 만료 시간 (분)</label>
                    <input type="range" id="session-timeout" min="1" max="30" defaultValue="5" className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1 bg-white border border-slate-200
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-400"
                    />
                    <p className="text-center text-slate-600 text-sm">5 분</p>
                </div>
                 <div>
                    <label htmlFor="geofence" className="block text-sm font-medium text-slate-700">지오펜스 반경 (m)</label>
                    <input type="range" id="geofence" min="20" max="200" defaultValue="50" step="10" className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1 bg-white border border-slate-200
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-400"
                    />
                     <p className="text-center text-slate-600 text-sm">50 미터</p>
                </div>
            </Section>
            
            <Section title="알림 설정" description="중요 이벤트 발생 시 알림 수신 여부를 설정합니다.">
                <Toggle label="신규 근로자 신청" enabled={true} />
                <Toggle label="스케줄 변경/휴무 신청" enabled={true} />
                <Toggle label="근태 이상(지각/결근) 발생" enabled={false} />
            </Section>

            <Section title="사용자 설정" description="관리자 계정 및 권한을 관리합니다.">
                 <Button variant="secondary">신규 관리자 초대</Button>
            </Section>

             <Section title="기타 설정">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="font-medium text-slate-700">데이터 내보내기</p>
                    <div className="flex gap-2">
                        <Button variant="secondary">근태기록 (CSV)</Button>
                        <Button variant="secondary">급여정산 (Excel)</Button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                    <div className="">
                        <p className="font-medium text-red-600">계정 비활성화</p>
                        <p className="text-sm text-slate-500">모든 데이터가 보관되며, 언제든지 재활성화할 수 있습니다.</p>
                    </div>
                    <Button variant="danger">계정 비활성화</Button>
                </div>
             </Section>
        </div>
    )
};

const MOCK_ACCOUNTS = [
    { id: 'admin', password: 'password123', companyCode: 'DOT-001' },
    { id: 'master', password: 'masterpassword', companyCode: 'DOT-002' },
];

const AdminRegister = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        phone: '',
        id: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
    });
    const [passwordError, setPasswordError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password' || name === 'confirmPassword') {
            setPasswordError('');
        }
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 2) {
            const { password, confirmPassword } = formData;

            const hasLetters = /[a-zA-Z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;

            if (!isLongEnough || !hasLetters || !hasNumbers || !hasSymbols) {
                setPasswordError('비밀번호는 8자 이상이며, 영문, 숫자, 기호를 모두 포함해야 합니다.');
                return;
            }
            if (password !== confirmPassword) {
                setPasswordError('비밀번호가 일치하지 않습니다.');
                return;
            }
            setPasswordError('');
        }
        setStep(prev => prev + 1);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate registration
        console.log('Registering with data:', formData);
        setStep(4); // Go to completion step
        setTimeout(() => {
            onBackToLogin();
        }, 3000);
    };

    if (step === 4) {
        return (
            <div className="w-full max-w-sm text-center">
                <span className="text-6xl mb-4" role="img" aria-label="Success">✅</span>
                <h1 className="text-2xl font-bold mb-2">회원가입 완료</h1>
                <p className="text-slate-600">회원가입이 성공적으로 완료되었습니다.<br/>로그인 페이지로 이동합니다.</p>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-sm">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-blue-700">DOT ATTENDANCE</h1>
                <p className="text-lg text-slate-500">관리자 회원가입 ({step}/3)</p>
            </div>
            {step === 1 && (
                <form onSubmit={handleNext} className="space-y-4">
                    <h2 className="font-semibold text-center">개인정보 입력</h2>
                    <Input name="name" placeholder="이름" value={formData.name} onChange={handleInputChange} required />
                    <Input name="company" placeholder="회사명" value={formData.company} onChange={handleInputChange} required />
                    <Input name="phone" placeholder="연락처" type="tel" value={formData.phone} onChange={handleInputChange} required />
                    <Button type="submit" className="w-full">다음</Button>
                    <Button type="button" variant="secondary" className="w-full" onClick={onBackToLogin}>로그인으로 돌아가기</Button>
                </form>
            )}
            {step === 2 && (
                 <form onSubmit={handleNext} className="space-y-4">
                    <h2 className="font-semibold text-center">ID / PW 입력</h2>
                    <Input name="id" placeholder="아이디" value={formData.id} onChange={handleInputChange} required />
                    <div>
                        <Input 
                            name="password" 
                            placeholder="비밀번호" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            required 
                            aria-describedby="password-rules"
                        />
                         <p id="password-rules" className="text-xs text-slate-500 mt-1 px-1">
                            8자 이상, 영문, 숫자, 기호를 포함해야 합니다.
                        </p>
                    </div>
                    <Input 
                        name="confirmPassword" 
                        placeholder="비밀번호 확인" 
                        type="password" 
                        value={formData.confirmPassword} 
                        onChange={handleInputChange} 
                        required 
                    />
                    {passwordError && <p className="text-sm text-red-500 text-center -my-2">{passwordError}</p>}
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" className="w-full" onClick={() => setStep(1)}>이전</Button>
                        <Button type="submit" className="w-full">다음</Button>
                    </div>
                </form>
            )}
             {step === 3 && (
                 <form onSubmit={handleRegister} className="space-y-4">
                    <h2 className="font-semibold text-center">본인 인증</h2>
                    <p className="text-center text-sm text-slate-500">입력하신 연락처로 전송된<br/>인증번호 6자리를 입력해주세요.</p>
                    <Input name="verificationCode" placeholder="인증번호" value={formData.verificationCode} onChange={handleInputChange} required />
                     <div className="flex gap-2">
                        <Button type="button" variant="secondary" className="w-full" onClick={() => setStep(2)}>이전</Button>
                        <Button type="submit" className="w-full">회원가입 완료</Button>
                    </div>
                </form>
            )}
        </div>
    );
};


const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [isFindIdPwModalOpen, setFindIdPwModalOpen] = useState(false);
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [companyCode, setCompanyCode] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const idInputRef = useRef<HTMLDivElement>(null);

    const handleAccountSelect = (account: typeof MOCK_ACCOUNTS[0]) => {
        setId(account.id);
        setPassword(account.password);
        setCompanyCode(account.companyCode);
        setShowAutocomplete(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (idInputRef.current && !idInputRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredAccounts = MOCK_ACCOUNTS.filter(acc => acc.id.toLowerCase().startsWith(id.toLowerCase()));

    if (view === 'register') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <AdminRegister onBackToLogin={() => setView('login')} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 pb-24">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-700">DOT ATTENDANCE</h1>
                    <p className="text-lg text-slate-500">관리자</p>
                </div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                    <div className="relative" ref={idInputRef}>
                        <Input 
                            placeholder="ID" 
                            id="id" 
                            name="id" 
                            required 
                            autoComplete="off"
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value);
                                if (!showAutocomplete) setShowAutocomplete(true);
                            }}
                            onFocus={() => setShowAutocomplete(true)}
                        />
                        {showAutocomplete && filteredAccounts.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg">
                                <ul className="py-1 max-h-40 overflow-y-auto">
                                    {filteredAccounts.map(account => (
                                        <li 
                                            key={account.id} 
                                            className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                                            onClick={() => handleAccountSelect(account)}
                                            onMouseDown={(e) => e.preventDefault()} // Prevents onFocus from firing on input
                                        >
                                            {account.id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <Input 
                        placeholder="비밀번호" 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input 
                        placeholder="업체코드" 
                        id="companyCode" 
                        name="companyCode" 
                        required 
                        value={companyCode}
                        onChange={(e) => setCompanyCode(e.target.value)}
                    />
                    <Button type="submit" className="w-full">로그인</Button>
                </form>
                <div className="text-center mt-4 text-sm text-slate-600">
                    <button onClick={() => setView('register')} className="hover:underline">회원가입</button>
                    <span className="mx-2 text-slate-300">|</span>
                    <button onClick={() => setFindIdPwModalOpen(true)} className="hover:underline">
                        ID/PW찾기
                    </button>
                </div>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-300"></div>
                    <span className="flex-shrink mx-4 text-slate-500 text-sm">OR</span>
                    <div className="flex-grow border-t border-slate-300"></div>
                </div>

                <div className="flex justify-center gap-4">
                    <button aria-label="네이버로 로그인" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#03C75A] text-white font-bold text-xl shadow-md hover:opacity-90 transition-opacity">N</button>
                    
                    <button aria-label="구글로 로그인" className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 transition-colors">
                        <svg viewBox="0 0 48 48" className="w-6 h-6">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.816,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                    </button>

                    <button aria-label="카카오톡으로 로그인" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#FEE500] shadow-md hover:opacity-90 transition-opacity">
                        <svg viewBox="0 0 32 32" className="w-6 h-6">
                            <path d="M16 4.64c-6.96 0-12.64 4.48-12.64 10.08 0 3.52 2.32 6.64 5.76 8.48l-1.92 7.04 7.68-4.16c.4 0.08 0.8 0.08 1.12 0.08 6.96 0 12.64-4.48 12.64-10.08s-5.68-10.08-12.64-10.08z"></path>
                        </svg>
                    </button>

                    <button aria-label="토스로 로그인" className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0064FF] shadow-md hover:opacity-90 transition-opacity">
                        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.102 5.035c.582.404.978.96.978 1.708 0 .749-.396 1.304-.978 1.708l-5.12 3.556a.2.2 0 0 1-.252 0l-5.12-3.556C7.03 8.047 6.634 7.492 6.634 6.743c0-.748.396-1.304.978-1.708l5.12-3.556a.8.8 0 0 1 1.008 0l5.362 3.556zM5.9 12.231c-.582-.404-.978-.96-.978-1.708V9.456l.004-.01 2.228-1.548-.004.008c.582-.404.978-.96.978-1.708C9.132 5.45 8.736 4.895 8.154 4.5l-1.25.867.001.003L4.99 6.743c-1.357.943-2.28 2.28-2.28 3.86 0 1.58 2.364 3.498 2.364 3.498l.002.002.824-.572zm12.2 0l.824.572s2.364-1.918 2.364-3.498c0-1.58-.923-2.917-2.28-3.86L16.85 5.368l-1.25-.867c-.582.405-.978.96-.978 1.708 0 .749.396 1.304.978 1.708l2.224 1.548v1.067c0 .748-.396 1.304-.978 1.708L12 15.787l-1.425-1.018-.004.003L5.9 12.231v.002s-2.364 1.918-2.364 3.498c0 1.58.923 2.917 2.28 3.86l4.916 3.414a.8.8 0 0 0 1.008 0l4.916-3.414c1.357-.943 2.28-2.28 2.28-3.86 0-1.58-2.364-3.498-2.364-3.498z" fill="#fff"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <Modal 
                isOpen={isFindIdPwModalOpen} 
                onClose={() => setFindIdPwModalOpen(false)} 
                title="아이디/비밀번호 찾기"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-md">
                        계정 정보를 포함하여 아래 메일로 문의주시면 최대한 빠르게 답변드리겠습니다.
                    </p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setFindIdPwModalOpen(false);
                    }}>
                        <div className="space-y-4">
                            <Input 
                                label="받는 사람"
                                id="dev-email"
                                name="dev-email"
                                type="email"
                                value="developer@dot-attendance.com"
                                disabled
                                className="bg-slate-100"
                            />
                            <Input 
                                label="회신받을 메일 주소" 
                                id="find-email" 
                                name="email" 
                                type="email" 
                                required 
                                placeholder="example@company.com" 
                            />
                             <Textarea
                                label="문의 내용"
                                id="find-message"
                                name="message"
                                required
                                placeholder="가입 시 입력한 이름, 회사명, 연락처 등을 입력해주세요."
                            />
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="secondary" onClick={() => setFindIdPwModalOpen(false)}>취소</Button>
                                <Button type="submit">메일 보내기</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

const AppHeader = ({ onMenuClick, onTitleClick, isSidebarContext = false }: { onMenuClick: () => void, onTitleClick?: () => void, isSidebarContext?: boolean }) => (
    <div className={`flex items-center gap-4 ${isSidebarContext ? 'mb-4' : ''}`}>
        <button
            onClick={onMenuClick}
            className="text-2xl text-slate-600"
            aria-label={isSidebarContext ? "사이드바 닫기" : "메뉴 열기"}
        >
            <span role="img" aria-hidden="true">☰</span>
        </button>
        <h1 
            className={`text-xl font-bold text-blue-700 ${onTitleClick ? 'cursor-pointer' : ''}`}
            onClick={onTitleClick}
            onKeyDown={(e) => { if (onTitleClick && (e.key === 'Enter' || e.key === ' ')) onTitleClick(); }}
            role={onTitleClick ? 'button' : undefined}
            tabIndex={onTitleClick ? 0 : -1}
            aria-label={onTitleClick ? '대시보드로 이동' : undefined}
        >
            DOT ATTENDANCE
        </h1>
    </div>
);

const AdminApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const storeSwitcherRef = useRef<HTMLDivElement>(null);
    const [newWorkers, setNewWorkers] = useState(MOCK_NEW_WORKERS_DATA);
    const [employees, setEmployees] = useState<(Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[]>(MOCK_EMPLOYEES_DATA);
    const [schedules, setSchedules] = useState(MOCK_SCHEDULES_DATA);
    const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
    const [currentStore, setCurrentStore] = useState('햄부기 매장');

    // State for the global Employee Edit Modal
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editedEmployeeData, setEditedEmployeeData] = useState<EmployeeFormData | null>(null);
    const [editInfoTab, setEditInfoTab] = useState('기본');

    const MOCK_STORES = ['햄부기 매장', '피자이당', '치킨공주', '분식왕국'];

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentPage('dashboard');
    };

    const handleNavigate = useCallback((page: string) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    }, []);

    const handleDataChange = (data: { newWorkers: NewWorkerRequest[], employees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[] }) => {
        setNewWorkers(data.newWorkers);
        setEmployees(data.employees);
    };

     const handleSchedulesChange = (updatedSchedules: Schedule[]) => {
        setSchedules(updatedSchedules);
    };
    
    const handleOpenEditEmployeeModal = useCallback((employeeId: number) => {
        const employeeToEdit = employees.find(emp => emp.id === employeeId);
        if (employeeToEdit) {
            setEditedEmployeeData(JSON.parse(JSON.stringify(employeeToEdit))); // Deep copy for editing
            setEditInfoTab('기본'); // Reset to default tab
            setEditModalOpen(true);
        }
    }, [employees]);
    
    const handleEditedDataChange = (field: keyof EmployeeFormData, value: any) => {
        setEditedEmployeeData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedEmployeeData) return;
        setEmployees(prev => prev.map(emp => emp.id === editedEmployeeData.id ? editedEmployeeData as Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; } : emp));
        setEditModalOpen(false);
    };


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
            if (storeSwitcherRef.current && !storeSwitcherRef.current.contains(event.target as Node)) {
                setIsStoreSwitcherOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef, storeSwitcherRef]);

    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    const NavItem = ({ icon, label, pageName }: { icon: string, label: string, pageName: string }) => (
        <button 
            onClick={pageName === 'logout' ? handleLogout : () => handleNavigate(pageName)} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left transition-colors ${currentPage === pageName ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'}`}
        >
            <span className="w-5 text-center text-xl">{icon}</span>
            <span className="font-medium whitespace-nowrap">{label}</span>
        </button>
    );

    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard': return <DashboardView onNavigate={handleNavigate} newWorkers={newWorkers} employees={employees} />;
            case 'employees': return <EmployeeView newWorkers={newWorkers} employees={employees} onDataChange={handleDataChange} onEditEmployee={handleOpenEditEmployeeModal} />;
            case 'attendance': return <AttendanceView employees={employees} onEditEmployee={handleOpenEditEmployeeModal} />;
            case 'schedule': return <ScheduleView schedules={schedules} employees={employees} onSchedulesChange={handleSchedulesChange} />;
            case 'qr': return <QRView />;
            case 'settings': return <SettingsView />;
            default: return <DashboardView onNavigate={handleNavigate} newWorkers={newWorkers} employees={employees} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-40 z-20 transition-opacity"
                    aria-hidden="true"
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full z-30 w-64 bg-white p-4 flex flex-col justify-between border-r transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <AppHeader onMenuClick={() => setIsSidebarOpen(false)} isSidebarContext={true} />
                    <nav className="space-y-2">
                        <NavItem icon="📊" label="대시보드" pageName="dashboard" />
                        <NavItem icon="👥" label="근로자 관리" pageName="employees" />
                        <NavItem icon="⏰" label="근태 관리" pageName="attendance" />
                        <NavItem icon="📅" label="스케줄 관리" pageName="schedule" />
                        <NavItem icon="📲" label="QR 관리" pageName="qr" />
                        <NavItem icon="⚙️" label="설정" pageName="settings" />
                    </nav>
                </div>
                <div className="border-t pt-4 mt-4">
                    <NavItem icon="🚪" label="로그아웃" pageName="logout" />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col min-h-screen">
                <header className="bg-white border-b p-4 flex items-center sticky top-0 z-10">
                    <AppHeader onMenuClick={() => setIsSidebarOpen(true)} onTitleClick={() => handleNavigate('dashboard')} />
                    <div className="flex-grow"></div>
                    <div className="flex items-center gap-4">
                        <div className="relative" ref={notificationRef}>
                            <button onClick={() => setIsNotificationOpen(prev => !prev)} className="relative text-2xl text-slate-500 hover:text-slate-800">
                                🔔
                                {newWorkers.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                        {newWorkers.length}
                                    </span>
                                )}
                            </button>
                             <div className={`absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border transition-all duration-200 ease-out transform origin-top-right ${isNotificationOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <div className="p-3 border-b">
                                    <h4 className="font-semibold text-sm">알림</h4>
                                </div>
                                {newWorkers.length > 0 ? (
                                    <ul>
                                        {newWorkers.map(worker => (
                                            <li key={worker.id}
                                                onClick={() => {
                                                    handleNavigate('employees');
                                                    setIsNotificationOpen(false);
                                                }}
                                                className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0"
                                            >
                                                <p className="font-semibold text-slate-800">{worker.name}님</p>
                                                <p className="text-sm text-slate-600">신규 근로자 신청이 도착했습니다.</p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="p-4 text-center text-sm text-slate-500">새로운 알림이 없습니다.</p>
                                )}
                            </div>
                        </div>
                        <div className="relative" ref={storeSwitcherRef}>
                            <button
                                onClick={() => setIsStoreSwitcherOpen(prev => !prev)}
                                className="text-left w-full rounded-md p-1 -m-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-haspopup="true"
                                aria-expanded={isStoreSwitcherOpen}
                            >
                                <div>
                                    <p className="font-semibold text-sm truncate">{currentStore}</p>
                                    <p className="text-xs text-slate-500">관리자</p>
                                </div>
                            </button>
                            {isStoreSwitcherOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border" role="menu">

                                    <div className="p-2 border-b">
                                        <h4 className="font-semibold text-sm">매장 전환</h4>
                                    </div>
                                    <ul>
                                        {MOCK_STORES.filter(store => store !== currentStore).map(store => (
                                            <li key={store} role="none">
                                                <button
                                                    onClick={() => {
                                                        setCurrentStore(store);
                                                        setIsStoreSwitcherOpen(false);
                                                    }}
                                                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                                    role="menuitem"
                                                >
                                                    {store}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="flex-1 p-6">
                    {renderContent()}
                </div>
            </div>

            {/* Global Employee Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="근로자 정보 수정" size="lg">
                {editedEmployeeData && <form onSubmit={handleSaveEmployee} className="flex flex-col h-full">
                    <div className="flex-grow">
                        <EmployeeInfoForm 
                           data={editedEmployeeData}
                           onDataChange={handleEditedDataChange}
                           activeTab={editInfoTab}
                           onTabChange={setEditInfoTab}
                        />
                    </div>
                    <div className="flex-shrink-0 flex justify-end gap-3 pt-4 mt-6 border-t">
                        <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>취소</Button>
                        <Button type="submit" variant="primary">수정 완료</Button>
                    </div>
                </form>}
            </Modal>
        </div>
    );
};

export default AdminApp;