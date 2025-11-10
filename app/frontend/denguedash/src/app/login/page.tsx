import { LoginForm } from "@/components/login/LoginForm";
import { VectorBackground } from "@/components/login/VectorBackground";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex min-h-screen flex-1 flex-col md:flex-row">
        {/* Left panel with background */}
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-teal-800 p-10 text-white">
          <VectorBackground />

          <div className="relative flex flex-col">
            <Link href={"/"} className="font-bold text-5xl">
              DengueDash
            </Link>
            <p className="mt-2 text-md font-light text-teal-100">
              A System for Real-time Dengue Monitoring and Forecasting
            </p>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="mb-8">
              <h1 className="text-5xl font-bold tracking-tight">
                Predict. <br />
                Prevent. <br />
                Protect.
              </h1>
              <div className="mt-6 max-w-md">
                <p className="text-lg text-teal-100">
                  Analytics and forecasting tools to help health professionals
                  combat dengue outbreaks effectively.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mb-20">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Data-driven Insights</h3>
                  <p className="text-xs text-teal-200">
                    Powered by machine learning
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Real-time Monitoring</h3>
                  <p className="text-xs text-teal-200">
                    Track cases as they happen
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel with login form */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-500">
                Enter your credentials below to access your account
              </p>
            </div>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
