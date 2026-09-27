import { districtTravelMatrix, peliyagodaDepots, getServiceAllowance } from '../data/tempDataService';
import type { DeliveryTimeEstimationResult, Order } from '../types';

export interface EstimationParams {
  depotId?: string;
  district: string;
  outletName: string;
  brand: 'Fresh' | 'Style' | 'Tech';
  dockType: 'rear_dock' | 'street' | 'mall_bay';
  departureTime: string; // e.g. "08:15"
  weatherCondition?: 'clear' | 'showers' | 'monsoon';
  vehicleType?: 'heavy' | 'medium' | 'light';
  windowOpen?: string; // "08:00"
  windowClose?: string; // "11:30"
}

/**
 * Calculates time-of-day traffic speed multiplier based on traffic_speed.csv
 * Lower multiplier = slower speed -> higher travel time
 */
export const getTrafficMultiplier = (timeStr: string): { multiplier: number; periodName: string } => {
  const parts = timeStr.replace(/[^0-9:]/g, '').split(':');
  const hours = parseInt(parts[0], 10) || 8;
  const minutes = parseInt(parts[1], 10) || 0;
  const decimalHour = hours + minutes / 60;

  if (decimalHour >= 5.0 && decimalHour < 7.0) {
    return { multiplier: 1.05, periodName: 'Early Morning Free-Flow' };
  } else if (decimalHour >= 7.0 && decimalHour < 9.5) {
    return { multiplier: 0.62, periodName: 'Morning Congestion Peak' };
  } else if (decimalHour >= 9.5 && decimalHour < 12.0) {
    return { multiplier: 0.88, periodName: 'Mid-Morning Operational' };
  } else if (decimalHour >= 12.0 && decimalHour < 14.5) {
    return { multiplier: 0.80, periodName: 'Midday Commercial Rush' };
  } else if (decimalHour >= 14.5 && decimalHour < 16.5) {
    return { multiplier: 0.90, periodName: 'Afternoon Steady Transit' };
  } else if (decimalHour >= 16.5 && decimalHour < 19.5) {
    return { multiplier: 0.55, periodName: 'Evening Gridlock Peak' };
  } else {
    return { multiplier: 1.02, periodName: 'Off-Peak / Night Flow' };
  }
};

/**
 * Weather travel delay multiplier based on road_conditions.csv
 */
export const getWeatherFactor = (weather: 'clear' | 'showers' | 'monsoon' = 'clear') => {
  switch (weather) {
    case 'monsoon':
      return { travelFactor: 1.25, extraDockMin: 8, label: 'Heavy Southwest Monsoon' };
    case 'showers':
      return { travelFactor: 1.10, extraDockMin: 3, label: 'Intermittent Showers' };
    default:
      return { travelFactor: 1.00, extraDockMin: 0, label: 'Clear Weather' };
  }
};

/**
 * Vehicle class speed modifier
 */
export const getVehicleFactor = (type: 'heavy' | 'medium' | 'light' = 'medium') => {
  switch (type) {
    case 'heavy':
      return 1.15; // 15% slower acceleration on slopes
    case 'light':
      return 0.92; // 8% faster in tight urban corridors
    default:
      return 1.00;
  }
};

/**
 * Formats a time string (e.g. "08:15") plus minutes into formatted "HH:MM AM/PM"
 */
export const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  const parts = timeStr.replace(/[^0-9:]/g, '').split(':');
  let hours = parseInt(parts[0], 10) || 8;
  const minutes = parseInt(parts[1], 10) || 0;

  const totalMinutes = Math.round(hours * 60 + minutes + minutesToAdd);
  const finalHour24 = Math.floor((totalMinutes / 60) % 24);
  const finalMin = Math.round(totalMinutes % 60);

  const period = finalHour24 >= 12 ? 'PM' : 'AM';
  const displayHour = finalHour24 % 12 === 0 ? 12 : finalHour24 % 12;
  const displayMin = finalMin < 10 ? `0${finalMin}` : `${finalMin}`;

  return `${displayHour}:${displayMin} ${period}`;
};

/**
 * Convert time string to decimal minutes for window compliance comparisons
 */
export const timeStrToMinutes = (timeStr: string): number => {
  const isPM = /pm/i.test(timeStr);
  const isAM = /am/i.test(timeStr);
  const clean = timeStr.replace(/[^0-9:]/g, '');
  const parts = clean.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return h * 60 + m;
};

/**
 * Primary Core Delivery Time Estimator
 */
