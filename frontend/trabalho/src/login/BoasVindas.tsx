import { useUser } from "/trabalho rogerio/frontend/trabalho/UserContext";
import "./BoasVindas.css";

export default function BemVindo() {
  const { user } = useUser();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Bem-vindo, {user?.name || "usuário"}!</h1>

        <p className="welcome-text">
          Sua conta foi ativada com sucesso e agora você pode aproveitar toda a
          plataforma.
        </p>
      </div>
    </div>
  );
}
