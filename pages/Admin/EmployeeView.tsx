
import React, { useState, useMemo } from 'react';
import { Employee } from '../../types';
import { Button, Card, Input, FilterDropdown, Modal } from '../../components/ui';

const columnOptions = [
    { key: 'name', label: '이름' },
    { key: 'position', label: '직급' },
    { key: 'status', label: '상태' },
    { key: 'infoStatus', label: '정보 상태' },
    { key: 'hireDate', label: '입사일' },
    { key: 'phone', label: '연락처' },
    { key: 'birthdate', label: '생년월일' },
    { key: 'employmentType', label: '고용 형태' },
    { key: 'payType', label: '급여 형태' },
    { key: 'payRate', label: '급여액' },
];

export const EmployeeView = ({ employees: initialEmployees, allEmployees, onOpenEmployeeModal }: { employees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[], allEmployees: (Employee & { accountNumber?: string; contract?: string | null; bankAccountCopy?: string | null; })[], onOpenEmployeeModal: (employee: Employee, mode: 'edit' | 'new') => void }) => {
    const [activeIndex, setActiveIndex] = useState(0); // 0: 검색, 1: 리스트
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Employee[] | null | undefined>(undefined);
    const [employeeToConfirm, setEmployeeToConfirm] = useState<Employee | null>(null);

    const [filters, setFilters] = useState<{ position: string[]; status: string[]; infoStatus: string[]; }>({
        position: [],
        status: [],
        infoStatus: [],
    });
    const [openFilter, setOpenFilter] = useState<keyof typeof filters | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportColumns, setExportColumns] = useState<Record<string, boolean>>(
        columnOptions.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );


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

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            setSearchResults(undefined);
            return;
        }
        const results = allEmployees.filter(emp => emp.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
        setSearchResults(results.length > 0 ? results : null);
    };

    const handleSearchOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const calculateCareer = (hireDateStr: string): string => {
        const hireDate = new Date(hireDateStr);
        const today = new Date();

        if (hireDate > today) return "신규";

        let years = today.getFullYear() - hireDate.getFullYear();
        let months = today.getMonth() - hireDate.getMonth();
        
        if (months < 0 || (months === 0 && today.getDate() < hireDate.getDate())) {
            years--;
            months += 12;
        }

        const totalMonths = years * 12 + months;

        if (totalMonths < 3) {
            return "신규";
        }
        if (totalMonths < 12) {
            return "1년 미만";
        }
        return `${years}년차`;
    };

    const handleColumnToggle = (key: string) => {
        setExportColumns(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    const handleSelectAllColumns = (select: boolean) => {
        setExportColumns(
            columnOptions.reduce((acc, col) => ({ ...acc, [col.key]: select }), {})
        );
    };

    return (
        <>
            <div className="space-y-4 pb-20">
                <h2 className="text-2xl font-bold">근로자 관리</h2>
                
                {/* Carousel Switcher */}
                <div className="w-full max-w-md mx-auto p-1 bg-slate-200 rounded-lg flex gap-1">
                    <button
                        onClick={() => setActiveIndex(0)}
                        className={`w-1/2 py-2 text-center font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-200 ${
                            activeIndex === 0 ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
                        }`}
                        aria-pressed={activeIndex === 0}
                    >
                        근로자 검색
                    </button>
                    <button
                        onClick={() => setActiveIndex(1)}
                        className={`w-1/2 py-2 text-center font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-200 ${
                            activeIndex === 1 ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
                        }`}
                        aria-pressed={activeIndex === 1}
                    >
                        내 근로자 리스트
                    </button>
                </div>
                
                {/* Carousel Content */}
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {/* Slide 1: Employee Search */}
                        <div className="w-full flex-shrink-0 px-1 py-1">
                            <Card>
                                <div className="flex gap-2">
                                    <Input 
                                        placeholder="근로자 이름(ID)을 입력하세요" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={handleSearchOnEnter}
                                        aria-label="근로자 검색"
                                    />
                                    <Button onClick={handleSearch} className="px-6 whitespace-nowrap">검색</Button>
                                </div>
                                <div className="mt-6">
                                    {searchResults === undefined && <p className="text-center text-slate-500 py-8">검색어를 입력하고 검색 버튼을 누르세요.</p>}
                                    {searchResults === null && <p className="text-center text-slate-500 py-8">'{searchQuery}'에 대한 검색 결과가 없습니다.</p>}
                                    {searchResults && (
                                         <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                                            {searchResults.map(result => {
                                                const isAlreadyRegistered = initialEmployees.some(emp => emp.id === result.id);
                                                const isDisabled = isAlreadyRegistered && result.status !== '퇴사';
                                                const careerInfo = calculateCareer(result.hireDate);
                                                const phoneLastFour = result.phone.slice(-4);
                                                return (
                                                    <Card 
                                                        key={result.id}
                                                        className={`transition-colors ${isDisabled ? 'bg-slate-100 cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-slate-50'}`}
                                                        onClick={isDisabled ? undefined : () => setEmployeeToConfirm(result)}
                                                        tabIndex={isDisabled ? -1 : 0}
                                                        onKeyDown={(e) => !isDisabled && (e.key === 'Enter' || e.key === ' ') && setEmployeeToConfirm(result)}
                                                        aria-disabled={isDisabled}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <p className="font-bold text-lg flex items-center gap-2">
                                                                    {result.name}
                                                                    {isAlreadyRegistered && (
                                                                        result.status === '퇴사'
                                                                        ? <span className="text-xs font-semibold bg-gray-500 text-white px-2 py-0.5 rounded-full">퇴사</span>
                                                                        : <span className="text-xs font-semibold bg-slate-300 text-slate-600 px-2 py-0.5 rounded-full">등록됨</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-sm text-slate-600">
                                                                    {careerInfo === "신규" ? (
                                                                        <span className="font-semibold text-blue-600">신규</span>
                                                                    ) : (
                                                                        <>
                                                                            <span>{careerInfo}</span>
                                                                            {result.jobType && (
                                                                                <>
                                                                                    <span className="mx-1.5 text-slate-300">|</span>
                                                                                    <span>{result.jobType}</span>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-mono">{result.birthdate}</p>
                                                                <p className="text-sm font-mono text-slate-500">010-****-{phoneLastFour}</p>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Slide 2: Employee List */}
                        <div className="w-full flex-shrink-0 px-1 py-1">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="relative">
                                    <Button variant="secondary" size="sm" onClick={() => setOpenFilter(openFilter === 'position' ? null : 'position')} className={filters.position.length > 0 ? '!bg-blue-100 !text-blue-700' : '!bg-white'}>
                                        직급 {filters.position.length > 0 && `(${filters.position.length})`} ▼
                                    </Button>
                                    {openFilter === 'position' && <FilterDropdown options={positionOptions} selected={filters.position} onToggle={(o) => handleFilterToggle('position', o)} onClose={() => setOpenFilter(null)} />}
                                </div>
                                <div className="relative">
                                    <Button variant="secondary" size="sm" onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')} className={filters.status.length > 0 ? '!bg-blue-100 !text-blue-700' : '!bg-white'}>
                                        상태 {filters.status.length > 0 && `(${filters.status.length})`} ▼
                                    </Button>
                                    {openFilter === 'status' && <FilterDropdown options={statusOptions} selected={filters.status} onToggle={(o) => handleFilterToggle('status', o)} onClose={() => setOpenFilter(null)} />}
                                </div>
                                <div className="relative">
                                    <Button variant="secondary" size="sm" onClick={() => setOpenFilter(openFilter === 'infoStatus' ? null : 'infoStatus')} className={filters.infoStatus.length > 0 ? '!bg-blue-100 !text-blue-700' : '!bg-white'}>
                                        정보 {filters.infoStatus.length > 0 && `(${filters.infoStatus.length})`} ▼
                                    </Button>
                                    {openFilter === 'infoStatus' && <FilterDropdown options={infoOptions} selected={filters.infoStatus} onToggle={(o) => handleFilterToggle('infoStatus', o)} onClose={() => setOpenFilter(null)} />}
                                </div>
                            </div>
                            <Card>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="sticky top-0 bg-white z-10">
                                            <tr className="border-b">
                                                <th className="p-2 font-bold">이름</th>
                                                <th className="p-2 font-bold">직급</th>
                                                <th className="p-2 font-bold">상태</th>
                                                <th className="p-2 font-bold">정보</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredEmployees.map(emp => (
                                                <tr 
                                                    key={emp.id} 
                                                    className="border-b hover:bg-slate-50 cursor-pointer"
                                                    onClick={() => onOpenEmployeeModal(emp, 'edit')}
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
                        </div>
                    </div>
                </div>

                <Modal
                    isOpen={!!employeeToConfirm}
                    onClose={() => setEmployeeToConfirm(null)}
                    title="근로자 정보 확인"
                    size="sm"
                    titleAlign="center"
                    hideCloseButton={true}
                >
                    {employeeToConfirm && (
                        <div>
                            <div className="p-4 bg-slate-50 rounded-md space-y-2 mb-6">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-semibold text-slate-600">이름</span>
                                    <span className="font-bold">{employeeToConfirm.name}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-semibold text-slate-600">생년월일</span>
                                    <span className="font-mono">{employeeToConfirm.birthdate}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm font-semibold text-slate-600">연락처</span>
                                    <span className="font-mono">010-****-{employeeToConfirm.phone.slice(-4)}</span>
                                </div>
                            </div>
                            <p className="text-center text-slate-600 mb-6">
                                선택한 근로자를 신규 등록 하시겠습니까?
                            </p>
                            <div className="flex justify-center gap-3 pt-4 border-t">
                                <Button variant="secondary" onClick={() => setEmployeeToConfirm(null)}>
                                    취소
                                </Button>
                                <Button onClick={() => {
                                    onOpenEmployeeModal(employeeToConfirm, 'new');
                                    setEmployeeToConfirm(null);
                                }}>
                                    신규 등록
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
                 <Modal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title="다운로드 항목 선택"
                    size="md"
                >
                    <div>
                        <div className="flex justify-between items-center mb-4 pb-3 border-b">
                             <p className="text-sm text-slate-600">엑셀 파일에 포함할 정보를 선택하세요.</p>
                             <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={() => handleSelectAllColumns(true)}>전체 선택</Button>
                                <Button size="sm" variant="secondary" onClick={() => handleSelectAllColumns(false)}>전체 해제</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                            {columnOptions.map(col => (
                                <label key={col.key} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!exportColumns[col.key]}
                                        onChange={() => handleColumnToggle(col.key)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{col.label}</span>
                                </label>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
                            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>취소</Button>
                            <Button 
                                onClick={() => alert('엑셀 다운로드 기능은 준비 중입니다.')}
                                disabled={Object.values(exportColumns).every(v => !v)}
                            >
                                다운로드
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
            {activeIndex === 1 && (
                <div className="fixed bottom-0 right-0 p-4 bg-white/80 backdrop-blur-sm border-t w-full lg:w-[calc(100%-16rem)] z-10">
                    <div className="flex justify-end px-6">
                        <Button onClick={() => setIsExportModalOpen(true)}>
                            <span role="img" aria-hidden="true" className="mr-2">📄</span>
                            엑셀 다운로드
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};
