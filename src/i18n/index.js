// AI-assisted: see docs/AI_LOG.md #18
const dictionaries = {
  es: {
    homeTitle: 'Inicio',
    available: 'Disponible',
    unavailable: 'No disponible',
    incomingTitle: 'Solicitud entrante',
    accept: 'Aceptar',
    reject: 'Rechazar',
    tripInProgress: 'Viaje en curso',
    passengerOnBoard: 'Pasajero a bordo',
    finishTrip: 'Finalizar viaje',
    summaryTitle: 'Cobro y resumen',
    earningsTitle: 'Ganancias',
    historyTitle: 'Historial',
    profileTitle: 'Perfil',
    settingsTitle: 'Configuración',
    registerPersonal: 'Datos personales',
    registerVehicle: 'Vehículo',
    registerDocuments: 'Documentos',
    submitRegister: 'Enviar registro',
    signOut: 'Cerrar sesión',
    emptyHistory: 'No hay viajes en este periodo',
    simulateRequest: 'Simular solicitud',
    goingToPickup: 'Rumbo al punto de recogida',
    goingToDestination: 'Rumbo al destino',
  },
  en: {
    homeTitle: 'Home',
    available: 'Available',
    unavailable: 'Unavailable',
    incomingTitle: 'Incoming request',
    accept: 'Accept',
    reject: 'Reject',
    tripInProgress: 'Trip in progress',
    passengerOnBoard: 'Passenger on board',
    finishTrip: 'Finish trip',
    summaryTitle: 'Payment summary',
    earningsTitle: 'Earnings',
    historyTitle: 'History',
    profileTitle: 'Profile',
    settingsTitle: 'Settings',
    registerPersonal: 'Personal data',
    registerVehicle: 'Vehicle',
    registerDocuments: 'Documents',
    submitRegister: 'Submit registration',
    signOut: 'Sign out',
    emptyHistory: 'No trips in this period',
    simulateRequest: 'Simulate request',
    goingToPickup: 'Heading to pickup',
    goingToDestination: 'Heading to destination',
  },
};

/**
 * @param {'es'|'en'} language
 * @param {string} key
 * @returns {string}
 */
export function t(language, key) {
  return dictionaries[language]?.[key] ?? dictionaries.es[key] ?? key;
}
