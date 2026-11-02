// AI-assisted: see docs/AI_LOG.md #34
import { createUserWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { uploadImage } from './cloudinary';
import {
  getTechnicalInspectionRequiredFrom,
  isTechnicalInspectionRequired,
} from '../validation/isTechnicalInspectionRequired';
import { PRICING } from '../config/pricing';

/**
 * Creates Auth user, uploads photos to Cloudinary and writes driver + vehicle docs.
 * @param {{ personal: object, vehicle: object, documents: object }} payload
 * @returns {Promise<{ uid: string, vehicleId: string, driver: object, vehicle: object }>}
 */
export async function registerDriver({ personal, vehicle, documents }) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    personal.email.trim(),
    personal.password
  );
  const uid = credential.user.uid;
  const vehicleRef = doc(collection(db, 'vehicles'));
  const vehicleId = vehicleRef.id;
  const now = serverTimestamp();
  const required = isTechnicalInspectionRequired(vehicle.registrationDate);
  const requiredFrom = getTechnicalInspectionRequiredFrom(vehicle.registrationDate);

  const folder = `uberclone/drivers/${uid}`;
  const [
    profilePhotoUrl,
    vehiclePhotoUrl,
    licensePhotoUrl,
    soatPhotoUrl,
    inspectionPhotoUrl,
  ] = await Promise.all([
    uploadImage(personal.profilePhotoUri, `${folder}/profile`),
    uploadImage(vehicle.vehiclePhotoUri, `${folder}/vehicle`),
    uploadImage(documents.licensePhotoUri, `${folder}/license`),
    uploadImage(documents.soatPhotoUri, `${folder}/soat`),
    required
      ? uploadImage(documents.inspectionPhotoUri, `${folder}/inspection`)
      : Promise.resolve(null),
  ]);

  const driverData = {
    fullName: personal.fullName.trim(),
    documentNumber: personal.documentNumber.trim(),
    phone: personal.phone.trim(),
    birthDate: new Date(personal.birthDate).toISOString(),
    gender: personal.gender.trim(),
    email: personal.email.trim(),
    profilePhotoUrl,
    vehicleId,
    accountStatus: 'pending',
    documents: {
      driverLicense: {
        number: documents.licenseNumber.trim(),
        photoUrl: licensePhotoUrl,
        expiresAt: new Date(documents.licenseExpiresAt).toISOString(),
      },
      soat: {
        photoUrl: soatPhotoUrl,
        expiresAt: new Date(documents.soatExpiresAt).toISOString(),
      },
      technicalInspection: {
        required,
        requiredFrom: requiredFrom.toISOString(),
        ...(required
          ? {
              photoUrl: inspectionPhotoUrl,
              expiresAt: new Date(documents.inspectionExpiresAt).toISOString(),
            }
          : {}),
      },
    },
    mercadoPagoEmail: documents.mercadoPagoEmail.trim(),
    termsAcceptedAt: new Date().toISOString(),
    termsCommissionRate: PRICING.commissionRate,
    fcmToken: '',
    createdAt: now,
    updatedAt: now,
  };

  const vehicleData = {
    driverId: uid,
    category: vehicle.category.trim(),
    plate: vehicle.plate.trim().toUpperCase(),
    brand: vehicle.brand.trim(),
    model: vehicle.model.trim(),
    year: Number(vehicle.year),
    registrationDate: new Date(vehicle.registrationDate).toISOString(),
    color: vehicle.color.trim(),
    passengerCapacity: Number(vehicle.passengerCapacity),
    photoUrl: vehiclePhotoUrl,
    createdAt: now,
    updatedAt: now,
  };

  const batch = writeBatch(db);
  batch.set(doc(db, 'drivers', uid), driverData);
  batch.set(vehicleRef, vehicleData);
  await batch.commit();

  return {
    uid,
    vehicleId,
    driver: {
      uid,
      ...driverData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    vehicle: {
      vehicleId,
      ...vehicleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
