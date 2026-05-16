/**
 * CX-3 Aviation Calculator — Accurate computation library
 * All formulas follow FAA/ASA standards and ICAO atmospheric model.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
export const ISA_SEA_LEVEL_TEMP_C = 15;
export const ISA_LAPSE_RATE_C_PER_FT = 0.0019812; // 3.5666 °F per 1000 ft
export const STD_PRESSURE_HPA = 1013.25;
export const STD_PRESSURE_INHG = 29.92;

// ─── Unit Conversions ─────────────────────────────────────────────────────────
export function ktToMph(kt: number): number { return kt * 1.15078; }
export function mphToKt(mph: number): number { return mph / 1.15078; }
export function ktToKmh(kt: number): number { return kt * 1.852; }
export function kmhToKt(kmh: number): number { return kmh / 1.852; }
export function nmToSm(nm: number): number { return nm * 1.15078; }
export function smToNm(sm: number): number { return sm / 1.15078; }
export function nmToKm(nm: number): number { return nm * 1.852; }
export function kmToNm(km: number): number { return km / 1.852; }
export function ftToM(ft: number): number { return ft * 0.3048; }
export function mToFt(m: number): number { return m / 0.3048; }
export function cToF(c: number): number { return c * 9 / 5 + 32; }
export function fToC(f: number): number { return (f - 32) * 5 / 9; }
export function inHgToHpa(inhg: number): number { return inhg * 33.8639; }
export function hpaToInhg(hpa: number): number { return hpa / 33.8639; }
export function lbsToKg(lbs: number): number { return lbs * 0.453592; }
export function kgToLbs(kg: number): number { return kg / 0.453592; }
export function galToL(gal: number): number { return gal * 3.78541; }
export function lToGal(l: number): number { return l / 3.78541; }
export function usGalToImpGal(usGal: number): number { return usGal * 0.832674; }
export function impGalToUsGal(impGal: number): number { return impGal / 0.832674; }
export function degToRad(deg: number): number { return deg * Math.PI / 180; }
export function radToDeg(rad: number): number { return rad * 180 / Math.PI; }

// ─── Extended unit conversions ─────────────────────────────────────────────────
// Speed extras
export function ktToMs(kt: number): number  { return kt * 0.514444; }
export function msToKt(ms: number): number  { return ms / 0.514444; }
export function ktToFps(kt: number): number { return kt * 1.68781; }
export function fpsToKt(fps: number): number{ return fps / 1.68781; }
export function mphToKmh(mph: number): number { return mph * 1.60934; }
export function kmhToMph(kmh: number): number { return kmh / 1.60934; }
export function fpmToMs(fpm: number): number  { return fpm * 0.00508; }
export function msToFpm(ms: number): number   { return ms / 0.00508; }
export function fpmToFps(fpm: number): number { return fpm / 60; }
export function fpsToFpm(fps: number): number { return fps * 60; }
// Distance extras
export function nmToFt(nm: number): number    { return nm * 6076.12; }
export function ftToNm(ft: number): number    { return ft / 6076.12; }
export function smToKm(sm: number): number    { return sm * 1.60934; }
export function kmToSm(km: number): number    { return km / 1.60934; }
export function nmToM(nm: number): number     { return nm * 1852; }
export function mToNm(m: number): number      { return m / 1852; }
export function miToKm(mi: number): number    { return mi * 1.60934; }
export function kmToMi(km: number): number    { return km / 1.60934; }
// Temperature extras
export function cToK(c: number): number       { return c + 273.15; }
export function kToC(k: number): number       { return k - 273.15; }
export function fToK(f: number): number       { return (f - 32) * 5 / 9 + 273.15; }
export function kToF(k: number): number       { return (k - 273.15) * 9 / 5 + 32; }
// Weight extras
export function lbsToOz(lbs: number): number  { return lbs * 16; }
export function ozToLbs(oz: number): number   { return oz / 16; }
export function kgToG(kg: number): number     { return kg * 1000; }
export function gToKg(g: number): number      { return g / 1000; }
export function ozToG(oz: number): number     { return oz * 28.3495; }
export function gToOz(g: number): number      { return g / 28.3495; }
// Volume extras
export function galToQt(gal: number): number  { return gal * 4; }
export function qtToGal(qt: number): number   { return qt / 4; }
export function lToMl(l: number): number      { return l * 1000; }
export function mlToL(ml: number): number     { return ml / 1000; }
// Gradient / climb
export function gradPctToDeg(pct: number): number  { return Math.atan(pct / 100) * 180 / Math.PI; }
export function gradDegToPct(deg: number): number  { return Math.tan(deg * Math.PI / 180) * 100; }
export function ftPerNmToPct(ftPerNm: number): number { return (ftPerNm / 6076.12) * 100; }
export function pctToFtPerNm(pct: number): number     { return (pct / 100) * 6076.12; }
// Pressure extras (mb = hPa)
export function mbToInhg(mb: number): number  { return mb / 33.8639; }
export function inHgToMb(inhg: number): number{ return inhg * 33.8639; }
export function kpaToInhg(kpa: number): number{ return kpa / 3.38639; }
export function inHgToKpa(inhg: number): number{ return inhg * 3.38639; }

// ─── Heading / Bearing helpers ────────────────────────────────────────────────
export function normalizeHeading(h: number): number {
  h = h % 360;
  return h < 0 ? h + 360 : h;
}

// ─── Pressure Altitude ─────────────────────────────────────────────────────────
/**
 * Pressure Altitude = Indicated Altitude + (STD - Altimeter Setting) × 1000
 * Using the standard approximation: 1 inHg = 1000 ft
 */
