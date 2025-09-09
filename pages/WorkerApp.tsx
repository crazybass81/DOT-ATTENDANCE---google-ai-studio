

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Card, Modal, DatePicker } from '../components/ui';
import { MOCK_EMPLOYEES_DATA } from '../data/mockData';
import { Employee } from '../types';
// FIX: Corrected import path for QRScannerModal to use a shared component path.
import QRScannerModal from '../components/shared/QRScannerModal';


const WorkerApp = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [storeCode, setStoreCode] = useState(storeId === 'sample-store' ? '' : storeId || '');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [error, setError] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const nameInputRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (localStorage.getItem('loggedInEmployeeId')) {
            navigate(`/worker/${storeId}/dashboard`);
        }
    }, [storeId, navigate]);

    useEffect(() => {
        setStoreCode(storeId === 'sample-store' ? '' : storeId || '');
    }, [storeId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (nameInputRef.current && !nameInputRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredEmployees = MOCK_EMPLOYEES_DATA.filter(emp => 
        emp.storeId === storeId && emp.name.toLowerCase().includes(name.toLowerCase())
    );

    const handleAccountSelect = (employee: Employee) => {
        setName(employee.name);
        setBirthdate(employee.birthdate);
        setPhone(employee.phone);
        setShowAutocomplete(false);
        setError('');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !birthdate || !phone) {
            setError('모든 정보를 입력해주세요.');
            return;
        }

        const formattedPhone = phone.length === 11 ? phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : phone;
        
        const employee = MOCK_EMPLOYEES_DATA.find(emp =>
            emp.name === name.trim() &&
            emp.birthdate === birthdate &&
            emp.phone === formattedPhone &&
            emp.storeId === storeId
        );

        if (employee) {
            localStorage.setItem('loggedInEmployeeId', String(employee.id));
            navigate(`/worker/${storeId}/dashboard`);
        } else {
            setError('입력한 정보와 일치하는 근로자가 없습니다.');
        }
    };

    const handleDateSelect = (date: Date) => {
        setBirthdate(date.toISOString().split('T')[0]);
        setIsDatePickerOpen(false);
        setError('');
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value.replace(/\D/g, '').substring(0, 11);
        const firstPart = input.slice(0, 3);
        const secondPart = input.slice(3, 7);
        const thirdPart = input.slice(7, 11);
        
        let formattedPhoneNumber = firstPart;
        if (secondPart) {
            formattedPhoneNumber += `-${secondPart}`;
        }
        if (thirdPart) {
            formattedPhoneNumber += `-${thirdPart}`;
        }
        setPhone(formattedPhoneNumber);
        setError('');
    };

    const handleScanSuccess = (data: string) => {
        // This function would be implemented with a QR library
        // to extract a store code from the scanned data.
        setStoreCode(data); 
    };

    return (
        <>
            <div className="relative min-h-screen overflow-hidden bg-slate-50">
                <div className="absolute inset-0 z-0">
                    <div className="blob blob-worker-1"></div>
                    <div className="blob blob-worker-2"></div>
                    <div className="blob blob-worker-3"></div>
                    <div className="blob blob-worker-4"></div>
                    <div className="blob blob-worker-5"></div>
                </div>

                <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
                    <div className="w-full max-w-sm">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-red-700">DOT ATTENDANCE</h1>
                            <p className="text-lg text-slate-600 mt-1">근로자용</p>
                        </div>
                        
                        <Card className="!bg-white/70 !backdrop-blur-sm !border !border-white/30 relative z-20">
                            <form onSubmit={handleLogin} className="space-y-4 p-2">
                                <div>
                                    <label htmlFor="storeCode" className="block text-sm font-medium text-slate-700 mb-1 sr-only">업체 코드</label>
                                    <div className="flex gap-2">
                                         <input 
                                            id="storeCode" 
                                            name="storeCode" 
                                            type="text" 
                                            value={storeId === 'sample-store' ? '' : storeId || ''}
                                            readOnly 
                                            placeholder="스캔을 눌러 QR코드를 스캔해주세요" 
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-slate-100 cursor-not-allowed h-[42px]"
                                        />
                                        <Button type="button" onClick={() => setIsScannerOpen(true)} className="flex-shrink-0 !bg-red-600 hover:!bg-red-700 focus:!ring-red-500 h-[42px]">
                                            스캔
                                        </Button>
                                    </div>
                                </div>
                                <div className="relative" ref={nameInputRef}>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="이름"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            setError('');
                                            if (!showAutocomplete) setShowAutocomplete(true);
                                        }}
                                        onFocus={() => setShowAutocomplete(true)}
                                        autoComplete="off"
                                        className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 h-[42px]"
                                    />
                                    {showAutocomplete && filteredEmployees.length > 0 && (
                                        <div className="absolute z-40 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg">
                                            <ul className="py-1 max-h-40 overflow-y-auto">
                                                {filteredEmployees.map(employee => (
                                                    <li
                                                        key={employee.id}
                                                        className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                                                        onClick={() => handleAccountSelect(employee)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                    >
                                                        {employee.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="relative z-30">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsDatePickerOpen(p => !p)}
                                        className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-left font-normal h-[42px] focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {birthdate || <span className="text-slate-400">생년월일</span>}
                                    </button>
                                    {isDatePickerOpen && (
                                        <DatePicker 
                                            currentDate={birthdate ? new Date(birthdate) : new Date()}
                                            onDateSelect={handleDateSelect}
                                            onClose={() => setIsDatePickerOpen(false)}
                                        />
                                    )}
                                </div>
                                <input id="phone" name="phone" type="tel" placeholder="전화번호" value={phone} onChange={handlePhoneChange} maxLength={13} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 h-[42px]"/>
                                {error && <p className="text-center text-sm text-red-500 -my-2">{error}</p>}
                                <Button type="submit" className="w-full !mt-6 !bg-red-600 hover:!bg-red-700 focus:!ring-red-500">
                                    로그인
                                </Button>
                                <div className="text-center text-sm pt-2">
                                    <span className="text-slate-600">처음이신가요? </span>
                                    <Link to={`/worker/${storeId}/register`} className="font-semibold text-red-600 hover:underline">
                                        신규 근로자 등록
                                    </Link>
                                </div>
                            </form>
                        </Card>
                        
                        <div className="text-center mt-8">
                            <Link to="/" className="inline-block px-6 py-2.5 rounded-md font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-sm">처음으로</Link>
                        </div>
                    </div>
                </div>
            </div>
            <QRScannerModal 
                isOpen={isScannerOpen} 
                onClose={() => setIsScannerOpen(false)} 
                onScanSuccess={handleScanSuccess}
            />
        </>
    );
};

export default WorkerApp;