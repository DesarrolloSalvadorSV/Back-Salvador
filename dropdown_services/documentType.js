// Importaciones para trabajar con archivos
const fs = require('fs/promises');
const path = require('path');

// Leer la lista de tipos de documento
async function getDocumentType() {
  const filePath = path.join(__dirname, 'documentType.json');

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const documentTypeData = JSON.parse(content);

    // Verificar si el formato del archivo es correcto.
    if (!documentTypeData || !documentTypeData.documentType || !Array.isArray(documentTypeData.documentType)) {
      throw new Error('El formato del archivo currencies.json es incorrecto.');
    }

    return documentTypeData.documentType;
  } catch (error) {
    console.error(`Error al leer o analizar el archivo ${filePath}: ${error.message}`);
    throw new Error('Error al obtener la lista de monedas.');
  }
}

module.exports = getDocumentType;
