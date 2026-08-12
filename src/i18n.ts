export type Locale = "en" | "uk";
export type LockState = "HARD_LOCK" | "TRACKING" | "SCANNING";

export const locales: Locale[] = ["en", "uk"];

export const translations = {
  en: {
    language: "Language",
    modeSelection: {
      SAFE: "Safe",
      MANUAL: "Manual",
      AUTO: "Auto",
    },
    appLabel: "Nerf Defense Program",
    title: "AUTO SENTRY CONTROL INTERFACE",
    callsign: "CALLSIGN: ZAF-007",
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
    camera: "Camera",
    cameraOptions: ["1", "2", "3", "4", "5", "6"],
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
    modeSelection: {
      SAFE: "Безпечний",
      MANUAL: "Ручний",
      AUTO: "Автоматичний",
    },
    appLabel: "Програма захисту Nerf",
    title: "ІНТЕРФЕЙС КОНТРОЛЮ АВТОМАТИЧНОЇ ТУРЕЛІ",
    callsign: "ПОЗИВНИЙ: ZAF-007",
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
    camera: "Камера",
    cameraOptions: ["1", "2", "3", "4", "5", "6"],
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
    controlSurface: "Панель керування",
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
      "Класифікацію завершено: безпечна зона для снарядів",
    ],
    units: {
      meters: "м",
      degrees: "°",
      darts: "постріли",
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