export function pressureAltitude(indicatedAltFt: number, altimeterInhg: number): number {
  return indicatedAltFt + (STD_PRESSURE_INHG - altimeterInhg) * 1000;
}

// ─── Density Altitude ─────────────────────────────────────────────────────────
/**
 * ISA temperature at pressure altitude
 */
export function isaTempAtAlt(pressureAltFt: number): number {
  return ISA_SEA_LEVEL_TEMP_C - ISA_LAPSE_RATE_C_PER_FT * pressureAltFt;
}

/**
 * Density Altitude using the standard approximation:
 * DA = PA + 118.8 × (OAT_C - ISA_Temp_C)
 * More accurate: uses ICAO formula
 */
export function densityAltitude(pressureAltFt: number, oatC: number): number {
  const isaTemp = isaTempAtAlt(pressureAltFt);
  return pressureAltFt + 118.8 * (oatC - isaTemp);
}

/**
 * Full density altitude from indicated alt + altimeter + OAT
 */
export function densityAltitudeFull(
  indicatedAltFt: number,
  altimeterInhg: number,
  oatC: number
): { pressureAlt: number; densityAlt: number } {
  const pa = pressureAltitude(indicatedAltFt, altimeterInhg);
  const da = densityAltitude(pa, oatC);
  return { pressureAlt: Math.round(pa), densityAlt: Math.round(da) };
}

// ─── True Altitude ─────────────────────────────────────────────────────────────
/**
 * True Altitude = Indicated Altitude + (OAT - ISA) × (Indicated Altitude / 273)
 * CX-3 formula: TA = IA × (OAT_K / ISA_K)
 * where ISA_K is ISA temp at that altitude in Kelvin
 */
export function trueAltitude(
  indicatedAltFt: number,
  altimeterInhg: number,
  oatC: number
): number {
  const pa = pressureAltitude(indicatedAltFt, altimeterInhg);
  const isaC = isaTempAtAlt(pa);
  const correction = ((oatC - isaC) / 273) * indicatedAltFt;
  return Math.round(indicatedAltFt + correction);
}

// ─── True Airspeed ─────────────────────────────────────────────────────────────
/**
 * True Airspeed from Calibrated Airspeed using density altitude.
 * TAS = CAS × √(ρ_SL / ρ_alt)
 * Simplified: TAS ≈ CAS × (1 + 0.02 × DA_per_1000ft)
 * Accurate formula using temperature ratio:
 * TAS = CAS × √(T_SL / T_alt) where temps in Kelvin and at std pressure
 * Even more accurate: uses air density ratio
 */
