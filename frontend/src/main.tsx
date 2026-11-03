import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AdminLayout } from "./components/AdminLayout";
import { AdminCenter } from "./pages/AdminCenter";
import { AdminStudio } from "./pages/AdminStudio";
import "./index.css";

type AdminDestination = "user" | "studio" | "center" | "split";

function RootApp() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", syncPathname);
    return () => window.removeEventListener("popstate", syncPathname);
  }, []);

  const handleAdminNavigate = (destination: AdminDestination) => {
    if (destination === "split") return;

    const nextPath =
      destination === "user"
        ? "/"
        : destination === "studio"
          ? "/admin/studio"
          : "/admin";

    window.history.pushState(null, "", nextPath);
    setPathname(nextPath);
  };

  const isAdminRoute =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (!isAdminRoute) {
    return <App />;
  }

  const activePage = pathname === "/admin/studio" ? "studio" : "center";

  return (
    <AdminLayout
      activePage={activePage}
      onNavigate={handleAdminNavigate}
    >
      {activePage === "studio" ? <AdminStudio /> : <AdminCenter />}
    </AdminLayout>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);