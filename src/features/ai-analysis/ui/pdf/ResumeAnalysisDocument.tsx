import { Document, Page, Text, View, StyleSheet, Font, Svg, Path } from '@react-pdf/renderer'
import { colors, spacing } from './pdf-styles'
import type { AnalysisData } from '../../types'

// Register Fonts (Roboto from Google Fonts CDN for Cyrillic support)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    padding: spacing.pagePadding,
    backgroundColor: colors.background,
    color: colors.foreground,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18, // Reduced from 24
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 10,
    color: colors.mutedForeground,
  },
  // Card styles removed to allow page breaking
  candidateContainer: {
    marginBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // Changed to center
    marginBottom: 20,
    backgroundColor: colors.cardBackground,
    borderRadius: spacing.borderRadius,
    padding: 12, // Reduced padding
    borderWidth: 1,
    borderColor: colors.border,
  },
  candidateInfo: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    alignItems: 'center',
  },
  candidateAvatar: {
    width: 48, // Reduced from 64
    height: 48, // Reduced from 64
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateNameBlock: {
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 4,
  },
  candidateName: {
    fontSize: 14, // Reduced from 18
    fontWeight: 700,
    color: colors.foreground,
  },
  scoreBlock: {
    flexDirection: 'row', // Back to row for compactness
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  scoreText: {
    alignItems: 'flex-end',
    flexDirection: 'column',
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 18, // Reduced from 24
    fontWeight: 700,
    color: colors.primary,
  },
  scoreCircle: {
    width: 40, // Reduced from 60
    height: 40, // Reduced from 60
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    backgroundColor: colors.muted,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20, // Reduced slightly
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.foreground,
    textTransform: 'uppercase',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 4,
    alignSelf: 'flex-start', // Prevent full width border
  },
  matchesGrid: {
    marginBottom: 24,
    flexDirection: 'column',
    gap: 12,
  },
  matchItem: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchTitle: {
    fontSize: 11,
    fontWeight: 600,
    flex: 1,
  },
  matchScore: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.primary,
    marginLeft: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%', // Explicit width
  },
  progressBarFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  matchReason: {
    fontSize: 10,
    color: colors.mutedForeground,
    lineHeight: 1.4,
  },
  skillsGrid: {
    flexDirection: 'column', // Changed to column to avoid overlap
    gap: 20,
    marginBottom: 24,
  },
  skillsColumn: {
    width: '100%', // Full width
    flexDirection: 'column',
    gap: 16,
  },
  skillSection: {
    marginBottom: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  skillList: {
    gap: 6, // Reduced gap
    flexDirection: 'column',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    minHeight: 12, // Ensure minimum height
  },
  skillDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4, // Align with text
  },
  skillText: {
    fontSize: 9, // Reduced font size
    flex: 1,
    lineHeight: 1.4,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6, // Increased gap for wrapping
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 4, // Explicit bottom margin for wrapped lines
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 500,
  },
  redFlagsBox: {
    backgroundColor: colors.destructiveLight,
    borderWidth: 1,
    borderColor: colors.destructive + '40', // 25% opacity
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  footerGrid: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  footerBox: {
    width: '48%', // Explicit width to prevent overflow
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  footerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 10,
    lineHeight: 1.4,
  }
})

// --- Components ---

const PdfScoreCircle = ({ percentage }: { percentage: number }) => {
  return (
    <View style={styles.scoreCircle}>
      <Text style={{ fontSize: 10, fontWeight: 700, color: colors.primary }}>
        {percentage}%
      </Text>
    </View>
  )
}

// Simplified Icons (Paths)
const Icons = {
  User: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  CheckCircle2: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M9 12l2 2 4-4",
  XCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6",
  AlertTriangle: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
  Brain: "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z",
  Heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  MessageCircle: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  ThumbsUp: "M7 10v12 M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z",
  ThumbsDown: "M17 14V2 M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z",
  MinusCircle: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M8 12h8"
}