export function trueAirspeed(casKt: number, pressureAltFt: number, oatC: number): number {
  const oatK = oatC + 273.15;
  // Speed of sound at sea level ISA: 661.47 kt
  // TAS = CAS / √(δ) × √(θ) where δ = P/P0, θ = T/T0
  // For subsonic non-compressible approx (accurate < M0.3):
  // TAS = CAS × √(ρ_0 / ρ) = CAS × √(T / T_0) / √(P / P_0)
  const T0 = 288.15; // ISA SL temp in K
  const P0 = STD_PRESSURE_HPA;
  // Pressure at altitude using barometric formula
  const P = P0 * Math.pow(1 - 6.87559e-6 * pressureAltFt, 5.2561);
  const densityRatio = (P / P0) / (oatK / T0);
  return Math.round(casKt / Math.sqrt(densityRatio) * 10) / 10;
}

/**
 * CAS from TAS
 */
export function calibratedAirspeed(tasKt: number, pressureAltFt: number, oatC: number): number {
  const oatK = oatC + 273.15;
  const T0 = 288.15;
  const P0 = STD_PRESSURE_HPA;
  const P = P0 * Math.pow(1 - 6.87559e-6 * pressureAltFt, 5.2561);
  const densityRatio = (P / P0) / (oatK / T0);
  return Math.round(tasKt * Math.sqrt(densityRatio) * 10) / 10;
}

// ─── Mach Number ─────────────────────────────────────────────────────────────
export function machNumber(tasKt: number, oatC: number): number {
  const oatK = oatC + 273.15;
  const speedOfSound = 38.967854 * Math.sqrt(oatK); // in kt
  return Math.round(tasKt / speedOfSound * 1000) / 1000;
}

// ─── Wind Triangle ─────────────────────────────────────────────────────────────
export interface WindTriangleResult {
  trueHeading: number;      // degrees
  groundSpeed: number;      // kt
  windCorrectionAngle: number; // degrees (+ = right, - = left)
  headwindComponent: number;  // kt (+ = headwind, - = tailwind)
  crosswindComponent: number; // kt (+ = from right)
}

/**
 * Given true course, TAS, wind direction (FROM), wind speed:
 * Solve the wind triangle for heading and ground speed.
 */
export function windTriangle(
  trueCourse: number, // degrees
  tas: number,        // kt
  windDirection: number, // degrees FROM
  windSpeed: number   // kt
): WindTriangleResult {
  const tcRad = degToRad(trueCourse);
  const wdRad = degToRad(windDirection);

  // Wind components relative to true course
  const wca = Math.asin((windSpeed / tas) * Math.sin(degToRad(windDirection - trueCourse)));
  const wcaDeg = radToDeg(wca);

  const trueHeading = normalizeHeading(trueCourse + wcaDeg);

  // Ground speed
  const gs = tas * Math.cos(wca) - windSpeed * Math.cos(degToRad(windDirection - trueCourse));

  // Headwind / crosswind components (relative to runway/course direction)
  const windAngle = degToRad(windDirection - trueCourse);
  const headwind = windSpeed * Math.cos(windAngle);
  const crosswind = windSpeed * Math.sin(windAngle);

  return {
    trueHeading: Math.round(trueHeading * 10) / 10,
    groundSpeed: Math.round(gs * 10) / 10,
    windCorrectionAngle: Math.round(wcaDeg * 10) / 10,
    headwindComponent: Math.round(headwind * 10) / 10,
    crosswindComponent: Math.round(crosswind * 10) / 10,
  };
}

/**
 * Find wind direction and speed from two known ground vectors.
 * Given: TH (true heading), TAS, TC (true course), GS
 */
