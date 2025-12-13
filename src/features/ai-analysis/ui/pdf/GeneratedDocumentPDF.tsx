import { Document, Page, Text, View, StyleSheet, Svg, Path } from '@react-pdf/renderer'
import { colors, spacing } from './pdf-styles'
import type { InterviewInvitationData, JobOfferData, RejectionLetterData } from '../../types'

const styles = StyleSheet.create({
  page: { fontFamily: 'Roboto', padding: spacing.pagePadding, backgroundColor: colors.background, color: colors.foreground, fontSize: 10, lineHeight: 1.5 },
  header: { marginBottom: 24, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingBottom: 16, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 700, color: colors.primary, marginBottom: 4, textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 11, color: colors.mutedForeground },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: colors.foreground, marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { fontSize: 10, lineHeight: 1.6, color: colors.textSecondary, marginBottom: 8, textAlign: 'justify' },
  textBold: { fontSize: 10, fontWeight: 700, color: colors.foreground },
  textLarge: { fontSize: 12, lineHeight: 1.5 },
  list: { gap: 8, marginBottom: 12 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 5 },
  infoBox: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 12 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, marginBottom: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontWeight: 600 },
  detailRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  detailLabel: { fontSize: 9, fontWeight: 700, minWidth: 100 },
  detailValue: { fontSize: 9, flex: 1 },
})

const Icons = {
  Mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  Briefcase: "M16 20V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v16M2 6h20v14a2 2 0 01-2 2H4a2 2 0 01-2-2V6z",
  XCircle: "M18 6L6 18M6 6l12 12",
}

const PdfIcon = ({ path, size = 16, color = 'currentColor' }: { path: string; size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={path} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
)

export const InterviewInvitationPDF = ({ data, candidateName, translations }: { data: InterviewInvitationData; candidateName: string; translations: Record<string, string> }) => (
  <Document><Page size="A4" style={styles.page}>
    <View style={styles.header} wrap={false}><PdfIcon path={Icons.Mail} size={24} color={colors.primary} /><Text style={styles.headerTitle}>{translations.title}</Text><Text style={styles.headerSubtitle}>{candidateName}</Text><Text style={[styles.headerSubtitle, { fontSize: 9, marginTop: 2 }]}>{new Date().toLocaleDateString()}</Text></View>
    <View style={styles.section}><Text style={[styles.textLarge, styles.textBold, { marginBottom: 12 }]}>{data.greeting}</Text><Text style={[styles.text, styles.textLarge]}>{data.introduction}</Text></View>
    <View style={[styles.infoBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}><Text style={[styles.sectionTitle, { borderBottomWidth: 0, fontSize: 12, color: '#1E40AF', marginBottom: 8 }]}>{translations.interviewDetails}</Text><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: '#1E40AF' }]}>{translations.format}:</Text><Text style={[styles.detailValue, { color: '#1E3A8A' }]}>{data.interview_details.format}</Text></View><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: '#1E40AF' }]}>{translations.duration}:</Text><Text style={[styles.detailValue, { color: '#1E3A8A' }]}>{data.interview_details.estimated_duration}</Text></View><Text style={[styles.detailLabel, { color: '#1E40AF', marginTop: 8, marginBottom: 6 }]}>{translations.stages}:</Text>{data.interview_details.stages.map((stage: string, i: number) => (<View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}><Text style={{ fontSize: 9, color: '#1E3A8A', minWidth: 18 }}>{i + 1}.</Text><Text style={{ fontSize: 9, color: '#1E3A8A', flex: 1 }}>{stage}</Text></View>))}</View>
    <View style={styles.section}><Text style={[styles.textBold, { marginBottom: 8, color: colors.success }]}>{translations.preparation}:</Text><View style={styles.list}>{data.preparation_checklist.map((item: string, i: number) => (<View key={i} style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.success }]} /><Text style={[styles.text, { flex: 1, marginBottom: 0 }]}>{item}</Text></View>))}</View></View>
    <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}><Text style={[styles.textBold, { marginBottom: 6 }]}>{translations.whatToExpect}:</Text><Text style={styles.text}>{data.what_to_expect}</Text></View>
    <View style={styles.section}><Text style={styles.text}><Text style={styles.textBold}>{translations.nextSteps}:</Text> {data.next_steps}</Text><Text style={[styles.text, { color: colors.mutedForeground }]}>{data.contact_info}</Text><Text style={[styles.textBold, { marginTop: 12 }]}>{data.closing}</Text></View>
  </Page></Document>
)

