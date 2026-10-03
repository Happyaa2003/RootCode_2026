const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('File not found:', filePath);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = values[j] !== undefined ? values[j] : '';
    }
    rows.push(obj);
  }
  return rows;
}

const baseDir = path.resolve('tempData');

console.log('Parsing General Data...');
const outlets = parseCSV(path.join(baseDir, 'General Data', 'outlets.csv'));
const vehicles = parseCSV(path.join(baseDir, 'General Data', 'vehicles.csv'));
const serviceAllowance = parseCSV(path.join(baseDir, 'General Data', 'service_allowance.csv'));
const districtTravel = parseCSV(path.join(baseDir, 'General Data', 'district_travel.csv'));
const trafficSpeed = parseCSV(path.join(baseDir, 'General Data', 'traffic_speed.csv'));
const calendar = parseCSV(path.join(baseDir, 'General Data', 'calendar.csv'));
const roadConditions = parseCSV(path.join(baseDir, 'General Data', 'road_conditions.csv'));

console.log('Parsing Test Data...');
const task1TestInputs = parseCSV(path.join(baseDir, 'Test Data', 'task1_test_inputs.csv'));
const task2aTestInputs = parseCSV(path.join(baseDir, 'Test Data', 'task2a_test_inputs.csv'));
const task2bPeakFleet = parseCSV(path.join(baseDir, 'Test Data', 'task2b_peak_day_fleet.csv'));
const task2bPeakScenarios = parseCSV(path.join(baseDir, 'Test Data', 'task2b_peak_day_scenarios.csv'));

// Sample relevant training / test deliveries (150 real deliveries from task1)
const deliveriesSample = task1TestInputs.slice(0, 150);

// Calendar: take days around operating and festivals
const calendarSample = calendar.filter(c => c.is_operating === '1' || c.festival || c.is_holiday === '1').slice(0, 150);

// Road conditions: sample distinct dates / districts
const roadConditionsSample = roadConditions.slice(0, 100);

const bundled = {
  metadata: {
    generatedAt: new Date().toISOString(),
    totalOutlets: outlets.length,
    totalVehicles: vehicles.length,
    totalDistrictTravelRules: districtTravel.length,
    totalServiceAllowances: serviceAllowance.length,
    totalForecastCases: task2aTestInputs.length,
    totalPeakScenarios: task2bPeakScenarios.length,
    totalDeliveries: deliveriesSample.length,
  },
  outlets,
  vehicles,
  serviceAllowance,
  districtTravel,
  trafficSpeed: trafficSpeed.slice(0, 120), // 5 districts x 24 hours
  calendar: calendarSample,
  roadConditions: roadConditionsSample,
  task2aForecastInputs: task2aTestInputs,
  task2bPeakFleet,
  task2bPeakScenarios,
  deliveries: deliveriesSample,
};

const outputPath = path.resolve(__dirname, '..', 'frontend', 'src', 'data', 'tempDataParsed.json');
fs.writeFileSync(outputPath, JSON.stringify(bundled, null, 2), 'utf8');

console.log('Successfully written parsed data to', outputPath);
console.log('Stats:', {
  outlets: outlets.length,
  vehicles: vehicles.length,
  serviceAllowance: serviceAllowance.length,
  districtTravel: districtTravel.length,
  task2aForecastInputs: task2aTestInputs.length,
  task2bPeakFleet: task2bPeakFleet.length,
  task2bPeakScenarios: task2bPeakScenarios.length,
  deliveries: deliveriesSample.length,
});
