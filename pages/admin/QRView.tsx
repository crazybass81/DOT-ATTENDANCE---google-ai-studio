import React from 'react';
import { Card, Button } from '../../components/ui';

export const QRView = () => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold">QR 관리</h2>
        <Card className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold">매장 QR 코드</h3>
            <p className="text-slate-500 mb-4">근로자가 이 QR 코드를 스캔하여 출퇴근합니다.</p>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://example.com/worker/store-123" alt="QR Code" className="border p-2 rounded-lg" />
            <div className="flex gap-4 mt-6">
                <Button>PNG 다운로드</Button>
                <Button variant="secondary">PDF 다운로드</Button>
                <Button variant="danger">재발급</Button>
            </div>
        </Card>
    </div>
);
