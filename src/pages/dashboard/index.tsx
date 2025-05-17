import { getAccessToken } from '@/api/token';
import { isEmpty } from 'lodash';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainContent } from '@/components/dashboard/MainContent';

const DashboardPage = () => {
  useEffect(() => {
    const accessToken = getAccessToken();
    if (isEmpty(accessToken)) {
      Router.push('/login');
    }
  }, []);

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full border-umm-gray border-2 rounded-lg flex">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export default DashboardPage;
