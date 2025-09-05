import { NewWorkerRequest, Employee, AttendanceRecord, AttendanceStatus, Schedule } from '../types';

export const STORE_DATA = [
    { companyCode: 'DOT-002', name: '햄부기 매장', storeId: 'sample-store' },
    { companyCode: 'DOT-002', name: '피자이당', storeId: 'pizza-store' },
    { companyCode: 'DOT-002', name: '치킨공주', storeId: 'chicken-store' },
    { companyCode: 'DOT-BUNSIK', name: '분식왕국', storeId: 'bunsik-store' },
    { companyCode: 'DOT-JOKBAL', name: '족발왕자', storeId: 'jokbal-store' },
];

export const MOCK_ACCOUNTS = [
    { id: 'admin', password: 'password', companyCode: 'DOT-002' },
    { id: 'bunsik-admin', password: 'password', companyCode: 'DOT-BUNSIK' },
    { id: 'jokbal-admin', password: 'password', companyCode: 'DOT-JOKBAL' },
];

// MOCK DATA
export const MOCK_NEW_WORKERS_DATA: NewWorkerRequest[] = [
    { id: 1, name: '박신규', phone: '010-1111-2222', birthdate: '1998-05-15', requestedAt: '2024-08-10 09:30' },
    { id: 2, name: '최지원', phone: '010-3333-4444', birthdate: '2001-11-20', requestedAt: '2024-08-10 14:00' },
];

export const MOCK_EMPLOYEES_DATA: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[] = [
    { id: 101, name: '김성실', position: '매니저', status: '재직', infoStatus: '정상', hireDate: '2023-01-15', lastWorkDate: '2024-08-10', phone: '010-1234-5678', birthdate: '1995-02-20', employmentType: '정규', payType: '월급', payRate: 3500000, accountNumber: '국민 111-222-333333', contract: '근로계약서_김성실.pdf', bankAccountCopy: '통장사본_김성실.jpg', color: '#3b82f6', storeId: 'bunsik-store', jobType: '분식' },
    { id: 102, name: '이근면', position: '정직원', status: '재직', infoStatus: '정상', hireDate: '2023-06-01', lastWorkDate: '2024-08-10', phone: '010-9876-5432', birthdate: '1999-07-07', employmentType: '정규', payType: '월급', payRate: 3000000, accountNumber: '신한 444-555-666666', contract: null, bankAccountCopy: '통장사본_이근면.pdf', color: '#10b981', storeId: 'sample-store', jobType: '양식' },
    { id: 103, name: '최알바', position: '파트타이머', status: '재직', infoStatus: '미흡', hireDate: '2024-03-10', lastWorkDate: '2024-08-09', phone: '010-5555-6666', birthdate: '2002-12-25', employmentType: '아르바이트', payType: '시급', payRate: 12000, accountNumber: '', contract: null, bankAccountCopy: null, color: '#f59e0b', storeId: 'sample-store', jobType: '양식' },
    { id: 104, name: '정퇴사', position: '정직원', status: '퇴사', infoStatus: '정상', hireDate: '2022-08-01', lastWorkDate: '2024-07-31', phone: '010-0000-0000', birthdate: '1993-10-10', employmentType: '정규', payType: '월급', payRate: 3200000, accountNumber: '우리 777-888-999999', contract: '근로계약서_정퇴사.pdf', bankAccountCopy: '통장사본_정퇴사.jpg', color: '#6b7280', reasonForResignation: '개인 사유', storeId: 'sample-store', jobType: '양식' },
    { id: 105, name: '박성실', position: '정직원', status: '재직', infoStatus: '정상', hireDate: '2024-01-01', lastWorkDate: '2024-08-10', phone: '010-1111-1111', birthdate: '1997-03-03', employmentType: '정규', payType: '월급', payRate: 2800000, accountNumber: '하나 123-456-789012', contract: '근로계약서_박성실.pdf', bankAccountCopy: null, color: '#8b5cf6', storeId: 'sample-store', jobType: '양식' },
    { id: 106, name: '오휴직', position: '정직원', status: '휴직', infoStatus: '정상', hireDate: '2021-09-01', lastWorkDate: '2024-05-31', phone: '010-2222-2222', birthdate: '1996-08-15', employmentType: '정규', payType: '월급', payRate: 3100000, accountNumber: '농협 321-654-987012', contract: '근로계약서_오휴직.pdf', bankAccountCopy: '통장사본_오휴직.jpg', color: '#ef4444', storeId: 'sample-store', jobType: '양식' },
    { id: 107, name: '나순대', position: '파트타이머', status: '재직', infoStatus: '정상', hireDate: '2024-05-20', lastWorkDate: '2024-08-10', phone: '010-3333-3333', birthdate: '2003-04-04', employmentType: '아르바이트', payType: '시급', payRate: 11000, accountNumber: '카카오뱅크 3333-01-123456', contract: null, bankAccountCopy: null, color: '#f97316', storeId: 'bunsik-store', jobType: '분식' },
    { id: 108, name: '김성심', position: '정직원', status: '재직', infoStatus: '정상', hireDate: '2024-06-01', lastWorkDate: '2024-08-10', phone: '010-4321-8765', birthdate: '1996-03-15', employmentType: '정규', payType: '월급', payRate: 2900000, accountNumber: '신한 123-456-789012', contract: null, bankAccountCopy: null, color: '#a855f7', storeId: 'bunsik-store', jobType: '분식' },
    { id: 109, name: '김성순', position: '파트타이머', status: '재직', infoStatus: '미흡', hireDate: '2024-07-15', lastWorkDate: '2024-08-10', phone: '010-5555-1234', birthdate: '2001-08-20', employmentType: '아르바이트', payType: '시급', payRate: 11500, accountNumber: '', contract: null, bankAccountCopy: null, color: '#ec4899', storeId: 'bunsik-store', jobType: '분식' },
];

