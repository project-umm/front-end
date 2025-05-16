import { clearTokens, getAccessToken } from "@/api/token";
import { isEmpty } from "lodash";
import Router from "next/router";
import React, { useEffect } from "react";

const DashboardPage = () => {
  useEffect(() => {
    const accessToken = getAccessToken();
    if (isEmpty(accessToken)) {
      Router.push("/login");
    }
  }, []);

  return (
    <div className="w-full h-full p-8">
      Dashboard
      <br />
      <button
        className="cursor-pointer"
        onClick={() => {
          clearTokens();
          Router.push("/");
        }}
      >
        logout for test
      </button>
    </div>
  );
};

export default DashboardPage;
