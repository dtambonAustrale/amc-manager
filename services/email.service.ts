import { resend, FROM_EMAIL } from '@/lib/resend/client'
import {
  appointmentConfirmationHtml,
  appointmentReminderHtml,
  reportFinalizedHtml
} from '@/lib/resend/templates'
import { createClient } from '@/lib/supabase/server'

type EmailResult = { success: true; id: string } | { success: false; error: string }

async function logEmail(data: {
  recipient: string
  subject: string
  type: string
  status: string
  error?: string
  triggeredBy?: string
}) {
  try {
    const supabase = await createClient()
    await supabase.from('email_logs').insert({
      recipient: data.recipient,
      subject: data.subject,
      type: data.type,
      status: data.status,
      error: data.error ?? null,
      triggered_by: data.triggeredBy ?? null,
    })
  } catch {
    // Log failure is non-critical
  }
}

export async function sendAppointmentConfirmation(params: {
  to: string
  clientName: string
  date: string
  time: string
  location: string
  type: string
  notes?: string
  triggeredBy?: string
}): Promise<EmailResult> {
  const subject = `Confirmation de rendez-vous — ${params.date}`
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject,
      html: appointmentConfirmationHtml(params),
    })
    if (error) throw new Error(error.message)
    await logEmail({ recipient: params.to, subject, type: 'appointment_confirmation', status: 'sent', triggeredBy: params.triggeredBy })
    return { success: true, id: data?.id ?? '' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logEmail({ recipient: params.to, subject, type: 'appointment_confirmation', status: 'failed', error: message, triggeredBy: params.triggeredBy })
    return { success: false, error: message }
  }
}

export async function sendAppointmentReminder(params: {
  to: string
  clientName: string
  date: string
  time: string
  location: string
  type: string
  triggeredBy?: string
}): Promise<EmailResult> {
  const subject = `Rappel de rendez-vous — ${params.date}`
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [params.to],
      subject,
      html: appointmentReminderHtml(params),
    })
    if (error) throw new Error(error.message)
    await logEmail({ recipient: params.to, subject, type: 'appointment_reminder', status: 'sent', triggeredBy: params.triggeredBy })
    return { success: true, id: data?.id ?? '' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logEmail({ recipient: params.to, subject, type: 'appointment_reminder', status: 'failed', error: message, triggeredBy: params.triggeredBy })
    return { success: false, error: message }
  }
}

export async function sendReportFinalized(params: {
  to: string[]
  reportType: string
  clientName: string
  authorName: string
  caseReference: string
  triggeredBy?: string
}): Promise<EmailResult> {
  const subject = `Compte rendu finalisé — ${params.caseReference}`
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject,
      html: reportFinalizedHtml(params),
    })
    if (error) throw new Error(error.message)
    for (const recipient of params.to) {
      await logEmail({ recipient, subject, type: 'report_finalized', status: 'sent', triggeredBy: params.triggeredBy })
    }
    return { success: true, id: data?.id ?? '' }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await logEmail({ recipient: params.to.join(', '), subject, type: 'report_finalized', status: 'failed', error: message, triggeredBy: params.triggeredBy })
    return { success: false, error: message }
  }
}
