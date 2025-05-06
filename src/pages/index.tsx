import React, { useEffect } from "react";
import Router from "next/router";

const IndexPage = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      Router.push("/dashboard");
    } else {
      Router.push("/login");
    }
  }, []);

  return <></>;
};

export default IndexPage;
