import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Titlebar from './Titlebar';

import { ErrorBoundary } from '../ui/ErrorBoundary';
import { FeedbackButton } from '../ui/FeedbackButton';
import { BackgroundGlow } from '../ui/BackgroundGlow';

export default function MainLayout() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0F0F14] text-white relative">
      <BackgroundGlow />
      <Titlebar />
      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 pl-8 pb-6">
          <div className="max-w-6xl mx-auto h-full">
            <ErrorBoundary>
              <div className="h-full">
                <Outlet />
              </div>
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <FeedbackButton 
        url="https://tally.so/r/yPOGa4" 
        className="bottom-5 transition-all duration-300" 
      />
    </div>
  );
}
