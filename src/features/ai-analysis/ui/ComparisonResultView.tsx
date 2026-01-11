import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ComparisonData as BaseComparisonData, RankedCandidate, ComparisonMatrix } from '../types'
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
import { HelpCircle } from '@/shared/ui/HelpCircle'

export interface ComparisonMatrixExtended extends Partial<ComparisonMatrix> {
  categories?: string[]
  criteria?: string[]
  candidates?: Array<{
    candidate_id: string
    scores: number[]
  }>
  scores?: Record<string, {
    professional?: number
    personality?: number
    cultural?: number
    motivation?: number
  }>
}

export interface ComparisonData extends Omit<BaseComparisonData, 'ranked_candidates' | 'comparison_matrix'> {
  ranked_candidates: Array<RankedCandidate & { 
    hire_recommendation?: 'hire_strongly' | 'hire' | 'consider' | 'reject'
    professional_score?: number
    personality_score?: number
    cultural_score?: number
    motivation_score?: number
  }>
  comparison_matrix: ComparisonMatrixExtended
}

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

  // Функция для нормализации данных от разных AI моделей
  const normalizedData = (function() {
    if (!data) return null;

    // Глубокое копирование через JSON для избежания мутаций и обхода строгих типов на этапе маппинга
    const n = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;

    // 1. Нормализация ranked_candidates
    if (n.ranked_candidates && Array.isArray(n.ranked_candidates)) {
      n.ranked_candidates = n.ranked_candidates.map((candidate) => {
        const c = candidate as Record<string, unknown>;
        
        // Маппинг баллов (поддержка плоской структуры и разных имен)
        if (!c.scores) {
          c.scores = {
            professional: (c.professional_score as number) || (c.professional as number) || 0,
            personality: (c.personality_score as number) || (c.personality as number) || 0,
            cultural_fit: (c.cultural_score as number) || (c.cultural_fit as number) || (c.cultural_fit_score as number) || (c.cultural as number) || 0,
            motivation: (c.motivation_score as number) || (c.motivation as number) || 0
          };
        } else {
          // Если объект scores есть, проверяем ключи в нем
          const s = c.scores as Record<string, number>;
          c.scores = {
            professional: s.professional || 0,
            personality: s.personality || 0,
            cultural_fit: s.cultural_fit || s.cultural || s.cultural_score || 0,
            motivation: s.motivation || 0
          };
        }

        // Маппинг характеристик
        if (!c.key_insights && c.summary) {
          c.key_insights = c.summary;
        }

        // Маппинг сильных и слабых сторон
        if ((!c.strengths || (c.strengths as string[]).length === 0) && Array.isArray(c.key_strengths)) {
          c.strengths = c.key_strengths;
        }

        // Маппинг рекомендации для Badge
        if (!c.recommendation && c.hire_recommendation) {
          c.recommendation = c.hire_recommendation;
        }

        return c;
      });
    }

    // 2. Нормализация final_recommendation
    if (n.final_recommendation) {
      const fr = n.final_recommendation as Record<string, unknown>;
      if (!fr.best_fit && fr.primary_choice) {
        fr.best_fit = fr.primary_choice;
      }
      if (!fr.alternatives && fr.backup_choice) {
        fr.alternatives = Array.isArray(fr.backup_choice) ? fr.backup_choice : [fr.backup_choice];
      }
      if (!fr.red_flags && fr.avoid_reasoning) {
        fr.red_flags = Array.isArray(fr.avoid_reasoning) ? fr.avoid_reasoning : [fr.avoid_reasoning];
      }

      // Прокидываем рекомендации в ranked_candidates для отображения Badge
      if (n.ranked_candidates && Array.isArray(n.ranked_candidates)) {
        n.ranked_candidates.forEach((candidate) => {
          const c = candidate as Record<string, unknown>;
          
          // 1. Если это лучший кандидат
          if (fr.best_fit && c.candidate_id === fr.best_fit) {
            c.recommendation = 'hire_strongly';
          } 
          // 2. Если это альтернативный кандидат
          else if (fr.alternatives && Array.isArray(fr.alternatives) && fr.alternatives.includes(c.candidate_id as string)) {
            c.recommendation = 'hire';
          }
          // 3. Если кандидат в списке "избегать"
          else if (fr.avoid && Array.isArray(fr.avoid) && fr.avoid.includes(c.candidate_id as string)) {
            c.recommendation = 'reject';
          }
          // 4. Fallback (если ничего не подошло, но есть общая рекомендация от AI в корне)
          else if (!c.recommendation) {
            c.recommendation = 'consider';
          }
        });
      }
    }

    // 3. Нормализация comparison_matrix
    if (n.comparison_matrix) {
      const cm = n.comparison_matrix as Record<string, unknown>;
      
      // Если нет списка кандидатов в матрице, строим его из ranked_candidates
      if (!cm.candidates && n.ranked_candidates && Array.isArray(n.ranked_candidates)) {
        cm.candidates = n.ranked_candidates.map((rc) => {
          const rcc = rc as Record<string, unknown>;
          const scores = rcc.scores as Record<string, number>;
          return {
            candidate_id: rcc.candidate_id,
            scores: [
              scores?.professional || 0,
              scores?.personality || 0,
              scores?.cultural_fit || 0,
              scores?.motivation || 0
            ]
          };
        });
      }

      // Синхронизация названий категорий
      if (!cm.categories && cm.criteria) {
        cm.categories = cm.criteria;
      }
    }

    return n as unknown as ComparisonData;
  })();

  if (!normalizedData || (!normalizedData.ranked_candidates?.length && !normalizedData.comparison_matrix && !normalizedData.final_recommendation)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h3 className="text-xl font-bold">Данные сравнения отсутствуют</h3>
        <p className="text-muted-foreground max-w-md">
          Похоже, AI не смог сгенерировать структурированные данные для этого сравнения. 
          Попробуйте запустить сравнение еще раз или обратитесь в поддержку.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Вернуться назад
          </Button>
        )}
      </div>
    )
  }

  const getRecommendationColor = (rec: string | undefined | null) => {
    if (!rec) return 'text-muted-foreground'
    const r = String(rec).toLowerCase()
    if (r.includes('strongly')) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:text-emerald-700'
    if (r.includes('hire')) return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-700'
    if (r.includes('consider')) return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-700'
    if (r.includes('reject')) return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:text-red-700'
    return 'text-muted-foreground'
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
            <div className="flex items-center gap-2 mb-1 md:mb-2">
              <h2 className="text-base md:text-2xl font-bold">Итоговое сравнение</h2>
              <HelpCircle topicId="candidate_comparison" />
            </div>
            <p className="text-xs md:text-base text-muted-foreground leading-relaxed">
              {normalizedData.summary}
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
          {(normalizedData.ranked_candidates || []).map((candidate) => (
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
                      <Badge className={getRecommendationColor(candidate.recommendation || candidate.hire_recommendation)}>
                        {(candidate.recommendation || candidate.hire_recommendation || 'N/A').replace(/_/g, ' ').toUpperCase()}
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
                    <Badge variant="secondary" className="text-[10px]">Проф: {candidate.scores?.professional || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Личн: {candidate.scores?.personality || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Культ: {candidate.scores?.cultural_fit || 0}</Badge>
                    <Badge variant="secondary" className="text-[10px]">Мотив: {candidate.scores?.motivation || 0}</Badge>
                  </div>
                  
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Профессионал</span>
                        <span className="font-semibold">{candidate.scores?.professional || 0}</span>
                      </div>
                      <Progress value={Number(candidate.scores?.professional || 0)} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Личность</span>
                        <span className="font-semibold">{candidate.scores?.personality || 0}</span>
                      </div>
                      <Progress value={Number(candidate.scores?.personality || 0)} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Культура</span>
                        <span className="font-semibold">{candidate.scores?.cultural_fit || 0}</span>
                      </div>
                      <Progress value={Number(candidate.scores?.cultural_fit || 0)} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Мотивация</span>
                        <span className="font-semibold">{candidate.scores?.motivation || 0}</span>
                      </div>
                      <Progress value={Number(candidate.scores?.motivation || 0)} className="h-2" />
                    </div>
                  </div>

                  <div className="p-2 md:p-3 rounded-lg bg-muted/30">
                    <p className="text-xs md:text-sm italic leading-snug">{candidate.key_insights || 'No insights provided'}</p>
                  </div>

                  <div className="space-y-2 md:hidden">
                    <details className="group">
                      <summary className="text-xs font-semibold cursor-pointer flex items-center gap-1.5 py-1 list-none">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        Сильные (+)
                      </summary>
                      <ul className="mt-1 space-y-0.5 pl-4">
                        {(candidate.strengths || []).slice(0, 3).map((strength, idx) => (
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
                        {(candidate.weaknesses || []).slice(0, 3).map((weakness, idx) => (
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
                        {(candidate.strengths || []).map((strength, idx) => (
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
                        {(candidate.weaknesses || []).map((weakness, idx) => (
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
                {(normalizedData.comparison_matrix?.candidates || []).map((cand) => (
                  <th key={cand.candidate_id} className="text-center p-3 font-semibold">
                    {candidateNames[cand.candidate_id] || 'Unknown'}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(normalizedData.comparison_matrix?.categories || normalizedData.comparison_matrix?.criteria || []).map((criterion, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{criterion}</td>
                  {(normalizedData.comparison_matrix?.candidates || []).map((cand) => {
                    // Try to get score from object format first, then from array
                    let score = 0
                    const scoresObj = normalizedData.comparison_matrix?.scores?.[cand.candidate_id]
                    
                    if (scoresObj) {
                      const categoryKeyMap: Record<string, string[]> = {
                        'Профессиональные навыки': ['professional', 'professional_score'],
                        'Личностные качества': ['personality', 'personality_score'],
                        'Культурный fit': ['cultural_fit', 'cultural', 'cultural_score', 'cultural_fit_score'],
                        'Мотивация': ['motivation', 'motivation_score'],
                        'Эмоциональный интеллект': ['eq', 'eq_score', 'emotional_intelligence'],
                        'Мягкие навыки': ['soft_skills', 'soft_skills_score'],
                        'Опыт работы': ['experience', 'experience_score']
                      }
                      
                      // 1. Пытаемся найти по точному названию критерия (как присылает Gemini)
                      const directVal = (scoresObj as unknown as Record<string, number>)[criterion]
                      if (directVal !== undefined) {
                        score = directVal
                      } else {
                        // 2. Ищем по мапе ключей
                        const keys = categoryKeyMap[criterion] || [criterion]
                        for (const key of keys) {
                          const val = (scoresObj as unknown as Record<string, number>)[key]
                          if (val !== undefined) {
                            score = val
                            break
                          }
                        }
                      }
                    } else if (Array.isArray(cand.scores)) {
                      score = cand.scores[idx] || 0
                    }
                    
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
                  Рекомендуемый кандидат: {candidateNames[normalizedData.final_recommendation?.best_fit || ''] || 'Unknown'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {normalizedData.final_recommendation?.reasoning || 'No reasoning provided'}
                </p>
              </div>
            </div>
          </GlassCard>

          {(normalizedData.final_recommendation?.alternatives || []).length > 0 && (
            <GlassCard className="p-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-500" />
                Альтернативные варианты
              </h4>
              <div className="flex flex-wrap gap-2">
                {normalizedData.final_recommendation.alternatives.map((candId) => (
                  <Badge key={candId} variant="secondary" className="text-sm py-1.5 px-3">
                    {candidateNames[candId] || 'Unknown'}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}

          {(normalizedData.final_recommendation?.red_flags || []).length > 0 && (
            <GlassCard className="p-6 border-amber-500/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Важные вопросы для прояснения
              </h4>
              <ul className="space-y-2">
                {normalizedData.final_recommendation.red_flags.map((flag, idx) => (
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
