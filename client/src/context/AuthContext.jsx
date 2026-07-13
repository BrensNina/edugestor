import { createContext, useContext, useState } from 'react';
import { auth } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(() => {
        const stored = localStorage.getItem('edugestor_usuario');
        return stored ? JSON.parse(stored) : null;
    });

    async function login(correo_electronico, contrasenia) {
        const { token, usuario: perfil } = await auth.login(correo_electronico, contrasenia);
        localStorage.setItem('edugestor_token', token);
        localStorage.setItem('edugestor_usuario', JSON.stringify(perfil));
        setUsuario(perfil);
        return perfil;
    }

    function logout() {
        localStorage.removeItem('edugestor_token');
        localStorage.removeItem('edugestor_usuario');
        setUsuario(null);
    }

    return (
        <AuthContext.Provider value={{ usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
