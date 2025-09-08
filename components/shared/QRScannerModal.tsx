
import React, { useEffect, useRef } from 'react';
import { Modal } from '../ui';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess }: { isOpen: boolean, onClose: () => void, onScanSuccess: (data: string) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        streamRef.current = stream;
                    }
                })
                .catch(err => {
                    console.error("Error accessing camera:", err);
                    alert("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
                    onClose();
                });
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
        
        return () => {
             if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    }, [isOpen, onClose]);

    // NOTE: The onScanSuccess prop is not called here as QR code scanning logic
    // is not implemented in this mock application. A real implementation would
    // use a library to process the video stream and decode a QR code.

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="QR 코드 스캔" size="sm">
            <div className="relative w-full aspect-square bg-black rounded-md overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                <div className="absolute inset-0 border-4 border-white/50 rounded-md"></div>
            </div>
            <p className="text-center text-sm text-slate-500 my-4">QR 코드를 화면에 맞춰주세요.</p>
        </Modal>
    );
};

export default QRScannerModal;
