"use client";

import React from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { registerUserAction } from "@/app/data/actions/auth-actions";
import { StrapiErrors } from "./custom/strapiErrors";
import { ZodErrors } from "./custom/ZodErrors";
import Authbg from "./Auth/AuthBg";
import AuthLayout from "./Auth/AuthLayout";

const SignupForm: React.FC = () => {
  const INITIAL_STATE = {
    zodErrors: null,
    strapiErrors: null,
    data: null,
    message: null,
  };

  const [formState, formAction] = useFormState(
    registerUserAction,
    INITIAL_STATE
  );

  return (
    <AuthLayout title="Hello Mate!" subTitle="Sign up to your account">
      <div className=" mt-5">
        <form id="signupForm" method="post" action={formAction}>
          <div className="mb-4">
            <label className="form-label text-dark">
              Username <span className="primary-text">*</span>
            </label>
            <input
              type="text"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              required
            />
            {formState?.zodErrors?.username && (
              <ZodErrors error={formState.zodErrors.username} />
            )}
          </div>
          <div className="mb-4">
            <label className="form-label text-dark">
              Email Address <span className="primary-text">*</span>
            </label>
            <input
              type="email"
              className="form-control"
              name="email"
              placeholder="Enter your email"
              required
            />
            {formState?.zodErrors?.email && (
              <ZodErrors error={formState.zodErrors.email} />
            )}
          </div>
          <div className="mb-4">
            <label className="form-label text-dark">
              Password <span className="primary-text">*</span>
            </label>
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
            />
            {formState?.zodErrors?.password && (
              <ZodErrors error={formState.zodErrors.password} />
            )}
          </div>
          <div>
            {formState?.strapiErrors && (
              <StrapiErrors error={formState.strapiErrors} />
            )}
          </div>
          <button
            className="tp-btn-blue w-50 rounded-1 position-relative d-flex gap-2 align-items-center justify-content-center mt-5"
            type="submit"
          >
            <span className="text">Register</span>
            <span className="icon">
              <svg
                width="11"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2L22 22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2V22H2"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          {formState.message && <p>{formState.message}</p>}
        </form>
        <div className="fxt-footer pt-4 ">
          <div className="fxt-transformY-50 fxt-transition-delay-9">
            <p className="text-dark letter-spacing">
              Already have an account?
              <Link href="/signin" className="mx-2 primary-text">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupForm;
