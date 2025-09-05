import React from 'react';

export const AppHeader = ({ onMenuClick, onTitleClick, isSidebarContext = false }: { onMenuClick: () => void, onTitleClick?: () => void, isSidebarContext?: boolean }) => (
    <div className={`flex items-center gap-4 ${isSidebarContext ? 'mb-4' : ''}`}>
        <button
            onClick={onMenuClick}
            className="text-2xl text-slate-600"
            aria-label={isSidebarContext ? "사이드바 닫기" : "메뉴 열기"}
        >
            <span role="img" aria-hidden="true">☰</span>
        </button>
        <h1 
            className={`text-xl font-bold text-blue-700 ${onTitleClick ? 'cursor-pointer' : ''}`}
            onClick={onTitleClick}
            onKeyDown={(e) => { if (onTitleClick && (e.key === 'Enter' || e.key === ' ')) onTitleClick(); }}
            role={onTitleClick ? 'button' : undefined}
            tabIndex={onTitleClick ? 0 : -1}
            aria-label={onTitleClick ? '대시보드로 이동' : undefined}
        >
            DOT ATTENDANCE
        </h1>
    </div>
);
