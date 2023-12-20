const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const router = express.Router();
const cors = require('cors');
const axios = require('axios');


// Configurar Multer para manejar la carga de archivos
const tmpDirectory = path.join('/tmp', 'uploads');
const storage = multer.diskStorage({
  destination: tmpDirectory,
  filename: function(req, file, callback) {
    const extension = file.originalname.split(".").pop();
    callback(null, `${file.fieldname}-${Date.now()}.${extension}`);
  },
});

const upload = multer({storage:storage})

router.use(cors())

// POST API para la guardar los documentos en Google Drive
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const keyFile = path.join(__dirname, 'apiKeySalvador.json');

    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({
      version: 'v3',
      auth,
    });

    const uploadedFiles = [];

    // Obtener el nombre de la carpeta desde la solicitud
    const folderName = req.body.folderName || 'Prueba'; // Valor predeterminado "Prueba" si no se proporciona

    // Buscar si ya existe una carpeta con el mismo nombre
    const existingFolders = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    });

    let folderMetadata;

    if (existingFolders.data.files.length > 0) {
      // Si ya existe una carpeta con el mismo nombre, usar la ya creada
      folderMetadata = existingFolders.data.files[0];
    } else {
      // Crea una nueva carpeta con el nombre especificado si no existe
      folderMetadata = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: ['1lZQd2UNbPRhU0mSo5o8C8GBK2S3_hWeu'], // ID de la carpeta padre
        },
      });

      folderMetadata = folderMetadata.data;
    }

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      console.log('File path:', file.path);

      const response = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimeType,
          parents: [folderMetadata.id], // ID de la carpeta
        },

        media: {
          body: fs.createReadStream(file.path),
        },
      });
      uploadedFiles.push(response.data);
    }

    // Generar la URL de la carpeta donde se guardaron los archivos
    const folderUrl = 'https://drive.google.com/drive/folders';

    console.log('Uploaded files:', uploadedFiles);
    console.log('Folder ID:', folderMetadata.id);

    // Concatenar carpetaUrl y carpetaMetadata.id en una sola variable
    const folderUrlWithId = folderUrl + '/' + folderMetadata.id;
    console.log('Folder URL:', folderUrlWithId);

    // Borrar la carpeta temporal
    try {
      await fsp.rmdir(tmpDirectory, { recursive: true }); // Usar fs.promises.rmdir y asegurar el paso de { recursive: true } si el directorio no está vacío
      console.log('Directorio temporal eliminado con éxito.');
    } catch (error) {
      console.error('Error al eliminar el directorio temporal:', error);
    }

    res.json({ files: uploadedFiles, folderUrlWithId }); // Incluir la URL de la carpeta en la respuesta
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;