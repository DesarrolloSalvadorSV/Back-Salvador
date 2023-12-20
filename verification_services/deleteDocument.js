const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const cors = require('cors');


// DELETE API para borrar el último documento subido a una carpeta específica a Google Drive mediante Url
router.delete('/delete-document/:url_documents', async (req, res) => {
    try {
        const urlDocumentsToDelete = req.params.url_documents;
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
            q: `trashed=false and '${urlDocumentsToDelete}' in parents`,
            fields: 'files(id)',
        });

        if (driveResponse.data.files.length > 0) {
            const fileIdToDelete = driveResponse.data.files[0].id;

            // Eliminar el archivo o carpeta de Google Drive
            await drive.files.delete({
                fileId: fileIdToDelete,
            });

            // Verificar si la eliminación fue exitosa
            const driveDeleteResponse = await drive.files.get({
                fileId: fileIdToDelete,
            }).catch(error => error.response);

            if (driveDeleteResponse && driveDeleteResponse.status === 404) {
                res.json({ message: `Archivo o carpeta con URL '${urlDocumentsToDelete}' eliminado correctamente.` });
            } else {
                res.status(500).json({ error: `Ocurrió un error al eliminar el archivo o carpeta de Google Drive.` });
            }
        } else {
            res.status(404).json({ error: `No se encontró un archivo o carpeta con URL '${urlDocumentsToDelete}' en Google Drive.` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Ocurrió un error al eliminar el archivo o carpeta.' });
    }
});

module.exports = router;