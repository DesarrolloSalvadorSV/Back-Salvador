// Importaciones
const fetch = require('node-fetch');
const cleanCountryCode = require('../formatting_services/transformCountryFormat');

const xapiKey = 'NWMxNzlmNGEtYTFiOS00OTQ1LWEwZmItMmMzZmM5NTM0ZDE3OlN2ZXgwNzcwQGdtYWlsLmNvbTpQQHNzdzByZA==';

async function userRegistration(username, password, country, currency, countryCode, phoneNumber, firstName, lastName, address, city, birthDate, documentType, documentNumber, passportNumber, email) {
  try {
    // Limpiar el código de marcación
    const cleanedNumberPhone = cleanCountryCode(countryCode, phoneNumber);

    // Asignar el número de celular correcto a la variable a usar
    const numberWhatsapp = cleanedNumberPhone;

    // 1a: Crear Usuario
    const apiUrlCreateUser = 'https://api.orangepill.cloud/v1/users';
    const fetchOptionsCreateUser = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xapiKey
      },
      body: JSON.stringify({
        username: username,
        password: password,
        roles: 'user',
        scope: 'own'
      })
    };

    const responseCreateUser = await fetch(apiUrlCreateUser, fetchOptionsCreateUser);
    console.log("RESPONSE CREATE USER")
    console.log(responseCreateUser);

    if (!responseCreateUser.ok) {
      throw new Error(`Error de red al crear usuario: ${responseCreateUser.status}`);
    }

    const dataCreateUser = await responseCreateUser.json();

    // Obtener los valores necesarios para los demás pasos
    const { identity, id } = dataCreateUser;

    // 1b: Actualizar Identity
    const apiUrlUpdateIdentity = `https://api.orangepill.cloud/v1/identities/${identity}`;

    const fetchOptionsUpdateIdentity = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xapiKey
      },
      body: JSON.stringify({
        country: country,
        currency: currency,
        type: 'person',
        owner: id
      })
    };

    const responseUpdateIdentity = await fetch(apiUrlUpdateIdentity, fetchOptionsUpdateIdentity);
    //console.log("RESPONSE UPDATE IDENTITY")
    //console.log(responseUpdateIdentity);

    if (!responseUpdateIdentity.ok) {
      const errorText = await responseUpdateIdentity.text();
      throw new Error(`Error al actualizar identity: ${responseUpdateIdentity.status}, ${errorText}`);
    }


    // 1c: Crear Alias
    const apiUrlCreateAlias = 'https://api.orangepill.cloud/v1/aliases';
    const fetchOptionsCreateAlias = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xapiKey
      },
      body: JSON.stringify({
        type: 'identity',
        alias: numberWhatsapp,
        identity: identity,
        owner: id
      })
    };

    const responseCreateAlias = await fetch(apiUrlCreateAlias, fetchOptionsCreateAlias);
    //console.log("RESPONSE CREATE ALIAS")
    //console.log(responseCreateAlias);

    if (!responseCreateAlias.ok) {
      const errorText = await responseCreateAlias.text();
      throw new Error(`Error al crear alias: ${responseCreateAlias.status}, ${errorText}`);
    }

    // 1d: Crear Identidad con Información Adicional
    const apiUrlCreateIdentityWithInfo = `https://api.orangepill.cloud/v1/identities/${identity}/person`;

    const fetchOptionsCreateIdentityWithInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xapiKey
      },
      body: JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        address: address,
        city: city,
        country: country,
        birthDate: birthDate,
        contactInformation: {
          phone: [
            {
              number: numberWhatsapp
            }
          ],
          email: [
            {
              address: email
            }
          ]
        },
        customAttributes: {
          documentType: documentType,
          documentNumber: documentNumber,
          passportNumber: passportNumber,
          kyc: false
        }
      })
    };

    const responseCreateIdentityWithInfo = await fetch(apiUrlCreateIdentityWithInfo, fetchOptionsCreateIdentityWithInfo);
    //console.log("RESPONSE CREATE IDENTITY WITH INFO")
    //console.log(responseCreateIdentityWithInfo);

    if (!responseCreateIdentityWithInfo.ok) {
      const errorText = await responseCreateIdentityWithInfo.text();
      throw new Error(`Error al crear identidad con información adicional: ${responseCreateIdentityWithInfo.status}, ${errorText}`);
    }

    // 1e: Notificación sobre Nueva Persona
    const apiUrlNotification = `https://api.orangepill.cloud/v1/identities/6541776baf124a6927e97377/person/message/email`;

    const notificationHtml = `<b>${firstName} ${lastName}</b> ha sido creado en el SalvadorSV. Su número de celular es ${numberWhatsapp} y su email es ${email}.`;

    const fetchOptionsNotification = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': xapiKey
      },
      body: JSON.stringify({
        content: {
          subject: 'Nuevo usuario en SalvadorSV',
          html: notificationHtml
        }
      })
    };


    const responseNotification = await fetch(apiUrlNotification, fetchOptionsNotification);
    //console.log("RESPONSE RESPONSE NOTIFICATION")
    //console.log(responseNotification);

    if (!responseNotification.ok) {
      const errorText = await responseNotification.text();
      throw new Error(`Error al enviar notificación: ${responseNotification.status}, ${errorText}`);
    }

    const dataNotification = await responseNotification.json();

    if (dataNotification.messages && dataNotification.messages.length > 0 && typeof dataNotification.messages[0].status === 'object') {
      // Todas las operaciones fueron exitosas
      return 200;
    } else {
      throw new Error(`Error de red: ${responseNotification.status}`);
    }
  } catch (error) {
    throw new Error('Error en la solicitud FETCH:', error);
  }
}

module.exports = userRegistration;