// Importaciones
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const verification = require('./verification_services/verification');
const deleteDocument = require('./verification_services/deleteDocument');
const deleteFolder = require('./verification_services/deleteFolder');
const userRegistration = require('./registration_login_services/userRegistration');
const { login } = require('./registration_login_services/login');
const getDeposits = require('./financial_services/getDeposits');
const getWithdrawals = require('./financial_services/getWithdrawals');
const getSentTransactions = require('./financial_services/getSentTransactions');
const getReceivedTransactions = require('./financial_services/getReceivedTransactions');
const getCurrencies = require('./dropdown_services/currencies');
const getDocumentType = require('./dropdown_services/documentType');
const getInternationalCodes = require('./dropdown_services/countryCodes');

const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: 'https://clientes.salvadorsv.com', 
  //origin: 'https://ba6b-177-222-98-248.ngrok-free.app',
  //origin: 'http://localhost:4200',
  credentials: true,
};

// Middleware para manejar solicitudes JSON
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());


// Rutas

// ---  Rutas para los servicios financieros ---

// Ruta para la solicitud de registro de usuarios - 1a, 1b, 1c, 1d, 1e
app.post('/register-users', async (req, res) => {
  const requestData = req.body;
  try {
    const success = await userRegistration(
      requestData.username,
      requestData.password,
      requestData.country,
      requestData.currency,
      requestData.countryCode,
      requestData.phoneNumber,
      requestData.firstName,
      requestData.lastName,
      requestData.address,
      requestData.city,
      requestData.birthDate,
      requestData.documentType,
      requestData.documentNumber,
      requestData.passportNumber,
      requestData.email,
      requestData.promoCod,
    );

    if (success) {
      res.status(200).send('Autenticación Completada');
    } else {
      res.status(401).send('Error de autenticación');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud POST.');
  }
});



// Ruta para el logeo del usuario - 2a, 2b
app.get('/login', async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  try {
    const userData = await login(username, password, res);

    if (userData) {
      res.status(200).json(userData);
    } else {
      res.status(401).send('Error de autenticación');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la autenticación.');
  }
});


// Ruta para obtener los depositos
app.get('/get-deposits', async (req, res) => {
  try {
    const transactions = await getDeposits(req);
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de depositos.');
  }
});

// Ruta para obtener los retiros
app.get('/get-withdrawals', async (req, res) => {
  try {
    const withdrawals = await getWithdrawals(req);
    res.json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de retiros.');
  }
});

// Ruta para obtener las transacciones enviadas
app.get('/get-send-transactions', async (req, res) => {
  try {
    const sendsFrom = await getSentTransactions(req);
    res.json(sendsFrom);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de envíos desde.');
  }
});

// Ruta para obtener las transacciones recibidas
app.get('/get-received-transactions', async (req, res) => {
  try {
    const sendsTo = await getReceivedTransactions(req);
    res.json(sendsTo);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de envíos hacia.');
  }
});



// ---  Rutas para la verificación ---

// Usar la ruta de subir archivos de la verificación
app.use(verification);

// Usar la ruta de borrar archivos de la verificación
app.use(deleteDocument);

// Usar la ruta de borrar carpetas de la verificación
app.use(deleteFolder);



// ---  Rutas para los Dropdowns ---

// Ruta para obtener la lista de monedas
app.get('/currencies', async (req, res) => {
  try {
    const currencies = await getCurrencies();
    res.json(currencies);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de monedas.');
  }
});

// Ruta para obtener la lista de tipos de documento
app.get('/document-types', async (req, res) => {
  try {
    const documentType = await getDocumentType();
    res.json(documentType);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error en la solicitud GET de tipos de documentos.');
  }
});

// Ruta para obtener la lista de códigos internacionales para celulares
app.get('/international-codes', async (req, res) => {
  try {
    const internationalCodes = await getInternationalCodes();
    res.status(200).json(internationalCodes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al recuperar códigos móviles internacionales' });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log('Servidor escuchando en', port);
});

