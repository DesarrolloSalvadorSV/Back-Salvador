const fetch = require('node-fetch');
const { encode } = require('base-64');
const { serialize } = require('cookie');

const realmKey = '5c179f4a-a1b9-4945-a0fb-2c3fc9534d17';

async function login(username, password, res) {
  try {
    const userApiKey = encode(`${realmKey}:${username}:${password}`);

    const apiUrlGetIdentity = 'https://api.orangepill.cloud/v1/users?populate=identity';

    const fetchOptionsGetIdentity = {
      method: 'GET',
      headers: {
        'x-api-key': userApiKey,
      },
    };

    const responseGetIdentity = await fetch(apiUrlGetIdentity, fetchOptionsGetIdentity);

    if (responseGetIdentity.ok) {
      console.log("Respuesta exitosa. Estableciendo cookie...", userApiKey);

      // Configura la cookie independientemente del valor de res
      const userApiKeyCookie = serialize('userApiKey', userApiKey, {
        httpOnly: true,
        secure: true,  // Trabajar en entornos de producción
        sameSite: 'None',
        maxAge: 3600,
        path: '/',
        //domain: 'clientes.salvadorsv.com',
        domain: 'ba6b-177-222-98-248.ngrok-free.app',
      });

      // Verifica que res esté definido antes de intentar usarlo
      if (res && typeof res.setHeader === 'function') {
        console.log("Entrando en res y setHeader function");
        // Establece la cookie en la respuesta (res) si res está presente
        res.setHeader('Set-Cookie', userApiKeyCookie);
        console.log("Ya se debió settear la cookie de userApiKeyCookie", userApiKeyCookie);
        return {
          success: true,
        };
      } else {
        console.log("No se logró configurar la cookie. 'res' no es válido.");
      }
    } else {
      console.error(`Error de red: ${responseGetIdentity.status}`);
    }
  } catch (error) {
    console.error('Error en la solicitud FETCH:', error.message);
    throw new Error('Error en la solicitud FETCH:', error);
  }

  return {
    success: false,
    reason: 'No se pudo establecer la cookie. Verifica los detalles en los logs.',
  };
}

module.exports = { login };