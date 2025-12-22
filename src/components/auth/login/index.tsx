"use client";

import IdharaLogo from "@/components/svg/iDharaLogo/iDhara_logo";
import { Button } from "@/components/ui/button";
import { updateAuthStore } from "@/lib/interfaces/auth/auth";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EmailSvg } from "src/components/svg/EmailSvg";
import { EyeSvg } from "src/components/svg/EyeSvg";
import { OpenEye } from "src/components/svg/OpenEye";
import { PasswordSvg } from "src/components/svg/PasswordSvg";
import {
  FormValues,
  phoneValues,
  ServerError,
  ValidationErrors,
} from "src/lib/interfaces/auth/login";
import { loginAPI } from "src/lib/services/auth";

const setAuthTokens = (accessToken: string, userDetails: any) => {
  Cookies.set("userDetails", JSON.stringify(userDetails));
  Cookies.set("token", accessToken, { secure: true, sameSite: "strict" });
  localStorage.setItem("authToken", accessToken);
  updateAuthStore({ token: accessToken, user: userDetails });
};

const handleServerError = (
  error: ServerError,
  setValidations: (val: ValidationErrors) => void,
  setConflictError: (val: { message?: string }) => void
) => {
  if (error?.status === 422) {
    setValidations(error?.data?.errors || {});
  } else if (error?.status === 409) {
    setConflictError({ message: error?.data?.message });
  } else if (error?.status === 404) {
    toast.error(error?.data?.message);
  } else {
    toast.error(error?.data?.message || "An error occurred");
  }
};

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidations] = useState<ValidationErrors>({});
  const [conflictError, setConflictError] = useState<{ message?: string }>({});

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    reset,
    setValue,
  } = useForm<FormValues & phoneValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: mutateLogin, isPending: isPendingLogin } = useMutation({
    mutationKey: ["login-user"],
    mutationFn: loginAPI,
    onSuccess: (response) => {
      const { access_token, user_details } = response?.data?.data || {};
      setAuthTokens(access_token, user_details);
      reset();
      navigate({ to: "/devices", replace: true });
      toast.success(response?.data?.message || "Login successful");
    },

    onError: (error: ServerError) => {
      handleServerError(error, setValidations, setConflictError);
    },
  });

  const onEmailSubmit = (data: FormValues) => {
    mutateLogin({ email: data.email, password: data.password });
  };

  const clearFieldError = (field: keyof (FormValues & phoneValues)) => {
    setValidations((prev: any) => ({ ...prev, [field]: null }));
    setConflictError({});
    clearErrors(field);
  };


  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      navigate({ to: "/devices", replace: true });
    }
  }, []);

  useEffect(() => {
    reset({
      email: "",
      password: "",
    });
    setValidations({});
    setConflictError({});
    clearErrors();
  }, [reset, clearErrors]);

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-center bg-cover"
      style={{
        backgroundImage: "url('/assets/iDhara_bgImage.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/20" />

      <div
        className="
            w-full max-w-md
            min-h-[430px]
            rounded-2xl
            bg-white/25
            backdrop-blur-md
            border border-white/30
            shadow-[0_8px_32px_rgba(0,0,0,0.25)]
            p-10
            text-white
          "
      >
        <div className="flex flex-col items-center gap-8">
          <IdharaLogo />

          <div className="w-full space-y-5">
            <div className="text-center">
              <div className="text-lg font-normal text-white">Sign In</div>
              <div className="text-white text-sm font-light">
                Sign in to access your Account
              </div>
            </div>

            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="font-light text-white text-xs">
                    Email<span className="text-red-500 "> *</span>
                  </div>
                  <div className="flex items-center w-full rounded-md border  pl-2">
                    <EmailSvg />
                    <input
                      placeholder="Enter your email"
                      className="h-full outline-none p-2.5 w-full bg-transparent placeholder-white text-xs font-light"
                      type="text"
                      autoComplete="off"
                      {...register("email", {
                        onChange: () => clearFieldError("email"),
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                  {validation.email && (
                    <p className="text-red-500 text-xs">{validation.email}</p>
                  )}
                </div>

                <div className="space-y-1 ">
                  <div className="font-light text-white text-xs">
                    Password <span className="text-red-500 ">*</span>
                  </div>
                  <div className="flex items-center w-full rounded-md border pl-2">
                    <PasswordSvg />
                    <input
                      placeholder="Enter your Password"
                      className="h-full outline-none p-2.5 w-full bg-transparent text-white placeholder-white text-xs font-light"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password", {
                        onChange: () => clearFieldError("password"),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-2.5 "
                    >
                      {showPassword ? <OpenEye /> : <EyeSvg />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs">
                      {errors.password.message}
                    </p>
                  )}
                  {validation.password && (
                    <p className="text-red-500 text-xs">
                      {validation.password}
                    </p>
                  )}
                  {conflictError?.message && (
                    <p className="text-red-500 text-xs">
                      {conflictError.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="  w-full rounded-lg bg-gradient-to-r from-blue-700 to-blue-500  py-2 font-light text-white  hover:opacity-90 "
                disabled={isPendingLogin}
              >
                {isPendingLogin && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                {isPendingLogin ? "Logging in..." : "Login"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
