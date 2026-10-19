export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const removeToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
};

export const getAuthFlowInProgress = () => {
  if (typeof window !== "undefined") {
    const val = sessionStorage.getItem("auth_flow_in_progress") === "true";
    console.log("getAuthFlowInProgress:", val);
    return val;
  }
  return false;
};

export const setAuthFlowInProgress = (inProgress) => {
  if (typeof window !== "undefined") {
    console.log("setAuthFlowInProgress:", inProgress);
    if (inProgress) {
      sessionStorage.setItem("auth_flow_in_progress", "true");
    } else {
      sessionStorage.removeItem("auth_flow_in_progress");
    }
  }
};

