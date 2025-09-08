
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_EMPLOYEES_DATA, MOCK_SCHEDULES_DATA } from '../../data/mockData';
import { Employee, EmployeeAppStatus, Schedule } from '../../types';
import { Button, Card, Tabs, Modal } from '../../components/ui';
import { CalendarHeader } from '../../components/admin/CalendarHeader';
import { getTextColorForBackground } from '../../utils';

const ActionButton = ({ status, onClick }: { status: 'none' | 'working' | 'break' | 'done', onClick: (newStatus: EmployeeAppStatus) => void }) => {
    const config = {
        none: { text: '출근하기', icon: '💼', color: 'bg-green-600 hover:bg-green-700', action: EmployeeAppStatus.WORKING },
        working: { text: '업무 중', icon: '🧑‍💻', color: 'bg-blue-600', action: null },
        break: { text: '휴식 중', icon: '☕', color: 'bg-yellow-500', action: null },
        done: { text: '업무 종료', icon: '🎉', color: 'bg-slate-500', action: null },
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


const DashboardContent = ({ employee }: { employee: Employee }) => {
    const [status, setStatus] = useState<EmployeeAppStatus>(EmployeeAppStatus.NONE);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [workLog, setWorkLog] = useState<{ label: string; time: string }[]>([]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

     const handleStatusChange = (newStatus: EmployeeAppStatus) => {
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let label = '';
        switch(newStatus) {
            case EmployeeAppStatus.WORKING: label = '출근'; break;
            case EmployeeAppStatus.BREAK: label = '휴식 시작'; break;
            case EmployeeAppStatus.DONE: label = '퇴근'; break;
            case EmployeeAppStatus.NONE: // Special case for coming back from break
                 label = '업무 복귀';
                 setStatus(EmployeeAppStatus.WORKING);
                 setWorkLog(prev => [...prev, { label, time }]);
                 return;
        }
        setStatus(newStatus);
        setWorkLog(prev => [...prev, { label, time }]);
    };

    const getStatusText = () => {
        switch(status) {
            case EmployeeAppStatus.NONE: return '업무 시작 전';
            case EmployeeAppStatus.WORKING: return '업무 중';
            case EmployeeAppStatus.BREAK: return '휴식 중';
            case EmployeeAppStatus.DONE: return '업무 종료';
            default: return '알 수 없음';
        }
    };

    const renderActionButtons = () => {
        switch (status) {
            case EmployeeAppStatus.WORKING:
                return (
                    <>
                        <Button onClick={() => handleStatusChange(EmployeeAppStatus.BREAK)} className="w-full !bg-yellow-500 hover:!bg-yellow-600 text-lg py-3">휴식 시작</Button>
                        <Button onClick={() => handleStatusChange(EmployeeAppStatus.DONE)} className="w-full !bg-red-600 hover:!bg-red-700 text-lg py-3">퇴근하기</Button>
                    </>
                );
            case EmployeeAppStatus.BREAK:
                 return <Button onClick={() => handleStatusChange(EmployeeAppStatus.NONE)} className="w-full !bg-blue-600 hover:!bg-blue-700 text-lg py-3">업무 복귀</Button>;
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
                    {/* FIX: The ActionButton component expects a lowercase string literal for its 'status' prop.
                        The EmployeeAppStatus enum provides uppercase strings. This converts the enum value
                        to lowercase and uses a type assertion to match the prop type. */}
                    <ActionButton status={status.toLowerCase() as 'none' | 'working' | 'break' | 'done'} onClick={handleStatusChange} />
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

const ScheduleContent = ({ employeeId }: { employeeId: number }) => {
    const [activeTab, setActiveTab] = useState('나의 스케줄');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const storeNames: { [key: string]: string } = {
        'sample-store': '햄부기 매장',
        'pizza-store': '피자이당',
        'bunsik-store': '분식왕국',
    };

    const mySchedules = MOCK_SCHEDULES_DATA.filter(s => s.employeeId === employeeId);
    
    const loggedInEmployee = MOCK_EMPLOYEES_DATA.find(e => e.id === employeeId);
    
    // Get all unique store IDs from the main employee data list
    const allStoreIds = Array.from(new Set(
        MOCK_EMPLOYEES_DATA.map(e => e.storeId).filter((id): id is string => !!id)
    ));

    // Default selected store to the logged-in employee's store, or the first available store
    const [selectedStore, setSelectedStore] = useState(loggedInEmployee?.storeId || allStoreIds[0] || '');

    const storeSchedules = MOCK_SCHEDULES_DATA.filter(s => s.storeId === selectedStore);

    const openDetailModal = (date: Date) => {
        setSelectedDate(date);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedDate(null);
    };


    const renderMyMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} className="border-r border-b bg-slate-50"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dailySchedules = mySchedules.filter(s => s.start.toDateString() === date.toDateString());
            const uniqueStoresOnDay = [...new Set(dailySchedules.map(s => s.storeId))];

            calendarDays.push(
                <div 
                    key={day} 
                    className={`border-r border-b p-1 min-h-[100px] ${dailySchedules.length > 0 ? 'cursor-pointer hover:bg-sky-50 transition-colors' : ''}`}
                    onClick={() => dailySchedules.length > 0 && openDetailModal(date)}
                >
                    <p className="font-semibold text-sm">{day}</p>
                    <div className="space-y-1 mt-1">
                        {uniqueStoresOnDay.map(storeId => (
                            <div key={storeId} className="p-1 bg-red-100 rounded-md">
                                <p className="text-[10px] font-bold text-red-800 text-center truncate">{storeNames[storeId] || storeId}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-7 border-t border-l">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="text-center font-bold p-2 border-r border-b bg-slate-100">{day}</div>)}
                {calendarDays}
            </div>
        );
    };

    const renderMyDayView = () => {
        const daySchedules = mySchedules.filter(s => s.start.toDateString() === currentDate.toDateString());
        if (daySchedules.length === 0) {
            return <p className="text-center text-slate-500 py-16">해당 날짜의 스케줄이 없습니다.</p>;
        }
        return (
            <ul className="space-y-3">
                {daySchedules.map(schedule => (
                    <li key={schedule.id} className="p-4 bg-slate-50 rounded-md border-l-4 border-red-400">
                        <p className="font-semibold text-slate-800">{storeNames[schedule.storeId] || schedule.storeId}</p>
                        <p className="text-slate-600 mt-1">{schedule.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {schedule.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </li>
                ))}
            </ul>
        );
    };

    const renderStoreMonthView = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarDays = Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`empty-${i}`} className="border-r border-b bg-slate-50"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateSchedules = storeSchedules.filter(s => s.start.toDateString() === date.toDateString());
            const uniqueEmployeesOnDay = Array.from(new Set(dateSchedules.map(s => s.employeeId)))
                .map(id => MOCK_EMPLOYEES_DATA.find(e => e.id === id)).filter((e): e is Employee => !!e);

            calendarDays.push(
                <div key={day} className="border-r border-b p-1 min-h-[120px]">
                    <p className="font-semibold text-sm">{day}</p>
                    <ul className="mt-1 space-y-0.5">
                        {uniqueEmployeesOnDay.map(employee => {
                            const isCurrentUser = employee.id === employeeId;
                            const bgColor = employee.color || '#e0e7ff';
                            const textColor = getTextColorForBackground(bgColor);
                            const itemClass = isCurrentUser ? 'font-bold ring-1 ring-red-500' : '';
                            return <li key={employee.id} style={{ backgroundColor: bgColor, color: textColor }} className={`px-1 py-0.5 rounded-md whitespace-nowrap overflow-hidden text-[10px] leading-tight truncate ${itemClass}`}>{employee.name}</li>;
                        })}
                    </ul>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-7 border-t border-l">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day} className="text-center font-bold p-2 border-r border-b bg-slate-100">{day}</div>)}
                {calendarDays}
            </div>
        );
    };

    const renderStoreDayView = () => {
        const daySchedules = storeSchedules.filter(s => s.start.toDateString() === currentDate.toDateString());
        const activeEmployees = MOCK_EMPLOYEES_DATA.filter(e => e.status === '재직');
        const employeesOnDay = activeEmployees.filter(emp => daySchedules.some(s => s.employeeId === emp.id));

        if (employeesOnDay.length === 0) return <p className="text-center text-slate-500 py-16">등록된 스케줄이 없습니다.</p>;

        const hourHeight = 50;
        return (
            <div className="border rounded-lg overflow-hidden bg-white">
                <div className="flex">
                    <div className="w-16 shrink-0 border-b border-r bg-slate-50"></div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${employeesOnDay.length}, minmax(0, 1fr))` }}>
                        {employeesOnDay.map(emp => {
                            const bgColor = emp.color || '#f9fafb'; const textColor = getTextColorForBackground(bgColor);
                            return <div key={emp.id} style={{ backgroundColor: bgColor, color: textColor }} className="p-2 font-bold text-center border-b border-r truncate">{emp.name}</div>;
                        })}
                    </div>
                </div>
                <div className="flex overflow-x-auto">
                    <div className="w-16 text-center text-xs shrink-0">
                        {Array.from({ length: 24 }).map((_, hour) => <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b border-r flex items-center justify-center bg-slate-50 text-slate-500">{String(hour).padStart(2, '0')}:00</div>)}
                    </div>
                    <div className="flex-1 grid min-w-[400px]" style={{ gridTemplateColumns: `repeat(${employeesOnDay.length}, minmax(0, 1fr))` }}>
                        {employeesOnDay.map(employee => (
                            <div key={employee.id} className="relative border-r">
                                {Array.from({ length: 24 }).map((_, hour) => <div key={hour} style={{ height: `${hourHeight}px` }} className="border-b"></div>)}
                                {daySchedules.filter(s => s.employeeId === employee.id).map(s => {
                                    const isCurrentUser = s.employeeId === employeeId;
                                    const startDecimal = s.start.getHours() + s.start.getMinutes() / 60;
                                    const endDecimal = s.end.getHours() + s.end.getMinutes() / 60;
                                    const top = startDecimal * hourHeight;
                                    const height = Math.max((endDecimal - startDecimal) * hourHeight, 20);
                                    const empColor = MOCK_EMPLOYEES_DATA.find(e => e.id === s.employeeId)?.color;
                                    const blockClass = isCurrentUser ? 'ring-2 ring-red-500 z-10' : '';

                                    return (
                                        <div key={s.id} className={`absolute p-1 text-xs rounded border-l-4 overflow-hidden ${blockClass}`} style={{ top: `${top}px`, height: `${height}px`, left: '2px', right: '2px', backgroundColor: `${empColor}E6`, borderColor: empColor, color: getTextColorForBackground(empColor) }}>
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
    
    const dailySchedulesForModal = selectedDate ? mySchedules.filter(s => s.start.toDateString() === selectedDate.toDateString()) : [];

    return (
        <div className="space-y-4">
            <Tabs tabs={['나의 스케줄', '매장 스케줄']} activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === '나의 스케줄' && (
                <Card>
                    <CalendarHeader currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode={viewMode} setViewMode={setViewMode} />
                    <div className="overflow-x-auto">{viewMode === 'month' ? renderMyMonthView() : renderMyDayView()}</div>
                </Card>
            )}
            {activeTab === '매장 스케줄' && (
                <Card>
                    <CalendarHeader currentDate={currentDate} setCurrentDate={setCurrentDate} viewMode={viewMode} setViewMode={setViewMode}>
                        {allStoreIds.length > 1 && (
                            <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="bg-white px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500">
                                {allStoreIds.map(storeId => <option key={storeId} value={storeId}>{storeNames[storeId] || storeId}</option>)}
                            </select>
                        )}
                    </CalendarHeader>
                    {viewMode === 'month' ? renderStoreMonthView() : renderStoreDayView()}
                </Card>
            )}

            <Modal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                title={selectedDate ? `${selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 근무 정보` : '근무 정보'}
            >
                {dailySchedulesForModal.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <ul className="space-y-3">
                            {dailySchedulesForModal.map(schedule => (
                                <li key={schedule.id} className="p-4 bg-slate-50 rounded-lg border-l-4 border-red-400 flex flex-col">
                                    <span className="font-semibold text-slate-800">{storeNames[schedule.storeId] || schedule.storeId}</span>
                                    <span className="text-slate-600 mt-1">
                                        {schedule.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} - {schedule.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-center py-8 text-slate-500">선택한 날짜에 근무 정보가 없습니다.</p>
                )}
                 <div className="flex justify-end pt-4 mt-4 border-t">
                    <Button onClick={closeDetailModal}>닫기</Button>
                </div>
            </Modal>
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

const WorkerDashboardPage = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [switchedFromAdmin, setSwitchedFromAdmin] = useState(false);

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
            case 'dashboard': return <DashboardContent employee={employee} />;
            case 'schedule': return <ScheduleContent employeeId={employee.id} />;
            case 'attendance': return <PlaceholderContent title="근태 확인" />;
            case 'paystub': return <PlaceholderContent title="급여 명세서" />;
            case 'profile': return <PlaceholderContent title="내 정보" />;
            case 'settings': return <PlaceholderContent title="환경 설정" />;
            default: return <DashboardContent employee={employee} />;
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
                    <h2 className="text-lg font-semibold">
                       {pageTitles[currentPage]}
                    </h2>
                    <div className="flex-grow"></div>
                    <div className="text-sm text-right">
                        <p className="font-semibold">{employee.name}님</p>
                        <p className="text-xs text-slate-500">{employee.position}</p>
                    </div>
                </header>
                <main className="flex-1 p-6">
                    {renderContent()}
                </main>
            </div>
            
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
        </div>
    );
};

export default WorkerDashboardPage;