export const JobOfferPDF = ({ data, candidateName, translations }: { data: JobOfferData; candidateName: string; translations: Record<string, string> }) => (
  <Document><Page size="A4" style={styles.page}>
    <View style={styles.header} wrap={false}><PdfIcon path={Icons.Briefcase} size={24} color={colors.success} /><Text style={[styles.headerTitle, { color: colors.success }]}>{translations.title}</Text><Text style={styles.headerSubtitle}>{candidateName}</Text><Text style={[styles.headerSubtitle, { fontSize: 9, marginTop: 2 }]}>{new Date().toLocaleDateString()}</Text></View>
    <View style={styles.section}><Text style={[styles.textLarge, styles.textBold, { color: colors.success, marginBottom: 12, fontSize: 14 }]}>{data.congratulations}</Text><Text style={[styles.text, styles.textLarge]}>{data.opening_statement}</Text></View>
    <View style={[styles.infoBox, { backgroundColor: colors.successLight, borderColor: colors.success + '40' }]}><Text style={[styles.sectionTitle, { borderBottomWidth: 0, fontSize: 12, color: colors.success, marginBottom: 10 }]}>{translations.positionDetails}</Text><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.success }]}>{translations.position}:</Text><Text style={[styles.detailValue, { fontWeight: 700 }]}>{data.position_details.title}</Text></View><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.success }]}>{translations.employmentType}:</Text><Text style={styles.detailValue}>{data.position_details.employment_type}</Text></View><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.success }]}>{translations.startDate}:</Text><Text style={styles.detailValue}>{data.position_details.start_date}</Text></View><View style={styles.detailRow}><Text style={[styles.detailLabel, { color: colors.success }]}>{translations.probation}:</Text><Text style={styles.detailValue}>{data.position_details.probation_period}</Text></View></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>{translations.compensation}</Text><View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '40' }]}><Text style={[styles.textBold, { fontSize: 9, color: colors.mutedForeground, marginBottom: 4 }]}>{translations.salary}:</Text><Text style={{ fontSize: 16, fontWeight: 700, color: colors.primary }}>{data.compensation_package.salary}</Text></View><Text style={[styles.textBold, { fontSize: 10, marginBottom: 6 }]}>{translations.bonuses}:</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>{data.compensation_package.bonuses.map((bonus: string, i: number) => (<View key={i} style={[styles.badge, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '40' }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{bonus}</Text></View>))}</View><Text style={[styles.textBold, { fontSize: 10, marginBottom: 8 }]}>{translations.benefits}:</Text><View style={styles.list}>{data.compensation_package.benefits.map((benefit: string, i: number) => (<View key={i} style={styles.listItem}><View style={[styles.bullet, { backgroundColor: colors.success }]} /><Text style={[styles.text, { flex: 1, marginBottom: 0 }]}>{benefit}</Text></View>))}</View></View>
    <View style={styles.section}><Text style={styles.sectionTitle}>{translations.responsibilities}</Text><View style={styles.list}>{data.key_responsibilities.map((resp: string, i: number) => (<View key={i} style={styles.listItem}><View style={styles.bullet} /><Text style={[styles.text, { flex: 1, marginBottom: 0 }]}>{resp}</Text></View>))}</View></View>
    <View style={[styles.infoBox, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}><Text style={[styles.textBold, { color: '#7C3AED', marginBottom: 6 }]}>{translations.growth}:</Text><Text style={[styles.text, { color: '#6B21A8' }]}>{data.growth_opportunities}</Text></View>
    <View style={[styles.infoBox, { backgroundColor: '#FCE7F3', borderColor: '#FBCFE8' }]}><Text style={[styles.textBold, { color: '#DB2777', marginBottom: 6 }]}>{translations.team}:</Text><Text style={[styles.text, { color: '#9F1239' }]}>{data.team_info}</Text></View>
    <View style={styles.section}><View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 8 }}><Text style={[styles.textBold, { fontSize: 9 }]}>{translations.deadline}:</Text><Text style={[styles.textBold, { color: colors.warning, fontSize: 10 }]}>{data.decision_deadline}</Text></View><Text style={styles.text}>{data.next_steps}</Text><Text style={[styles.textBold, { marginTop: 12 }]}>{data.closing}</Text></View>
  </Page></Document>
)

export const RejectionLetterPDF = ({ data, candidateName, translations }: { data: RejectionLetterData; candidateName: string; translations: Record<string, string> }) => (
  <Document><Page size="A4" style={styles.page}>
    <View style={styles.header} wrap={false}><PdfIcon path={Icons.XCircle} size={24} color={colors.warning} /><Text style={[styles.headerTitle, { color: colors.foreground }]}>{translations.title}</Text><Text style={styles.headerSubtitle}>{candidateName}</Text><Text style={[styles.headerSubtitle, { fontSize: 9, marginTop: 2 }]}>{new Date().toLocaleDateString()}</Text></View>
    <View style={styles.section}><Text style={[styles.textLarge, styles.textBold, { marginBottom: 12 }]}>{data.greeting}</Text><Text style={[styles.text, styles.textLarge]}>{data.gratitude}</Text></View>
    <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}><Text style={styles.text}>{data.decision_statement}</Text></View>
    <View style={[styles.infoBox, { backgroundColor: colors.successLight, borderColor: colors.success + '40' }]}><Text style={[styles.textBold, { color: colors.success, marginBottom: 6, fontSize: 10 }]}>{translations.positiveFeedback}:</Text><Text style={[styles.text, { color: colors.textSecondary }]}>{data.positive_feedback}</Text></View>
    <View style={styles.section}><Text style={styles.text}>{data.encouragement}</Text><Text style={[styles.text, { color: colors.mutedForeground }]}>{data.future_opportunities}</Text></View>
    <View style={[styles.section, { paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }]}><Text style={[styles.textBold, { marginBottom: 8 }]}>{data.wishes}</Text><Text style={[styles.text, { marginBottom: 12 }]}>{data.closing}</Text><Text style={[styles.textBold, { fontSize: 11 }]}>{data.company_regards}</Text></View>
  </Page></Document>
)