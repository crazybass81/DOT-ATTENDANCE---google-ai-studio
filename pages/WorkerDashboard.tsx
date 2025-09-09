


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// FIX: Corrected relative import paths for nested file structure.
import { MOCK_EMPLOYEES_DATA } from '../data/mockData';
import { Employee, EmployeeAppStatus } from '../types';
import { Button, Card, Modal } from '../components/ui';
// FIX: Corrected import path for admin view components to use PascalCase 'Admin' and a correct relative path.
import { AttendanceView } from './Admin/AttendanceView';

const ActionButton = ({ status, onClick }: { status: 'none' | 'working' | 'break' | 'done' | 'away', onClick: (newStatus: EmployeeAppStatus) => void }) => {
    const config = {
        none: { text: '출근하기', icon: '💼', color: 'bg-green-600 hover:bg-green-700', action: EmployeeAppStatus.WORKING },
        working: { text: '업무 중', icon: '🧑‍💻', color: 'bg-blue-600', action: null },
        break: { text: '휴식 중', icon: '☕', color: 'bg-yellow-500', action: null },
        done: { text: '업무 종료', icon: '🎉', color: 'bg-slate-500', action: null },
        away: { text: '외근 중', icon: '🚗', color: 'bg-purple-600', action: null },
    };

    const { text, icon, color, action } = config[status];

    const handleClick = () => {
        if (action) {
            onClick(action);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!action}
            className={`w-48 h-48 rounded-full text-white flex flex-col items-center justify-center shadow-lg transition-transform duration-300 transform hover:scale-105 ${color} ${!action ? 'cursor-default hover:scale-100' : ''}`}
        >
            <span className="text-5xl" role="img" aria-hidden="true">{icon}</span>
            <span className="mt-2 text-xl font-bold">{text}</span>
        </button>
    );
};


