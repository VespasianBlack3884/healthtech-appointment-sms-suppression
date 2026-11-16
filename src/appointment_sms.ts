import { z } from "zod";
import { infrai } from "./infrai.ts";

export const appointmentRequest = z.object({
  appointmentId: z.string().min(1),
  patientPhone: z.string().regex(/^\+[1-9]\d{7,14}$/),
  patientOptedOut: z.boolean(),
  startsAt: z.string().datetime(),
});

export type AppointmentRequest = z.infer<typeof appointmentRequest>;
export type SendDecision = { status: "sent" | "suppressed"; appointmentId: string; messageId?: string };

export async function sendAppointmentReminder(input: unknown): Promise<SendDecision> {
  const appointment = appointmentRequest.parse(input);
  if (appointment.patientOptedOut) {
    return { status: "suppressed", appointmentId: appointment.appointmentId };
  }

  const result = await infrai.sms.batch.send({
    messages: [{
      to: appointment.patientPhone,
      body: `Appointment reminder for ${appointment.startsAt}`,
    }],
  });
  return { status: "sent", appointmentId: appointment.appointmentId, messageId: result.message_id };
}
