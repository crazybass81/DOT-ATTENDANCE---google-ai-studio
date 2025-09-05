import React, { useState } from 'react';
import { Card, Button } from '../../components/ui';

export const SettingsView = () => {
    const Section: React.FC<{title: string, children: React.ReactNode, description?: string}> = ({title, children, description}) => (
        <Card>
            <h3 className="text-lg font-bold mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-500 mb-4 pb-3 border-b">{description}</p>}
            <div className="space-y-4 pt-2">{children}</div>
        </Card>
    );

    const InfoRow: React.FC<{label: string, value: string}> = ({label, value}) => (
        <div className="flex items-center">
            <p className="w-24 font-semibold text-slate-600 shrink-0">{label}</p>
            <p className="text-slate-800">{value}</p>
        </div>
    );
    
    const Toggle: React.FC<{label: string, enabled: boolean}> = ({ label, enabled }) => {
        const [isEnabled, setIsEnabled] = useState(enabled);
        return (
            <div className="flex items-center justify-between py-1">
                <span className="text-slate-700">{label}</span>
                <button onClick={() => setIsEnabled(!isEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-slate-300'}`} aria-label={label}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
            </div>
        )
    };
    
    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold">설정</h2>

            <Section title="개인정보 설정" description="로그인된 관리자 계정 정보입니다.">
                <InfoRow label="이름" value="김관리" />
                <InfoRow label="아이디" value="admin" />
                <InfoRow label="이메일" value="admin@dot-attendance.com" />
                <div className="pt-2">
                    <Button variant="secondary" size="md">비밀번호 변경</Button>
                </div>
            </Section>

            <Section title="기본 설정" description="시스템의 기본 동작 방식을 설정합니다.">
                <div>
                    <label htmlFor="session-timeout" className="block text-sm font-medium text-slate-700">세션 만료 시간 (분)</label>
                    <input type="range" id="session-timeout" min="1" max="30" defaultValue="5" className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1 bg-white border border-slate-200
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-400"
                    />
                    <p className="text-center text-slate-600 text-sm">5 분</p>
                </div>
                 <div>
                    <label htmlFor="geofence" className="block text-sm font-medium text-slate-700">지오펜스 반경 (m)</label>
                    <input type="range" id="geofence" min="20" max="200" defaultValue="50" step="10" className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-1 bg-white border border-slate-200
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-400
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-400"
                    />
                     <p className="text-center text-slate-600 text-sm">50 미터</p>
                </div>
            </Section>
            
            <Section title="알림 설정" description="중요 이벤트 발생 시 알림 수신 여부를 설정합니다.">
                <Toggle label="신규 근로자 신청" enabled={true} />
                <Toggle label="스케줄 변경/휴무 신청" enabled={true} />
                <Toggle label="근태 이상(지각/결근) 발생" enabled={false} />
            </Section>

            <Section title="사용자 설정" description="관리자 계정 및 권한을 관리합니다.">
                 <Button variant="secondary">신규 관리자 초대</Button>
            </Section>

             <Section title="기타 설정">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="font-medium text-slate-700">데이터 내보내기</p>
                    <div className="flex gap-2">
                        <Button variant="secondary">근태기록 (CSV)</Button>
                        <Button variant="secondary">급여정산 (Excel)</Button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t">
                    <div className="">
                        <p className="font-medium text-red-600">계정 비활성화</p>
                        <p className="text-sm text-slate-500">모든 데이터가 보관되며, 언제든지 재활성화할 수 있습니다.</p>
                    </div>
                    <Button variant="danger">계정 비활성화</Button>
                </div>
             </Section>
        </div>
    )
};
