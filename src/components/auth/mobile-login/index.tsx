"use client";

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { LogoIcon } from "@/components/svg/LogoIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useUserDetails } from "@/lib/helpers/userpermission";
import { updateAuthStore } from "@/lib/interfaces/auth/auth";
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
import { loginAPI, sendOtpAPI, verifyOtpAPI } from "src/lib/services/auth";

type ViewType = "email" | "phone" | "otp";
const OTP_LENGTH = 4;
const PHONE_LENGTH = 10;
const TIMER_DURATION = 59;

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

const useOtpTimer = () => {
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [canResend, setCanResend] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTimer(TIMER_DURATION);
    setCanResend(false);

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  return { timer, canResend, startTimer, stopTimer };
};

export function LoginPage() {
  const navigate = useNavigate();
  const { isAdmin } = useUserDetails();
  const { timer, canResend, startTimer, stopTimer } = useOtpTimer();
  const [view, setView] = useState<ViewType>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidations] = useState<ValidationErrors>({});
  const [conflictError, setConflictError] = useState<{ message?: string }>({});
  const [phoneNumber, setPhoneNumber] = useState("");

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
      phone: "",
      otp: "",
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

  const { mutate: mutateOtp, isPending: isPendingSendOtp } = useMutation({
    mutationKey: ["otp"],
    mutationFn: sendOtpAPI,
    onSuccess: (response) => {
      const phone = response?.data?.data?.phone || phoneNumber;
      setPhoneNumber(phone);
      setView("otp");
      toast.success(response?.data?.message || "OTP sent successfully");
    },
    onError: (error: ServerError) => {
      handleServerError(error, setValidations, setConflictError);
    },
  });

 const { mutate: mutateVerifyOtp, isPending: isPendingVerifyOtp } =
    useMutation({
      mutationKey: ["verify-otp"],
      mutationFn: verifyOtpAPI,
      onSuccess: (response) => {
        const { access_token, user_details } = response?.data?.data || {};
        setAuthTokens(access_token, user_details);
        localStorage.setItem("userId", user_details?.id);
        toast.success(response?.data?.message || "Login successful");
        reset();
        navigate({ to: isAdmin() ? "/dashboard" : "/ponds" });
      },
      onError: (error: ServerError) => {
        handleServerError(error, setValidations, setConflictError);
      },
    });

  const onEmailSubmit = (data: FormValues) => {
    mutateLogin({ email: data.email, password: data.password });
  };

  const onPhoneSubmit = (data: phoneValues) => {
    setPhoneNumber(data.phone);
    mutateOtp({ phone: data.phone });
  };

  const onOtpSubmit = (data: phoneValues) => {
    mutateVerifyOtp({ phone: phoneNumber, otp: data.otp });
  };

  const handleResendOtp = () => {
    if (!canResend) return;

    setValue("otp", "");
    clearFieldError("otp");
    mutateOtp({ phone: phoneNumber });
  };

  const handleOtpChange = (val: string) => {
    const numericValue = val.replace(/\D/g, "");
    setValue("otp", numericValue);
    clearFieldError("otp");

    if (numericValue.length === OTP_LENGTH) {
      mutateVerifyOtp({ phone: phoneNumber, otp: numericValue });
    }
  };

  const handleBackToPhone = () => {
    setView("phone");
    setValue("otp", "");
    stopTimer();
  };

  const handleSwitchToEmail = () => {
    setView("email");
    setPhoneNumber("");
    setValue("phone", "");
    stopTimer();
  };

  const handleSwitchToPhone = () => {
    setView("phone");
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
    const shouldKeepPhone = view === "otp" || view === "phone";
    reset({
      email: "",
      password: "",
      phone: shouldKeepPhone ? phoneNumber : "",
      otp: "",
    });
    setValidations({});
    setConflictError({});
    clearErrors();
  }, [view, phoneNumber, reset, clearErrors]);

  useEffect(() => {
    if (view === "otp") {
      setValue("otp", "");
      startTimer();
    } else {
      stopTimer();
    }
  }, [view]);

  const viewConfig = {
    email: {
      title: "Sign In",
      subtitle: "Sign in to access your Account",
    },
    phone: {
      title: "Verify Your Phone Number",
      subtitle: "Enter Phone Number to Access Your Account",
    },
    otp: {
      title: "OTP Verification",
      subtitle: `Enter the OTP sent to ****** ${phoneNumber.slice(6)}`,
    },
  };

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
            <div className="text-lg font-normal">{viewConfig[view].title}</div>
            <div className="text-gray-500 text-sm font-light">
              {viewConfig[view].subtitle}
            </div>
          </div>
          <form
            onSubmit={handleSubmit(
              view === "email"
                ? onEmailSubmit
                : view === "phone"
                  ? onPhoneSubmit
                  : onOtpSubmit
            )}
            className="space-y-5"
          >
            {view === "email" && (
              <>
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

                  <div className="cursor-pointer">
                    <span
                      className="text-blue-500"
                      onClick={handleSwitchToPhone}
                    >
                      Login with Phone Number
                    </span>
                  </div>
                </div>
              </>
            )}
            {view === "phone" && (
              <>
                <div className="space-y-1">
                  <Input
                    placeholder="Enter phone number"
                    autoComplete="off"
                    maxLength={PHONE_LENGTH}
                    autoFocus
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Invalid phone number (10 digits required)",
                      },
                      onChange: () => clearFieldError("phone"),
                    })}
                    className="h-full outline-none p-2 w-full bg-inherit"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^0-9]/g,
                        ""
                      );
                    }}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs">
                      {errors.phone.message}
                    </p>
                  )}
                  {validation.phone && (
                    <p className="text-red-500 text-xs">{validation.phone}</p>
                  )}
                </div>

                <div className="text-center pt-5 space-y-6">
                  <Button
                    type="submit"
                    className="w-full text-white bg-primary p-2 rounded-full hover:bg-primary/80"
                    disabled={isPendingSendOtp}
                  >
                    {isPendingSendOtp && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isPendingSendOtp ? "Sending OTP..." : "Send OTP"}
                  </Button>

                  <div className="cursor-pointer">
                    <span
                      className="text-blue-500"
                      onClick={handleSwitchToEmail}
                    >
                      Back to Email Login
                    </span>
                  </div>
                </div>
              </>
            )}
            {view === "otp" && (
              <>
                <div className="flex flex-col justify-center space-y-1">
                  <div className="flex justify-center">
                    <Controller
                      control={control}
                      name="otp"
                      render={({ field }) => (
                        <InputOTP
                          maxLength={OTP_LENGTH}
                          value={field.value || ""}
                          onChange={handleOtpChange}
                          autoFocus
                        >
                          <InputOTPGroup>
                            {Array.from({ length: OTP_LENGTH }, (_, i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="border-black bg-white text-black h-12 w-12 text-lg 3xl:text-xl ml-1 mr-1 [&_.caret]:bg-black"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    />
                  </div>

                  <div className="flex flex-row justify-center">
                    {errors.otp && (
                      <p className="text-red-500 text-xs">
                        {errors.otp.message}
                      </p>
                    )}
                    {validation.otp && (
                      <p className="text-red-500 text-xs">{validation.otp}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-center mt-4 text-sm text-gray-600">
                    <p>Didn't receive the OTP?</p>
                    {canResend ? (
                      <button
                        type="button"
                        className="font-medium hover:underline-offset-4 hover:underline text-blue-400 hover:text-blue-500"
                        onClick={handleResendOtp}
                      >
                        Resend OTP
                      </button>
                    ) : (
                      <p className="font-medium">
                        Resend OTP in{" "}
                        <span className="text-yellow-500 font-semibold">
                          {timer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-center pt-2 space-y-8">
                  <Button
                    type="submit"
                    className="w-full text-white bg-primary p-2 rounded-full hover:bg-primary/80 disabled:cursor-not-allowed"
                    disabled={isPendingVerifyOtp}
                  >
                    {isPendingVerifyOtp && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isPendingVerifyOtp ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div className="cursor-pointer">
                    <span className="text-blue-500" onClick={handleBackToPhone}>
                      Back to Phone
                    </span>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