export const estimateDeliveryTime = (params: EstimationParams): DeliveryTimeEstimationResult => {
  const depot = peliyagodaDepots.find(d => d.id === params.depotId) || peliyagodaDepots[0];
  const travelInfo = districtTravelMatrix.find(d => d.district.toLowerCase() === params.district.toLowerCase()) || {
    district: params.district,
    depot: depot.name,
    roadClass: 'Urban Sector',
    freeFlowKmh: 30,
    depotToDistrictKm: 14.5,
    depotToDistrictFreeflowMin: 29.0,
    interStopKm: 4.2,
    interStopFreeflowMin: 8.4,
  };

  const traffic = getTrafficMultiplier(params.departureTime);
  const weather = getWeatherFactor(params.weatherCondition);
  const vehicleFactor = getVehicleFactor(params.vehicleType);

  // 1. Distance
  const distanceKm = Math.round(travelInfo.depotToDistrictKm * 10) / 10;

  // 2. Base Freeflow Travel Minutes
  const baseTravelMin = Math.round(travelInfo.depotToDistrictFreeflowMin);

  // 3. Traffic Adjustment: travel time scales inversely with speed multiplier
  // e.g. multiplier 0.62 means travel time = base / 0.62
  const trafficAdjustedMin = Math.round(baseTravelMin / traffic.multiplier);
  const trafficDelayMin = Math.max(0, trafficAdjustedMin - baseTravelMin);

  // 4. Weather & Vehicle adjustments
  const weatherAdjustedMin = Math.round(trafficAdjustedMin * weather.travelFactor * vehicleFactor);
  const monsoonWeatherDelayMin = Math.max(0, weatherAdjustedMin - trafficAdjustedMin);

  // Total Estimated Travel Minutes
  const estimatedTravelMin = weatherAdjustedMin;

  // 5. Dock Service Allowance from service_allowance.csv
  const dockAllowanceMin = getServiceAllowance(params.brand, params.dockType);
  const totalServiceTurnaroundMin = dockAllowanceMin + weather.extraDockMin;

  // 6. Total Delivery Turnaround (Travel + Dock Handling)
  const totalEstimatedDeliveryMin = estimatedTravelMin + totalServiceTurnaroundMin;

  // 7. Arrival ETA and Completion ETD
  const estimatedArrivalETA = addMinutesToTime(params.departureTime, estimatedTravelMin);
  const estimatedCompletionETA = addMinutesToTime(params.departureTime, totalEstimatedDeliveryMin);

  // 8. On-Time Probability & Window Compliance
  let onTimeProbability = 95;
  let timeWindowCompliance = true;

  if (params.windowClose) {
    const arrivalMins = timeStrToMinutes(estimatedArrivalETA);
    const windowCloseMins = timeStrToMinutes(params.windowClose);
    const bufferMinutes = windowCloseMins - arrivalMins;

    if (bufferMinutes < 0) {
      // Arrival is past closing time
      timeWindowCompliance = false;
      onTimeProbability = Math.max(10, Math.round(50 - Math.abs(bufferMinutes) * 2));
    } else if (bufferMinutes < 15) {
      // Razor thin margin
      onTimeProbability = 72;
    } else if (bufferMinutes < 30) {
      onTimeProbability = 86;
    } else {
      onTimeProbability = 98;
    }
  }

  // Weather and traffic penalties on confidence
  if (traffic.multiplier < 0.65) onTimeProbability -= 8;
  if (params.weatherCondition === 'monsoon') onTimeProbability -= 12;
  if (travelInfo.roadClass.toLowerCase().includes('hill')) onTimeProbability -= 5;
  onTimeProbability = Math.max(15, Math.min(99, onTimeProbability));

  return {
    origin: depot.name,
    destinationOutlet: params.outletName,
    district: params.district,
    roadClass: travelInfo.roadClass,
    distanceKm,
    baseTravelMin,
    trafficMultiplier: Math.round(traffic.multiplier * 100) / 100,
    trafficDelayMin,
    monsoonWeatherDelayMin,
    estimatedTravelMin,
    dockAllowanceMin,
    totalServiceTurnaroundMin,
    totalEstimatedDeliveryMin,
    departureTime: params.departureTime,
    estimatedArrivalETA,
    estimatedCompletionETA,
    onTimeProbability,
    timeWindowCompliance,
  };
};

/**
 * Enriches an existing Order with real-time delivery estimation calculations
 */
export const enrichOrderWithEstimation = (order: Order, departureTime = '06:00'): Order => {
  const brand = (order.brand as 'Fresh' | 'Style' | 'Tech') || 'Fresh';
  const dockType = order.outlet.dockType || 'street';
  const district = order.district || order.outlet.district || 'Colombo';

  const est = estimateDeliveryTime({
    district,
    outletName: order.outlet.name,
    brand,
    dockType,
    departureTime,
    windowOpen: order.window.start,
    windowClose: order.window.end,
  });

  return {
    ...order,
    estimatedTravelMin: est.estimatedTravelMin,
    estimatedArrivalETA: est.estimatedArrivalETA,
    estimatedServiceMin: est.dockAllowanceMin,
    estimatedCompletionETA: est.estimatedCompletionETA,
    onTimeProbability: est.onTimeProbability,
  };
};
