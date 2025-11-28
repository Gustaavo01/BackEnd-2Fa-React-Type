import React, { createContext, useContext, useState } from "react";
import "./FlashMessage.css";

type FlashType = "success" | "error" | "info";

type FlashMessageContextType = {
  showMessage: (msg: string, type?: FlashType) => void;
};

const FlashMessageContext = createContext<FlashMessageContextType>({
  showMessage: () => {},
});

export const FlashMessageProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FlashType>("success");
  const [visible, setVisible] = useState(false);

  const showMessage = (msg: string, type: FlashType = "success") => {
    setMessage(msg);
    setType(type);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, 3500);
  };

  return (
    <FlashMessageContext.Provider value={{ showMessage }}>
      {children}

      {visible && (
        <div className={`flash-message ${type}`}>
          {message}
        </div>
      )}
    </FlashMessageContext.Provider>
  );
};

export const useFlashMessage = () => useContext(FlashMessageContext);