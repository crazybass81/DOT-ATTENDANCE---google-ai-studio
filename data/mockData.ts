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
];

// MOCK DATA
export const MOCK_NEW_WORKERS_DATA: NewWorkerRequest[] = [
    { id: 1, name: '박신규', phone: '010-1111-2222', birthdate: '1998-05-15', requestedAt: '2024-08-10 09:30' },
    { id: 2, name: '최지원', phone: '010-3333-4444', birthdate: '2001-11-20', requestedAt: '2024-08-10 14:00' },
];

export const MOCK_EMPLOYEES_DATA: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[] = [
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

export const MOCK_ATTENDANCE: AttendanceRecord[] = [];