
import React, { useState } from 'react';
import { NewWorkerRequest, Employee, AttendanceStatus, AttendanceRecord } from '../../types';
import { Button, Card, Modal } from '../../components/ui';

export const DashboardView = ({ onNavigate, employees, attendance, onOpenEmployeeModal }: { 
    onNavigate: (page: string) => void, 
    employees: Employee[], 
    attendance: AttendanceRecord[],
    onOpenEmployeeModal: (employee: Employee, mode: 'edit') => void 
}) => {
    const [modalState, setModalState] = useState({ isOpen: false, title: '', employees: [] as Employee[] });
    const [isAddWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
    const [isCostModalOpen, setIsCostModalOpen] = useState(false);

    // Calculate attendance status for today
    const today = new Date().toISOString().split('T')[0];
    const activeEmployees = employees.filter(emp => emp.status === '재직');
    const todaysAttendance = attendance.filter(att => att.date === today);

    const workingEmployees: Employee[] = [];
    const breakEmployees: Employee[] = [];
    const doneEmployees: Employee[] = [];
    
    todaysAttendance.forEach(att => {
        const employee = activeEmployees.find(e => e.id === att.employeeId);
        if (!employee) return; // Skip if not an active employee (e.g., resigned)

        if (att.clockIn && !att.clockOut) {
            if (att.breakStart && !att.breakEnd) {
                breakEmployees.push(employee);
            } else { 
                workingEmployees.push(employee);
            }
        } 
        else if (att.clockIn && att.clockOut) {
            doneEmployees.push(employee);
        }
    });

    // Calculate attendance issues dynamically for today
    const lateEmployees = todaysAttendance
        .filter(att => att.status === AttendanceStatus.LATE)
        .map(att => employees.find(e => e.id === att.employeeId))
        .filter((e): e is Employee => !!e);

    const employeesWithAttendance = new Set(todaysAttendance.map(att => att.employeeId));
    const absentEmployees = activeEmployees
        .filter(emp => !employeesWithAttendance.has(emp.id));
    
    const overtimeEmployees = todaysAttendance
        .filter(att => att.workHours > 8) // Assuming 8 hours is standard
        .map(att => employees.find(e => e.id === att.employeeId))
        .filter((e): e is Employee => !!e);


    const handleStatusClick = (statusType: 'working' | 'break' | 'done' | 'late' | 'absent' | 'overtime') => {
        let title = '';
        let employeeList: Employee[] = [];

        switch (statusType) {
            case 'working':
                title = '출근 중인 근로자';
                employeeList = workingEmployees;
                break;
            case 'break':
                title = '휴게 중인 근로자';
                employeeList = breakEmployees;
                break;
            case 'done':
                title = '퇴근한 근로자';
                employeeList = doneEmployees;
                break;
            case 'late':
                title = '지각 근로자';
                employeeList = lateEmployees;
                break;
            case 'absent':
                title = '결근 근로자';
                employeeList = absentEmployees;
                break;
            case 'overtime':
                title = '초과근무 근로자';
                employeeList = overtimeEmployees;
                break;
        }

        setModalState({ isOpen: true, title, employees: employeeList });
    };

    const handleEmployeeClick = (employee: Employee) => {
        setModalState({ isOpen: false, title: '', employees: [] }); // Close current modal
        onOpenEmployeeModal(employee, 'edit');
    };

    return (
        <>
            <div className="space-y-6 pb-20">
                <Button onClick={() => onNavigate('employees')} className="w-full">근로자 찾기</Button>
                <Card>
                    <h3 className="font-bold text-lg mb-4">현재 근태 현황</h3>
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
                            <p className="text-sm text-slate-500">퇴근 <span role="img" aria-label="workers off work">🏠</span></p>
                            <p className="text-3xl font-bold text-slate-600">{doneEmployees.length}</p>
                        </button>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold text-lg mb-4">오늘의 근태 특이사항</h3>
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <button onClick={() => setIsCostModalOpen(true)} className="bg-red-50 p-4 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">
                            <p className="text-sm text-slate-500">지각 <span role="img" aria-label="late">🏃</span></p>
                            <p className="text-3xl font-bold text-red-600">0</p>
                        </button>
                        <button onClick={() => setIsCostModalOpen(true)} className="bg-slate-100 p-4 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">
                            <p className="text-sm text-slate-500">결근 <span role="img" aria-label="absent">🤷</span></p>
                            <p className="text-3xl font-bold text-slate-600">0</p>
                        </button>
                        <button onClick={() => setIsCostModalOpen(true)} className="bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
                            <p className="text-sm text-slate-500">초과 <span role="img" aria-label="overtime">💪</span></p>
                            <p className="text-3xl font-bold text-blue-600">0</p>
                        </button>
                    </div>
                </Card>
                 <Card onClick={() => setIsCostModalOpen(true)} className="cursor-pointer">
                    <h3 className="font-bold text-lg mb-2">오늘의 예상 인건비</h3>
                     <div className="flex items-center justify-between">
                        <div>
                            <p className="text-4xl font-bold text-blue-600">0<span className="text-2xl font-medium ml-1">원</span></p>
                            <p className="text-sm text-slate-500 mt-1">* 당일 근무기록 기반 예상 금액</p>
                        </div>
                        <span className="text-5xl" role="img" aria-label="money">💸</span>
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
                            {modalState.employees.map((employee) => (
                                <li 
                                    key={employee.id} 
                                    className="py-3 px-2 cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
                                    onClick={() => handleEmployeeClick(employee)}
                                >
                                    {employee.name}
                                </li>
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

            <Modal
                isOpen={isCostModalOpen}
                onClose={() => setIsCostModalOpen(false)}
                title="알림"
                size="sm"
            >
                <div className="text-center">
                    <p className="text-slate-600 my-4">준비 중인 기능입니다. 🏗️</p>
                    <div className="flex justify-center pt-4 border-t">
                        <Button onClick={() => setIsCostModalOpen(false)}>확인</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};
