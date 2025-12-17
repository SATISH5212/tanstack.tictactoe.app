import { BeforeLoadContextOptions, redirect } from "@tanstack/react-router";
import Cookies from "js-cookie";

const getIsAuthenticated = () => {
    return Cookies.get("token");
};

const authRoutes = [
    "/",
    //   "/signup",
    //   "/signin",
    //   "/verify",
    //   "/forgot-password",
    //   "/auth/reset-password",
    //   "/company-details",
    //   "/verify-user-document",
    //   "/success",
    //   "/complete",
    //   "/workflow-response/",
];

export const authMiddleware = async ({
    location,
}: BeforeLoadContextOptions<any, undefined, {}, {}, any>) => {
    if (typeof window == "undefined") return;

    if (!getIsAuthenticated() && !authRoutes.includes(location.pathname)) {
        throw redirect({
            to: "/",
        });
    }

    if (getIsAuthenticated() && authRoutes.includes(location.pathname)) {
        throw redirect({
            to: "/devices",
        });
    }
};
