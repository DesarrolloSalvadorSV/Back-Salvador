const express = require('express');
const { google } = require('googleapis');
const router = express.Router();
const fs = require('fs');
const path = require('path');


// Servicio DELETE para eliminar la última carpeta subida a Google Drive mediante Url
router.delete('/delete-folder/:url_folder', async (req, res) => {
  try {
    const urlFolderToDelete = req.params.url_folder;
    const keyFile = path.join(__dirname, 'apiKeySalvador.json');

    // Configurar la autenticación de Google Drive
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFile,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({
      version: 'v3',
      auth,
    });

    // Recuperar el ID del archivo o carpeta en Google Drive
    const driveResponse = await drive.files.list({
      q: `trashed=false and '${urlFolderToDelete}' in parents`,
      fields: 'files(id)',
    });

    if (driveResponse.data.files.length > 0) {
      const fileIdToDelete = driveResponse.data.files[0].id;

      // Eliminar la carpeta y su contenido de Google Drive
      await drive.files.delete({
        fileId: fileIdToDelete,
      });

      res.json({ message: `Carpeta con URL '${urlFolderToDelete}' eliminada correctamente de Google Drive.` });
    } else {
      res.status(404).json({ error: `No se encontró una carpeta con URL '${urlFolderToDelete}' en Google Drive.` });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar la carpeta de Google Drive.' });
  }
});

module.exports = router;