import { TokenData } from "@/interfaces/auth/token-data-interface";
import { decodeJwt, jwtVerify } from "jose";

export const verifyTokenSignature = async (
  token: string,
  tokenKind: string
): Promise<boolean> => {
  const JWT_SECRET = process.env.JWT_SECRET;
  try {
    await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    console.log(`${tokenKind} token signature verified`);
    return true;
  } catch (error) {
    console.log(`Cannot verify ${tokenKind} token signature`, error);
    return false;
  }
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const decoded = decodeJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp !== undefined && currentTime >= decoded.exp;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

export const getDataFromToken = async (
  token: string
): Promise<TokenData | null> => {
  try {
    const decoded = decodeJwt(token) as TokenData;
    return decoded;
  } catch (error) {
    console.error("Error getting data from token:", error);
    return null;
  }
};

export const generateNewAccessToken = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DJANGO_URL + "auth/token/refresh/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      }
    );
    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error("Error generating new access token:", error);
    return null;
  }
};
