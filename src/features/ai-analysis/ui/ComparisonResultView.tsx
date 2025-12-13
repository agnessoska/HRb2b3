import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ComparisonData } from '../types'
import { GlassCard } from '@/shared/ui/GlassCard'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Star,
  ArrowLeft
} from 'lucide-react'

interface ComparisonResultViewProps {
  data: ComparisonData
  candidateNames: Record<string, string>
  onBack?: () => void
}

export const ComparisonResultView = ({ 
  data, 
  candidateNames,
  onBack 
}: ComparisonResultViewProps) => {
  const { t } = useTranslation('ai-analysis')
  const [activeTab, setActiveTab] = useState<'ranking' | 'matrix' | 'recommendation'>('ranking')

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'hire_strongly':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'hire':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'consider':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'reject':
        return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
      default:
        return 'text-muted-foreground'
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-amber-500" />
      case 2:
        return <Medal className="h-6 w-6 text-slate-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 75) return 'text-blue-600 dark:text-blue-400'
    if (score >= 60) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('common:back')}
        </Button>
      )}

      <GlassCard className="p-3 md:p-6">
        <div className="flex items-start gap-2 md:gap-4">
          <div className="hidden sm:flex p-2 md:p-3 rounded-xl bg-primary/10">
            <Star className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-2xl font-bold mb-1 md:mb-2">Итоговое сравнение</h2>
            <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-1 md:gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'ranking'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Рейтинг кандидатов
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Сравнительная матрица
        </button>
        <button
          onClick={() => setActiveTab('recommendation')}
          className={`px-3 md:px-4 py-2 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'recommendation'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Итоговая рекомендация
        </button>
      </div>

      {activeTab === 'ranking' && (
        <div className="grid gap-3 md:gap-4">
          {data.ranked_candidates.map((candidate) => (
            <GlassCard key={candidate.candidate_id} className="p-3 md:p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-2 md:gap-4">
                <div className="flex-shrink-0 scale-75 md:scale-100">
                  {getRankIcon(candidate.rank)}
                </div>

                <div className="flex-1 min-w-0 space-y-2 md:space-y-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-1.5 md:gap-2">
                    <div className="min-w-0 w-full sm:w-auto">
                      <h3 className="text-sm md:text-xl font-bold mb-1 break-words">
                        {candidateNames[candidate.candidate_id] || 'Unknown'}
                      </h3>
                      <Badge className={getRecommendationColor(candidate.recommendation)}>
                        {candidate.recommendation.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className={`text-2xl md:text-3xl font-bold ${getScoreColor(candidate.overall_score)}`}>
                        {candidate.overall_score}
                      </div>
                      <div className="text-xs text-muted-foreground">Общий балл</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 md:hidden">
                    <Badge variant="secondary" className="text-[10px]">Проф: {candidate.scores.professional}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Личн: {candidate.scores.personality}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Культ: {candidate.scores.cultural_fit}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Мотив: {candidate.scores.motivation}</Badge>
                  </div>
                  
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Профессионал</span>
                        <span className="font-semibold">{candidate.scores.professional}</span>
                      </div>
                      <Progress value={candidate.scores.professional} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Личность</span>
                        <span className="font-semibold">{candidate.scores.personality}</span>
                      </div>
                      <Progress value={candidate.scores.personality} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Культура</span>
                        <span className="font-semibold">{candidate.scores.cultural_fit}</span>
                      </div>
                      <Progress value={candidate.scores.cultural_fit} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Мотивация</span>
                        <span className="font-semibold">{candidate.scores.motivation}</span>
                      </div>
                      <Progress value={candidate.scores.motivation} className="h-2" />
                    </div>
                  </div>

                  <div className="p-2 md:p-3 rounded-lg bg-muted/30">
                    <p className="text-xs md:text-sm italic leading-snug">{candidate.key_insights}</p>
                  </div>

                  <div className="space-y-2 md:hidden">
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 py-1 list-none">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        Сильные (+)
                      </summary>
                      <ul className="mt-1 space-y-0.5 pl-4">
                        {candidate.strengths.slice(0, 3).map((strength, idx) => (
                          <li key={idx} className="text-[10px] leading-tight">• {strength}</li>
                        ))}
                      </ul>
                    </details>
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 py-1 list-none">
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                        Слабые (-)
                      </summary>
                      <ul className="mt-1 space-y-0.5 pl-4">
                        {candidate.weaknesses.slice(0, 3).map((weakness, idx) => (
                          <li key={idx} className="text-[10px] leading-tight">• {weakness}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                  
                  <div className="hidden md:grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        Сильные стороны
                      </h4>
                      <ul className="space-y-1">
                        {candidate.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2 leading-tight">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-amber-500" />
                        Слабые стороны
                      </h4>
                      <ul className="space-y-1">
                        {candidate.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2 leading-tight">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span className="break-words">{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === 'matrix' && (
        <GlassCard className="p-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-semibold">Критерий</th>
                {data.comparison_matrix.candidates.map((cand) => (
                  <th key={cand.candidate_id} className="text-center p-3 font-semibold">
                    {candidateNames[cand.candidate_id] || 'Unknown'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.comparison_matrix.criteria.map((criterion, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{criterion}</td>
                  {data.comparison_matrix.candidates.map((cand) => {
                    const score = cand.scores[idx]
                    return (
                      <td key={cand.candidate_id} className="p-3 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score}
                          </span>
                          <Progress value={score} className="w-20 h-1.5" />
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {activeTab === 'recommendation' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Trophy className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">
                  Рекомендуемый кандидат: {candidateNames[data.final_recommendation.best_fit] || 'Unknown'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {data.final_recommendation.reasoning}
                </p>
              </div>
            </div>
          </GlassCard>

          {data.final_recommendation.alternatives.length > 0 && (
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Альтернативные варианты
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.final_recommendation.alternatives.map((candId) => (
                  <Badge key={candId} variant="secondary" className="text-sm py-1.5 px-3">
                    {candidateNames[candId] || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}

          {data.final_recommendation.red_flags.length > 0 && (
            <GlassCard className="p-6 border-amber-500/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Важные вопросы для прояснения
              </h4>
              <ul className="space-y-2">
                {data.final_recommendation.red_flags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  )
}