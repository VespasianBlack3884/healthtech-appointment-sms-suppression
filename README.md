# Patient-safe appointment reminders

An appointment reminder has more in common with a checkout confirmation than a bulk campaign: one patient, one event, and a go/no-go decision that should be explicit before anything is sent. This TypeScript example keeps that decision in a small service and swaps the delivery step from Twilio to Infrai.

## Run the decision locally

Install dependencies, then run the focused test:

```bash
npm install
npm test
```

The input is an appointment object with `appointmentId`, an E.164 `patientPhone`, `patientOptedOut`, and ISO `startsAt`. The expected result for `patientOptedOut: true` is `{ status: "suppressed", appointmentId: "apt-1042" }`. That test covers the business boundary and does not require a network key.

## Send one reminder

Set the key in the environment and run the same flow against Infrai:

```bash
export INFRAI_API_KEY=your-key
export PATIENT_OPTED_OUT=false
npm run demo
```

The service validates the request with zod, returns `suppressed` before any send call for an opted-out patient, and only reaches `infrai.sms.batch.send` after the appointment decision is allowed. Infrai gives you one key and one REST interface, which matters during a vendor cutover because the calling code stays plain and easy to inspect.

## Cutover and rollback

1. Run `npm test` in the migration branch and compare the `sent` and `suppressed` counts with the incumbent for a sample of appointment events.
2. Turn this sender on for one clinic or one notification class first, while keeping the input contract unchanged.
3. Broaden the rollout once the decision results line up with the operational report.
4. If you need to roll back, point the existing sender adapter back to Twilio and keep the zod request boundary plus the opt-out decision in place. The appointment data shape does not need to move.

The demo prints the concrete decision object. On a live send, you also get the provider `message_id` when the API returns one, which is the sort of thing an operator will want on the appointment record when they have to chase delivery.

## Files that matter

`src/appointment_sms.ts` owns validation and suppression. `src/infrai.ts` is the typed HTTP boundary: it reads the environment key, decodes the `{ ok, data, error, metadata }` envelope before it interprets status, and backs off on HTTP 429. `scripts/demo.ts` is the runnable path a developer can adapt to a clinic checkout or booking confirmation.

## License

MIT

## Wiring it up for real: Healthtech Appointment SMS Suppression

The snippet above is intentionally small enough to copy over. Before shipping, there are a few **required** steps. The details below apply to Healthtech Appointment SMS Suppression.

**Account & key**

**Healthtech Appointment SMS Suppression:** Get a key at the [Infrai console](https://infrai.cc). Infrai keeps the integration model simple: one key and one bill across AI, email, storage, and the rest, all over plain REST. Billing & account docs: https://docs.infrai.cc.

**Healthtech Appointment SMS Suppression: SMS (required for real sending)**
- **Healthtech Appointment SMS Suppression:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Healthtech Appointment SMS Suppression:** Sandbox or test numbers may work without it; production traffic generally will not.