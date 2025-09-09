

import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// FIX: Corrected import paths for components to be relative to pages/
import { Button, Card, DatePicker, Modal } from '../components/ui';
import QRScannerModal from '../components/shared/QRScannerModal';

interface WorkerRegistrationData {
    name: string;
    phone: string;
    birthdate: string;
}

const WorkerRegistrationPage = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<WorkerRegistrationData>({
        name: '',
        phone: '',
        birthdate: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const input = value.replace(/\D/g, '').substring(0, 11);
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
            setFormData(prev => ({ ...prev, phone: formattedPhoneNumber }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleDateSelect = (date: Date) => {
        setFormData(prev => ({ ...prev, birthdate: date.toISOString().split('T')[0] }));
        setIsDatePickerOpen(false);
    };

    const handleScanSuccess = (data: string) => {
        // This is a mock function. In a real app, you would use a QR
        // library to decode the video stream and get the data.
        // For now, we assume the QR data is the new store ID and navigate.
        setIsScannerOpen(false);
        navigate(`/worker/${data}/register`);
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = "이름을 입력해주세요.";
        }
        if (!formData.birthdate) {
            newErrors.birthdate = "생년월일을 선택해주세요.";
        }
        if (!formData.phone) {
            newErrors.phone = "전화번호를 입력해주세요.";
        } else if (formData.phone.length !== 13) {
            newErrors.phone = "올바른 전화번호 형식(010-1234-5678)으로 입력해주세요.";
        }
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setStep(2);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setStep(3);
        }, 1500);
    };
    
    const finishRegistration = () => {
        navigate(`/worker/${storeId}`);
    }

    const getStepTitle = () => {
        switch(step) {
            case 1: return "정보 입력 (1/2)";
            case 2: return "정보 확인 (2/2)";
            case 3: return "요청 완료";
            default: return "신규 근로자 등록";
        }
    }
    
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
                            <p className="text-lg text-slate-600 mt-1">신규 근로자 등록</p>
                        </div>
                        
                        <Card className="!bg-white/70 !backdrop-blur-sm !border !border-white/30">
                            {step === 1 && (
                                <form onSubmit={handleNext} className="space-y-4 p-2">
                                    <div>
                                        <label htmlFor="storeIdReg" className="block text-sm font-medium text-slate-700 mb-1">업체 코드</label>
                                        <div className="flex gap-2">
                                            <input
                                                id="storeIdReg"
                                                name="storeId"
                                                type="text"
                                                value={storeId === 'sample-store' ? '' : storeId || ''}
                                                readOnly
                                                placeholder="스캔을 눌러 QR코드를 스캔해주세요"
                                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-slate-100 cursor-not-allowed"
                                            />
                                            <Button type="button" onClick={() => setIsScannerOpen(true)} className="flex-shrink-0 !bg-red-600 hover:!bg-red-700 focus:!ring-red-500">
                                                스캔
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <input id="nameReg" name="name" type="text" required placeholder="이름" value={formData.name} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 h-[42px]"/>
                                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsDatePickerOpen(p => !p)}
                                                className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-left font-normal h-[42px] focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                {formData.birthdate || <span className="text-slate-400">생년월일</span>}
                                            </button>
                                            {isDatePickerOpen && (
                                                <DatePicker
                                                    currentDate={formData.birthdate ? new Date(formData.birthdate) : new Date()}
                                                    onDateSelect={handleDateSelect}
                                                    onClose={() => setIsDatePickerOpen(false)}
                                                />
                                            )}
                                        </div>
                                        {errors.birthdate && <p className="text-sm text-red-500 mt-1">{errors.birthdate}</p>}
                                    </div>
                                    <div>
                                        <input id="phoneReg" name="phone" type="tel" required placeholder="전화번호" value={formData.phone} onChange={handleInputChange} maxLength={13} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 h-[42px]"/>
                                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                                    </div>
                                    <Button type="submit" className="w-full !mt-6 !bg-red-600 hover:!bg-red-700 focus:!ring-red-500">
                                        다음
                                    </Button>
                                </form>
                            )}
                            {step === 2 && (
                                <form onSubmit={handleSubmit} className="p-2">
                                     <h3 className="text-lg font-semibold text-center mb-4">{getStepTitle()}</h3>
                                    <div className="space-y-3 mb-6">
                                        <p className="text-center text-slate-600">입력하신 정보가 맞는지 확인해주세요.</p>
                                        <div className="p-4 bg-slate-50 rounded-md space-y-2">
                                             <p><strong>업체코드:</strong> {storeId}</p>
                                             <p><strong>이름:</strong> {formData.name}</p>
                                             <p><strong>생년월일:</strong> {formData.birthdate}</p>
                                             <p><strong>전화번호:</strong> {formData.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" variant="secondary" className="w-full" onClick={() => setStep(1)}>이전</Button>
                                        <Button type="submit" className="w-full !bg-red-600 hover:!bg-red-700 focus:!ring-red-500" disabled={isLoading}>
                                            {isLoading ? '요청 중...' : '등록 요청하기'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                            {step === 3 && (
                                <div className="text-center p-4">
                                    <h3 className="text-lg font-semibold text-center mb-4">{getStepTitle()}</h3>
                                    <span className="text-6xl mb-4" role="img" aria-label="Success">✅</span>
                                    <h2 className="text-xl font-bold mb-2">등록 요청 완료</h2>
                                    <p className="text-slate-600 mb-6">관리자 승인 후 출퇴근 기록이 가능합니다.</p>
                                    <Button onClick={finishRegistration} className="w-full !bg-red-600 hover:!bg-red-700 focus:!ring-red-500">로그인 페이지로</Button>
                                </div>
                            )}
                        </Card>

                        <div className="text-center mt-8">
                            <Link to={`/worker/${storeId}`} className="inline-block px-6 py-2.5 rounded-md font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-sm">
                                로그인으로 돌아가기
                            </Link>
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

export default WorkerRegistrationPage;