// Ensure fill="none" is explicitly set to prevent black filling issues
const PdfIcon = ({ path, size = 16, color = 'currentColor', fill = 'none' }: { path: string, size?: number, color?: string, fill?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={path} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill={fill} />
  </Svg>
)

const PdfVerdictBadge = ({ verdict, label }: { verdict: string, label: string }) => {
  let bgColor = colors.muted
  let textColor = colors.mutedForeground
  let borderColor = colors.border
  let icon = null

  if (verdict === 'recommended') {
    bgColor = colors.successLight
    textColor = colors.success
    borderColor = colors.success + '40'
    icon = Icons.ThumbsUp
  } else if (verdict === 'maybe') {
    bgColor = colors.warningLight
    textColor = colors.warning
    borderColor = colors.warning + '40'
    icon = Icons.MinusCircle
  } else if (verdict === 'rejected') {
    bgColor = colors.destructiveLight
    textColor = colors.destructive
    borderColor = colors.destructive + '40'
    icon = Icons.ThumbsDown
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      gap: 4
    }}>
      {icon && <PdfIcon path={icon} size={10} color={textColor} />}
      <Text style={{ color: textColor, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  )
}

// --- Main Document ---

interface ResumeAnalysisDocumentProps {
  data: AnalysisData
  title: string
  translations: {
    matchScore: string
    matches: string
    hardSkills: string
    softSkills: string
    gaps: string
    redFlags: string
    culturalFit: string
    interviewQuestions: string
    verdicts: Record<string, string>
  }
}

export const ResumeAnalysisDocument = ({ data, title, translations }: ResumeAnalysisDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString()}</Text>
      </View>

      {data.candidates?.map((candidate, index) => (
        <View key={index} style={styles.candidateContainer}>
          {/* 1. Card Header (Keep together) */}
          <View style={styles.cardHeader} wrap={false}>
            <View style={styles.candidateInfo}>
              <View style={styles.candidateAvatar}>
                <PdfIcon path={Icons.User} size={24} color={colors.primary} />
              </View>
              <View style={styles.candidateNameBlock}>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <PdfVerdictBadge
                  verdict={candidate.verdict}
                  label={translations.verdicts[candidate.verdict]}
                />
              </View>
            </View>
            
            <View style={styles.scoreBlock}>
              <PdfScoreCircle percentage={candidate.match_score} />
              <Text style={styles.scoreLabel}>{translations.matchScore}</Text>
            </View>
          </View>

          {/* 2. Summary (Can break if needed, but prefer not to) */}
          <View style={styles.summary} wrap={false}>
            <Text style={styles.summaryText}>{candidate.summary}</Text>
          </View>

          {/* 3. Matches (List can break) */}
          <View style={styles.matchesGrid}>
            <Text style={styles.sectionTitle}>{translations.matches}</Text>
            {candidate.vacancy_matches?.map((match, i) => (
              <View key={i} style={styles.matchItem} wrap={false}>
                <View style={styles.matchHeader}>
                  <Text style={styles.matchTitle}>{match.vacancy_title}</Text>
                  <Text style={styles.matchScore}>{match.score}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${match.score}%` }]} />
                </View>
                <Text style={styles.matchReason}>{match.reason}</Text>
              </View>
            ))}
          </View>

          {/* 4. Skills Grid - Changed to vertical layout to prevent overlap */}
          <View style={styles.skillsGrid}>
            
            {/* Hard Skills */}
            <View style={styles.skillSection}>
              <View style={styles.skillHeader} wrap={false}>
                <PdfIcon path={Icons.CheckCircle2} size={10} color={colors.success} />
                <Text style={{ color: colors.success }}>{translations.hardSkills}</Text>
              </View>
              <View style={styles.skillList}>
                {[...(candidate.pros || []), ...(candidate.skills?.hard_skills_match || [])].map((item, i) => (
                  <View key={i} style={styles.skillItem} wrap={false}>
                    <View style={[styles.skillDot, { backgroundColor: colors.success + '80' }]} />
                    <Text style={styles.skillText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Missing Skills */}
            <View style={styles.skillSection}>
              <View style={styles.skillHeader} wrap={false}>
                <PdfIcon path={Icons.XCircle} size={10} color={colors.destructive} />
                <Text style={{ color: colors.destructive }}>{translations.gaps}</Text>
              </View>
              <View style={styles.skillList}>
                {[...(candidate.cons || []), ...(candidate.skills?.missing_skills || [])].map((item, i) => (
                  <View key={i} style={styles.skillItem} wrap={false}>
                    <View style={[styles.skillDot, { backgroundColor: colors.destructive + '80' }]} />
                    <Text style={styles.skillText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Soft Skills (Badges) */}
            {candidate.skills?.soft_skills && candidate.skills.soft_skills.length > 0 && (
              <View style={styles.skillSection}>
                <View style={styles.skillHeader} wrap={false}>
                  <PdfIcon path={Icons.Brain} size={10} color="#A855F7" />
                  <Text style={{ color: "#A855F7" }}>{translations.softSkills}</Text>
                </View>
                <View style={styles.badgeContainer}>
                  {candidate.skills.soft_skills.map((skill, i) => (
                    <View key={i} style={[styles.badge, { borderColor: '#E9D5FF', backgroundColor: '#FAF5FF' }]} wrap={false}>
                      <Text style={[styles.badgeText, { color: '#7E22CE' }]}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Red Flags */}
            {candidate.red_flags && candidate.red_flags.length > 0 && (
              <View style={styles.redFlagsBox}>
                <View style={styles.skillHeader} wrap={false}>
                  <PdfIcon path={Icons.AlertTriangle} size={10} color={colors.destructive} />
                  <Text style={{ color: colors.destructive }}>{translations.redFlags}</Text>
                </View>
                <View style={styles.skillList}>
                  {candidate.red_flags.map((flag, i) => (
                    <View key={i} style={styles.skillItem} wrap={false}>
                      <View style={[styles.skillDot, { backgroundColor: colors.destructive }]} />
                      <Text style={[styles.skillText, { color: colors.destructive }]}>{flag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* 5. Footer Grid */}
          {(candidate.cultural_fit || (candidate.interview_questions && candidate.interview_questions.length > 0)) && (
            <View style={styles.footerGrid}>
              {candidate.cultural_fit && (
                <View style={[styles.footerBox, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
                  <View style={styles.footerTitle} wrap={false}>
                    <PdfIcon path={Icons.Heart} size={10} color="#1D4ED8" />
                    <Text style={{ color: '#1D4ED8' }}>{translations.culturalFit}</Text>
                  </View>
                  <Text style={[styles.footerText, { color: '#1E3A8A' }]}>{candidate.cultural_fit}</Text>
                </View>
              )}
              
              {candidate.interview_questions && candidate.interview_questions.length > 0 && (
                <View style={[styles.footerBox, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
                  <View style={styles.footerTitle} wrap={false}>
                    <PdfIcon path={Icons.MessageCircle} size={10} color="#B45309" />
                    <Text style={{ color: '#B45309' }}>{translations.interviewQuestions}</Text>
                  </View>
                  <View style={styles.skillList}>
                    {candidate.interview_questions.map((q, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 4 }} wrap={false}>
                        <Text style={[styles.footerText, { fontWeight: 700, color: '#D97706' }]}>{i + 1}.</Text>
                        <Text style={[styles.footerText, { color: '#78350F' }]}>{q}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
)
