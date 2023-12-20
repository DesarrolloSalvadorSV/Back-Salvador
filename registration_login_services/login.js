// Importaciones
const fetch = require('node-fetch');
const { encode } = require('base-64');

const realmKey = '5c179f4a-a1b9-4945-a0fb-2c3fc9534d17';

// Variable global para almacenar el identityId
let globalIdentityId = null;
let uniqueUserApiKey = null;

async function login(username, password) {
  // 2a: Login User
  const userApiKey = encode(`${realmKey}:${username}:${password}`);


  // 2b: Login + Recuperar Identity
  const apiUrlGetIdentity = 'https://api.orangepill.cloud/v1/users?populate=identity';

  const fetchOptionsGetIdentity = {
    method: 'GET',
    headers: {
      'x-api-key': userApiKey
    }
  };

  try {

    const responseGetIdentity = await fetch(apiUrlGetIdentity, fetchOptionsGetIdentity);
    const dataLogin = await responseGetIdentity.json();
    
    if (responseGetIdentity.ok) {
      const identityInfo = dataLogin.rows[0].identity;

      // Almacena el identityId en la variable global
      globalIdentityId = identityInfo.id;
      uniqueUserApiKey = userApiKey;

      return {
        success: true,
        identityId: globalIdentityId,
        userApiKey: uniqueUserApiKey,
      };
    } else {
      throw new Error(`Error de red: ${responseGetIdentity.status}`);
    }

  } catch (error) {
    console.error('Error en la solicitud FETCH:', error);
    throw new Error(`Error en la solicitud FETCH:`, error);
  }
}

module.exports = { login, getGlobalIdentityId: () => globalIdentityId, getUniqueUserApiKey: () => uniqueUserApiKey};