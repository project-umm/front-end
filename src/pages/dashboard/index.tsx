import { getAccessToken } from '@/api/token';
import { isEmpty } from 'lodash';
import Router from 'next/router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { MainContent } from '@/components/dashboard/MainContent';
import { DashboardResponse, getDashboard } from '@/api/dashboard';

const DashboardPage = () => {
  console.log('🟢 Dashboard 컴포넌트 시작');

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);

  const fetchDashboardData = useCallback(async () => {
    console.log('🟡 Dashboard API 호출 시작');
    try {
      const data = await getDashboard();
      console.log('🟢 Dashboard API 성공:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('🔴 대시보드 데이터를 가져오는데 실패했습니다:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🟡 Dashboard useEffect 시작');

    const accessToken = getAccessToken();
    console.log('🟡 Access Token:', accessToken ? '존재함' : '없음');

    if (isEmpty(accessToken)) {
      console.log('🔴 토큰 없음 - 로그인 페이지로 이동');
      Router.push('/login');
      return;
    }

    fetchDashboardData();

    const intervalId = setInterval(fetchDashboardData, 3 * 60 * 1000);

    return () => {
      console.log('🟡 Dashboard cleanup');
      clearInterval(intervalId);
    };
  }, [fetchDashboardData]);

  // 메모화된 props
  const sidebarProps = useMemo(
    () => ({
      profileUrl: dashboardData?.my_profile.profile_url,
      nickname: dashboardData?.my_profile.nickname,
    }),
    [dashboardData?.my_profile.profile_url, dashboardData?.my_profile.nickname]
  );

  const mainContentProps = useMemo(
    () => ({
      alarmNumber: dashboardData?.alarm_number || 0,
    }),
    [dashboardData?.alarm_number]
  );

  console.log(
    '🟢 Dashboard 렌더링, dashboardData:',
    dashboardData ? '존재함' : '없음',
    'alarmNumber:',
    mainContentProps.alarmNumber
  );

  return (
    <div className="w-full h-full p-4">
      <div className="w-full h-full border-umm-gray border-2 rounded-lg flex">
        <Sidebar {...sidebarProps} />
        <MainContent {...mainContentProps} />
      </div>
    </div>
  );
};

export default DashboardPage;
