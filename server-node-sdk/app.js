const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const insuranceRoutes = require('./routes/insuranceRoutes');
const adminRoutes = require('./routes/adminRoutes');
const claimRoutes = require('./routes/claimRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/auth', authRoutes);
app.use('/patient', patientRoutes);
app.use('/doctor', doctorRoutes);
app.use('/insurance', insuranceRoutes);
app.use('/admin', adminRoutes);
app.use('/claims', claimRoutes);
app.use('/ledger', ledgerRoutes);

app.get('/', (req, res) => res.send({ status: 'EHR Server Running' }));

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  res.status(err.status || 400).send({ success: false, message: err.message || 'Bad Request' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
module.exports = app;
