// Importaciones
const fetch = require('node-fetch');
const { parse } = require('cookie');
const { transformDateCreation } = require('../formatting_services/transformDateFormat');

async function getWithdrawals(req) {
  try {
    // Obtener la cookie del request (req)
    const cookies = parse(req.headers.cookie || '');
    const userApiKey = cookies.userApiKey || '';

    const apiUrl = 'https://api.orangepill.cloud/v1/transactions/all?scope=-own,outgoing&query={"type":"withdrawal"}';

    const fetchOptions = {
      method: 'GET',
      headers: {
        'x-api-key': userApiKey,
      },
    };

    const response = await fetch(apiUrl, fetchOptions);

    if (!response.ok) {
      throw new Error(`Error de red: ${response.status}`);
    }

    const data = await response.json();

    // Utiliza el servicio para transformar la fecha de creación
    const dataWithTransformedDate = data.map(transformDateCreation);

    return dataWithTransformedDate;
  } catch (error) {
    console.error('Error en la solicitud FETCH:', error.message);
    throw error;
  }
}

module.exports = getWithdrawals;