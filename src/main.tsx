import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";

// let body = document.getElementsByName("body")[0];
// body.style.margin = "0px";
// body.style.height = "100%";
// body.style.overflow = "hidden";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
