import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { EmployeeAppStatus, TimeOffRequest, RequestStatus } from '../types';
import { Button, Card, Input, Textarea } from '../components/ui';

// MOCK DATA
const MOCK_USER = { name: '김근로' };
const MOCK_SCHEDULE = { start: '10:00', end: '19:00', breakMinutes: 60 };
const MOCK_REQUESTS: TimeOffRequest[] = [
    { id: 1, type: '휴무 신청', date: '2024-08-15', details: '연차 사용', status: RequestStatus.APPROVED },
    { id: 2, type: '스케줄 변경', date: '2024-08-16', details: '11:00-20:00 변경 요청', status: RequestStatus.PENDING },
    { id: 3, type: '휴무 신청', date: '2024-08-05', details: '병가', status: RequestStatus.REJECTED, rejectionReason: '증빙 서류 미제출' },
];

const StatusBadge: React.FC<{ status: EmployeeAppStatus }> = ({ status }) => {
    const statusMap = {
        [EmployeeAppStatus.NONE]: { text: '업무 시작 전', color: 'bg-slate-500' },
        [EmployeeAppStatus.WORKING]: { text: '업무 중', color: 'bg-green-500' },
        [EmployeeAppStatus.BREAK]: { text: '휴게 중', color: 'bg-yellow-500' },
        [EmployeeAppStatus.AWAY]: { text: '외근 중', color: 'bg-blue-500' },
        [EmployeeAppStatus.DONE]: { text: '업무 종료', color: 'bg-gray-600' },
    };
    const { text, color } = statusMap[status];
    return <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${color}`}>{text}</span>;
};


const WorkerDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [status, setStatus] = useState<EmployeeAppStatus>(EmployeeAppStatus.NONE);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = (newStatus: EmployeeAppStatus, message: string) => {
        // Mock geofence/session check
        const isSessionValid = Math.random() > 0.1; // 90% success rate
        if(!isSessionValid) {
            showToast('세션이 만료되었습니다. QR을 다시 스캔해주세요.', 'error');
            return;
        }
        
        setStatus(newStatus);
        showToast(message);
    };

    const isWorking = status === EmployeeAppStatus.WORKING;
    const isBreak = status === EmployeeAppStatus.BREAK;
    const isNone = status === EmployeeAppStatus.NONE;
    const isDone = status === EmployeeAppStatus.DONE;
    const isAway = status === EmployeeAppStatus.AWAY;

    return (
        <div className="p-4 md:p-6 space-y-6">
            {toast && (
                <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} flex items-center gap-3`}>
                    {toast.type === 'success' ? '✅' : '⚠️'}
                    {toast.message}
                </div>
            )}
            <header className="text-center">
                <h1 className="text-2xl font-bold">{MOCK_USER.name}님, 안녕하세요!</h1>
                <p className="text-slate-500">{currentTime.toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-3xl font-mono font-bold mt-1">{currentTime.toLocaleTimeString('ko-KR')}</p>
            </header>

            <Card className="flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-3">현재 상태</h2>
                <StatusBadge status={status} />
            </Card>

            <Card>
                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => handleAction(EmployeeAppStatus.WORKING, `출근이 기록되었습니다 (${currentTime.toLocaleTimeString('ko-KR')}).`)} disabled={!isNone && !isDone}>출근</Button>
                    <Button onClick={() => handleAction(EmployeeAppStatus.BREAK, '휴게 시작')} disabled={!isWorking}>휴게시작</Button>
                    <Button onClick={() => handleAction(EmployeeAppStatus.WORKING, '휴게 종료')} disabled={!isBreak}>휴게종료</Button>
                    <Button onClick={() => handleAction(EmployeeAppStatus.DONE, '퇴근이 기록되었습니다.')} disabled={!isWorking}>퇴근</Button>
                    <Button variant="secondary" onClick={() => handleAction(isAway ? EmployeeAppStatus.WORKING : EmployeeAppStatus.AWAY, isAway ? '외근 종료' : '외근 시작')} className="col-span-2" disabled={isBreak || isDone || isNone}>{isAway ? '외근 종료' : '외근 시작'}</Button>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-3">오늘 스케줄</h2>
                <p className="text-base"><span className="font-semibold">예정 시간:</span> {MOCK_SCHEDULE.start} ~ {MOCK_SCHEDULE.end}</p>
                <p className="text-base"><span className="font-semibold">휴게 시간:</span> {MOCK_SCHEDULE.breakMinutes}분</p>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">신청</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <Input type="date" label="날짜 선택" />
                    <Input type="text" label="변경/휴무 내용" placeholder="예: 11시 출근 요청 / 연차 사용" />
                    <Textarea label="사유" placeholder="사유를 입력해주세요 (필수)"/>
                    <div className="flex gap-3">
                        <Button type="submit" className="flex-1">스케줄 변경 신청</Button>
                        <Button type="submit" className="flex-1" variant="secondary">휴무 신청</Button>
                    </div>
                </form>
            </Card>

            <Card>
                <h2 className="text-xl font-bold mb-4">신청 내역</h2>
                <ul className="space-y-3">
                    {MOCK_REQUESTS.map(req => (
                        <li key={req.id} className="p-3 bg-slate-100 rounded-md">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{req.type} ({req.date})</p>
                                    <p className="text-sm text-slate-600">{req.details}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${
                                    req.status === RequestStatus.APPROVED ? 'bg-green-500' :
                                    req.status === RequestStatus.PENDING ? 'bg-yellow-500' : 'bg-red-500'
                                }`}>{req.status}</span>
                            </div>
                            {req.status === RequestStatus.REJECTED && req.rejectionReason && (
                                <p className="text-sm text-red-600 mt-1 pl-1 border-l-2 border-red-500">사유: {req.rejectionReason}</p>
                            )}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

const WorkerRegister = ({ onRegisterSuccess }: { onRegisterSuccess: () => void }) => {
    const { storeId } = useParams();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onRegisterSuccess();
        }, 1500);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-2">신규 근로자 신청</h1>
            <p className="text-center text-slate-600 mb-6">업체코드: <span className="font-mono bg-slate-200 px-2 py-1 rounded">{storeId}</span></p>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="name" name="name" type="text" label="이름*" required placeholder="홍길동" />
                    <Input id="phone" name="phone" type="tel" label="전화번호*" required placeholder="010-1234-5678" />
                    <Input id="birthdate" name="birthdate" type="date" label="생년월일*" required />
                    <div className="flex items-start">
                        <input id="agree" name="agree" type="checkbox" required className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-1" />
                        <label htmlFor="agree" className="ml-2 block text-sm text-slate-900">개인정보 수집 및 이용에 동의합니다.</label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? '신청 중...' : '신청하기'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};


const WorkerApp = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    
    useEffect(() => {
        // Simulate checking local storage for a token
        const token = localStorage.getItem('worker-token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleRegisterSuccess = () => {
        setIsRegistered(true);
        // Simulate successful registration and admin approval
        setTimeout(() => {
             localStorage.setItem('worker-token', 'mock-token-value');
             setIsAuthenticated(true);
        }, 3000)
    };
    
    if (isAuthenticated) {
        return <WorkerDashboard />;
    }

    if (isRegistered) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
                <span className="text-6xl mb-4" role="img" aria-label="Success">✅</span>
                <h1 className="text-2xl font-bold mb-2">신청이 완료되었습니다.</h1>
                <p className="text-slate-600">관리자 승인 후 서비스 이용이 가능합니다.<br/>잠시만 기다려주세요.</p>
            </div>
        )
    }

    return <WorkerRegister onRegisterSuccess={handleRegisterSuccess} />;
};

export default WorkerApp;