import { headers } from "next/headers";
import { countryByCode, countryFromHeaders, countryFromName, type CountryProfile } from "./geo";
import type { User } from "./types";

export async function resolveCountry(user: Pick<User, "detectedCountry" | "profile">): Promise<CountryProfile> {
  const headerCountry = countryFromHeaders(await headers());
  if (headerCountry && headerCountry.code !== "US") return headerCountry;
  if (user.detectedCountry) return countryByCode(user.detectedCountry);
  if (user.profile?.country) return countryFromName(user.profile.country);
  return headerCountry ?? countryByCode("US");
}
