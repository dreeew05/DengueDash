import { decodeJwt, jwtVerify } from "jose";

export const verifyTokenSignature = async (
  token: string,
  tokenKind: string
): Promise<boolean> => {
  const SECRET_KEY = process.env.SECRET_KEY;
  try {
    await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
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

export const getUserIdFromToken = async (
  token: string
): Promise<number | null> => {
  try {
    const decoded = decodeJwt(token);
    return (decoded as { user_id: number }).user_id;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
};

export const generateNewAccessToken = async (
  refreshToken: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_DJANGO_URL + "token/refresh/",
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
