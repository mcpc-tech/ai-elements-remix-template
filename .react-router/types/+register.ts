import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/.well-known/appspecific/com.chrome.devtools.json": {};
  "/api/acp/chat": {};
  "/acp": {};
};