import { Routes, Route, Navigate } from "react-router-dom";
import FixedPlugin from "../../horizon-components/fixedPlugin/FixedPlugin";
import Login from "../../pages/Login";
import Register from "../../pages/Register";

export default function Auth() {
  document.documentElement.dir = "ltr";
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <FixedPlugin />

      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(/7482290.jpg)` }}
        />
      </div>

      {/* Main Content - Centered */}
      <main className="relative z-10 flex h-full min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Routes>
            <Route path="/sign-in" element={<Login />} />
            <Route path="/sign-up" element={<Register />} />
            <Route
              path="/"
              element={<Navigate to="/auth/sign-in" replace />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
