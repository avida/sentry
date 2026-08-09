export type Locale = "en" | "uk";
export type LockState = "HARD_LOCK" | "TRACKING" | "SCANNING";

export const locales: Locale[] = ["en", "uk"];

export const translations = {
  en: {
    language: "Language",
    appLabel: "Nerf Defense Program",
    title: "AUTO SENTRY CONTROL INTERFACE",
    callsign: "CALLSIGN: BASTION-07",
    missionProfile: "Mission Profile",
    engagementMode: "Engagement Mode",
    weaponBus: "Weapon Bus",
    iffFilter: "IFF Filter",
    armed: "ARMED",
    standby: "STANDBY",
    autoClassify: "AUTO CLASSIFY",
    manualVerify: "MANUAL VERIFY",
    disarm: "Disarm",
    arm: "Arm",
    autoTrackOn: "Auto Track On",
    autoTrackOff: "Auto Track Off",
    targetingHud: "Targeting HUD",
    lockStatus: "LOCK STATUS",
    confidence: "CONFIDENCE",
    rangeGate: "RANGE GATE",
    telemetry: "Telemetry",
    turretPan: "Turret Pan",
    turretTilt: "Turret Tilt",
    burstLength: "Burst Length",
    flywheelTemp: "Flywheel Temp",
    batteryReserve: "Battery Reserve",
    controlSurface: "Control Surface",
    panAxis: "Pan Axis",
    tiltAxis: "Tilt Axis",
    eventLog: "Event Log",
    lockStates: {
      HARD_LOCK: "HARD LOCK",
      TRACKING: "TRACKING",
      SCANNING: "SCANNING",
    },
    logs: [
      "Patrol route synchronized with node grid C4",
      "Friendly signature table refreshed",
      "Motion burst detected: sector north-east",
      "Classification resolved: foam projectile safe-zone",
    ],
    units: {
      meters: "m",
      degrees: "deg",
      darts: "darts",
      celsius: "C",
    },
  },
  uk: {
    language: "Мова",
    appLabel: "Програма захисту Nerf",
    title: "ІНТЕРФЕЙС КОНТРОЛЮ АВТОМАТИЧНОГО СПОСТЕРЕЖЕННЯ",
    callsign: "ПОЗИВНИЙ: BASTION-07",
    missionProfile: "Профіль місії",
    engagementMode: "Режим ураження",
    weaponBus: "Шина озброєння",
    iffFilter: "Фільтр IFF",
    armed: "ОЗБРОЄНО",
    standby: "ЧЕКАННЯ",
    autoClassify: "АВТОМАТИЧНА КЛАСИФІКАЦІЯ",
    manualVerify: "РУЧНА ПЕРЕВІРКА",
    disarm: "Роззброїти",
    arm: "ОЗБРОЇТИ",
    autoTrackOn: "Автослідкування увімкнено",
    autoTrackOff: "Автослідкування вимкнено",
    targetingHud: "HUD прицілювання",
    lockStatus: "СТАН БЛОКУВАННЯ",
    confidence: "ВПЕВНЕНІСТЬ",
    rangeGate: "ДІАПАЗОН",
    telemetry: "Телеметрія",
    turretPan: "Поворот турелі",
    turretTilt: "Нахил турелі",
    burstLength: "Тривалість черги",
    flywheelTemp: "Температура маховика",
    batteryReserve: "Резерв батареї",
    controlSurface: "Керуюча поверхня",
    panAxis: "Вісь обертання",
    tiltAxis: "Вісь нахилу",
    eventLog: "Журнал подій",
    lockStates: {
      HARD_LOCK: "ЖОРСТКЕ БЛОКУВАННЯ",
      TRACKING: "СЛІДКУВАННЯ",
      SCANNING: "СКАНУВАННЯ",
    },
    logs: [
      "Маршрут патрулю синхронізовано з сіткою вузлів C4",
      "Оновлено таблицю сигнатур союзників",
      "Виявлено імпульс руху: сектор північно-схід",
      "Класифікацію завершено: безпечна зона для пінистих снарядів",
    ],
    units: {
      meters: "м",
      degrees: "°",
      darts: "дартси",
      celsius: "C",
    },
  },
} as const;

export function getInitialLocale(): Locale {
  const saved = window.localStorage.getItem("ui-locale");
  if (saved === "en" || saved === "uk") {
    return saved;
  }
  const browser = window.navigator.language.toLowerCase();
  return browser.startsWith("uk") ? "uk" : "en";
}
