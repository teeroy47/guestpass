import { randomUUID } from "crypto";

import { auth as authV1 } from "firebase-functions/v1";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

type CreateInviteRequest = {
  guest: {
    name: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  event?: {
    id?: string;
    name?: string;
    date?: string;
    location?: string;
  };
  plusOnes?: number;
};

type CreateInviteResponse = {
  guestId: string;
  inviteCode: string;
  accessCode: string;
  qrUrl: string;
  pdfUrl: string;
  guest: {
    name: string;
    email: string;
  };
  event: {
    id: string;
    name: string;
    date: string | null;
    location: string | null;
  };
};

const ADMIN_EMAILS = new Set(["chiunye16@gmail.com"]);
const INVITE_STORAGE_FOLDER = "invites";
const SIGNED_URL_EXPIRY_DAYS = 7;

admin.initializeApp();



function assertAdminEmail(email: string | undefined): asserts email is string {
  if (!email || !ADMIN_EMAILS.has(email)) {
    throw new HttpsError("permission-denied", "Admin privileges required to create invites.");
  }
}

function sanitizeString(input: unknown): string {
  return typeof input === "string" ? input.trim() : "";
}

function coercePositiveInteger(value: unknown, defaultValue = 0): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return defaultValue;
  }
  return Math.floor(numeric);
}

function buildSignedUrlExpiry(days: number): string {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return expires.toISOString();
}

async function generateQrBuffer(payload: Record<string, unknown>): Promise<Buffer> {
  return QRCode.toBuffer(JSON.stringify(payload), {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
  });
}

