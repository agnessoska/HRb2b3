import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicHeader } from '@/shared/ui/PublicHeader'

export default function PrivacyPolicyPage() {
  const { i18n } = useTranslation('common')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const content = {
    ru: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Сбор информации</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.1 Информация через Google OAuth</h3>
              <p>При входе через Google мы собираем:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Адрес электронной почты</li>
                <li>Полное имя</li>
                <li>Фотографию профиля</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.2 Цель сбора</h3>
              <p>Эти данные используются для:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Аутентификации пользователя в системе</li>
                <li>Отображения профиля в платформе</li>
                <li>Коммуникации с пользователем</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Хранение данных</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.1 Где хранятся данные</h3>
              <p>Все данные безопасно хранятся в базе данных Supabase (PostgreSQL) с использованием:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Шифрования при передаче (HTTPS/TLS)</li>
                <li>Row Level Security (RLS) для разграничения доступа</li>
                <li>Регулярного резервного копирования</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.2 Срок хранения</h3>
              <p>Данные хранятся до момента удаления аккаунта пользователем.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Использование данных</h2>
          <p className="mb-4">Мы НЕ:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Не продаем ваши данные третьим лицам</li>
            <li>Не используем данные для рекламы</li>
            <li>Не передаем данные без вашего согласия</li>
          </ul>
          <p>Мы используем данные только для:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Предоставления функционала HR платформы</li>
            <li>Улучшения сервиса</li>
            <li>Технической поддержки</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Права пользователя</h2>
          <p>Вы имеете право:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Получить доступ к своим данным</li>
            <li>Исправить неточные данные</li>
            <li>Удалить свой аккаунт и все связанные данные</li>
            <li>Экспортировать свои данные</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Безопасность</h2>
          <p>Мы применяем современные меры безопасности:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Шифрование данных</li>
            <li>Защита от несанкционированного доступа</li>
            <li>Регулярные аудиты безопасности</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">6. Контакты</h2>
          <p>По вопросам конфиденциальности: support@hr.labpro.in</p>
        </section>
      </div>
    ),
    en: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Information Collection</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.1 Google OAuth Information</h3>
              <p>When you sign in with Google, we collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Email address</li>
                <li>Full name</li>
                <li>Profile picture</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.2 Purpose</h3>
              <p>This information is used for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Authenticate you in the system</li>
                <li>Display your profile in the platform</li>
                <li>Communicate with you</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Data Storage</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.1 Where We Store Data</h3>
              <p>All data is securely stored in Supabase database (PostgreSQL) with:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Encryption in transit (HTTPS/TLS)</li>
                <li>Row Level Security (RLS)</li>
                <li>Regular backups</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.2 Retention Period</h3>
              <p>Data is stored until account deletion by the user.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Data Usage</h2>
          <p className="mb-4">We DO NOT:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Sell your data to third parties</li>
            <li>Use data for advertising</li>
            <li>Share data without your consent</li>
          </ul>
          <p>We use data only for:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Providing HR platform functionality</li>
            <li>Service improvement</li>
            <li>Technical support</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access your data</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and all associated data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Security</h2>
          <p>We implement modern security measures:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Data encryption</li>
            <li>Protection against unauthorized access</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">6. Contact</h2>
          <p>For privacy inquiries: support@hr.labpro.in</p>
        </section>
      </div>
    ),
    kk: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Ақпарат жинау</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.1 Google OAuth арқылы ақпарат</h3>
              <p>Google арқылы кірген кезде біз жинаймыз:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Электрондық пошта мекенжайы</li>
                <li>Толық аты-жөні</li>
                <li>Профиль суреті</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">1.2 Мақсаты</h3>
              <p>Бұл деректер келесі мақсаттарда қолданылады:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Жүйеде пайдаланушыны аутентификациялау</li>
                <li>Платформада профильді көрсету</li>
                <li>Пайдаланушымен байланыс орнату</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Деректерді сақтау</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.1 Деректер қайда сақталады</h3>
              <p>Барлық деректер Supabase дерекқорында (PostgreSQL) қауіпсіз сақталады:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Тасымалдау кезінде шифрлау (HTTPS/TLS)</li>
                <li>Row Level Security (RLS)</li>
                <li>Тұрақты сақтық көшірмелер</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.2 Сақтау мерзімі</h3>
              <p>Деректер пайдаланушы тіркелгісін жойғанға дейін сақталады.</p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Деректерді пайдалану</h2>
          <p className="mb-4">Біз ЖАСАМАЙМЫЗ:</p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Деректеріңізді үшінші тараптарға сатпаймыз</li>
            <li>Деректерді жарнама үшін пайдаланбаймыз</li>
            <li>Келісіміңізсіз деректерді бермейміз</li>
          </ul>
          <p>Біз деректерді тек келесі мақсаттарда пайдаланамыз:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>HR платформасының функционалдығын қамтамасыз ету</li>
            <li>Қызметті жақсарту</li>
            <li>Техникалық қолдау көрсету</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Пайдаланушы құқықтары</h2>
          <p>Сіздің құқығыңыз бар:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Өз деректеріңізге қол жеткізу</li>
            <li>Қате деректерді түзету</li>
            <li>Тіркелгіңізді және барлық байланысты деректерді жою</li>
            <li>Өз деректеріңізді экспорттау</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Қауіпсіздік</h2>
          <p>Біз заманауи қауіпсіздік шараларын қолданамыз:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Деректерді шифрлау</li>
            <li>Рұқсатсыз қол жеткізуден қорғау</li>
            <li>Тұрақты қауіпсіздік аудиттері</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">6. Байланыс</h2>
          <p>Құпиялылық сұрақтары бойынша: support@hr.labpro.in</p>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader showAuthButtons={false} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-8 pt-8 px-8 sm:px-12">
            <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight break-words hyphens-auto">
              {i18n.language === 'ru' ? 'Политика конфиденциальности' :
               i18n.language === 'en' ? 'Privacy Policy' : 
               'Құпиялылық саясаты'}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {i18n.language === 'ru' ? 'Последнее обновление: 22 декабря 2025' : 
               i18n.language === 'en' ? 'Last Updated: December 22, 2025' : 
               'Соңғы жаңарту: 22 желтоқсан 2025'}
            </p>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 bg-card">
            {content[i18n.language as keyof typeof content] || content.ru}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
