// Add new property to filter configs to be used in label
export const CONTROL_NAME_LABELS = {
  HD: 'Hougang Depot',
  AMKD: 'Ang Mo Kio Depot',
  ARDD: 'Aver Raja Depot Depot',
  depots: 'Depot Name',
  effectiveDate: 'Effective Date',
  consistency: 'Consistency',
  active: 'Active Parameter',
  mdcsAccess: 'MDCS Access',
  // Bus Monitoring
  connection: 'Connection Status',
  download: 'Parameter Download Status',
  upload: 'Parameter Upload Status',
  auth: 'SAM Auth Status',
  // Bus Transfer
  currDepot: 'Current Depot',
  currOperator: 'Current Operator',
  futureOperator: 'Future Operator',
  //bus list
  dayType: 'Day Type',
  serviceNo: 'Service No.',
  busId: 'Bus ID',
  // vehicle map
  status: 'Status',
  // Report
  reportType: 'Report Type',
  businessDate: 'Business Date',
  monthType: 'Month Type',
  serviceProvider: 'Service Provider Name',
  startDate: 'Start Date',
  endDate: 'End Date',
  // Maintenance
  currDate: 'Current Business Day',
  eodExecuted: 'Last EOD Executed',
  updateType: 'Update Type',
} as const;
