export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { email, password } = req.body;

  // Simulación de validación (sustituye con tu lógica real)
  const userDB = {
    email: 'admin@tienda.com',
    password: '123456'
  };

  if (email === userDB.email && password === userDB.password) {
    return res.status(200).json({ message: 'Inicio de sesión exitoso', role: 'admin' });
  } else {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }
}
