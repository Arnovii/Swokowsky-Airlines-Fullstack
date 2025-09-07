
export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Credenciales inválidas");
  }

  return res.json(); // backend debería devolver { access_token, user }
}

export async function getProfile(token: string) {
  const res = await fetch("http://localhost:3000/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error("No autorizado");
  }

  return res.json();
}
