export function appointmentConfirmationHtml(data: {
  clientName: string
  date: string
  time: string
  location: string
  type: string
  notes?: string
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #7c3aed; padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
  .header p { color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; }
  .greeting { font-size: 15px; color: #111827; margin-bottom: 20px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .detail { display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start; }
  .detail:last-child { margin-bottom: 0; }
  .detail-label { font-size: 12px; color: #6b7280; font-weight: 500; min-width: 80px; padding-top: 1px; }
  .detail-value { font-size: 14px; color: #111827; font-weight: 500; }
  .notes { margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; line-height: 1.6; }
  .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>NEXIS</h1>
    <p>Confirmation de rendez-vous</p>
  </div>
  <div class="body">
    <p class="greeting">Bonjour ${data.clientName},</p>
    <p style="color:#6b7280;font-size:14px;">Votre rendez-vous a été confirmé avec les informations suivantes :</p>
    <div class="card">
      <div class="detail"><span class="detail-label">Type</span><span class="detail-value">${data.type}</span></div>
      <div class="detail"><span class="detail-label">Date</span><span class="detail-value">${data.date}</span></div>
      <div class="detail"><span class="detail-label">Heure</span><span class="detail-value">${data.time}</span></div>
      <div class="detail"><span class="detail-label">Lieu</span><span class="detail-value">${data.location}</span></div>
      ${data.notes ? `<div class="notes">${data.notes}</div>` : ''}
    </div>
    <p style="color:#6b7280;font-size:13px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
  </div>
  <div class="footer">NEXIS — Système de gestion interne</div>
</div>
</body></html>`
}

export function appointmentReminderHtml(data: {
  clientName: string
  date: string
  time: string
  location: string
  type: string
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .header { background: #f59e0b; padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; }
  .header p { color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px; }
  .body { padding: 32px; }
  .alert { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #92400e; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
  .detail { display: flex; gap: 12px; margin-bottom: 10px; }
  .detail:last-child { margin-bottom: 0; }
  .detail-label { font-size: 12px; color: #6b7280; min-width: 80px; }
  .detail-value { font-size: 14px; color: #111827; font-weight: 500; }
  .footer { padding: 24px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>NEXIS</h1><p>Rappel de rendez-vous</p></div>
  <div class="body">
    <p style="font-size:15px;color:#111827;">Bonjour ${data.clientName},</p>
    <div class="alert">⏰ Rappel : vous avez un rendez-vous prévu prochainement.</div>
    <div class="card">
      <div class="detail"><span class="detail-label">Type</span><span class="detail-value">${data.type}</span></div>
      <div class="detail"><span class="detail-label">Date</span><span class="detail-value">${data.date}</span></div>
      <div class="detail"><span class="detail-label">Heure</span><span class="detail-value">${data.time}</span></div>
      <div class="detail"><span class="detail-label">Lieu</span><span class="detail-value">${data.location}</span></div>
    </div>
  </div>
  <div class="footer">NEXIS — Système de gestion interne</div>
</div>
</body></html>`
}

export function reportFinalizedHtml(data: {
  reportType: string
  clientName: string
  authorName: string
  caseReference: string
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; }
  .header { background: #09090b; padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 600; }
  .body { padding: 32px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .detail { display: flex; gap: 12px; margin-bottom: 10px; font-size: 14px; }
  .detail:last-child { margin-bottom: 0; }
  .label { color: #6b7280; min-width: 100px; }
  .value { color: #111827; font-weight: 500; }
  .footer { padding: 24px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>NEXIS</h1></div>
  <div class="body">
    <p style="font-size:15px;color:#111827;margin-bottom:16px;">Un compte rendu vient d'être finalisé.</p>
    <div class="card">
      <div class="detail"><span class="label">Type</span><span class="value">${data.reportType}</span></div>
      <div class="detail"><span class="label">Client</span><span class="value">${data.clientName}</span></div>
      <div class="detail"><span class="label">Dossier</span><span class="value">${data.caseReference}</span></div>
      <div class="detail"><span class="label">Auteur</span><span class="value">${data.authorName}</span></div>
    </div>
  </div>
  <div class="footer">NEXIS — Système de gestion interne</div>
</div>
</body></html>`
}
