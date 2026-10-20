import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [user, setUser] = useState(() => {
        
        const savedUser = localStorage.getItem("user");
      
        if (!savedUser || savedUser === "undefined") {
          return null;
        }
      
        try {
          return JSON.parse(savedUser);
        } catch {
          localStorage.removeItem("user");
          return null;
        }

    });

    const login = async (email, password) => {
        const { data } = await api.post("/users/login", {email,password});

        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
    };

    const register = async (name, email, password) => {
        const { data } = await api.post("/users/register", {name,email,password});
    
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    const adminLogin = async (email, password) => {
        const { data } = await api.post("/admin/login", { email, password });
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, adminLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);