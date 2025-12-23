# Инструкция по верификации Google OAuth (для снятия лимита 100 пользователей)

Эта инструкция поможет вам пройти процесс верификации приложения в Google Cloud Console, чтобы снять ограничение на 100 пользователей и убрать экран "Unverified app" при входе.

## Шаг 1: Подготовка (Pre-requisites)

Перед началом убедитесь, что у вас есть:
1.  **Домен:** `hr.labpro.in` (сайт должен быть доступен по HTTPS).
2.  **Политики:** Ссылки на Privacy Policy и Terms of Service.
    *   Privacy: `https://hr.labpro.in/public/privacy`
    *   Terms: `https://hr.labpro.in/public/terms`
3.  **Логотип:** Изображение логотипа (желательно квадратное, PNG, до 1MB).

## Шаг 2: Настройка OAuth Consent Screen

1.  Зайдите в [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent).
2.  Выберите ваш проект (который используется для Supabase Auth).
3.  Нажмите **Edit App** (или Create, если еще не создавали).

### App Information
*   **App name:** `HR Platform` (или ваше название, которое увидят пользователи).
*   **User support email:** Ваш email (или email поддержки).
*   **App logo:** Загрузите логотип.

### App Domain
*   **Application home page:** `https://hr.labpro.in`
*   **Application privacy policy link:** `https://hr.labpro.in/public/privacy`
*   **Application terms of service link:** `https://hr.labpro.in/public/terms`

### Authorized Domains
*   Нажмите **+ ADD DOMAIN**.
*   Введите: `labpro.in` (Google требует верифицировать корневой домен).
*   *Примечание:* Вам нужно будет подтвердить владение доменом `labpro.in` в **Google Search Console**, если это еще не сделано. Ссылка на Search Console появится там же. Это делается добавлением DNS TXT записи (аналогично Resend).

### Developer Contact Information
*   Введите ваш email для уведомлений от Google.

Нажмите **Save and Continue**.

## Шаг 3: Scopes (Права доступа)

Это самый важный шаг.
1.  Нажмите **Add or Remove Scopes**.
2.  Выберите **только** базовые права:
    *   `.../auth/userinfo.email`
    *   `.../auth/userinfo.profile`
    *   `openid`
3.  **НЕ выбирайте** ничего другого (Gmail, Drive, Calendar), иначе процесс верификации затянется на недели и потребует аудита безопасности.
4.  Нажмите **Update**, затем **Save and Continue**.

## Шаг 4: Test Users (Тестовые пользователи)

*   Если ваше приложение в статусе **Testing**, здесь список пользователей, которым разрешен вход.
*   Нажмите **Save and Continue**.

## Шаг 5: Публикация и Верификация

1.  Вернитесь на экран **OAuth Consent Screen**.
2.  Под заголовком "Publishing status" нажмите кнопку **PUBLISH APP**.
3.  Появится диалог "Push to production?". Нажмите **Confirm**.

**Что произойдет дальше:**
*   Статус изменится на **In production**.
*   Ограничение в 100 пользователей будет снято.
*   Если вы выбрали только базовые права (email, profile), верификация может пройти автоматически или занять 1-2 дня.
*   Если Google потребует дополнительной проверки, вы получите письмо на email разработчика. Вам могут попросить прислать видео, демонстрирующее процесс входа.

## Проверка владения доменом (если требуется)

Если Google не дает добавить `labpro.in` в "Authorized domains":
1.  Перейдите в [Google Search Console](https://search.google.com/search-console).
2.  Добавьте свойство (Property): `labpro.in`.
3.  Выберите метод верификации **DNS record**.
4.  Скопируйте TXT запись (начинается с `google-site-verification=...`).
5.  Добавьте эту запись в DNS настройки домена на Vercel (аналогично тому, как делали для Resend).
6.  Нажмите Verify.