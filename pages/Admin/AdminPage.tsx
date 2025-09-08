



import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee, Schedule, AttendanceRecord } from '../../types';
import { STORE_DATA } from '../../data/mockData';
import { Modal, Button, Card } from '../../components/ui';
import { AppHeader } from '../../components/admin/AppHeader';
import { EmployeeInfoForm } from '../../components/admin/EmployeeInfoForm';
import type { EmployeeFormData } from '../../components/admin/EmployeeInfoForm';
// FIX: Corrected import paths to resolve casing conflicts. The components are in the same 'Admin' directory.
import { DashboardView } from './DashboardView';
import { EmployeeView } from './EmployeeView';
import { AttendanceView } from './AttendanceView';
import { ScheduleView } from './ScheduleView';
import { QRView } from './QRView';
import { getRandomColor } from '../../utils';

type Account = { id: string, password?: string, companyCode: string };

interface AdminPageProps {
  employees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[];
  setEmployees: React.Dispatch<React.SetStateAction<(Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
}

const AdminPage = ({ employees, setEmployees, attendance, setAttendance }: AdminPageProps) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loggedInAccount, setLoggedInAccount] = useState<Account | null>(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Main data states are now passed as props
    
    // Store management states
    const [currentStore, setCurrentStore] = useState('');
    const [accessibleStores, setAccessibleStores] = useState<string[]>([]);


    // State for the global Employee Edit Modal
    const [employeeModalMode, setEmployeeModalMode] = useState<'edit' | 'new' | null>(null);
    const [editedEmployeeData, setEditedEmployeeData] = useState<EmployeeFormData | null>(null);
    const [editInfoTab, setEditInfoTab] = useState('기본');
    const [isCancelConfirmModalOpen, setIsCancelConfirmModalOpen] = useState(false);

    // Filter data based on current store
    const currentStoreId = useMemo(() => STORE_DATA.find(s => s.name === currentStore)?.storeId, [currentStore]);

    const filteredEmployees = useMemo(() => {
        if (!currentStoreId) return employees;
        return employees.filter(e => e.storeId === currentStoreId);
    }, [employees, currentStoreId]);

    const filteredAttendance = useMemo(() => {
        if (!currentStoreId) return attendance;
        const employeeIdsInStore = new Set(filteredEmployees.map(e => e.id));
        return attendance.filter(record => employeeIdsInStore.has(record.employeeId));
    }, [attendance, filteredEmployees, currentStoreId]);

    const handleUpdateAttendance = (updatedRecord: AttendanceRecord) => {
        setAttendance(prev => prev.map(rec => 
            rec.id === updatedRecord.id 
                ? { ...updatedRecord, isModified: true } 
                : rec
        ));
    };

    const handleAddAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'isModified'>) => {
        const newRecord: AttendanceRecord = {
            ...recordData,
            id: Date.now(),
            isModified: true,
        };
        setAttendance(prev => [...prev, newRecord]);
    };

    const handleDeleteAttendance = (recordIds: number[]) => {
        setAttendance(prev => prev.filter(rec => !recordIds.includes(rec.id)));
    };

    const handleLogout = () => {
        localStorage.removeItem('loggedInAdmin');
        setIsAuthenticated(false);
        setLoggedInAccount(null);
        navigate('/');
    };

    const handleSwitchToWorker = () => {
        if (loggedInAccount) {
            const targetEmployee = employees.find(e => e.id === 101 && e.storeId === 'bunsik-store');
            if (targetEmployee) {
                localStorage.setItem('switchedFromAdmin', JSON.stringify(loggedInAccount));
                localStorage.setItem('loggedInEmployeeId', String(targetEmployee.id));
                localStorage.removeItem('loggedInAdmin');
                navigate(`/worker/${targetEmployee.storeId}/dashboard`);
            } else {
                alert('전환할 근로자 계정(김성실)을 찾을 수 없습니다.');
            }
        }
    };

    const handleNavigate = useCallback((page: string) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    }, []);
    
    const handleOpenEmployeeModal = useCallback((employee: Employee, mode: 'edit' | 'new') => {
        if (mode === 'edit') {
            setEditedEmployeeData(JSON.parse(JSON.stringify(employee))); // Full data for edit
        } else { // mode === 'new'
            const newEmployeeData: EmployeeFormData = {
                // Pre-fill as requested
                name: employee.name,
                birthdate: employee.birthdate,
                phone: employee.phone || '',
                
                // Empty/default values for the rest
                id: Date.now(), // Temporary unique ID for React keys, will be replaced on save.
                position: '',
                status: '재직',
                infoStatus: '미흡',
                hireDate: new Date().toISOString().split('T')[0],
                lastWorkDate: '',
                employmentType: '아르바이트',
                payType: '시급',
                payRate: 0,
                color: getRandomColor(),
                reasonForResignation: undefined,
                storeId: currentStoreId,
                jobType: '',
                
                accountNumber: '',
                contract: null,
                bankAccountCopy: null,
            };
            setEditedEmployeeData(newEmployeeData);
        }
        setEditInfoTab('기본');
        setEmployeeModalMode(mode);
    }, [employees, currentStoreId]);
    
    const handleEditedDataChange = (field: keyof EmployeeFormData, value: any) => {
        setEditedEmployeeData(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedEmployeeData) return;
        
        if (employeeModalMode === 'new') {
            const newEmployee: Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; } = {
                ...(editedEmployeeData as Omit<EmployeeFormData, 'id'>),
                id: Date.now(), // Generate a final ID
                status: '재직',
                infoStatus: '정상', 
            } as Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; };
            setEmployees(prev => [...prev, newEmployee]);
        } else { // 'edit'
            setEmployees(prev => prev.map(emp => emp.id === editedEmployeeData.id ? editedEmployeeData as Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; } : emp));
        }
       
        setEmployeeModalMode(null);
    };

    const handleConfirmCancel = () => {
        setEmployeeModalMode(null);
        setIsCancelConfirmModalOpen(false);
    };

    useEffect(() => {
        const storedAdmin = localStorage.getItem('loggedInAdmin');
        if (storedAdmin) {
            try {
                const account = JSON.parse(storedAdmin);
                setIsAuthenticated(true);
                setLoggedInAccount(account);
            } catch (e) {
                console.error("Failed to parse admin data from localStorage", e);
                localStorage.removeItem('loggedInAdmin');
                navigate('/');
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    useEffect(() => {
        if (loggedInAccount) {
            const userStores = STORE_DATA.filter(s => s.companyCode === loggedInAccount.companyCode);
            if (userStores.length > 0) {
                setAccessibleStores(userStores.map(s => s.name));
                setCurrentStore(userStores[0].name);
            }
        }
    }, [loggedInAccount]);

    if (!isAuthenticated) {
        return <div className="flex h-screen w-screen items-center justify-center bg-slate-100">로딩 중...</div>;
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
            case 'dashboard': return <DashboardView onNavigate={handleNavigate} employees={filteredEmployees} attendance={filteredAttendance} onOpenEmployeeModal={handleOpenEmployeeModal} />;
            case 'employees': return <EmployeeView employees={filteredEmployees} allEmployees={employees} onOpenEmployeeModal={handleOpenEmployeeModal} />;
            case 'attendance': return <AttendanceView 
                employees={filteredEmployees} 
                attendance={filteredAttendance} 
                onEditEmployee={(employeeId) => {
                    const employeeToEdit = employees.find(emp => emp.id === employeeId);
                    if (employeeToEdit) {
                        handleOpenEmployeeModal(employeeToEdit, 'edit');
                    }
                }}
                onUpdateAttendance={handleUpdateAttendance}
                onAddAttendance={handleAddAttendance}
                onDeleteAttendance={handleDeleteAttendance}
            />;
            case 'schedule': return <ScheduleView />;
            case 'qr': return <QRView />;
            case 'settings': return (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">설정</h2>
                    <Card>
                        <div className="text-center py-16">
                            <p className="text-slate-500">준비 중인 기능입니다. 🏗️</p>
                        </div>
                    </Card>
                </div>
            );
            default: return <DashboardView onNavigate={handleNavigate} employees={filteredEmployees} attendance={filteredAttendance} onOpenEmployeeModal={handleOpenEmployeeModal} />;
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
            <div className="flex flex-col h-screen">
                <header className="bg-white border-b p-4 flex items-center z-10">
                    <AppHeader onMenuClick={() => setIsSidebarOpen(true)} onTitleClick={() => handleNavigate('dashboard')} />
                    <div className="flex-grow"></div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-semibold text-sm whitespace-nowrap">{currentStore}</p>
                            <p className="text-xs text-slate-500">관리자</p>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>

            {/* Global Employee Edit/Add Modal */}
            <Modal 
                isOpen={employeeModalMode !== null} 
                onClose={() => setEmployeeModalMode(null)} 
                title={employeeModalMode === 'new' ? "근로자 정보 입력" : "근로자 정보 수정"}
                size="lg"
                titleAlign="center"
                hideCloseButton={true}
            >
                {editedEmployeeData && <form onSubmit={handleSaveEmployee} className="flex flex-col h-full">
                    <div className="flex-grow">
                        <EmployeeInfoForm 
                           data={editedEmployeeData}
                           onDataChange={handleEditedDataChange}
                           activeTab={editInfoTab}
                           onTabChange={setEditInfoTab}
                           isNew={employeeModalMode === 'new'}
                        />
                    </div>
                    <div className={`flex-shrink-0 flex ${employeeModalMode === 'new' ? 'justify-center' : 'justify-end'} gap-3 pt-4 mt-6 border-t`}>
                        {employeeModalMode === 'new' ? (
                            <>
                                <Button type="button" variant="secondary" onClick={() => setIsCancelConfirmModalOpen(true)}>뒤로가기</Button>
                                <Button type="submit" variant="primary">등록 완료</Button>
                            </>
                        ) : (
                            <>
                                <Button type="button" variant="secondary" onClick={() => setEmployeeModalMode(null)}>취소</Button>
                                <Button type="submit" variant="primary">수정 완료</Button>
                            </>
                        )}
                    </div>
                </form>}
            </Modal>

            <Modal
                isOpen={isCancelConfirmModalOpen}
                onClose={() => setIsCancelConfirmModalOpen(false)}
                title="입력 취소 확인"
                size="sm"
                titleAlign="center"
                hideCloseButton={true}
            >
                <div>
                    <p className="text-center text-slate-600 mb-6">입력된 정보가 사라집니다.<br/>취소하시겠습니까?</p>
                    <div className="flex justify-center gap-3 pt-4 border-t">
                        <Button variant="secondary" onClick={() => setIsCancelConfirmModalOpen(false)}>취소</Button>
                        <Button variant="primary" onClick={handleConfirmCancel}>확인</Button>
                    </div>
                </div>
            </Modal>
            
            {loggedInAccount?.id === 'bunsik-admin' && (
                <button
                    onClick={handleSwitchToWorker}
                    className="fixed bottom-6 right-6 z-40 bg-red-600 text-white w-28 h-14 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-red-500"
                    aria-label="근로자 모드로 전환"
                >
                    <span role="img" aria-hidden="true" className="mr-2 text-lg">🔄</span>
                    근로자 모드
                </button>
            )}
        </div>
    );
};

export default AdminPage;