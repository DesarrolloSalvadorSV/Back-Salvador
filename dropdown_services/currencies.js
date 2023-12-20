// Importaciones para trabajar con archivos
const fs = require('fs/promises');
const path = require('path');

// Leer la lista de monedas
async function getCurrencies() {
  const filePath = path.join(__dirname, 'currencies.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const currenciesData = JSON.parse(content);

    // Verificar si el formato del archivo es correcto.
    if (!currenciesData || !currenciesData.currencies || !Array.isArray(currenciesData.currencies)) {
      throw new Error('El formato del archivo currencies.json es incorrecto.');
    }

    return currenciesData.currencies;
  } catch (error) {
    console.error(`Error al leer o analizar el archivo ${filePath}: ${error.message}`);
    throw new Error('Error al obtener la lista de monedas.');
  }
}

module.exports = getCurrencies;
