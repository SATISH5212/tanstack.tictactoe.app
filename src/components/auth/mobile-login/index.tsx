"use client";

import { LogoIcon } from "@/components/svg/LogoIcon";
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
      navigate({ to: "/dashboard" });
      setAuthTokens(access_token, user_details);
      toast.success(response?.data?.message || "Login successful");
      reset();
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
      navigate({ to: "/dashboard" });
    }
  }, [navigate]);

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
    <div className="h-screen w-screen flex text-xs bg-white">
      <div className="w-8/12 rounded-xl overflow-hidden m-4">
        <img
          className="w-full h-full object-cover"
          src="/assets/image.webp"
          alt="Main Image"
        />
      </div>
      <div className="w-4/12 flex flex-col items-center gap-10 h-dvh px-24 justify-center">
        <LogoIcon />
        <div className="w-full space-y-5 text-35353d">
          <div className="text-center">
            <div className="text-lg font-normal">Sign In</div>
            <div className="text-gray-500 text-sm font-light">
             Sign in to access your Account
            </div>
          </div>
          <form
            onSubmit={handleSubmit(onEmailSubmit)}
  
            className="space-y-5"
          >
          
                <div className="space-y-1">
                  <div className="font-normal">
                    Email<span className="text-red-500"> *</span>
                  </div>
                  <div className="flex items-center w-full rounded-md border pl-2 bg-FAFAFA">
                    <EmailSvg />
                    <input
                      placeholder="Enter your email"
                      className="h-full outline-none p-2 w-full bg-inherit"
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

                <div className="space-y-1">
                  <div className="font-normal">
                    Password <span className="text-red-500">*</span>
                  </div>
                  <div className="flex items-center w-full rounded-md border pl-2 bg-f9f9f9">
                    <PasswordSvg />
                    <input
                      placeholder="Enter your Password"
                      className="h-full outline-none p-2 w-full bg-inherit font-light"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      {...register("password", {
                        onChange: () => clearFieldError("password"),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-2.5"
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

                <div className="text-center pt-5 space-y-8">
                  <Button
                    type="submit"
                    className="w-full text-white bg-primary p-2 rounded-full hover:bg-primary/80"
                    disabled={isPendingLogin}
                  >
                    {isPendingLogin && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isPendingLogin ? "Logging in..." : "Login"}
                  </Button>
                </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
