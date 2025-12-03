import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  UserProvider,
  useUser,
} from "/trabalho rogerio/frontend/trabalho/UserContext";
import VerificarConta from "./login/VerificarConta";
import { FlashMessageProvider } from "/trabalho rogerio/frontend/trabalho/FlashMessageContext/FlashMessageContext.tsx";
import RecuperarSenha from "./login/RecuperarSenha";
import NotFoundPage from "./NotFoundPage/NotFoundPage";
import Login from "./login/Login";
import Cadastro from "./login/Cadastro";
import TrocarSenha from "./login/TrocarSenha";
import BoasVindas from "./login/BoasVindas";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user || user.role === "guest") return <>{children}</>;
  return <Navigate to="/" replace />;
};

const UserRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user || (user.role !== "user" && user.role !== "admin")) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/verificar/:token" element={<VerificarConta />} />

          <Route path="/recuperar-senha" element={<RecuperarSenha />} />

          <Route path="/trocar-senha/:token" element={<TrocarSenha />} />
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/boas-vindas" element={<BoasVindas />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
