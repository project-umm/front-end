import React, { useEffect } from "react";
import Router from "next/router";

const LoginPage = () => {
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      Router.push("/dashboard");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 로그인 로직 구현
  };

  const handleEnterLogin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-1/3 h-1/3 border-2 border-umm-gray max-w-[600px] max-h-[500px] rounded-lg">
        <div className="flex flex-col justify-center items-center p-8">
          <span className="text-4xl font-chosun mb-8">音</span>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="id" className="text-left font-bold">
                이메일
              </label>
              <input
                type="text"
                id="id"
                placeholder="이메일"
                className="w-full p-2 border border-umm-gray rounded"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label htmlFor="password" className="text-left font-bold">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호"
                className="w-full p-2 border border-umm-gray rounded"
              />
            </div>
            <button
              type="submit"
              onKeyDown={handleEnterLogin}
              className="w-full mt-6 bg-umm-gray text-white py-2 rounded hover:bg-opacity-90 transition-colors cursor-pointer"
            >
              로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
