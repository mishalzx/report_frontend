"use client";

import { loginUserAction } from "@/app/data/actions/auth-actions";
import Link from "next/link";
import { useActionState } from "react";
import AuthLayout from "./Auth/AuthLayout";
import { StrapiErrors } from "./custom/strapiErrors";
import { ZodErrors } from "./custom/ZodErrors";

const SigninForm = () => {
  const INITIAL_STATE = {
    zodErrors: null,
    strapiErrors: null,
    data: null,
    message: null,
  };

  const [formState, formAction] = useActionState(
    loginUserAction,
    INITIAL_STATE
  );

  return (
    <AuthLayout title="Hello Mate!" subTitle="Sign in to your account">
      <div className=" mt-5">
        <form
          id="loginForm"
          className="form-dark"
          method="post"
          action={formAction}
        >
          <div className="text-danger">
            <StrapiErrors error={formState?.strapiErrors} />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark">
              Username <span className="primary-text">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="identifier"
              name="identifier"
              required
              placeholder="Enter Your username"
            />
            <ZodErrors error={formState?.zodErrors?.identifier} />
          </div>

          <div className="mb-4">
            <label className="form-label text-dark">
              Password <span className="primary-text">*</span>
            </label>

            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              required
              placeholder="Enter Password"
            />
            <ZodErrors error={formState?.zodErrors?.password} />
          </div>
          <div className=" mb-5">
            <a className=" text-2 text-dark text-decoration-none" href="">
              Forgot Password ?
            </a>
          </div>
          <button
            className="tp-btn-blue w-50 rounded-1 position-relative d-flex gap-2 align-items-center justify-content-center"
            type="submit"
          >
            <span className=" text-white letter-spacing"> Log in</span>
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
        </form>
        <div className="fxt-footer pt-4 ">
          <div className="fxt-transformY-50 fxt-transition-delay-9">
            <p className="text-dark letter-spacing">
              Don't have an account?
              <Link href="/signup" className="mx-2 primary-text">
                Register
              </Link>
            </p>
          </div>
        </div>
        {/* <div className="fxt-style-line mt-4">
              <div className="fxt-transformY-50 fxt-transition-delay-5">
                <h6 className="text-dark letter-spacing">Or Login With</h6>
              </div>
            </div> */}
      </div>
    </AuthLayout>
  );
};

export default SigninForm;
