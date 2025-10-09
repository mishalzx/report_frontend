import axios from "axios";

// Helper function to log and handle errors
const handleAxiosError = (error: any) => {
  const { response } = error;
  if (response) {
    console.error("Error status:", response.status);
    console.error("Error data:", response.data);
    return response;  // Return response to the caller to handle it
  } else {
    console.error("No response from the server.");
  }
};

// POST request with token and data
export const post = async (
  url: string,
  token?: string | null,
  data = {},
  _config = {}
) => {
  const config: any = { ..._config };
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Ensure content-type is set if required
    };
  }
  return axios
    .post(url, data, config)
    .then((res: any) => {
      const { data, status } = res;
      return { data, status };
    })
    .catch(handleAxiosError);
};

// PUT request with token and data
export const put = async (
  url: string,
  token?: string | null,
  data = {},
  _config = {}
) => {
  const config: any = { ..._config };
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // Ensure content-type is set if required
    };
  }
  return axios
    .put(url, data, config)
    .then((res: any) => {
      const { data, status } = res;
      return { data, status };
    })
    .catch(handleAxiosError);
};

// GET request with token
export const get = async (
  url: string,
  token?: string | null,
  _config: any = {}
) => {
  const config: any = { ..._config };
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // If necessary
    };
  }
  return axios
    .get(url, config)
    .then((res: any) => res.data)
    .catch(handleAxiosError);
};

// DELETE request with token
export const _delete = async (
  url: string,
  token?: string | null,
  _config: any = {}
) => {
  const config: any = { ..._config };
  if (token) {
    config.headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json', // If necessary
    };
  }
  return axios
    .delete(url, config)
    .then((res: any) => res.data)
    .catch(handleAxiosError);
};
