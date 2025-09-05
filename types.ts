
export enum EmployeeAppStatus {
    NONE = 'NONE',
    WORKING = 'WORKING',
    BREAK = 'BREAK',
    DONE = 'DONE',
    AWAY = 'AWAY',
}

export enum AttendanceStatus {
    NORMAL = '정상',
    LATE = '지각',
    ABSENT = '결근',
    EARLY_LEAVE = '조퇴'
}

export enum RequestStatus {
    PENDING = '대기',
    APPROVED = '승인',
    REJECTED = '반려'
}

export interface NewWorkerRequest {
    id: number;
    name: string;
    phone: string;
    birthdate: string;
    requestedAt: string;
}

export interface Employee {
    id: number;
    name: string;
    position: string;
    status: '재직' | '휴직' | '퇴사';
    infoStatus: '정상' | '미흡';
    hireDate: string;
    lastWorkDate: string;
    phone: string;
    birthdate: string;
    employmentType: '정규' | '아르바이트';
    payType: '시급' | '월급';
    payRate: number;
    color?: string;
    reasonForResignation?: string;
    storeId?: string;
    jobType?: string;
}

export interface AttendanceRecord {
    id: number;
    employeeId: number;
    employeeName: string;
    date: string;
    clockIn: string | null;
    breakStart: string | null;
    breakEnd: string | null;
    clockOut: string | null;
    workHours: number;
    status: AttendanceStatus;
    isModified: boolean;
}

export interface Schedule {
    id: number;
    employeeId: number;
    employeeName: string;
    start: Date;
    end: Date;
    breakMinutes: number;
    storeId: string;
}

export interface TimeOffRequest {
    id: number;
    type: '스케줄 변경' | '휴무 신청';
    date: string;
    details: string;
    status: RequestStatus;
    rejectionReason?: string;
}