export function findWind(
  trueHeading: number,
  tas: number,
  trueCourse: number,
  groundSpeed: number
): { windDirection: number; windSpeed: number } {
  const thRad = degToRad(trueHeading);
  const tcRad = degToRad(trueCourse);

  // TAS vector components
  const tasX = tas * Math.sin(thRad);
  const tasY = tas * Math.cos(thRad);

  // GS vector components
  const gsX = groundSpeed * Math.sin(tcRad);
  const gsY = groundSpeed * Math.cos(tcRad);

  // Wind vector = TAS vector - GS vector
  const windX = tasX - gsX;
  const windY = tasY - gsY;

  const windSpeed = Math.sqrt(windX * windX + windY * windY);
  let windDir = radToDeg(Math.atan2(windX, windY));
  windDir = normalizeHeading(windDir);

  return {
    windDirection: Math.round(windDir * 10) / 10,
    windSpeed: Math.round(windSpeed * 10) / 10,
  };
}

/**
 * Runway crosswind and headwind components
 */
export function runwayWindComponents(
  windDirection: number, // magnetic
  windSpeed: number,
  runwayHeading: number  // magnetic (e.g., Runway 27 = 270°)
): { headwind: number; crosswind: number; crosswindDirection: "left" | "right" } {
  const angle = degToRad(windDirection - runwayHeading);
  const headwind = windSpeed * Math.cos(angle);
  const crosswind = windSpeed * Math.sin(angle);
  return {
    headwind: Math.round(headwind * 10) / 10,
    crosswind: Math.round(Math.abs(crosswind) * 10) / 10,
    crosswindDirection: crosswind >= 0 ? "right" : "left",
  };
}

// ─── Time / Speed / Distance ──────────────────────────────────────────────────
/**
 * Returns time in minutes
 */
export function timeFromDistSpeed(distanceNm: number, speedKt: number): number {
  return (distanceNm / speedKt) * 60;
}

/**
 * Returns distance in nm
 */
export function distanceFromTimeSpeed(timeMin: number, speedKt: number): number {
  return (timeMin / 60) * speedKt;
}

/**
 * Returns speed in kt
 */
export function speedFromDistTime(distanceNm: number, timeMin: number): number {
  return distanceNm / (timeMin / 60);
}

/**
 * Convert decimal minutes to HH:MM:SS
 */
