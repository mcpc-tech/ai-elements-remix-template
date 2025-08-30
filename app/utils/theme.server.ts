import { createCookie } from "react-router";

export const themeCookie = createCookie("theme", {
  maxAge: 60 * 60 * 24 * 365,
});
