import { Box, CSSReset } from "@chakra-ui/react";
import { Global } from "@emotion/react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./Pages/HomePage";
import JoyPlayer from "./Pages/JoyPlayer";

const customStyles = `
  html, body {
    overflow: hidden;
    height: 100%;
    margin: 0;
    padding: 0;
  }

  #root {
    height: 100%;
  }
`;

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/joy",
    element: <JoyPlayer />,
  },
]);

function App() {
  return (
    <>
      <CSSReset />
      <Global styles={customStyles} />
      <RouterProvider router={router} />;
    </>
  );
}

export default App;
