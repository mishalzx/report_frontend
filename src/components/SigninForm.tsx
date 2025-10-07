"use client";

import React from 'react'
import { useFormState } from 'react-dom';
import { loginUserAction } from '@/app/data/actions/auth-actions';
import { StrapiErrors } from './custom/strapiErrors';
import { ZodErrors } from './custom/ZodErrors';

const SigninForm = () => {

  const INITIAL_STATE = {
    zodErrors: null,
    strapiErrors: null,
    data: null,
    message: null,
  };

  const [formState, formAction] = useFormState(loginUserAction, INITIAL_STATE);

  return (
  











<section className="fxt-template-animation fxt-template-layout7 bg-set">
                <div className="kd-overlay"></div>

		<div className="container">
			<div className="row align-items-center justify-content-center">

				<div className="col-xl-6 col-lg-7 col-sm-12 col-12 fxt-bg-color">

					<div className="fxt-content">
						<div className="fxt-header">
							<a href="login-7.html" className="fxt-logo"><img src="img/logo-7.png" alt="Logo"/></a>
							<p>Login into your pages account</p>
						</div>
						<div className="fxt-form">
							  <form id="loginForm" className="form-dark" method="post" action={formAction}>

                      <div className='text-danger'><StrapiErrors error={formState?.strapiErrors} /></div>

                      <div className="mb-3">
                        <label className="form-label text-light" >Username</label>
                        <input type="text" className="form-control" id="identifier"
                          name="identifier" required placeholder="Enter Your username" />
                        <ZodErrors error={formState?.zodErrors?.identifier} />

                      </div>


                      <div className="mb-3">
                        <label className="form-label text-light" >Password</label>
                        <a className="float-end text-2" href="">Forgot Password ?</a>
                        <input type="password" className="form-control" id="password"
                          name="password" required placeholder="Enter Password" />
                        <ZodErrors error={formState?.zodErrors?.password} />

                      </div>
                      <button className="tp-btn-blue w-100 position-relative" type="submit">
                    <span className="text">                    Login
                    </span>
                    <span className="icon position-absolute floatbtn">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L10 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M10 1V10H1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </span>
                  </button>
                      {/* <button className="btn btn-primary my-2" type="submit">Log in</button> */}
                    </form>
						</div>
						<div className="fxt-style-line">
							<div className="fxt-transformY-50 fxt-transition-delay-5">
								<h3>Or Login With</h3>
							</div>
						</div>
						
						<div className="fxt-footer">
							<div className="fxt-transformY-50 fxt-transition-delay-9">
								<p>Don't have an account?<a href="register-7.html" className="switcher-text2 inline-text">Register</a></p>
							</div>
              
						</div>
            
					</div>
          
				</div>
        
			</div>
      
		</div>

	</section>







  )
}

export default SigninForm