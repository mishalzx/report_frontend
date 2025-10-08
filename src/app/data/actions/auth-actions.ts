"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  registerUserService,
  loginUserService,
} from "@/app/data/actions/auth-service";

function extractStrapiErrors(responseData: any): string[] {
  if (!responseData) return ["Unknown error"]; 
  // Strapi v4 error shape: { error: { message, details: { errors: [{ message }] } } }
  const err = responseData.error;
  if (!err) return ["Unknown error"]; 
  const messages: string[] = [];
  if (typeof err.message === "string" && err.message.trim()) {
    messages.push(err.message);
  }
  const nested = err.details?.errors;
  if (Array.isArray(nested)) {
    for (const e of nested) {
      if (typeof e?.message === "string" && e.message.trim()) {
        messages.push(e.message);
      }
    }
  }
  return messages.length > 0 ? messages : ["Invalid username or password"]; 
}

// Cookie configuration
const config = {
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: "/", // Root path
  domain: "", // Use current domain
  httpOnly: true, // Prevent JavaScript access
  secure: false, // Set to false for HTTP
  sameSite: "lax" as const, // For compatibility
};

// FormState type for managing state
export interface FormState {
  zodErrors: {
    username?: string[];
    password?: string[];
    email?: string[];
    identifier?: string[];
  } | null;
  strapiErrors: string[] | null;
  data: unknown;
  message: string | null;
}

// Zod schemas for validation
const schemaRegister = z.object({
  username: z.string().min(3).max(20, {
    message: "Username must be between 3 and 20 characters",
  }),
  password: z.string().min(6).max(100, {
    message: "Password must be between 6 and 100 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

const schemaLogin = z.object({
  identifier: z.string().min(3).max(100, {
    message: "Identifier must be between 3 and 100 characters",
  }),
  password: z.string().min(6).max(100, {
    message: "Password must be between 6 and 100 characters",
  }),
});

// Register user action
export async function registerUserAction(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schemaRegister.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const responseData = await registerUserService(validatedFields.data);

  if (!responseData || responseData.error) {
    return {
      ...state,
      strapiErrors: extractStrapiErrors(responseData),
      message: "Registration failed.",
    };
  }

  (await cookies()).set("jwt", responseData.jwt, config);
  if (typeof window !== "undefined") {
    alert("Registration successful! Welcome to the platform.");
  }
  redirect("/dashboard");
  return { ...state, data: responseData, message: "Registration successful!" };
}

// Login user action
export async function loginUserAction(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = schemaLogin.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      zodErrors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }

  const responseData = await loginUserService(validatedFields.data);

  if (!responseData || responseData.error) {
    return {
      ...state,
      strapiErrors: extractStrapiErrors(responseData),
      message: "Login failed.",
    };
  }

  (await cookies()).set("jwt", responseData.jwt, config);
  redirect("/dashboard");
  return { ...state, data: responseData, message: "Login successful!" };
}

// Logout user action
export async function logoutAction(): Promise<void> {
  (await cookies()).set("jwt", "", { ...config, maxAge: 0 });
  redirect("/signin");
}
