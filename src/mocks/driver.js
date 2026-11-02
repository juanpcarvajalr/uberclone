// AI-assisted: see docs/AI_LOG.md #7
export const MOCK_DRIVER = {
  uid: 'driver_mock_001',
  fullName: 'Carlos Andrés Mejía',
  documentNumber: '1020304050',
  phone: '3001234567',
  birthDate: '1994-05-12T00:00:00.000Z',
  gender: 'male',
  email: 'carlos.mejia@example.com',
  profilePhotoUrl: 'https://placehold.co/120x120/png',
  vehicleId: 'vehicle_mock_001',
  accountStatus: 'approved',
  documents: {
    driverLicense: {
      number: 'LIC-998877',
      photoUrl: 'https://placehold.co/200x120/png',
      expiresAt: '2028-06-15T00:00:00.000Z',
    },
    soat: {
      photoUrl: 'https://placehold.co/200x120/png',
      expiresAt: '2027-03-01T00:00:00.000Z',
    },
    technicalInspection: {
      required: false,
      requiredFrom: '2028-02-10T00:00:00.000Z',
    },
  },
  mercadoPagoEmail: 'carlos.mp@example.com',
  termsAcceptedAt: '2026-09-01T12:00:00.000Z',
  termsCommissionRate: 0.2,
  fcmToken: 'mock-fcm-token',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-10-20T08:00:00.000Z',
};

export const MOCK_VEHICLE = {
  vehicleId: 'vehicle_mock_001',
  driverId: 'driver_mock_001',
  category: 'economy',
  plate: 'ABC123',
  brand: 'Chevrolet',
  model: 'Onix',
  year: 2022,
  registrationDate: '2023-02-10T00:00:00.000Z',
  color: 'blanco',
  passengerCapacity: 4,
  photoUrl: 'https://placehold.co/320x180/png',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
};

export const MOCK_DRIVER_LOCATION = {
  uid: 'driver_mock_001',
  isAvailable: false,
  location: { lat: 6.2442, lng: -75.5812 },
  category: 'economy',
  updatedAt: '2026-10-26T14:00:00.000Z',
};
