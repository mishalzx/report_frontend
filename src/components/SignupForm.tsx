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


    


<section className="fxt-template-animation fxt-template-layout7 bg-set">
                <div className="kd-overlay"></div>

		<div className="container">
			<div className="row align-items-center justify-content-center">

				<div className="col-xl-6 col-lg-7 col-sm-12 col-12 fxt-bg-color">

					<div className="fxt-content">
						<div className="fxt-header">
							<a href="login-7.html" className="fxt-logo"><img src="https://ariflex.co/assets/imgs/Ariflex%20Logo-02.png" width={200} alt="Logo"/></a>
							<p>Login into your pages account</p>
						</div>
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
						<div className="fxt-style-line mt-4">
							<div className="fxt-transformY-50 fxt-transition-delay-5">
								<h3>Or Login With</h3>
							</div>
						</div>
						
						<div className="fxt-footer">
							<div className="fxt-transformY-50 fxt-transition-delay-9">
							<p>Don't have an account?<Link href="/signup" className="switcher-text2 inline-text">Register</Link></p>
							</div>
              
						</div>
            
					</div>
          
				</div>
        
			</div>
      
		</div>

	</section>







  );
};

export default SignupForm;
