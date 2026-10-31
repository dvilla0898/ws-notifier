import type { NextConfig } from "next";

/**
 * `output: "export"` genera un sitio 100 % estático en la carpeta `out/`.
 * No hay servidor de Node en producción: todo corre en el navegador,
 * que es justo lo que necesitamos porque los datos viven en localStorage.
 */
const nextConfig: NextConfig = {
  output: "export",
  // Genera /login/index.html en lugar de /login.html (funciona en cualquier hosting estático).
  trailingSlash: true,
  // La optimización de imágenes necesita un servidor; en un export estático se desactiva.
  images: { unoptimized: true },
};

export default nextConfig;
