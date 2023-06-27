import jwtDecode, { JwtPayload } from "jwt-decode";
import { ILoggedInUser } from "./interfaces";

/**
 * @author Ankur Mundra on June, 2023
 */

export function setAuthToken(token: string): ILoggedInUser {
  const decodedToken = jwtDecode<JwtPayload>(token);

  if (!decodedToken) {
    throw new Error("Invalid token");
  }

  if (!decodedToken.exp) {
    throw new Error("Expiration time not found in token");
  }
  const expirationDate = new Date(decodedToken.exp * 1000);
  localStorage.setItem("token", token);
  localStorage.setItem("expiration", expirationDate.toISOString());

  return decodedToken as ILoggedInUser;
}

export function getTokenDuration(): number {
  const storedExpirationDate = localStorage.getItem("expiration");

  if (!storedExpirationDate) {
    throw new Error("Expiration date not found in local storage");
  }

  const expirationDate = new Date(storedExpirationDate);
  const now = new Date();
  return expirationDate.getTime() - now.getTime();
}

function isTokenExpired(): boolean {
  const tokenDuration = getTokenDuration();
  return tokenDuration < 0;
}

export function getAuthToken(): string | null {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return isTokenExpired() ? "EXPIRED" : token;
}
