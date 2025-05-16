import React, { useEffect, useState } from "react";
import Router from "next/router";
import { login } from "@/api/auth";
import { HttpStatusCode } from "axios";
import { getAccessToken } from "@/api/token";

const LoginPage = () => {
  useEffect(() => {
    const accessToken = getAccessToken();
    if (accessToken) {
      Router.push("/dashboard");
    }
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginResponse = await login({
      username,
      password,
    });

    if (loginResponse.status === HttpStatusCode.Ok) {
      Router.push("/dashboard");
    } else {
      alert("로그인에 실패했습니다. 이메일이나 비밀번호를 확인해주세요.");
    }
  };

  const handleEnterLogin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-1/3 h-1/3 border-2 border-umm-gray max-w-[600px] max-h-[500px] min-h-[400px] rounded-lg">
        <div className="flex flex-col justify-center items-center p-8">
          <span className="text-4xl font-chosun mb-8">音</span>
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="id" className="text-left font-bold">
                아이디
              </label>
              <input
                type="text"
                id="id"
                placeholder="아이디"
                className="w-full p-2 border border-umm-gray rounded"
                onChange={(e) => setUsername(e.target.value)}
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
                onKeyDown={handleEnterLogin}
                className="w-full p-2 border border-umm-gray rounded"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
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