const DashboardContent = ({ employee, status, workLog, onStatusChange }: {
    employee: Employee;
    status: EmployeeAppStatus;
    workLog: { label: string; time: string }[];
    onStatusChange: (newStatus: EmployeeAppStatus) => void;
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusText = () => {
        switch(status) {
            case EmployeeAppStatus.NONE: return '업무 시작 전';
            case EmployeeAppStatus.WORKING: return '업무 중';
            case EmployeeAppStatus.BREAK: return '휴식 중';
            case EmployeeAppStatus.DONE: return '업무 종료';
            case EmployeeAppStatus.AWAY: return '외근 중';
            default: return '알 수 없음';
        }
    };

    const renderActionButtons = () => {
        switch (status) {
            case EmployeeAppStatus.WORKING:
            case EmployeeAppStatus.AWAY:
                return (
                    <>
                        <Button onClick={() => onStatusChange(EmployeeAppStatus.BREAK)} className="w-full !bg-yellow-500 hover:!bg-yellow-600 text-lg py-3">휴식 시작</Button>
                        <Button onClick={() => onStatusChange(EmployeeAppStatus.DONE)} className="w-full !bg-red-600 hover:!bg-red-700 text-lg py-3">퇴근하기</Button>
                    </>
                );
            case EmployeeAppStatus.BREAK:
                 return <Button onClick={() => onStatusChange(EmployeeAppStatus.WORKING)} className="w-full !bg-blue-600 hover:!bg-blue-700 text-lg py-3">업무 복귀</Button>;
            default:
                return null;
        }
    };
    
    return (
        <div className="max-w-md mx-auto">
             <div className="space-y-6">
                <div className="text-center">
                    <p className="text-lg text-slate-600">{employee.name}님, 안녕하세요!</p>
                    <p className="text-2xl font-bold text-slate-800">{getStatusText()}</p>
                </div>
                
                <div className="flex justify-center items-center my-8">
                    <ActionButton status={status.toLowerCase() as 'none' | 'working' | 'break' | 'done' | 'away'} onClick={onStatusChange} />
                </div>

                <div className="space-y-3 px-4">
                    {renderActionButtons()}
                </div>

                <Card className="!mt-8">
                    <div className="text-center mb-4">
                        <p className="font-mono text-4xl tracking-widest font-bold text-slate-700">
                            {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                    </div>

                    {workLog.length > 0 && (
                        <div className="text-left border-t pt-4">
                            <h4 className="font-semibold mb-2">오늘의 기록</h4>
                            <ul className="text-sm space-y-1 text-slate-600 max-h-32 overflow-y-auto pr-2">
                                {workLog.slice().reverse().map((log, index) => (
                                    <li key={index} className="flex justify-between p-1.5 bg-slate-50 rounded-md">
                                        <span>{log.label}</span>
                                        <span className="font-mono">{log.time}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

const PlaceholderContent = ({ title }: { title: string }) => (
    <Card>
        <div className="text-center py-16">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-slate-500">준비 중인 기능입니다. 🏗️</p>
        </div>
    </Card>
);

const RecordContent = ({ onRecord, onClose }: { onRecord: (newStatus: EmployeeAppStatus, customLabel?: string) => void; onClose: () => void; }) => {
    const [confirmation, setConfirmation] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const handleRecord = (status: EmployeeAppStatus, message: string, customLabel?: string) => {
        onRecord(status, customLabel);
        setConfirmation(message);
        setTimeout(() => {
            setConfirmation('');
            onClose();
        }, 1500);
    };

    return (
        <div>
            <div className="text-center mb-4">
                <p className="font-mono text-4xl tracking-widest font-bold text-slate-700">
                    {currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
            </div>
            <p className="text-slate-500 mb-6 text-center">아래 버튼을 눌러 현재 시간을 기록하세요.</p>
            {confirmation && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md transition-opacity duration-300">
                    {confirmation}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => handleRecord(EmployeeAppStatus.WORKING, '출근 시간이 기록되었습니다.')} className="!py-4 !text-lg !bg-green-600 hover:!bg-green-700">💼 출근</Button>
                <Button onClick={() => handleRecord(EmployeeAppStatus.DONE, '퇴근 시간이 기록되었습니다.')} className="!py-4 !text-lg !bg-red-600 hover:!bg-red-700">🏠 퇴근</Button>
                <Button onClick={() => handleRecord(EmployeeAppStatus.BREAK, '휴게 시작 시간이 기록되었습니다.')} className="!py-4 !text-lg !bg-yellow-500 hover:!bg-yellow-600">☕ 휴게 시작</Button>
                <Button onClick={() => handleRecord(EmployeeAppStatus.NONE, '업무 복귀 시간이 기록되었습니다.')} className="!py-4 !text-lg !bg-blue-600 hover:!bg-blue-700">▶️ 업무 복귀</Button>
                <Button onClick={() => handleRecord(EmployeeAppStatus.AWAY, '외근 시작 시간이 기록되었습니다.')} className="!py-4 !text-lg !bg-purple-600 hover:!bg-purple-700">🚗 외근 시작</Button>
                <Button onClick={() => handleRecord(EmployeeAppStatus.NONE, '외근 복귀 시간이 기록되었습니다.', '외근 복귀')} className="!py-4 !text-lg !bg-teal-600 hover:!bg-teal-700">🏢 외근 종료</Button>
            </div>
        </div>
    );
};

const WorkerDashboard = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [switchedFromAdmin, setSwitchedFromAdmin] = useState(false);
    
    const [status, setStatus] = useState<EmployeeAppStatus>(EmployeeAppStatus.NONE);
    const [workLog, setWorkLog] = useState<{ label: string; time: string }[]>([]);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    useEffect(() => {
        const employeeId = localStorage.getItem('loggedInEmployeeId');
        if (!employeeId) {
            navigate(`/worker/${storeId}`);
            return;
        }

        const foundEmployee = MOCK_EMPLOYEES_DATA.find(emp => emp.id === parseInt(employeeId, 10));
        if (foundEmployee) {
            setEmployee(foundEmployee);
        } else {
            localStorage.removeItem('loggedInEmployeeId');
            navigate(`/worker/${storeId}`);
        }
        
        const adminData = localStorage.getItem('switchedFromAdmin');
        if(adminData) {
            setSwitchedFromAdmin(true);
        }
    }, [storeId, navigate]);
    
    const handleStatusChange = (newStatus: EmployeeAppStatus, customLabel?: string) => {
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let label = customLabel || '';

        if (newStatus === EmployeeAppStatus.NONE) {
             label = customLabel || '업무 복귀';
             setStatus(EmployeeAppStatus.WORKING);
             setWorkLog(prev => [...prev, { label, time }]);
             return;
        }

        if (!label) {
            switch(newStatus) {
                case EmployeeAppStatus.WORKING: label = '출근'; break;
                case EmployeeAppStatus.BREAK: label = '휴식 시작'; break;
                case EmployeeAppStatus.DONE: label = '퇴근'; break;
                case EmployeeAppStatus.AWAY: label = '외근 시작'; break;
            }
        }
        
        setStatus(newStatus);
        setWorkLog(prev => [...prev, { label, time }]);
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInEmployeeId');
        localStorage.removeItem('switchedFromAdmin');
        navigate(`/`);
    };

    const handleSwitchToAdmin = () => {
        const adminData = localStorage.getItem('switchedFromAdmin');
        if (adminData) {
            localStorage.setItem('loggedInAdmin', adminData);
            localStorage.removeItem('loggedInEmployeeId');
            localStorage.removeItem('switchedFromAdmin');
            navigate('/admin');
        }
    };
    
    const handleNavigate = (page: string) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    };

     const NavItem = ({ icon, label, pageName }: { icon: string, label: string, pageName: string }) => (
         <button 
            onClick={pageName === 'logout' ? handleLogout : () => handleNavigate(pageName)} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md w-full text-left transition-colors ${currentPage === pageName ? 'bg-red-600 text-white' : 'hover:bg-slate-200'}`}
        >
            <span className="w-5 text-center text-xl">{icon}</span>
            <span className="font-medium whitespace-nowrap">{label}</span>
        </button>
    );

     const renderContent = () => {
        if (!employee) return null;
        switch (currentPage) {
            case 'dashboard': return <DashboardContent employee={employee} status={status} workLog={workLog} onStatusChange={handleStatusChange} />;
            case 'schedule': return <PlaceholderContent title="스케줄 확인" />;
            case 'attendance': return (
                <AttendanceView
                    employees={employee ? [employee] : []}
                    attendance={[]}
                    onEditEmployee={() => {}}
                    onUpdateAttendance={() => {}}
                    onAddAttendance={() => {}}
                    onDeleteAttendance={() => {}}
                    isWorker={true}
                />
            );
            case 'paystub': return <PlaceholderContent title="급여 명세서" />;
            case 'profile': return <PlaceholderContent title="내 정보" />;
            case 'settings': return <PlaceholderContent title="환경 설정" />;
            default: return <DashboardContent employee={employee} status={status} workLog={workLog} onStatusChange={handleStatusChange} />;
        }
    };
    
    if (!employee) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <p>로딩 중...</p>
            </div>
        );
    }

    const pageTitles: { [key: string]: string } = {
        'dashboard': '대시보드',
        'schedule': '스케줄 확인',
        'attendance': '근태 확인',
        'paystub': '급여 명세서',
        'profile': '내 정보',
        'settings': '환경 설정',
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-40 z-20 transition-opacity"
                    aria-hidden="true"
                ></div>
            )}

            <aside className={`fixed top-0 left-0 h-full z-30 w-64 bg-white p-4 flex flex-col justify-between border-r transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="text-2xl text-slate-600"
                            aria-label="사이드바 닫기"
                        >
                            <span role="img" aria-hidden="true">☰</span>
                        </button>
                        <h1 className="text-xl font-bold text-red-700">DOT ATTENDANCE</h1>
                    </div>
                    <nav className="space-y-2">
                        <NavItem icon="🏠" label="대시보드" pageName="dashboard" />
                        <NavItem icon="📅" label="스케줄 확인" pageName="schedule" />
                        <NavItem icon="⏰" label="근태 확인" pageName="attendance" />
                        <NavItem icon="💰" label="급여 명세서" pageName="paystub" />
                        <NavItem icon="👤" label="내 정보" pageName="profile" />
                        <NavItem icon="⚙️" label="환경 설정" pageName="settings" />
                    </nav>
                </div>
                <div className="border-t pt-4 mt-4">
                    <NavItem icon="🚪" label="로그아웃" pageName="logout" />
                </div>
            </aside>
            
            <div className="flex flex-col min-h-screen">
                <header className="bg-white border-b p-4 flex items-center sticky top-0 z-10">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-2xl text-slate-600 mr-4">
                        <span role="img" aria-hidden="true">☰</span>
                    </button>
                    <h1 className="text-xl font-bold text-red-700">DOT ATTENDANCE</h1>
                    <div className="flex-grow"></div>
                    <div className="text-sm text-right">
                        <p className="font-semibold">{employee.name}님</p>
                        <p className="text-xs text-slate-500">{employee.position}</p>
                    </div>
                </header>
                <main className="flex-1 p-6">
                    <h2 className="text-2xl font-bold mb-4">
                       {pageTitles[currentPage]}
                    </h2>
                    {renderContent()}
                </main>
            </div>
            
            <Modal
                isOpen={isRecordModalOpen}
                onClose={() => setIsRecordModalOpen(false)}
                title="근태 기록하기"
                size="sm"
                titleAlign="center"
            >
                <RecordContent onRecord={handleStatusChange} onClose={() => setIsRecordModalOpen(false)} />
            </Modal>

            {switchedFromAdmin && employee && employee.id === 101 && (
                <button
                    onClick={handleSwitchToAdmin}
                    className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white w-28 h-14 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="관리자 모드로 복귀"
                >
                    <span role="img" aria-hidden="true" className="mr-2 text-lg">🔄</span>
                    관리자 모드
                </button>
            )}
             <button
                onClick={() => setIsRecordModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="근태 기록하기"
            >
                <span role="img" aria-hidden="true">✏️</span>
            </button>
        </div>
    );
};

export default WorkerDashboard;
