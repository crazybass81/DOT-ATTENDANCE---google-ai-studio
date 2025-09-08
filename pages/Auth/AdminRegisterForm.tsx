
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Textarea } from '../../components/ui';
import { MOCK_ACCOUNTS } from '../../data/mockData';

const TypeSelectionCard = ({ title, description, emoji, onClick }: { title: string, description: string, emoji: string, onClick: () => void }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-4 border rounded-lg hover:bg-slate-50 hover:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
        <div className="flex items-center gap-4">
            <span className="text-4xl" role="img" aria-hidden="true">{emoji}</span>
            <div>
                <h3 className="font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-600">{description}</p>
            </div>
        </div>
    </button>
);

const ProgressIndicator = ({ step, userType }: { step: number; userType: string; }) => {
    const getThirdStepTitle = () => {
        if (step < 3) {
            return '정보 확인/입력';
        }
        if (userType === 'sole_proprietor' || userType === 'corporate') {
            return '사업자 정보 입력';
        }
        return '정보 확인/입력';
    };

    const steps = [
        { number: 1, title: '기본정보 입력' },
        { number: 2, title: '회원 유형 선택' },
        { number: 3, title: getThirdStepTitle() }
    ];
    
    return (
        <div className="flex justify-center items-center text-lg font-bold">
            {steps.map((s, index) => {
                const isCompleted = step > s.number;
                const isCurrent = step === s.number;
                
                let textColor = 'text-slate-500';
                if (isCurrent) {
                    textColor = 'text-blue-600';
                } else if (isCompleted) {
                    textColor = 'text-slate-800';
                }

                return (
                    <React.Fragment key={s.number}>
                        <span className={textColor}>{s.title}</span>
                        {index < steps.length - 1 && <span className="mx-3 text-slate-400">&gt;</span>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


export const AdminRegisterForm = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        confirmPassword: '',
        name: '',
        birthdate: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        gender: '',
        email: '',
        emailId: '',
        emailDomain: 'naver.com',
        customEmailDomain: '',
        phone: '',
        verificationCode: '',
        userType: '',
        businessName: '',
        businessRegistrationNumber: '',
        corporateRegistrationNumber: '',
        representativeName: '',
        businessType: '',
        businessItem: '',
        businessOpeningDate: '',
        businessRegistrationFile: null as File | null,
        businessOpeningYear: '',
        businessOpeningMonth: '',
        businessOpeningDay: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [timer, setTimer] = useState(180);
    const [showIdAutocomplete, setShowIdAutocomplete] = useState(false);
    const idInputRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (idInputRef.current && !idInputRef.current.contains(event.target as Node)) {
                setShowIdAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let interval: number | undefined;
        if (isCodeSent && timer > 0 && !isVerified) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setIsCodeSent(false);
        }
        return () => clearInterval(interval);
    }, [isCodeSent, timer, isVerified]);
    
    useEffect(() => {
        if (formData.verificationCode.length === 6 && isCodeSent && !isVerified) {
            handleVerifyCode();
        }
    }, [formData.verificationCode, isCodeSent, isVerified]);

    useEffect(() => {
        const { birthYear, birthMonth, birthDay } = formData;
        
        if (birthYear && birthMonth) {
            const daysInMonth = new Date(parseInt(birthYear), parseInt(birthMonth), 0).getDate();
            if (parseInt(birthDay) > daysInMonth) {
                setFormData(prev => ({ ...prev, birthDay: '' }));
            }
        }
        
        if (birthYear && birthMonth && birthDay) {
            const formattedDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, birthdate: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, birthdate: '' }));
        }
    }, [formData.birthYear, formData.birthMonth, formData.birthDay]);
    
    useEffect(() => {
        const { businessOpeningYear, businessOpeningMonth, businessOpeningDay } = formData;
        
        if (businessOpeningYear && businessOpeningMonth) {
            const daysInMonth = new Date(parseInt(businessOpeningYear), parseInt(businessOpeningMonth), 0).getDate();
            if (parseInt(businessOpeningDay) > daysInMonth) {
                setFormData(prev => ({ ...prev, businessOpeningDay: '' }));
            }
        }
        
        if (businessOpeningYear && businessOpeningMonth && businessOpeningDay) {
            const formattedDate = `${businessOpeningYear}-${String(businessOpeningMonth).padStart(2, '0')}-${String(businessOpeningDay).padStart(2, '0')}`;
            setFormData(prev => ({ ...prev, businessOpeningDate: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, businessOpeningDate: '' }));
        }
    }, [formData.businessOpeningYear, formData.businessOpeningMonth, formData.businessOpeningDay]);

    useEffect(() => {
        const { emailId, emailDomain, customEmailDomain } = formData;
        if (emailId) {
            const domain = emailDomain === 'custom' ? customEmailDomain : emailDomain;
            if (domain) {
                setFormData(prev => ({ ...prev, email: `${emailId}@${domain}` }));
            } else {
                setFormData(prev => ({ ...prev, email: '' }));
            }
        } else {
            setFormData(prev => ({ ...prev, email: '' }));
        }
    }, [formData.emailId, formData.emailDomain, formData.customEmailDomain]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const input = value.replace(/\D/g, '').substring(0, 11);
            const firstPart = input.slice(0, 3);
            const secondPart = input.slice(3, 7);
            const thirdPart = input.slice(7, 11);
            
            let formattedPhoneNumber = firstPart;
            if (input.length > 3) {
                formattedPhoneNumber += `-${secondPart}`;
            }
            if (input.length > 7) {
                formattedPhoneNumber += `-${thirdPart}`;
            }
            setFormData(prev => ({ ...prev, phone: formattedPhoneNumber }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (['birthYear', 'birthMonth', 'birthDay'].includes(name) && errors.birthdate) {
            setErrors(prev => ({ ...prev, birthdate: '' }));
        }
        if (['businessOpeningYear', 'businessOpeningMonth', 'businessOpeningDay'].includes(name) && errors.businessOpeningDate) {
            setErrors(prev => ({ ...prev, businessOpeningDate: '' }));
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFormData(prev => ({ ...prev, businessRegistrationFile: e.target.files![0] }));
        }
    };
    
    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        const { id, password, confirmPassword, name, birthdate, gender, email, phone } = formData;
        const existingIds = MOCK_ACCOUNTS.map(acc => acc.id);

        if (!id) {
            newErrors.id = "아이디를 입력해주세요.";
        } else if (existingIds.includes(id)) {
            newErrors.id = "이미 사용 중인 아이디입니다.";
        }
        if (!name) newErrors.name = "이름을 입력해주세요.";
        if (!birthdate) newErrors.birthdate = "생년월일을 입력해주세요.";
        if (!gender) newErrors.gender = "성별을 선택해주세요.";
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "올바른 이메일 주소를 입력해주세요.";
        if (!phone || phone.length < 13) newErrors.phone = "올바른 전화번호를 입력해주세요.";
        
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        if (!password) {
            newErrors.password = "비밀번호를 입력해주세요.";
        } else if (password.length < 8 || !hasLetters || !hasNumbers || !hasSymbols) {
            newErrors.password = '비밀번호는 8자 이상이며, 영문, 숫자, 기호를 모두 포함해야 합니다.';
        }
        
        if (password !== confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }
        
        if (!isVerified) {
            newErrors.verificationCode = "전화번호 인증을 완료해주세요.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const validateStep3 = () => {
        const newErrors: Record<string, string> = {};
        const { businessName, businessRegistrationNumber, corporateRegistrationNumber, userType, representativeName, businessType, businessItem, businessOpeningDate } = formData;
        if (!businessName) newErrors.businessName = "상호명 또는 법인명을 입력해주세요.";
        if (!businessRegistrationNumber) newErrors.businessRegistrationNumber = "사업자 등록번호를 입력해주세요.";
        
        if (userType === 'corporate' && !corporateRegistrationNumber) {
            newErrors.corporateRegistrationNumber = "법인 등록번호를 입력해주세요.";
        }

        if (userType === 'sole_proprietor' || userType === 'corporate') {
            if (!representativeName) newErrors.representativeName = "대표자 성함을 입력해주세요.";
            if (!businessType) newErrors.businessType = "업태를 입력해주세요.";
            if (!businessItem) newErrors.businessItem = "종목을 입력해주세요.";
            if (!businessOpeningDate) newErrors.businessOpeningDate = "개업년월일을 입력해주세요.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep1()) {
            setStep(2);
        }
    };
    
    const handleSendCode = () => {
        if (!formData.phone || formData.phone.length < 13) {
            setErrors(prev => ({ ...prev, phone: '올바른 전화번호를 입력해주세요.' }));
            return;
        }
        setIsCodeSent(true);
        setTimer(180);
        setErrors(prev => ({ ...prev, verificationCode: '' }));
    };

    const handleVerifyCode = () => {
        // Mock verification
        if (formData.verificationCode === '123456') {
            setIsVerified(true);
            setIsCodeSent(false);
            setErrors(prev => ({ ...prev, verificationCode: '' }));
        } else {
            setErrors(prev => ({...prev, verificationCode: '인증번호가 올바르지 않습니다.'}));
        }
    };


    const handleUserTypeSelect = (type: string) => {
        setFormData(prev => ({ ...prev, userType: type }));
        if (type === 'worker') {
            setIsConfirmModalOpen(true);
        } else {
            setStep(3);
        }
    };

    const handleBusinessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateStep3()) {
            setIsConfirmModalOpen(true);
        }
    };

    const handleFinalSubmit = () => {
        setIsConfirmModalOpen(false);
        console.log('Registering with data:', formData);
        setStep(4);
        setTimeout(() => {
            onBackToLogin();
        }, 3000);
    };
    
    const { birthYear, birthMonth, birthDay } = formData;
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInSelectedMonth = birthYear && birthMonth ? new Date(parseInt(birthYear), parseInt(birthMonth), 0).getDate() : 31;
    const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

    const { businessOpeningYear, businessOpeningMonth } = formData;
    const businessYears = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const businessMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const daysInBusinessMonth = businessOpeningYear && businessOpeningMonth 
        ? new Date(parseInt(businessOpeningYear), parseInt(businessOpeningMonth), 0).getDate() 
        : 31;
    const businessDays = Array.from({ length: daysInBusinessMonth }, (_, i) => i + 1);

    const existingIds = MOCK_ACCOUNTS.map(acc => acc.id);
    const filteredIds = formData.id ? existingIds.filter(id => id.toLowerCase().includes(formData.id.toLowerCase())) : [];

    if (step === 4) {
        return (
            <div className="w-full max-w-sm text-center bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-xl p-8">
                <span className="text-6xl mb-4" role="img" aria-label="Success">✅</span>
                <h1 className="text-2xl font-bold mb-2">회원가입 완료</h1>
                <p className="text-slate-600">회원가입이 성공적으로 완료되었습니다.<br/>로그인 페이지로 이동합니다.</p>
            </div>
        );
    }
    
    const isWorkerConfirm = formData.userType === 'worker' && isConfirmModalOpen;
    
    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-700">DOT ATTENDANCE</h1>
                <p className="text-lg text-slate-600 mt-1">회원가입</p>
            </div>
            {step < 4 && (
                <div className="mb-4">
                    <ProgressIndicator step={step} userType={formData.userType} />
                </div>
            )}
            <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-xl">
                <div className="p-6">
                    {step === 1 && (
                        <form onSubmit={handleNext} className="space-y-4">
                            
                            <div className="relative" ref={idInputRef}>
                                <Input
                                    label="아이디"
                                    name="id"
                                    value={formData.id}
                                    autoComplete="off"
                                    onChange={e => {
                                        handleInputChange(e);
                                        if (e.target.value) {
                                            setShowIdAutocomplete(true);
                                        } else {
                                            setShowIdAutocomplete(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (formData.id) setShowIdAutocomplete(true);
                                    }}
                                />
                                {showIdAutocomplete && filteredIds.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                        <ul>
                                            {filteredIds.map(id => (
                                                <li key={id} className="px-3 py-2 text-sm text-slate-600">
                                                    {id} <span className="text-red-500 font-semibold">(사용 중)</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {errors.id && <p className="text-xs text-red-500 mt-1">{errors.id}</p>}
                            </div>

                            <div>
                                <Input label="비밀번호" name="password" type="password" value={formData.password} onChange={handleInputChange} aria-describedby="password-rules" />
                                <p id="password-rules" className="text-xs text-slate-500 mt-1 px-1">8자 이상, 영문, 숫자, 기호를 포함해야 합니다.</p>
                                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                            </div>
                            
                            <div>
                                <Input label="비밀번호 확인" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
                                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                    <Input label="이름" name="name" value={formData.name} onChange={handleInputChange} />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">성별</label>
                                    <div className="flex gap-4 items-center h-10">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} className="custom-radio" />
                                            <span className="mr-2"></span>
                                            남성
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} className="custom-radio" />
                                            <span className="mr-2"></span>
                                            여성
                                        </label>
                                    </div>
                                    {errors.gender && <p className="text-xs text-red-500 -mt-2">{errors.gender}</p>}
                                </div>
                            </div>
                            
                            <div className="col-span-full">
                                 <label className="block text-sm font-medium text-slate-700 mb-1">생년월일</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <select name="birthYear" value={birthYear} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">년</option>
                                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <select name="birthMonth" value={birthMonth} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">월</option>
                                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select name="birthDay" value={birthDay} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">일</option>
                                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {errors.birthdate && <p className="text-xs text-red-500 mt-1">{errors.birthdate}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-auto">
                                        <Input name="emailId" value={formData.emailId} onChange={handleInputChange} />
                                    </div>
                                    <span className="font-semibold">@</span>
                                    <div className="w-40 flex-shrink-0">
                                        <select name="emailDomain" value={formData.emailDomain} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                            <option value="naver.com">naver.com</option>
                                            <option value="gmail.com">gmail.com</option>
                                            <option value="hanmail.net">hanmail.net</option>
                                            <option value="daum.net">daum.net</option>
                                            <option value="nate.com">nate.com</option>
                                            <option value="custom">직접입력</option>
                                        </select>
                                    </div>
                                </div>
                                {formData.emailDomain === 'custom' && (
                                    <Input
                                        name="customEmailDomain"
                                        value={formData.customEmailDomain}
                                        onChange={handleInputChange}
                                        placeholder="도메인 입력"
                                        className="mt-2 bg-white"
                                    />
                                )}
                                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">전화번호</label>
                                 <div className="flex gap-2 items-stretch">
                                    <div className="flex-1 space-y-1">
                                        <Input 
                                            name="phone" 
                                            type="tel" 
                                            value={formData.phone} 
                                            onChange={handleInputChange} 
                                            placeholder="010-1234-5678" 
                                            disabled={isVerified}
                                        />
                                        <div>
                                            <div className="relative w-full">
                                                <Input 
                                                    name="verificationCode" 
                                                    value={formData.verificationCode} 
                                                    onChange={handleInputChange} 
                                                    placeholder="인증번호를 입력하세요."
                                                    maxLength={6}
                                                    disabled={!isCodeSent || isVerified}
                                                />
                                                {isCodeSent && (
                                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-red-500 font-mono">
                                                    {`${String(Math.floor(timer/60)).padStart(2,'0')}:${String(timer%60).padStart(2,'0')}`}
                                                  </span>
                                                )}
                                            </div>
                                            {isCodeSent && !isVerified && (
                                                <p className="text-xs text-slate-500 mt-1 px-1">
                                                    예비 키 (테스트용): <span className="font-mono font-bold">123456</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleSendCode}
                                        disabled={isCodeSent || isVerified}
                                        className="w-32 shrink-0 !bg-white !text-blue-600 border border-blue-600 hover:!bg-blue-50 focus:!ring-blue-500"
                                    >
                                        {isVerified ? (
                                            "인증 완료"
                                        ) : (
                                            <span className="text-center leading-tight">
                                                인증번호
                                                <br />
                                                받기
                                            </span>
                                        )}
                                    </Button>
                                </div>
                                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                {errors.verificationCode && <p className="text-xs text-red-500 mt-1">{errors.verificationCode}</p>}
                            </div>

                            <Button type="submit" className="w-full !mt-6">다음</Button>
                        </form>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <TypeSelectionCard 
                                emoji="👥"
                                title="일반 근로자"
                                description="매장 스케줄 확인 및 출퇴근 기록"
                                onClick={() => handleUserTypeSelect('worker')}
                            />
                            <TypeSelectionCard 
                                emoji="👨‍🍳"
                                title="개인 사업자"
                                description="단일 매장 관리 및 직원 근태 확인"
                                onClick={() => handleUserTypeSelect('sole_proprietor')}
                            />
                            <TypeSelectionCard 
                                emoji="🏢"
                                title="법인 사업자"
                                description="여러 매장 통합 관리"
                                onClick={() => handleUserTypeSelect('corporate')}
                            />
                             <div className="pt-2">
                                <Button type="button" variant="secondary" className="w-full !border !border-slate-300" onClick={() => setStep(1)}>이전</Button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (formData.userType === 'sole_proprietor' || formData.userType === 'corporate') && (
                        <form onSubmit={handleBusinessSubmit} className="space-y-4">
                            <div>
                                <Input label={formData.userType === 'corporate' ? '법인명' : '상호명'} name="businessName" value={formData.businessName} onChange={handleInputChange} />
                                {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
                            </div>
                            <div>
                                <Input label="사업자 등록번호" name="businessRegistrationNumber" value={formData.businessRegistrationNumber} onChange={handleInputChange} placeholder="'-' 없이 숫자만 입력" />
                                {errors.businessRegistrationNumber && <p className="text-xs text-red-500 mt-1">{errors.businessRegistrationNumber}</p>}
                            </div>
                             {formData.userType === 'corporate' && (
                                <div>
                                    <Input label="법인 등록번호" name="corporateRegistrationNumber" value={formData.corporateRegistrationNumber} onChange={handleInputChange} placeholder="'-' 없이 숫자만 입력" />
                                    {errors.corporateRegistrationNumber && <p className="text-xs text-red-500 mt-1">{errors.corporateRegistrationNumber}</p>}
                                </div>
                            )}
                            <div>
                                <Input label="대표자 성함" name="representativeName" value={formData.representativeName} onChange={handleInputChange} />
                                {errors.representativeName && <p className="text-xs text-red-500 mt-1">{errors.representativeName}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Input label="업태" name="businessType" value={formData.businessType} onChange={handleInputChange} />
                                    {errors.businessType && <p className="text-xs text-red-500 mt-1">{errors.businessType}</p>}
                                </div>
                                <div>
                                    <Input label="종목" name="businessItem" value={formData.businessItem} onChange={handleInputChange} />
                                    {errors.businessItem && <p className="text-xs text-red-500 mt-1">{errors.businessItem}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">개업년월일</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <select name="businessOpeningYear" value={formData.businessOpeningYear} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">년</option>
                                        {businessYears.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                    <select name="businessOpeningMonth" value={formData.businessOpeningMonth} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">월</option>
                                        {businessMonths.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <select name="businessOpeningDay" value={formData.businessOpeningDay} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                        <option value="">일</option>
                                        {businessDays.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                {errors.businessOpeningDate && <p className="text-xs text-red-500 mt-1">{errors.businessOpeningDate}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {formData.userType === 'corporate' ? '법인 사업자 등록증' : '사업자 등록증'}
                                </label>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border">
                                    <p className="text-sm text-slate-600 truncate">
                                        {formData.businessRegistrationFile ? formData.businessRegistrationFile.name : '파일을 선택해주세요'}
                                    </p>
                                    <label className="cursor-pointer shrink-0">
                                        <span className="text-sm font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-100">
                                            파일 업로드
                                        </span>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="button" variant="secondary" className="w-full !border !border-slate-300" onClick={() => setStep(2)}>이전</Button>
                                <Button type="submit" className="w-full">회원가입</Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <div className="text-center mt-6 text-sm">
                <span className="text-white opacity-80">이미 계정이 있으신가요? </span>
                <button type="button" onClick={onBackToLogin} className="font-semibold text-white hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-white rounded-sm">
                    로그인
                </button>
            </div>
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="가입 정보 확인"
                hideCloseButton={isWorkerConfirm}
                titleAlign={isWorkerConfirm ? 'center' : 'left'}
            >
                <div className="space-y-4">
                    <p className="text-center text-slate-600">입력하신 정보로 가입을 진행할까요?</p>
                    <div className="p-4 bg-slate-50 rounded-md space-y-1 text-sm max-h-60 overflow-y-auto">
                        <p><strong>아이디:</strong> {formData.id}</p>
                        <p><strong>이름:</strong> {formData.name}</p>
                        <p><strong>이메일:</strong> {formData.email}</p>
                        <p><strong>연락처:</strong> {formData.phone}</p>
                        <p><strong>회원 유형:</strong> {
                            formData.userType === 'worker' ? '일반 근로자' :
                            formData.userType === 'sole_proprietor' ? '개인 사업자' : '법인 사업자'
                        }</p>
                        {(formData.userType === 'sole_proprietor' || formData.userType === 'corporate') && (
                            <>
                                <p><strong>{formData.userType === 'corporate' ? '법인명' : '상호명'}:</strong> {formData.businessName}</p>
                                <p><strong>사업자 등록번호:</strong> {formData.businessRegistrationNumber}</p>
                                {formData.userType === 'corporate' && (
                                    <p><strong>법인 등록번호:</strong> {formData.corporateRegistrationNumber}</p>
                                )}
                                <p><strong>대표자 성함:</strong> {formData.representativeName}</p>
                                <p><strong>업태:</strong> {formData.businessType}</p>
                                <p><strong>종목:</strong> {formData.businessItem}</p>
                                <p><strong>개업년월일:</strong> {formData.businessOpeningDate}</p>
                            </>
                        )}
                    </div>
                    <div className={isWorkerConfirm ? "flex justify-center gap-4 pt-4 border-t" : "flex justify-end gap-3 pt-4 border-t"}>
                        <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)} className={isWorkerConfirm ? 'w-32' : ''}>취소</Button>
                        <Button onClick={handleFinalSubmit} className={isWorkerConfirm ? 'w-32' : ''}>확인</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
