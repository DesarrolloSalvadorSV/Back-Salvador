// Limpiar y Concatenar el Código del País
function cleanCountryCode(countryCode, phoneNumber) {

    const cleanedCountryCode = countryCode.replace(/\+/g, '').trim();
  
    const cleanedPhoneNumber = (cleanedCountryCode + phoneNumber).trim();
  
    return cleanedPhoneNumber;
  }
  
  module.exports = cleanCountryCode;