export function minutesToHMS(totalMinutes: number): { hours: number; minutes: number; seconds: number } {
  const totalSeconds = Math.round(totalMinutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function formatHMS(totalMinutes: number): string {
  const { hours, minutes, seconds } = minutesToHMS(totalMinutes);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// ─── Fuel Calculations ─────────────────────────────────────────────────────────
export function fuelBurn(timeMin: number, fuelFlowGphOrPph: number): number {
  return (timeMin / 60) * fuelFlowGphOrPph;
}

export function endurance(totalFuelGal: number, fuelFlowGph: number): number {
  return (totalFuelGal / fuelFlowGph) * 60; // minutes
}

export function rangeFromFuel(totalFuelGal: number, fuelFlowGph: number, groundSpeedKt: number): number {
  const timeHours = totalFuelGal / fuelFlowGph;
  return timeHours * groundSpeedKt;
}

export function fuelRequired(distanceNm: number, groundSpeedKt: number, fuelFlowGph: number): number {
  const timeHours = distanceNm / groundSpeedKt;
  return timeHours * fuelFlowGph;
}

// ─── Weight & Balance ─────────────────────────────────────────────────────────
export interface WBItem {
  name: string;
  weightLbs: number;
  armIn: number; // inches
}

export interface WBResult {
  totalWeight: number;
  totalMoment: number;
  cg: number; // inches from datum
  items: Array<{ name: string; weight: number; arm: number; moment: number }>;
}

export function weightAndBalance(items: WBItem[]): WBResult {
  let totalWeight = 0;
  let totalMoment = 0;
  const computed = items.map((item) => {
    const moment = item.weightLbs * item.armIn;
    totalWeight += item.weightLbs;
    totalMoment += moment;
    return { name: item.name, weight: item.weightLbs, arm: item.armIn, moment };
  });
  const cg = totalWeight !== 0 ? totalMoment / totalWeight : 0;
  return {
    totalWeight: Math.round(totalWeight * 100) / 100,
    totalMoment: Math.round(totalMoment * 100) / 100,
    cg: Math.round(cg * 100) / 100,
    items: computed,
  };
}

// ─── Off-Course Correction ────────────────────────────────────────────────────
/**
 * 1-in-60 rule: heading correction
 */
export function offCourseCorrection(
  distanceOffCoursNm: number,
  distanceTravelledNm: number,
  distanceToDestNm: number
): { openingAngle: number; closingAngle: number; totalCorrection: number } {
  const openingAngle = radToDeg(Math.atan(distanceOffCoursNm / distanceTravelledNm));
  const closingAngle = radToDeg(Math.atan(distanceOffCoursNm / distanceToDestNm));
  return {
    openingAngle: Math.round(openingAngle * 10) / 10,
    closingAngle: Math.round(closingAngle * 10) / 10,
    totalCorrection: Math.round((openingAngle + closingAngle) * 10) / 10,
  };
}

/**
 * Simple 60:1 rule approximation
 */
export function offCourseSixtyToOne(
  distanceOffCoursNm: number,
  distanceFlownNm: number
): number {
  return (distanceOffCoursNm / distanceFlownNm) * 60;
}

// ─── Magnetic Variation ──────────────────────────────────────────────────────
export function trueTomagnetic(trueDeg: number, variationDeg: number, variationDirection: "E" | "W"): number {
  // East is least, West is best
  const variation = variationDirection === "E" ? variationDeg : -variationDeg;
  return normalizeHeading(trueDeg - variation);
}

export function magneticToTrue(magneticDeg: number, variationDeg: number, variationDirection: "E" | "W"): number {
  const variation = variationDirection === "E" ? variationDeg : -variationDeg;
  return normalizeHeading(magneticDeg + variation);
}

// ─── Compass Deviation ────────────────────────────────────────────────────────
export function compassToMagnetic(compassDeg: number, deviationDeg: number, deviationDir: "E" | "W"): number {
  const dev = deviationDir === "E" ? deviationDeg : -deviationDeg;
  return normalizeHeading(compassDeg + dev);
}

export function magneticToCompass(magneticDeg: number, deviationDeg: number, deviationDir: "E" | "W"): number {
  const dev = deviationDir === "E" ? deviationDeg : -deviationDeg;
  return normalizeHeading(magneticDeg - dev);
}

// ─── VVI / Rate of Climb for Gradient ────────────────────────────────────────
export function rateOfClimb(groundSpeedKt: number, gradientPercent: number): number {
  // RoC (fpm) = GS (kt) × gradient (%) × 10.1
  return Math.round(groundSpeedKt * gradientPercent * 10.1);
}

export function climbGradient(rateOfClimbFpm: number, groundSpeedKt: number): number {
  return Math.round(rateOfClimbFpm / (groundSpeedKt * 10.1) * 10) / 10;
}

export function feetPerNm(rateOfClimbFpm: number, groundSpeedKt: number): number {
  // feet per nm = RoC / GS_in_fps_over_nm ... simplified:
  return Math.round((rateOfClimbFpm / groundSpeedKt) * 60);
}

// ─── Top of Descent ──────────────────────────────────────────────────────────
export function topOfDescent(
  currentAltFt: number,
  targetAltFt: number,
  descentRateFpm: number,
  groundSpeedKt: number
): { distanceNm: number; timeMin: number } {
  const altitudeLoss = currentAltFt - targetAltFt;
  const timeMin = altitudeLoss / descentRateFpm;
  const distanceNm = (groundSpeedKt / 60) * timeMin;
  return {
    distanceNm: Math.round(distanceNm * 10) / 10,
    timeMin: Math.round(timeMin * 10) / 10,
  };
}

// ─── Equivalent Airspeed ─────────────────────────────────────────────────────
/**
 * EAS = CAS corrected for compressibility error.
 * For subsonic flight: EAS ≈ TAS × √(ρ/ρ₀) where ρ/ρ₀ = pressure ratio / temp ratio
 * Accurate form uses pressure ratio only (no temp): EAS = TAS × √(P/P₀)
 */
export function equivalentAirspeed(tasKt: number, pressureAltFt: number): number {
  const P0 = STD_PRESSURE_HPA;
  const P = P0 * Math.pow(1 - 6.87559e-6 * pressureAltFt, 5.2561);
  const pressureRatio = P / P0;
  return Math.round(tasKt * Math.sqrt(pressureRatio) * 10) / 10;
}

/**
 * CAS from EAS corrected for compressibility (inverse of above, approx).
 * For low subsonic flight EAS ≈ CAS, correction grows with altitude.
 */
export function tasFromEas(easKt: number, pressureAltFt: number): number {
  const P0 = STD_PRESSURE_HPA;
  const P = P0 * Math.pow(1 - 6.87559e-6 * pressureAltFt, 5.2561);
  const pressureRatio = P / P0;
  return Math.round(easKt / Math.sqrt(pressureRatio) * 10) / 10;
}

// ─── Mach ↔ Airspeed ─────────────────────────────────────────────────────────
/**
 * Speed of sound at OAT (knots). a = 38.9678 × √T_K
 */
export function speedOfSound(oatC: number): number {
  const oatK = oatC + 273.15;
  return Math.round(38.9678 * Math.sqrt(oatK) * 10) / 10;
}

/**
 * TAS from Mach number + OAT
 */
export function tasFromMach(mach: number, oatC: number): number {
  return Math.round(mach * speedOfSound(oatC) * 10) / 10;
}

/**
 * CAS from Mach + pressure altitude + OAT
 */
export function casFromMach(mach: number, pressureAltFt: number, oatC: number): number {
  const tas = tasFromMach(mach, oatC);
  return calibratedAirspeed(tas, pressureAltFt, oatC);
}

/**
 * EAS from Mach + pressure altitude
 */
export function easFromMach(mach: number, pressureAltFt: number, oatC: number): number {
  const tas = tasFromMach(mach, oatC);
  return equivalentAirspeed(tas, pressureAltFt);
}

// ─── Dynamic Pressure ─────────────────────────────────────────────────────────
/**
 * Dynamic pressure q = ½ρV² in lbs/ft² (psf)
 * Using ρ₀ = 0.002377 slug/ft³ and EAS
 */
export function dynamicPressure(easKt: number): number {
  const easFps = easKt * 1.68781;
  const rho0 = 0.002377; // slug/ft³ sea-level
  return Math.round(0.5 * rho0 * easFps * easFps * 100) / 100;
}

// ─── Load Factor & Stall ─────────────────────────────────────────────────────
/**
 * Load factor n = 1 / cos(bank)
 */
export function loadFactor(bankDeg: number): number {
  if (bankDeg >= 90) return Infinity;
  return Math.round(1 / Math.cos(degToRad(bankDeg)) * 100) / 100;
}

/**
 * Stall speed in banked turn: Vs_bank = Vs × √n
 */
export function stallSpeedInBank(vs1g: number, bankDeg: number): number {
  const n = loadFactor(bankDeg);
  if (!isFinite(n)) return Infinity;
  return Math.round(vs1g * Math.sqrt(n) * 10) / 10;
}

/**
 * Maneuvering speed Va at current weight from Va at max gross
 * Va_current = Va_max × √(W_current / W_max)
 */
export function maneuveringSpeed(vaMax: number, wMax: number, wCurrent: number): number {
  if (wMax <= 0) return vaMax;
  return Math.round(vaMax * Math.sqrt(wCurrent / wMax) * 10) / 10;
}

/**
 * Turning radius for bank + TAS (feet)
 * r = V² / (g × tan(bank)) where V in fps
 */
export function bankAngleForRadius(radiusFt: number, tasKt: number): number {
  const tasFps = tasKt * 1.68781;
  const g = 32.174;
  return Math.round(radToDeg(Math.atan(tasFps * tasFps / (g * radiusFt))) * 10) / 10;
}

// ─── Glideslope / VVI ─────────────────────────────────────────────────────────
/**
 * Required VVI (fpm) for a given glidepath angle and ground speed.
 * VVI = GS(kt) × tan(angle°) × 101.27
 */
export function vviForGlideslope(gsKt: number, angleDeg: number): number {
  return Math.round(gsKt * Math.tan(degToRad(angleDeg)) * 101.27);
}

/**
 * Glidepath angle from VVI and GS
 */
export function glideslopeAngle(vviFpm: number, gsKt: number): number {
  return Math.round(radToDeg(Math.atan(vviFpm / (gsKt * 101.27))) * 100) / 100;
}

/**
 * VVI table for standard 3° ILS at common speeds
 */
export function vviTable3deg(): Array<{ gsKt: number; vviFpm: number }> {
  return [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].map((gs) => ({
    gsKt: gs,
    vviFpm: vviForGlideslope(gs, 3),
  }));
}

// ─── Climb Performance ───────────────────────────────────────────────────────
/**
 * Climb gradient (%) from rate of climb and TAS
 */
export function climbGradientPct(rocFpm: number, tasKt: number): number {
  const tasFpm = tasKt * 101.27;
  return Math.round(rocFpm / tasFpm * 100 * 10) / 10;
}

/**
 * Climb gradient (feet per nm) from RoC and GS
 */
export function climbFeetPerNm(rocFpm: number, gsKt: number): number {
  if (gsKt <= 0) return 0;
  return Math.round((rocFpm / gsKt) * 60);
}

/**
 * Rate of climb needed for a gradient (%) at given TAS
 */
export function rocForGradient(gradientPct: number, tasKt: number): number {
  const tasFpm = tasKt * 101.27;
  return Math.round(gradientPct / 100 * tasFpm);
}

/**
 * Rate of climb needed for feet-per-nm gradient at given GS
 */
export function rocForFeetPerNm(feetPerNm: number, gsKt: number): number {
  return Math.round(feetPerNm * gsKt / 60);
}

/**
 * Time to climb in minutes
 */
export function timeToClimb(altToGainFt: number, rocFpm: number): number {
  if (rocFpm <= 0) return Infinity;
  return altToGainFt / rocFpm;
}

/**
 * Top of climb distance in nm
 */
export function topOfClimbDist(altToGainFt: number, rocFpm: number, gsKt: number): number {
  const timeMin = timeToClimb(altToGainFt, rocFpm);
  if (!isFinite(timeMin)) return Infinity;
  return Math.round((gsKt / 60) * timeMin * 10) / 10;
}

// ─── Glide Range ─────────────────────────────────────────────────────────────
/**
 * Glide distance (nm) from AGL altitude and glide ratio, with optional wind.
 * windKt: positive = headwind (reduces range), negative = tailwind
 */
export function glideRangeNm(altAglFt: number, glideRatio: number, tasKt: number, windKt: number = 0): number {
  const gsKt = Math.max(tasKt - windKt, 1);
  const effectiveRatio = glideRatio * (gsKt / tasKt);
  const distFt = altAglFt * effectiveRatio;
  return Math.round(distFt / 6076.12 * 10) / 10;
}

/**
 * Glide ratio from horizontal distance and altitude lost
 */
export function glideRatioFromDist(distNm: number, altLostFt: number): number {
  const distFt = distNm * 6076.12;
  return Math.round(distFt / altLostFt * 10) / 10;
}

/**
 * Altitude required to glide a given distance
 */
export function altForGlide(distNm: number, glideRatio: number, tasKt: number, windKt: number = 0): number {
  const gsKt = Math.max(tasKt - windKt, 1);
  const effectiveRatio = glideRatio * (gsKt / tasKt);
  const distFt = distNm * 6076.12;
  return Math.round(distFt / effectiveRatio);
}

// ─── Fuel Weight & Flow ───────────────────────────────────────────────────────
export type FuelType = "avgas100ll" | "jeta" | "mogas" | "custom";

export const FUEL_DENSITIES: Record<FuelType, number> = {
  avgas100ll: 6.01,  // lbs/gal at 59°F
  jeta:       6.71,
  mogas:      6.00,
  custom:     6.01,
};

export function fuelGalToLbs(gallons: number, fuelType: FuelType, customDensity?: number): number {
  const density = fuelType === "custom" ? (customDensity ?? 6.01) : FUEL_DENSITIES[fuelType];
  return Math.round(gallons * density * 10) / 10;
}

export function fuelLbsToGal(lbs: number, fuelType: FuelType, customDensity?: number): number {
  const density = fuelType === "custom" ? (customDensity ?? 6.01) : FUEL_DENSITIES[fuelType];
  return Math.round(lbs / density * 10) / 10;
}

export function pphToGph(pph: number, fuelType: FuelType, customDensity?: number): number {
  return fuelLbsToGal(pph, fuelType, customDensity);
}

export function gphToPph(gph: number, fuelType: FuelType, customDensity?: number): number {
  return fuelGalToLbs(gph, fuelType, customDensity);
}

// ─── Specific Range & Efficiency ─────────────────────────────────────────────
/**
 * Specific Range = nm per gallon
 */
export function specificRange(gsKt: number, fuelFlowGph: number): number {
  if (fuelFlowGph <= 0) return 0;
  return Math.round(gsKt / fuelFlowGph * 100) / 100;
}

/**
 * Fuel flow needed for a target specific range
 */
export function fuelFlowForRange(gsKt: number, targetNmPerGal: number): number {
  if (targetNmPerGal <= 0) return 0;
  return Math.round(gsKt / targetNmPerGal * 100) / 100;
}

/**
 * Cost per nm at given fuel price and specific range
 */
export function costPerNm(fuelPricePerGal: number, specificRangeNmPerGal: number): number {
  if (specificRangeNmPerGal <= 0) return 0;
  return Math.round(fuelPricePerGal / specificRangeNmPerGal * 100) / 100;
}

// ─── Standard Rate Turn ──────────────────────────────────────────────────────
/**
 * Standard rate turn = 3 degrees per second
 * Bank angle for standard rate turn: BA = TAS / 10 + 7 (approx)
 * Accurate: BA = arctan(TAS × π / 180 / g / RateRad)
 */
export function standardRateTurnBank(tasKt: number): number {
  const tasMs = tasKt * 0.514444;
  const rateRad = 3 * Math.PI / 180; // 3 deg/sec
  const g = 9.80665;
  const bankRad = Math.atan(tasMs * rateRad / g);
  return Math.round(radToDeg(bankRad) * 10) / 10;
}

export function turnRadius(tasKt: number, bankAngleDeg: number): number {
  const tasMs = tasKt * 0.514444;
  const g = 9.80665;
  const bankRad = degToRad(bankAngleDeg);
  const radiusM = tasMs * tasMs / (g * Math.tan(bankRad));
  return Math.round(mToFt(radiusM)); // ft
}

export function timeForTurn(headingChangeDeg: number, ratePerSec: number = 3): number {
  return headingChangeDeg / ratePerSec; // seconds
}

// ─── Required Descent Rate ────────────────────────────────────────────────────
export function requiredDescentRate(
  altToLoseFt: number,
  distanceNm: number,
  groundSpeedKt: number
): number {
  const timeMin = (distanceNm / groundSpeedKt) * 60;
  return Math.round(altToLoseFt / timeMin); // fpm
}

// ─── Glide Ratio / Glide Distance ────────────────────────────────────────────
export function glideDistance(
  altAglFt: number,
  glideRatio: number,
  headwindKt: number = 0,
  tasKt: number = 65
): number {
  const gsKt = tasKt - headwindKt;
  // distance = alt × glideRatio × (GS/TAS) in ft, convert to nm
  const distFt = altAglFt * glideRatio * (gsKt / tasKt);
  return Math.round(distFt / 6076.12 * 10) / 10; // nm
}

// ─── Speed / Ground Speed Correction ─────────────────────────────────────────
export function etaCorrection(
  plannedGS: number,
  actualGS: number,
  remainingDistNm: number
): { newEtaMin: number; timeDifferenceMin: number } {
  const newEtaMin = (remainingDistNm / actualGS) * 60;
  const oldEtaMin = (remainingDistNm / plannedGS) * 60;
  return {
    newEtaMin: Math.round(newEtaMin * 10) / 10,
    timeDifferenceMin: Math.round((newEtaMin - oldEtaMin) * 10) / 10,
  };
}

// ─── ISA Deviation ───────────────────────────────────────────────────────────
export function isaDeviation(pressureAltFt: number, oatC: number): number {
  const isaTemp = isaTempAtAlt(pressureAltFt);
  return Math.round((oatC - isaTemp) * 10) / 10;
}
