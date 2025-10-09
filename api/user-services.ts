// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { get, post, put, _delete } from "./api";
const BASE_URL = "http://localhost:1337";






export async function usergetmeDetails(params: any, token: any) {
  return get(`${BASE_URL}/api/users/me`, token,params,);
}