async function generateInvitePdf(options: {
  guestName: string;
  eventName: string;
  eventDate: string | null;
  eventLocation: string | null;
  inviteCode: string;
  accessCode: string;
  qrBuffer: Buffer;
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 595]);
  const { width, height } = page.getSize();

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const qrImage = await pdfDoc.embedPng(options.qrBuffer);

  const headingSize = 22;
  const bodySize = 12;
  const spacing = 24;
  let cursorY = height - 60;

  page.drawText("GuestPass Invitation", {
    x: 40,
    y: cursorY,
    size: headingSize,
    font: boldFont,
    color: rgb(0.11, 0.14, 0.31),
  });

  cursorY -= spacing * 1.7;

  page.drawText(`Guest: ${options.guestName}`, {
    x: 40,
    y: cursorY,
    size: bodySize,
    font: regularFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  cursorY -= spacing;

  page.drawText(`Event: ${options.eventName}`, {
    x: 40,
    y: cursorY,
    size: bodySize,
    font: regularFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  if (options.eventDate) {
    cursorY -= spacing;
    page.drawText(`Date: ${options.eventDate}`, {
      x: 40,
      y: cursorY,
      size: bodySize,
      font: regularFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  if (options.eventLocation) {
    cursorY -= spacing;
    page.drawText(`Location: ${options.eventLocation}`, {
      x: 40,
      y: cursorY,
      size: bodySize,
      font: regularFont,
      color: rgb(0.1, 0.1, 0.1),
    });
  }

  cursorY -= spacing;
  page.drawText(`Invite Code: ${options.inviteCode}`, {
    x: 40,
    y: cursorY,
    size: bodySize,
    font: regularFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  cursorY -= spacing;
  page.drawText(`Access Code: ${options.accessCode}`, {
    x: 40,
    y: cursorY,
    size: bodySize,
    font: regularFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const qrSize = 220;
  page.drawRectangle({
    x: (width - qrSize) / 2 - 12,
    y: 90 - 12,
    width: qrSize + 24,
    height: qrSize + 24,
    color: rgb(0.96, 0.97, 1),
  });
  page.drawImage(qrImage, {
    x: (width - qrSize) / 2,
    y: 90,
    width: qrSize,
    height: qrSize,
  });

  page.drawText("Please present this QR code at check-in.", {
    x: (width - 240) / 2,
    y: 60,
    size: 11,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  return pdfDoc.save();
}

function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Ensures a document exists for the authenticated user and captures metadata.
 */
export const ensureUserProfile = authV1.user().onCreate(async (user) => {
  const userDocRef = admin.firestore().collection("users").doc(user.uid);

  await userDocRef.set(
    {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: user.metadata?.creationTime
        ? admin.firestore.Timestamp.fromMillis(Date.parse(user.metadata.creationTime))
        : admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
});

/**
 * Callable function that can be used to retrieve a minimal profile snapshot.
 */
export const getProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const userDoc = await admin.firestore().collection("users").doc(request.auth.uid).get();

  if (!userDoc.exists) {
    throw new HttpsError("not-found", "Profile not found.");
  }

  return userDoc.data();
});

/**
 * Callable function that creates an invite, generates QR/PDF assets, and stores metadata.
 */
export const createInvite = onCall<CreateInviteRequest>({
  cors: true,
  enforceAppCheck: false,
}, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const callerEmail = request.auth.token?.email as string | undefined;
  assertAdminEmail(callerEmail);

  const rawGuest = request.data?.guest ?? {};
  const rawEvent = request.data?.event ?? {};

  const guestName = sanitizeString(rawGuest.name);
  const guestEmail = sanitizeString(rawGuest.email).toLowerCase();
  const guestPhone = sanitizeString(rawGuest.phone);
  const guestNotes = sanitizeString(rawGuest.notes);
  const eventId = sanitizeString(rawEvent.id) || "default";
  const eventName = sanitizeString(rawEvent.name) || "GuestPass Event";
  const eventDate = sanitizeString(rawEvent.date) || null;
  const eventLocation = sanitizeString(rawEvent.location) || null;
  const plusOnes = coercePositiveInteger(request.data?.plusOnes, 0);

  if (!guestName) {
    throw new HttpsError("invalid-argument", "Guest name is required.");
  }

  if (!guestEmail || !guestEmail.includes("@")) {
    throw new HttpsError("invalid-argument", "A valid guest email is required.");
  }

  const guestsCollection = admin.firestore().collection("guests");
  const guestDocRef = guestsCollection.doc();
  const guestId = guestDocRef.id;
  const inviteCode = randomUUID();
  const accessCode = generateAccessCode();

  const qrPayload = {
    guestId,
    inviteCode,
    accessCode,
    eventId,
  };

  const qrBuffer = await generateQrBuffer(qrPayload);
  const pdfBytes = await generateInvitePdf({
    guestName,
    eventName,
    eventDate,
    eventLocation,
    inviteCode,
    accessCode,
    qrBuffer,
  });

  const bucket = admin.storage().bucket();
  const qrPath = `${INVITE_STORAGE_FOLDER}/${guestId}/invite-qr.png`;
  const pdfPath = `${INVITE_STORAGE_FOLDER}/${guestId}/invite.pdf`;

  await bucket.file(qrPath).save(qrBuffer, {
    contentType: "image/png",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=300",
    },
  });

  await bucket.file(pdfPath).save(Buffer.from(pdfBytes), {
    contentType: "application/pdf",
    resumable: false,
    metadata: {
      cacheControl: "public, max-age=300",
    },
  });

  const [qrUrl] = await bucket.file(qrPath).getSignedUrl({
    action: "read",
    expires: buildSignedUrlExpiry(SIGNED_URL_EXPIRY_DAYS),
  });

  const [pdfUrl] = await bucket.file(pdfPath).getSignedUrl({
    action: "read",
    expires: buildSignedUrlExpiry(SIGNED_URL_EXPIRY_DAYS),
  });

  await guestDocRef.set({
    name: guestName,
    email: guestEmail,
    phone: guestPhone || null,
    notes: guestNotes || null,
    status: "pending",
    plusOnes,
    invitedBy: callerEmail,
    event: {
      id: eventId,
      name: eventName,
      date: eventDate,
      location: eventLocation,
    },
    invite: {
      code: inviteCode,
      accessCode,
      storagePaths: {
        qr: qrPath,
        pdf: pdfPath,
      },
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    guestId,
    inviteCode,
    accessCode,
    qrUrl,
    pdfUrl,
    guest: {
      name: guestName,
      email: guestEmail,
    },
    event: {
      id: eventId,
      name: eventName,
      date: eventDate,
      location: eventLocation,
    },
  } satisfies CreateInviteResponse;
});