export const MOCK_SCHEDULES_DATA: Schedule[] = [
    // 김성실 (bunsik-store)
    { id: 201, employeeId: 101, employeeName: '김성실', start: new Date('2024-08-10T09:00:00'), end: new Date('2024-08-10T18:00:00'), breakMinutes: 60, storeId: 'bunsik-store' },
    { id: 202, employeeId: 101, employeeName: '김성실', start: new Date('2024-08-11T09:00:00'), end: new Date('2024-08-11T18:00:00'), breakMinutes: 60, storeId: 'bunsik-store' },
    // 이근면 (sample-store)
    { id: 203, employeeId: 102, employeeName: '이근면', start: new Date('2024-08-10T10:00:00'), end: new Date('2024-08-10T19:00:00'), breakMinutes: 60, storeId: 'sample-store' },
    // 최알바 (sample-store)
    { id: 204, employeeId: 103, employeeName: '최알바', start: new Date('2024-08-10T12:00:00'), end: new Date('2024-08-10T17:00:00'), breakMinutes: 30, storeId: 'sample-store' },
    // 박성실 (sample-store)
    { id: 205, employeeId: 105, employeeName: '박성실', start: new Date('2024-08-10T08:30:00'), end: new Date('2024-08-10T17:30:00'), breakMinutes: 60, storeId: 'sample-store' },
    // 나순대 (bunsik-store)
    { id: 206, employeeId: 107, employeeName: '나순대', start: new Date('2024-08-10T11:00:00'), end: new Date('2024-08-10T20:00:00'), breakMinutes: 60, storeId: 'bunsik-store' },
    { id: 207, employeeId: 107, employeeName: '나순대', start: new Date('2024-08-12T11:00:00'), end: new Date('2024-08-12T20:00:00'), breakMinutes: 60, storeId: 'bunsik-store' },
];

