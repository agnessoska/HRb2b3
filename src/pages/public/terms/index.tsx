import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicHeader } from '@/shared/ui/PublicHeader'

export default function TermsPage() {
  const { i18n } = useTranslation('common')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const content = {
    ru: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Общие положения</h2>
          <p>Настоящие Условия использования регулируют ваш доступ к HR Platform v2.0 и ее использование. Используя наш сервис, вы подтверждаете свое согласие с данными условиями.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Описание сервиса</h2>
          <p>HR Platform v2.0 — это облачное решение для автоматизации процессов подбора персонала, включающее инструменты AI-анализа и психометрического тестирования.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Учетные записи</h2>
          <p>При создании учетной записи (через email или Google OAuth) вы обязуетесь предоставлять достоверную информацию. Вы несете ответственность за безопасность своей учетной записи.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Интеллектуальная собственность</h2>
          <p>Весь контент, технологии и программное обеспечение платформы являются собственностью HR Platform или ее лицензиаров и защищены законами об авторском праве.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Ограничение ответственности</h2>
          <p>Сервис предоставляется на условиях «как есть». Мы не гарантируем бесперебойную работу платформы и не несем ответственности за косвенные убытки, возникшие в результате использования сервиса.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">6. Изменения условий</h2>
          <p>Мы оставляем за собой право изменять данные условия в любое время. Продолжение использования сервиса после внесения изменений означает ваше согласие с новыми условиями.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">7. Контактная информация</h2>
          <p>По всем вопросам: support@hr.labpro.in</p>
        </section>
      </div>
    ),
    en: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. General Provisions</h2>
          <p>These Terms of Service govern your access to and use of HR Platform v2.0. By using our service, you confirm your acceptance of these terms.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Description of Service</h2>
          <p>HR Platform v2.0 is a cloud-based solution for automating recruitment processes, including AI analysis and psychometric testing tools.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. User Accounts</h2>
          <p>When creating an account (via email or Google OAuth), you agree to provide accurate information. You are responsible for the security of your account.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Intellectual Property</h2>
          <p>All content, technology, and software of the platform are the property of HR Platform or its licensors and are protected by copyright laws.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
          <p>The service is provided on an "as is" basis. We do not guarantee uninterrupted operation of the platform and are not liable for indirect damages resulting from the use of the service.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the service after changes are made constitutes your acceptance of the new terms.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">7. Contact Information</h2>
          <p>For any questions: support@hr.labpro.in</p>
        </section>
      </div>
    ),
    kk: (
      <div className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed">
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">1. Жалпы ережелер</h2>
          <p>Осы Пайдалану шарттары HR Platform v2.0 нұсқасына кіруіңізді және оны пайдалануыңызды реттейді. Біздің қызметті пайдалана отырып, сіз осы шарттармен келісетініңізді растайсыз.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">2. Қызмет сипаттамасы</h2>
          <p>HR Platform v2.0 — бұл AI-талдау және психометриялық тестілеу құралдарын қамтитын рекрутинг процестерін автоматтандыруға арналған бұлттық шешім.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">3. Пайдаланушы тіркелгілері</h2>
          <p>Тіркелгіні жасау кезінде (электрондық пошта немесе Google OAuth арқылы) сіз шынайы ақпарат беруге міндеттенесіз. Сіз өз тіркелгіңіздің қауіпсіздігіне жауаптысыз.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">4. Интеллектуалдық меншік</h2>
          <p>Платформаның барлық мазмұны, технологиялары мен бағдарламалық жасақтамасы HR Platform-ның немесе оның лицензиарларының меншігі болып табылады және авторлық құқық туралы заңдармен қорғалады.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">5. Жауапкершілікті шектеу</h2>
          <p>Қызмет «сол күйінде» беріледі. Біз платформаның үздіксіз жұмысына кепілдік бермейміз және қызметті пайдалану нәтижесінде туындаған жанама шығындар үшін жауап бермейміз.</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">6. Шарттарға өзгерістер енгізу</h2>
          <p>Біз осы шарттарды кез келген уақытта өзгерту құқығын өзімізде қалдырамыз. Өзгерістер енгізілгеннен кейін қызметті пайдалануды жалғастыру жаңа шарттармен келісетініңізді білдіреді.</p>
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">7. Байланыс ақпараты</h2>
          <p>Барлық сұрақтар бойынша: support@hr.labpro.in</p>
        </section>
      </div>
    ),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader showAuthButtons={false} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-8 pt-8 px-8 sm:px-12">
            <CardTitle className="text-3xl sm:text-4xl font-extrabold tracking-tight break-words hyphens-auto">
              {i18n.language === 'ru' ? 'Условия использования' :
               i18n.language === 'en' ? 'Terms of Service' : 
               'Пайдалану шарттары'}
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
