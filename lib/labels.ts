import type {
  ClientType, ClientStatus, CaseType, CaseStatus, CasePriority,
  PaymentMethod, PaymentStatus, AppointmentType, AppointmentStatus,
  AppointmentLocation, ReportType, ReportStatus, ReportVisibility
} from '@/types/database'

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  particulier: 'Particulier',
  entreprise: 'Entreprise',
  association: 'Association',
  autre: 'Autre',
}

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  'archivé': 'Archivé',
}

export const CASE_TYPE_LABELS: Record<CaseType, string> = {
  litige: 'Litige',
  contrat: 'Contrat',
  recouvrement: 'Recouvrement',
  conseil_juridique: 'Conseil juridique',
  titre_sejour: 'Titre de séjour',
  accompagnement_admin: 'Accompagnement administratif',
  rdv_avocat: 'Rendez-vous avocat',
  autre: 'Autre',
}

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  ouvert: 'Ouvert',
  en_cours: 'En cours',
  en_attente: 'En attente',
  a_completer: 'À compléter',
  rdv_prevu: 'RDV prévu',
  attente_reglement: 'Attente règlement',
  cloture: 'Clôturé',
  archive: 'Archivé',
}

export const CASE_PRIORITY_LABELS: Record<CasePriority, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  urgente: 'Urgente',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  carte: 'Carte bancaire',
  virement: 'Virement',
  cheque: 'Chèque',
  especes: 'Espèces',
  autre: 'Autre',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paye: 'Payé',
  en_attente: 'En attente',
  partiel: 'Partiel',
  annule: 'Annulé',
  en_retard: 'En retard',
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  rdv_avocat: 'Rendez-vous avocat',
  closing: 'Closing / Signature',
  telephonique: 'Téléphonique',
  administratif: 'Administratif',
  audience: 'Audience',
  autre: 'Autre',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  prevu: 'Prévu',
  realise: 'Réalisé',
  annule: 'Annulé',
  reporte: 'Reporté',
  absent: 'Absent',
  a_confirmer: 'À confirmer',
}

export const APPOINTMENT_LOCATION_LABELS: Record<AppointmentLocation, string> = {
  cabinet: 'Cabinet',
  visio: 'Visioconférence',
  telephone: 'Téléphone',
  tribunal: 'Tribunal',
  exterieur: 'Extérieur',
  autre: 'Autre',
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  closing: 'Closing',
  rdv_avocat: 'Rendez-vous avocat',
  appel: 'Appel téléphonique',
  audience: 'Audience',
  administratif: 'Administratif',
  interne: 'Note interne',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  brouillon: 'Brouillon',
  a_relire: 'À relire',
  finalise: 'Finalisé',
  valide: 'Validé',
  archive: 'Archivé',
}

export const REPORT_VISIBILITY_LABELS: Record<ReportVisibility, string> = {
  interne: 'Interne',
  avocat: 'Avocat',
  tous: 'Tous',
}
