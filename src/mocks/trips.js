// AI-assisted: see docs/AI_LOG.md #8
import { calculateFare } from '../utils/calculateFare';
import { PRICING } from '../config/pricing';

const fareA = calculateFare({
  distanceKm: 8.5,
  durationMin: 22,
  category: 'economy',
  tip: 0,
});

const fareB = calculateFare({
  distanceKm: 5.2,
  durationMin: 15,
  category: 'xl',
  tip: 2000,
});

const fareC = calculateFare({
  distanceKm: 12.0,
  durationMin: 35,
  category: 'premium',
  tip: 0,
});

const fareD = calculateFare({
  distanceKm: 3.1,
  durationMin: 10,
  category: 'economy',
  tip: 1000,
});

/**
 * Completed/paid mock trips for history and earnings screens.
 */
export const MOCK_TRIPS = [
  {
    tripId: 'trip_001',
    driverId: 'driver_mock_001',
    passengerId: 'passenger_001',
    vehicleId: 'vehicle_mock_001',
    origin: {
      lat: 6.2476,
      lng: -75.5658,
      address: 'Parque Lleras, El Poblado',
    },
    destination: {
      lat: 6.1987,
      lng: -75.575,
      address: 'Centro Comercial El Tesoro',
    },
    distanceKm: 8.5,
    durationMin: 22,
    category: 'economy',
    ...fareA,
    tip: 0,
    commissionRate: PRICING.commissionRate,
    paymentMethod: 'mercadopago',
    paymentStatus: 'approved',
    paymentId: 'mp_mock_001',
    status: 'paid',
    rating: 5,
    routePolyline: 'mock_polyline_llerás_tesoro',
    createdAt: '2026-10-26T09:15:00.000Z',
    completedAt: '2026-10-26T09:45:00.000Z',
  },
  {
    tripId: 'trip_002',
    driverId: 'driver_mock_001',
    passengerId: 'passenger_002',
    vehicleId: 'vehicle_mock_001',
    origin: {
      lat: 6.2518,
      lng: -75.5636,
      address: 'Universidad de Antioquia',
    },
    destination: {
      lat: 6.2705,
      lng: -75.577,
      address: 'Aeropuerto Olaya Herrera',
    },
    distanceKm: 5.2,
    durationMin: 15,
    category: 'xl',
    ...fareB,
    tip: 2000,
    commissionRate: PRICING.commissionRate,
    paymentMethod: 'cash',
    paymentStatus: 'cash_received',
    paymentId: null,
    status: 'paid',
    rating: 4,
    routePolyline: 'mock_polyline_udea_olaya',
    createdAt: '2026-10-25T18:20:00.000Z',
    completedAt: '2026-10-25T18:40:00.000Z',
  },
  {
    tripId: 'trip_003',
    driverId: 'driver_mock_001',
    passengerId: 'passenger_003',
    vehicleId: 'vehicle_mock_001',
    origin: {
      lat: 6.2086,
      lng: -75.567,
      address: 'Laureles — Estadio',
    },
    destination: {
      lat: 6.1765,
      lng: -75.4287,
      address: 'Rionegro — terminal',
    },
    distanceKm: 12.0,
    durationMin: 35,
    category: 'premium',
    ...fareC,
    tip: 0,
    commissionRate: PRICING.commissionRate,
    paymentMethod: 'stripe',
    paymentStatus: 'approved',
    paymentId: 'pi_mock_003',
    status: 'paid',
    rating: 5,
    routePolyline: 'mock_polyline_laureles_rio',
    createdAt: '2026-10-20T14:00:00.000Z',
    completedAt: '2026-10-20T14:50:00.000Z',
  },
  {
    tripId: 'trip_004',
    driverId: 'driver_mock_001',
    passengerId: 'passenger_004',
    vehicleId: 'vehicle_mock_001',
    origin: {
      lat: 6.2442,
      lng: -75.5812,
      address: 'Centro — Parque Berrío',
    },
    destination: {
      lat: 6.2308,
      lng: -75.5906,
      address: 'Plaza Mayor',
    },
    distanceKm: 3.1,
    durationMin: 10,
    category: 'economy',
    ...fareD,
    tip: 1000,
    commissionRate: PRICING.commissionRate,
    paymentMethod: 'mercadopago',
    paymentStatus: 'approved',
    paymentId: 'mp_mock_004',
    status: 'paid',
    rating: 3,
    routePolyline: 'mock_polyline_berrio_plaza',
    createdAt: '2026-10-12T11:30:00.000Z',
    completedAt: '2026-10-12T11:45:00.000Z',
  },
];

export const MOCK_INCOMING_REQUEST = {
  tripId: 'trip_incoming_001',
  driverId: null,
  passengerId: 'passenger_incoming',
  vehicleId: null,
  origin: {
    lat: 6.2442,
    lng: -75.5812,
    address: 'Calle 50 #46-36, Medellín',
  },
  destination: {
    lat: 6.1987,
    lng: -75.575,
    address: 'El Tesoro, El Poblado',
  },
  distanceKm: 8.5,
  durationMin: 22,
  category: 'economy',
  ...fareA,
  tip: 0,
  commissionRate: PRICING.commissionRate,
  paymentMethod: 'mercadopago',
  paymentStatus: 'pending',
  paymentId: null,
  status: 'requested',
  rating: null,
  routePolyline: null,
  createdAt: new Date().toISOString(),
  completedAt: null,
  passengerName: 'María Gómez',
};
