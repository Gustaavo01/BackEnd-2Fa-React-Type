import { Link } from "react-router-dom";
import "./NotFoundPage.css";
const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-subtitle">Oops! Página não encontrada.</p>
        <p className="notfound-text">
          Parece que o link que você tentou acessar não existe ou foi movido.
        </p>

        <div className="notfound-buttons">
          <Link to="/" className="btn btn-outline">
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;