const express = require('express');
const cors = require('cors');

const dailyBusRoutes = require('./routes/daily-bus-list.routes');
const diagnosticRoutes = require('./routes/diagnostics.routes');
const eodProcessRoutes = require('./routes/eod-process.routes');
const auditTrailLogRoutes = require('./routes/audit-trail-log.routes');
const systemInfoRoutes = require('./routes/system-info.routes');
const operationalBusListRoutes = require('./routes/operational-bus-list.routes');
const masterBusListRoutes = require('./routes/master-bus-list.routes');
const dagwParamVersionSummaryRoutes = require('./routes/dagw-param-version-summary.routes');
const parameterRoutes = require('./routes/parameter.routes');
const parameterImportExportRoutes = require('./routes/parameter-import-export.routes');
const messageImportExportRoutes = require('./routes/message-import-export.routes');
const generalInformationRoutes = require('./routes/general-information.routes');
const depotRoutes = require('./routes/depot.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.locals.EOD_PROCESS_COUNT = 0;
app.locals.PARAMETER_FILE_IMPORT_COUNT = 0;
app.locals.PARAMETER_FILE_EXPORT_COUNT = 0;

app.use(cors());

app.use(express.json());

// Routes
app.use('/api/daily-bus-list', dailyBusRoutes);
app.use('/api/diagnostics', diagnosticRoutes);
app.use('/api/eod-process', eodProcessRoutes);
app.use('/api/audit-trail-log', auditTrailLogRoutes);
app.use('/api/system-info', systemInfoRoutes);
app.use('/api/operational-bus-list', operationalBusListRoutes);
app.use('/api/master-bus-list', masterBusListRoutes);
app.use('/api/dagw-param-version-summary', dagwParamVersionSummaryRoutes);
app.use('/api/parameter', parameterRoutes);
app.use('/api/param', parameterImportExportRoutes);
app.use('/api/message-data', messageImportExportRoutes);
app.use('/api/general-information', generalInformationRoutes);
app.use('/api/depot', depotRoutes);
app.use('/api/user', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
