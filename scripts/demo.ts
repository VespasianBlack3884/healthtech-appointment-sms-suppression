import { sendAppointmentReminder } from "../src/appointment_sms.ts";

const input = {
  appointmentId: process.env.APPOINTMENT_ID ?? "apt-1042",
  patientPhone: process.env.PATIENT_PHONE ?? "+14155550142",
  patientOptedOut: process.env.PATIENT_OPTED_OUT === "true",
  startsAt: process.env.APPOINTMENT_START ?? "2026-11-04T15:30:00.000Z",
};

console.log(await sendAppointmentReminder(input));
