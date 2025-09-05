
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
        <div className="blob blob4"></div>
        <div className="blob blob5"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-blue-700 tracking-tight">DOT ATTENDANCE</h1>
          <p className="text-lg text-slate-500 mt-2">출퇴근 관리 시스템</p>
        </div>

        <div className="w-full max-w-md mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/worker/sample-store" className="group">
            <Card className="p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm border border-white/30">
              <span className="text-6xl mb-4" role="img" aria-label="Workers">👥</span>
              <h2 className="text-2xl font-bold text-slate-800">근로자용</h2>
              <p className="text-slate-500 mt-1">출퇴근 기록 및 스케줄 확인</p>
            </Card>
          </Link>
          <Link to="/admin" className="group">
            <Card className="p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out cursor-pointer h-full flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm border border-white/30">
              <span className="text-6xl mb-4" role="img" aria-label="Admin">⚙️</span>
              <h2 className="text-2xl font-bold text-slate-800">관리자용</h2>
              <p className="text-slate-500 mt-1">직원 및 시스템 관리</p>
            </Card>
          </Link>
        </div>

        <footer className="absolute bottom-4 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} DOT Attendance. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;