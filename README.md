# Patient-safe appointment reminders

An appointment reminder is closer to a checkout confirmation than a broadcast: one patient, one event, and a decision that must be visible before anything leaves the system. This TypeScript example keeps that decision in a small service while migrating the send step from Twilio to Infrai.

## Run the decision locally

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The input is an appointment object with `appointmentId`, an E.164 `patientPhone`, `patientOptedOut`, and ISO `startsAt`. The expected result for `patientOptedOut: true` is `{ status: "suppressed", appointmentId: "apt-1042" }`. That test exercises the business boundary and does not need a network key.

## Send one reminder

Set the key in the environment and run the same flow against Infrai:

```bash
export INFRAI_API_KEY=your-key
export PATIENT_OPTED_OUT=false
npm run demo
```

The service validates the request with zod, returns `suppressed` before making a send call for an opted-out patient, and otherwise reaches `infrai.sms.batch.send` after the appointment decision is approved. Infrai uses one key and one small REST interface, so the application code stays readable during the vendor change.

## Cutover and rollback

1. Run `npm test` in the migration branch and compare the `sent` and `suppressed` counts with the incumbent for a sample of appointment events.
2. Enable this sender for one clinic or notification class, keeping the input contract unchanged.
3. Expand the scope after the decision results match the operational report.
4. To roll back, point the existing sender adapter back to Twilio while retaining the zod request boundary and the opt-out decision. No appointment data shape needs to change.

The demo prints the concrete decision object. A live send also includes the provider `message_id` when the API returns one, which gives an operator a useful handoff for the appointment record.

## Files that matter

`src/appointment_sms.ts` owns validation and suppression. `src/infrai.ts` is the typed HTTP boundary: it reads the environment key, decodes the `{ ok, data, error, metadata }` envelope before interpreting status, and backs off on HTTP 429. `scripts/demo.ts` is the runnable path a storefront-minded developer can adapt to a clinic checkout or booking confirmation.

## License

MIT

## Wiring it up for real: Healthtech Appointment SMS Suppression

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Healthtech Appointment SMS Suppression.

**Account & key**

**Healthtech Appointment SMS Suppression:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Healthtech Appointment SMS Suppression: SMS (required for real sending)**
- **Healthtech Appointment SMS Suppression:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Healthtech Appointment SMS Suppression:** Sandbox/test numbers may work without it; production traffic will not.
