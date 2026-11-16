import test from "node:test";
import assert from "node:assert/strict";
import { sendAppointmentReminder } from "./appointment_sms.ts";

test("an opted-out patient is suppressed before a send", async () => {
  const result = await sendAppointmentReminder({
    appointmentId: "apt-1042",
    patientPhone: "+14155550142",
    patientOptedOut: true,
    startsAt: "2026-11-04T15:30:00.000Z",
  });
  assert.deepEqual(result, { status: "suppressed", appointmentId: "apt-1042" });
});
