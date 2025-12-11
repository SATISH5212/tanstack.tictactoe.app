import Cookies from "js-cookie";
import prepareURLEncodedParams from "./helpers/prepareURLEncodedparams";

interface IAPIResponse {
  message: string;
  success: boolean;
  status: number;
  data: any;
}

class FetchService {
  authStatusCodes: number[] = [403];
  authErrorURLs: string[] = ["/auth/login", "/auth/forgot-password", "auth/verify-otp"];
  private _fetchType: string;
  private _apiUrl: string;

  constructor(fetchTypeValue = "json", apiUrl: string) {
    this._fetchType = fetchTypeValue;
    this._apiUrl = apiUrl;
  }

  configureAuthorization(config: any) {
    let accessToken = "";
    accessToken += Cookies.get("token");

    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }

  setHeader(config: any) {
    config.headers = {};
  }

  setDefaultHeaders(config: any) {
    config.headers = {
      "Content-Type": "application/json",
    };
  }

  checkToLogOutOrNot(path: string) {
    return this.authErrorURLs.some((arrayUrl: string) =>
      path.includes(arrayUrl)
    );
  }

  isAuthRequest(path: string) {
    return this.authErrorURLs.includes(path);
  }

  async hit(...args: any): Promise<IAPIResponse> {
    let [path, config] = args;
    this.setDefaultHeaders(config);

    if (!this.isAuthRequest(path)) {
    }
    this.configureAuthorization(config);


    let url = this._apiUrl + path;

    const response: any = await fetch(url, config);

    if (response?.status === 200 || response?.status === 201) {
      if (this._fetchType === "response") {
        return {
          success: true,
          status: response.status,
          data: response,
          message: response?.message,
        };
      } else {
        return {
          success: true,
          status: response.status,
          data: await response.json(),
          message: response?.message,
        };
      }
    } else if (
      this.authStatusCodes.includes(response.status) &&
      !this.checkToLogOutOrNot(path)
    ) {
      setTimeout(() => {
        Cookies.remove("token");
        window.location.href = "/";
      }, 1000);
      throw {
        success: false,
        status: response.status,
        data: await response.json(),
        message: response?.message,
      };
    } else {
      throw {
        status: response?.status,
        success: false,
        data: await response.json(),
        message: response?.message,
      };
    }
  }

  async post(url: string, payload?: any) {
    return await this.hit(url, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  async postFormData(url: string, file?: any) {
    return await this.hit(url, {
      method: "POST",
      body: file,
    });
  }

  async get(url: string, queryParams = {}) {
    if (Object.keys(queryParams).length) {
      url = prepareURLEncodedParams(url, queryParams);
    }
    return await this.hit(url, {
      method: "GET",
    });
  }

  async delete(url: string, payload = {}) {
    return this.hit(url, {
      method: "DELETE",
      body: JSON.stringify(payload),
    });
  }

  async deleteWithOutPayload(url: string) {
    return this.hit(url, {
      method: "DELETE",
    });
  }

  async put(url: string, payload = {}) {
    return this.hit(url, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async patch(url: string, payload = {}) {
    return this.hit(url, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async postPlainText(url: string, textPayload: string) {
    return this.hit(url, {
      method: "POST",
      body: textPayload,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

// Create instances for different API URLs
export const $fetch = new FetchService(
  "json",
  import.meta.env.VITE_PUBLIC_API_URL
);
export const $fetch2 = new FetchService(
  "json",
  import.meta.env.VITE_APFC_API_URL
);
export const $dummyFetch = new FetchService(
  "json",
  import.meta.env.VITE_PUBLIC_DUMMY_API_URL
);
export const $imagefetch = new FetchService(
  "json",
  import.meta.env.VITE_IMAGE_URL
);
export const $socket = new FetchService(
  "json",
  import.meta.env.VITE_SOCKET_URL
);
