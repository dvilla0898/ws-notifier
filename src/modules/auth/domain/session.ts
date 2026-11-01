/** Usuario autenticado. Nunca incluye la contraseña. */
export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

/** Sesión activa: quién es el usuario y su token. */
export interface Session {
  user: User;
  /** Token falso: con un backend real sería un JWT o una cookie de sesión. */
  token: string;
}
