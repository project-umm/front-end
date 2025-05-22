import { getAccessToken } from '@/api/token';
import { isEmpty } from 'lodash';
import Router from 'next/router';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainContent } from '@/components/dashboard/MainContent';
import { DashboardResponse, getDashboard } from '@/api/dashboard';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  useEffect(() => {
    const accessToken = getAccessToken();
    if (isEmpty(accessToken)) {
      Router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const data = await getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('대시보드 데이터를 가져오는데 실패했습니다:', error);
      }
    };

    fetchDashboardData();

    const intervalId = setInterval(fetchDashboardData, 3 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full border-umm-gray border-2 rounded-lg flex">
        <Sidebar
          profileUrl={dashboardData?.my_profile.profile_url}
          nickname={dashboardData?.my_profile.nickname}
        />
        <MainContent alarmNumber={dashboardData?.alarm_number} />
      </div>
    </div>
  );
};

export default DashboardPage;
