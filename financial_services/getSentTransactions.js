// Importaciones
const fetch = require('node-fetch');
const { getUniqueUserApiKey } = require('../registration_login_services/login')
const { transformDateCreation } = require('../formatting_services/transformDateFormat');

// Obtener las transacciones enviadas por IdentityId
async function getSentTransactions() {
  const userApiKey = getUniqueUserApiKey();
  const apiUrl = `https://api.orangepill.cloud/v1/transactions/all?scope=-own,outgoing&query={"type":"send"}`;

  const fetchOptions = {
    method: 'GET',
    headers: {
      'x-api-key': userApiKey,
    },
  };

  try {
    const response = await fetch(apiUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }

    const data = await response.json();

    // Utiliza el servicio para transformar la fecha de creación
    const dataWithTransformedDate = data.map(transformDateCreation);

    return dataWithTransformedDate;
  } catch (error) {
    throw new Error('Error en la solicitud FETCH:', error);
  }
}

module.exports = getSentTransactions;