const calculateWorkHours = (clockIn: string | null, clockOut: string | null, breakStart: string | null, breakEnd: string | null): number => {
    if (!clockIn || !clockOut) return 0;
    
    try {
        const start = new Date(`1970-01-01T${clockIn}:00`);
        const end = new Date(`1970-01-01T${clockOut}:00`);
        let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        
        if (breakStart && breakEnd) {
            const breakS = new Date(`1970-01-01T${breakStart}:00`);
            const breakE = new Date(`1970-01-01T${breakEnd}:00`);
            if (breakE > breakS) {
                diff -= (breakE.getTime() - breakS.getTime()) / (1000 * 60 * 60);
            }
        }
        return parseFloat(Math.max(0, diff).toFixed(1));
    } catch (e) {
        return 0;
    }
};

const generateMockAttendance = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    let idCounter = 301;
    const activeEmployees = MOCK_EMPLOYEES_DATA.filter(e => e.status === '재직');

    const startDate = new Date('2024-08-01T00:00:00Z');
    const endDate = new Date('2024-08-10T00:00:00Z');
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const randomTime = (baseHour: number, rangeMinutes: number) => {
        const randomMinutes = Math.floor(Math.random() * rangeMinutes) - (rangeMinutes / 2);
        const date = new Date();
        date.setHours(baseHour, randomMinutes, 0, 0);
        return date.toTimeString().substring(0, 5);
    };

    for (const employee of activeEmployees) {
        const isPartTimer = employee.employmentType === '아르바이트';
        const baseStartHour = isPartTimer ? (employee.id === 103 ? 12 : 11) : (employee.id === 105 ? 8.5 : 9);
        const baseWorkDuration = isPartTimer ? 5 : 8;
        const hasBreak = baseWorkDuration >= 6;

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

            if (!isPartTimer && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
            if (isPartTimer && dayOfWeek === 0) continue; 
            if (Math.random() < 0.05) continue; // Random absenteeism

            const date = formatDate(d);
            
            const lateChance = Math.random();
            let clockIn: string;
            let status = AttendanceStatus.NORMAL;

            if (lateChance < 0.15) { // 15% chance to be late
                const lateMinutes = 5 + Math.floor(Math.random() * 25); // 5 to 30 mins late
                const clockInDate = new Date(`${date}T00:00:00`);
                clockInDate.setHours(baseStartHour, lateMinutes);
                clockIn = clockInDate.toTimeString().substring(0, 5);
                status = AttendanceStatus.LATE;
            } else {
                const earlyMinutes = Math.floor(Math.random() * 15); // up to 15 mins early
                const clockInDate = new Date(`${date}T00:00:00`);
                clockInDate.setHours(baseStartHour, -earlyMinutes);
                clockIn = clockInDate.toTimeString().substring(0, 5);
            }

            const clockOutDate = new Date(`${date}T${clockIn}`);
            clockOutDate.setHours(clockOutDate.getHours() + baseWorkDuration + (hasBreak ? 1 : 0));
            clockOutDate.setMinutes(clockOutDate.getMinutes() + Math.floor(Math.random() * 15)); // Clock out a bit late
            const clockOut = clockOutDate.toTimeString().substring(0, 5);

            let breakStart: string | null = null;
            let breakEnd: string | null = null;
            if (hasBreak) {
                const breakStartDate = new Date(`${date}T${clockIn}`);
                breakStartDate.setHours(breakStartDate.getHours() + 3.5 + (Math.random() * 1));
                breakStart = breakStartDate.toTimeString().substring(0, 5);
                const breakEndDate = new Date(breakStartDate);
                breakEndDate.setHours(breakEndDate.getHours() + 1);
                breakEnd = breakEndDate.toTimeString().substring(0, 5);
            }
            
            let finalClockOut: string | null = clockOut;
            if (date === '2024-08-10' && employee.id === 105) { // 박성실 is still working
                finalClockOut = null;
            }

            const workHours = calculateWorkHours(clockIn, finalClockOut, breakStart, breakEnd);
            
            records.push({
                id: idCounter++,
                employeeId: employee.id,
                employeeName: employee.name,
                date,
                clockIn,
                breakStart,
                breakEnd,
                clockOut: finalClockOut,
                workHours,
                status,
                isModified: status === AttendanceStatus.LATE,
            });
        }
    }
    return records;
};


export const MOCK_ATTENDANCE: AttendanceRecord[] = generateMockAttendance();
