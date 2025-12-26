import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { AnalysisCandidate, AnalysisData } from '../../types'

// Регистрируем шрифты для поддержки кириллицы
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
  fontWeight: 300,
})

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
  fontWeight: 400,
})

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
  fontWeight: 500,
})

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
  fontWeight: 700,
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  candidateCard: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  candidateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
    marginBottom: 4,
  },
  verdictBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 700,
    color: '#7c3aed',
  },
  summary: {
    marginBottom: 16,
    lineHeight: 1.5,
    color: '#475569',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  matchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  matchItem: {
    width: '48%',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  matchTitle: {
    fontWeight: 700,
    fontSize: 9,
  },
  matchScore: {
    fontWeight: 700,
    color: '#7c3aed',
  },
  matchReason: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.3,
  },
  skillsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  skillsSection: {
    flex: 1,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  skillDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  skillText: {
    fontSize: 9,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    gap: 16,
  },
  footerSection: {
    flex: 1,
  },
  footerText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.4,
  },
  questionItem: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  questionNumber: {
    fontWeight: 700,
    color: '#f59e0b',
  },
})

interface Props {
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
    verdicts: {
      recommended: string
      maybe: string
      rejected: string
    }
  }
}

const PdfScoreCircle = ({ score }: { score: number }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreLabel}>Match Score</Text>
      <Text style={[styles.scoreValue, { color }]}>{score}%</Text>
    </View>
  )
}

export const ResumeAnalysisDocument = ({ data, title, translations }: Props) => {
  const getVerdictStyle = (verdict: AnalysisCandidate['verdict']) => {
    switch (verdict) {
      case 'recommended':
        return { backgroundColor: '#dcfce7', color: '#166534' }
      case 'maybe':
        return { backgroundColor: '#fef9c3', color: '#854d0e' }
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b' }
      default:
        return { backgroundColor: '#f1f5f9', color: '#475569' }
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString()} • {data.candidates.length} кандидатов
          </Text>
        </View>

        {data.candidates.map((candidate, index) => (
          <View key={index} style={styles.candidateCard} wrap={false}>
            <View style={styles.candidateHeader}>
              <View>
                <Text style={styles.candidateName}>{candidate.name}</Text>
                <View style={[styles.verdictBadge, getVerdictStyle(candidate.verdict)]}>
                  <Text>{translations.verdicts[candidate.verdict]}</Text>
                </View>
              </View>
              <PdfScoreCircle score={candidate.match_score} />
            </View>

            <View style={styles.summary}>
              <Text>{candidate.summary}</Text>
            </View>

            <Text style={styles.sectionTitle}>{translations.matches}</Text>
            <View style={styles.matchesGrid}>
              {candidate.vacancy_matches?.map((match, i) => (
                <View key={i} style={styles.matchItem}>
                  <View style={styles.matchHeader}>
                    <Text style={styles.matchTitle}>{match.vacancy_title}</Text>
                    <Text style={styles.matchScore}>{match.score}%</Text>
                  </View>
                  <Text style={styles.matchReason}>{match.reason}</Text>
                </View>
              ))}
            </View>

            <View style={styles.skillsGrid}>
              <View style={styles.skillsSection}>
                <Text style={[styles.sectionTitle, { color: '#10b981' }]}>{translations.hardSkills}</Text>
                {[...(candidate.pros || []), ...(candidate.skills?.hard_skills_match || [])].map((skill, i) => (
                  <View key={i} style={styles.skillItem}>
                    <View style={[styles.skillDot, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.skillsSection}>
                <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>{translations.gaps}</Text>
                {[...(candidate.cons || []), ...(candidate.skills?.missing_skills || [])].map((skill, i) => (
                  <View key={i} style={styles.skillItem}>
                    <View style={[styles.skillDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>

              {candidate.skills?.soft_skills && candidate.skills.soft_skills.length > 0 && (
                <View style={styles.skillsSection}>
                  <Text style={[styles.sectionTitle, { color: '#8b5cf6' }]}>{translations.softSkills}</Text>
                  {candidate.skills.soft_skills.map((skill, i) => (
                    <View key={i} style={styles.skillItem}>
                      <View style={[styles.skillDot, { backgroundColor: '#8b5cf6' }]} />
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.footer}>
              {candidate.cultural_fit && (
                <View style={styles.footerSection}>
                  <Text style={[styles.sectionTitle, { color: '#3b82f6' }]}>{translations.culturalFit}</Text>
                  <Text style={styles.footerText}>{candidate.cultural_fit}</Text>
                </View>
              )}

              {candidate.interview_questions && candidate.interview_questions.length > 0 && (
                <View style={styles.footerSection}>
                  <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>{translations.interviewQuestions}</Text>
                  {candidate.interview_questions.map((q, i) => (
                    <View key={i} style={styles.questionItem}>
                      <Text style={styles.questionNumber}>{i + 1}.</Text>
                      <Text style={styles.footerText}>{q}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {candidate.red_flags && candidate.red_flags.length > 0 && (
              <View style={{ marginTop: 16, padding: 12, backgroundColor: '#fef2f2', borderRadius: 8, borderWidth: 1, borderColor: '#fee2e2' }}>
                <Text style={[styles.sectionTitle, { color: '#dc2626', marginBottom: 4 }]}>{translations.redFlags}</Text>
                {candidate.red_flags.map((flag, i) => (
                  <View key={i} style={styles.skillItem}>
                    <View style={[styles.skillDot, { backgroundColor: '#dc2626' }]} />
                    <Text style={[styles.footerText, { color: '#991b1b' }]}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </Page>
    </Document>
  )
}
