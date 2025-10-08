"use client";

import React from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { registerUserAction } from "@/app/data/actions/auth-actions";
import { StrapiErrors } from "./custom/strapiErrors";
import { ZodErrors } from "./custom/ZodErrors";

const SignupForm: React.FC = () => {
  const INITIAL_STATE = {
    zodErrors: null,
    strapiErrors: null,
    data: null,
    message: null,
  };

  const [formState, formAction] = useFormState(registerUserAction, INITIAL_STATE);

  return (

    <section className="fxt-template-animation fxt-template-layout4 loaded">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6 col-12 fxt-bg-wrap">
            <div className="fxt-bg-img bgsectsigupimg">
              <div className="fxt-header">
                <div className="fxt-transformY-50 fxt-transition-delay-1">
                  {/* <a href="login-4.html" className="fxt-logo"><img src="img/logo-4.png" alt="Logo" /></a> */}
                </div>
                <div className="fxt-transformY-50 fxt-transition-delay-2">
                  <h1>Welcome To Our My Own Perfume</h1>
                </div>
                <div className="fxt-transformY-50 fxt-transition-delay-3">
                  <p>Our perfume formulas are crafted using a blend of chemical analysis, olfactory expertise, and thorough research, drawing inspiration from the most renowned fragrances on the market. This approach provides valuable insight into the composition and success of popular perfumes and their scent profiles. .</p>
                </div>
              </div>
              <ul className="fxt-socials">
                <li className="fxt-facebook fxt-transformY-50 fxt-transition-delay-4"><a href="#" title="Facebook"><i className="fab fa-facebook-f"></i></a></li>
                <li className="fxt-twitter fxt-transformY-50 fxt-transition-delay-5"><a href="#" title="twitter"><i className="fab fa-twitter"></i></a></li>
                <li className="fxt-google fxt-transformY-50 fxt-transition-delay-6"><a href="#" title="google"><i className="fab fa-google-plus-g"></i></a></li>
                <li className="fxt-linkedin fxt-transformY-50 fxt-transition-delay-7"><a href="#" title="linkedin"><i className="fab fa-linkedin-in"></i></a></li>
                <li className="fxt-youtube fxt-transformY-50 fxt-transition-delay-8"><a href="#" title="youtube"><i className="fab fa-youtube"></i></a></li>
              </ul>
            </div>
          </div>
          <div className="col-md-6 col-12 fxt-bg-color">
            <div className="fxt-content">
              <div className="fxt-form">
                <form id="signupForm" method="post" action={formAction}>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" name="username" className="form-control"
                      placeholder="Enter your username" required />
                    {formState?.zodErrors?.username && (
                      <ZodErrors error={formState.zodErrors.username} />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" className="form-control"
                      name="email" placeholder="Enter your email" required />
                    {formState?.zodErrors?.email && <ZodErrors error={formState.zodErrors.email} />}
                  </div>
                  <div className="form-group">
                    <label>Password</label>
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
                    {formState?.strapiErrors && <StrapiErrors error={formState.strapiErrors} />}
                  </div>
                  <button className="tp-btn-blue w-100 mt-2 position-relative" type="submit">
                    <span className="text">                    Register
                    </span>
                    <span className="icon position-absolute floatbtn">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L10 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M10 1V10H1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </button>
                  {formState.message && <p>{formState.message}</p>}
                </form>
              </div>
              <div className="fxt-footer">
                <p>have an account?<Link href="/signin" className="switcher-text2 inline-text">Signin</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
};

export default SignupForm;
