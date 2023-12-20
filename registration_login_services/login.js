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
      // Configura la cookie independientemente del valor de res
      const userApiKeyCookie = serialize('userApiKey', userApiKey, {
        httpOnly: true,
        secure: true,  // Trabajar en entornos de producción
        //secure: false, // Siempre en entornos locales es FALSE
        sameSite: 'Lax',
        maxAge: 3600,
        path: '/',
      });

      // Verifica que res esté definido antes de intentar usarlo
      if (res && typeof res.setHeader === 'function') {
        // Establece la cookie en la respuesta (res) si res está presente
        res.setHeader('Set-Cookie', userApiKeyCookie);
        return {
          success: true,
        };
      } else {
        console.log("No se logró configurar la cookie");
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
