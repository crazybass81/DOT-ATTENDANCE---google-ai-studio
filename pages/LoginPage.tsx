
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Textarea } from '../components/ui';
import { MOCK_ACCOUNTS, MOCK_EMPLOYEES_DATA } from '../data/mockData';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const idInputRef = useRef<HTMLDivElement>(null);
    const [isFindIdPwModalOpen, setFindIdPwModalOpen] = useState(false);

    const allAccounts = [
      ...MOCK_ACCOUNTS.map(acc => ({ type: '관리자', id: acc.id, password: acc.password })),
      ...MOCK_EMPLOYEES_DATA.map(emp => ({ type: '근로자', id: emp.name, password: emp.birthdate.replace(/-/g, '') }))
    ];

    const filteredAccounts = id
      ? allAccounts.filter(acc => acc.id.toLowerCase().includes(id.toLowerCase()))
      : allAccounts;

    const handleAccountSelect = (account: { id: string, password?: string }) => {
        setId(account.id);
        if (account.password) {
            setPassword(account.password);
        }
        setShowAutocomplete(false);
        setError('');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (idInputRef.current && !idInputRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const adminAccount = MOCK_ACCOUNTS.find(
            acc => acc.id === id && acc.password === password
        );

        if (adminAccount) {
            localStorage.setItem('loggedInAdmin', JSON.stringify(adminAccount));
            localStorage.removeItem('loggedInEmployeeId');
            navigate('/admin');
            return;
        }

        const workerAccount = MOCK_EMPLOYEES_DATA.find(
            emp => emp.name === id && emp.birthdate.replace(/-/g, '') === password
        );

        if (workerAccount) {
            localStorage.setItem('loggedInEmployeeId', String(workerAccount.id));
            localStorage.removeItem('loggedInAdmin');
            if (!workerAccount.storeId) {
                setError('근로자 계정에 매장 정보가 없습니다.');
                return;
            }
            navigate(`/worker/${workerAccount.storeId}/dashboard`);
            return;
        }

        setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            <div className="absolute inset-0 z-0">
                <div className="blob blob-admin-1"></div>
                <div className="blob blob-admin-2"></div>
                <div className="blob blob-admin-3"></div>
                <div className="blob blob-admin-4"></div>
                <div className="blob blob-admin-5"></div>
            </div>

            <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
                 <div className="w-full max-w-sm">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-700">DOT ATTENDANCE</h1>
                        <p className="text-lg text-slate-600 mt-1">출퇴근 관리 시스템</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg shadow-xl p-6">
                        <form className="space-y-4" onSubmit={handleLoginSubmit}>
                             <div className="relative" ref={idInputRef}>
                                <Input 
                                    placeholder="ID" 
                                    id="id" 
                                    name="id" 
                                    required 
                                    autoComplete="off"
                                    value={id}
                                    onChange={(e) => {
                                        setId(e.target.value);
                                        if (!showAutocomplete) setShowAutocomplete(true);
                                        setError('');
                                    }}
                                    onFocus={() => setShowAutocomplete(true)}
                                />
                                {showAutocomplete && filteredAccounts.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg">
                                        <ul className="py-1 max-h-48 overflow-y-auto">
                                            {filteredAccounts.map(account => (
                                                <li 
                                                    key={`${account.type}-${account.id}`} 
                                                    className="px-3 py-2 cursor-pointer hover:bg-slate-100 flex justify-between items-center"
                                                    onClick={() => handleAccountSelect(account)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    <span>{account.id}</span>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${account.type === '관리자' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                        {account.type}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <Input 
                                placeholder="비밀번호" 
                                id="password" 
                                name="password" 
                                type="password" 
                                required 
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                            />
                            <p className="text-xs text-slate-500 pt-1 px-1">
                                근로자는 ID(이름), PW(생년월일 8자리)로 로그인하세요.
                            </p>
                            {error && <p className="text-sm text-red-500 text-center -my-1 whitespace-pre-wrap">{error}</p>}
                            <Button type="submit" className="w-full !mt-5">로그인</Button>
                        </form>
                        <div className="text-center pt-4 text-sm text-slate-700">
                             <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                                회원가입
                            </Link>
                            <span className="mx-2 text-slate-400">|</span>
                            <button onClick={() => setFindIdPwModalOpen(true)} className="font-semibold text-blue-600 hover:underline">
                                ID/PW 찾기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <Modal 
                isOpen={isFindIdPwModalOpen} 
                onClose={() => setFindIdPwModalOpen(false)} 
                title="아이디/비밀번호 찾기"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-md">
                        계정 정보를 포함하여 아래 메일로 문의주시면 최대한 빠르게 답변드리겠습니다.
                    </p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        setFindIdPwModalOpen(false);
                    }}>
                        <div className="space-y-4">
                            <Input 
                                label="받는 사람"
                                id="dev-email"
                                name="dev-email"
                                type="email"
                                value="developer@dot-attendance.com"
                                disabled
                                className="bg-slate-100"
                            />
                            <Input 
                                label="회신받을 메일 주소" 
                                id="find-email" 
                                name="email" 
                                type="email" 
                                required 
                                placeholder="example@company.com" 
                            />
                             <Textarea
                                label="문의 내용"
                                id="find-message"
                                name="message"
                                required
                                placeholder="가입 시 입력한 이름, 회사명, 연락처 등을 입력해주세요."
                            />
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="secondary" onClick={() => setFindIdPwModalOpen(false)}>취소</Button>
                                <Button type="submit">메일 보내기</Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};