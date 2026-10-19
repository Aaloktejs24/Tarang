let _accessToken = null;
let _tempToken = null;

export const getToken = () => {
  return _accessToken;
};

export const setToken = (token) => {
  _accessToken = token;
  if (typeof window !== "undefined") {
    localStorage.setItem("is_logged_in", "true");
  }
};

export const removeToken = () => {
  _accessToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("is_logged_in");
  }
};

export const getTempToken = () => {
  return _tempToken;
};

export const setTempToken = (token) => {
  _tempToken = token;
};

export const removeTempToken = () => {
  _tempToken = null;
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

