
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminRegisterForm } from './AdminRegisterForm';

const RegisterPage = () => {
    const navigate = useNavigate();

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
                <AdminRegisterForm onBackToLogin={() => navigate('/')} />
            </div>
        </div>
    );
};

export default RegisterPage;
