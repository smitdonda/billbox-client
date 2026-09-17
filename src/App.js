import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import ErrorBoundary from "./Components/ui/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import Main from "./Components/pages";
import useMediaQuery from "./hooks/useMediaQuery";

const TOAST_DURATION = 3500;

function App() {
  const isPhone = useMediaQuery("(max-width: 600px)");

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Main />
        </AuthProvider>
        <Toaster
          position="top-right"
          theme="light"
          duration={TOAST_DURATION}
          closeButton
          // keep the toasts stacked on small screens
          expand={!isPhone}
          toastOptions={{
            // used by the timer bar in index.css
            style: { "--toast-duration": `${TOAST_DURATION}ms` },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
