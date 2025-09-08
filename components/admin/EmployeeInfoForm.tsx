
import React, { useState, useMemo, useRef } from 'react';
import { Employee } from '../../types';
import { Input, Textarea, Tabs, DatePicker, Button } from '../ui';

export interface EmployeeFormData extends Partial<Employee> {
    accountNumber?: string;
    contract?: string | null;
    bankAccountCopy?: string | null;
}

interface EmployeeInfoFormProps {
    data: EmployeeFormData;
    onDataChange: (field: keyof EmployeeFormData, value: any) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    isNew?: boolean;
}

const KOREAN_BANKS = ['선택', '국민', '신한', '우리', '하나', '기업', '농협', '카카오뱅크', '케이뱅크', '토스뱅크', '새마을금고', '우체국', 'SC제일', '씨티', '수협', '경남', '광주', '대구', '부산', '전북', '제주', '산업', '기타'];

export const EmployeeInfoForm: React.FC<EmployeeInfoFormProps> = ({ data, onDataChange, activeTab, onTabChange, isNew }) => {
    const [isHireDatePickerOpen, setIsHireDatePickerOpen] = useState(false);
    const colorInputRef = useRef<HTMLInputElement>(null);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onDataChange(e.target.name as keyof EmployeeFormData, e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: 'contract' | 'bankAccountCopy') => {
        if (e.target.files && e.target.files[0]) {
            onDataChange(docType, e.target.files[0].name);
        }
    };

    const getBankName = (accountStr?: string) => {
        if (!accountStr) return '';
        const parts = accountStr.split(' ');
        if (KOREAN_BANKS.includes(parts[0])) return parts[0];
        return '';
    };

    const getAccountNumberOnly = (accountStr?: string) => {
        if (!accountStr) return '';
        const parts = accountStr.split(' ');
        const bankName = getBankName(accountStr);
        if (bankName && parts.length > 1) {
            return parts.slice(1).join('').replace(/-/g, '');
        }
        return accountStr.replace(/-/g, '');
    };
    
    const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const currentBank = getBankName(data.accountNumber);
        const currentNumber = getAccountNumberOnly(data.accountNumber);

        let newBank = currentBank;
        let newNumber = currentNumber;

        if (e.target.name === 'bankName') {
            newBank = e.target.value === '선택' ? '' : e.target.value;
        } else if (e.target.name === 'accountNumberOnly') {
            newNumber = e.target.value.replace(/\D/g, ''); // Allow only digits
        }

        onDataChange('accountNumber', `${newBank} ${newNumber}`.trim());
    };

    const maskPhoneNumber = (phone: string) => {
        if (!phone) return '';
        // Masks phone numbers like 010-1234-5678 to 010-****-5678
        return phone.replace(/(\d{3}-)\d{4}(-\d{4})/, '$1****$2');
    };
    
    const renderDocumentRow = (label: string, docType: 'contract' | 'bankAccountCopy', docName: string | null | undefined) => (
         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
            <div>
                <p className="font-semibold">{label}</p>
                {docName ? (
                     <p className="text-sm text-blue-600">{docName}</p>
                ) : (
                    <p className="text-sm text-red-500">미제출</p>
                )}
            </div>
            <label className="cursor-pointer">
                <span className="text-sm font-medium bg-white border border-slate-300 rounded-md px-3 py-1.5 hover:bg-slate-100">파일 선택</span>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, docType)} />
            </label>
        </div>
    );
    
    const renderTabContent = () => {
        switch (activeTab) {
            case '기본':
                return <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-5">
                    <Input label="이름" name="name" value={data.name || ''} onChange={handleInputChange} disabled={isNew} />
                    <Input 
                        label="연락처" 
                        name="phone" 
                        value={isNew ? maskPhoneNumber(data.phone || '') : (data.phone || '')}
                        onChange={handleInputChange}
                        disabled={isNew}
                    />
                    <Input label="생년월일" name="birthdate" type="date" value={data.birthdate || ''} onChange={handleInputChange} disabled={isNew} />
                    <div>
                        <label htmlFor="employeeColor" className="block text-sm font-medium text-slate-700 mb-1">근로자 색상</label>
                        <div className="relative flex items-center border border-slate-300 bg-white rounded-md shadow-sm">
                             <div 
                                className="w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer"
                                onClick={() => colorInputRef.current?.click()}
                            >
                                <div className="w-6 h-6 rounded border" style={{ backgroundColor: data.color || '#ffffff' }}></div>
                            </div>
                            <input
                                id="employeeColorCode"
                                type="text"
                                name="color"
                                value={data.color || ''}
                                onClick={() => colorInputRef.current?.click()}
                                onChange={handleInputChange}
                                className="w-full pl-1 py-2 border-l focus:outline-none focus:ring-0 border-transparent bg-transparent cursor-pointer"
                                placeholder="#RRGGBB"
                                readOnly
                            />
                            <input
                                ref={colorInputRef}
                                id="employeeColor"
                                type="color"
                                value={data.color || '#ffffff'}
                                onChange={handleInputChange}
                                name="color"
                                className="absolute left-0 top-0 w-10 h-10 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>;
            case '고용':
                return (
                    <div className="col-span-full grid grid-cols-2 gap-x-4 gap-y-5">
                        <Input label="직급" name="position" value={data.position || ''} onChange={handleInputChange} placeholder="예: 파트타이머" />
                        <div className="relative z-10">
                            <label className="block text-sm font-medium text-slate-700 mb-1">입사일</label>
                             <button 
                                type="button" 
                                onClick={() => setIsHireDatePickerOpen(p => !p)}
                                className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm text-left font-normal h-[42px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {data.hireDate || <span className="text-slate-400">날짜 선택</span>}
                            </button>
                             {isHireDatePickerOpen && (
                                <DatePicker 
                                    currentDate={data.hireDate ? new Date(data.hireDate) : new Date()}
                                    onDateSelect={(date) => {
                                        onDataChange('hireDate', date.toISOString().split('T')[0]);
                                        setIsHireDatePickerOpen(false);
                                    }}
                                    onClose={() => setIsHireDatePickerOpen(false)}
                                />
                            )}
                        </div>
                        <div>
                            <label htmlFor="employmentTypeEdit" className="block text-sm font-medium text-slate-700 mb-1">고용 형태</label>
                            <select id="employmentTypeEdit" name="employmentType" value={data.employmentType || '아르바이트'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                <option value="정규">정규</option>
                                <option value="아르바이트">아르바이트</option>
                            </select>
                        </div>
                        {data.id && (
                            <div>
                                <label htmlFor="statusEdit" className="block text-sm font-medium text-slate-700 mb-1">상태</label>
                                <select id="statusEdit" name="status" value={data.status || '재직'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                    <option value="재직">재직</option>
                                    <option value="휴직">휴직</option>
                                    <option value="퇴사">퇴사</option>
                                </select>
                            </div>
                        )}
                        {data.id && data.status === '퇴사' && (
                            <div className="col-span-2">
                                <Textarea label="퇴사 사유" name="reasonForResignation" value={data.reasonForResignation || ''} onChange={handleInputChange} placeholder="퇴사 사유를 입력해주세요." />
                            </div>
                        )}
                    </div>
                );
            case '급여':
                return <>
                    <div>
                        <label htmlFor="payTypeEdit" className="block text-sm font-medium text-slate-700 mb-1">급여 형태</label>
                        <select id="payTypeEdit" name="payType" value={data.payType || '시급'} onChange={handleInputChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            <option value="시급">시급</option>
                            <option value="월급">월급</option>
                        </select>
                    </div>
                    <Input label="급여액(원)" name="payRate" type="number" value={data.payRate || ''} onChange={handleInputChange} placeholder="예: 12000"/>
                    <div className="col-span-2 grid grid-cols-5 gap-x-3">
                        <div className="col-span-2">
                             <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 mb-1">은행</label>
                             <select id="bankName" name="bankName" value={getBankName(data.accountNumber)} onChange={handleAccountChange} className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                {KOREAN_BANKS.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                             </select>
                        </div>
                        <div className="col-span-3">
                            <label htmlFor="accountNumberOnly" className="block text-sm font-medium text-slate-700 mb-1">계좌번호</label>
                             <input 
                                id="accountNumberOnly"
                                name="accountNumberOnly"
                                type="text"
                                value={getAccountNumberOnly(data.accountNumber)}
                                onChange={handleAccountChange}
                                className="bg-white w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="숫자만 입력"
                            />
                            <p className="text-xs text-slate-500 mt-1">-를 제외하고 입력해주세요</p>
                        </div>
                    </div>
                </>;
            case '서류':
                return <div className="col-span-2 space-y-3">
                    {renderDocumentRow('근로계약서', 'contract', data.contract)}
                    {renderDocumentRow('통장사본', 'bankAccountCopy', data.bankAccountCopy)}
                </div>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {isNew ? (
                 <div className="flex justify-center items-center gap-2 border-b">
                    {['기본', '고용', '급여', '서류'].map(tab => (
                        <Button
                            key={tab}
                            type="button"
                            variant={activeTab === tab ? 'primary' : 'secondary'}
                            onClick={() => onTabChange(tab)}
                            className={`
                                ${activeTab === tab 
                                    ? 'shadow-sm'
                                    : '!bg-transparent !text-slate-500 !shadow-none hover:!bg-slate-100'
                                }`
                            }
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
            ) : (
                <Tabs tabs={['기본', '고용', '급여', '서류']} activeTab={activeTab} onTabChange={onTabChange} align="center" />
            )}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                {renderTabContent()}
            </div>
        </div>
    );
};
