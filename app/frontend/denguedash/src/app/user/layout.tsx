import LayoutComponents from "@/components/common/layout/BaseAllUsersLayout";
import { TokenData } from "@/interfaces/auth/token-data-interface";
import { getDataFromToken } from "@/lib/token";
import { cookies } from "next/headers";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");

  if (!accessToken) {
    console.error("Access token is undefined");
    return null;
  }

  const dataFromToken: TokenData | null = await getDataFromToken(
    accessToken.value
  );
  if (!dataFromToken) {
    console.error("Data from token is null");
    return null;
  }
  const isAdmin = dataFromToken.is_admin;
  const druType = dataFromToken.user_dru_type;

  if (isAdmin === null || druType === null) {
    console.error("Admin or DRU type is null");
    return null;
  }

  return (
    <LayoutComponents isAdmin={isAdmin} druType={druType}>
      {children}
    </LayoutComponents>
  );
}
