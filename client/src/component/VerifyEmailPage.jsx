import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = useMemo(() => {
    const fromState = location.state?.email;
    if (fromState) return fromState;
    const params = new URLSearchParams(location.search);
    return params.get("email") || "";
  }, [location.search, location.state]);

  const open = (url) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white/95 border border-gray-100 shadow-xl rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center mb-5">
          <div className="h-1 w-16 rounded-full bg-red-500 mr-3 shadow-md" />
          <h1 className="text-2xl font-bold text-gray-900">Verify your email</h1>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-full bg-red-50 p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 8v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Check your inbox</p>
              <p className="text-sm text-gray-600 mt-1">
                We sent a verification link{email ? " to" : "."}
                {email ? (
                  <>
                    {" "}
                    <span className="font-medium text-gray-800 break-all">{email}</span>.
                  </>
                ) : null}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Click the link to verify your email, then come back and log in again.
              </p>
            </div>
          </div>

          <ul className="mt-4 text-sm text-gray-600 space-y-1">
            <li>• Check Spam/Promotions if you don’t see it.</li>
            <li>• The link may take a minute to arrive.</li>
            <li>• Use the same email you registered with.</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={() => open("https://mail.google.com/")}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:shadow-sm transition"
          >
            Open Gmail
          </button>
          <button
            type="button"
            onClick={() => open("https://outlook.live.com/mail/")}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:shadow-sm transition"
          >
            Open Outlook
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:scale-[1.01] transform transition"
          >
            Back to Login
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 hover:shadow-sm transition"
          >
            Edit email
          </button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-5">
          If you verified but still can’t log in, try again after a minute.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;