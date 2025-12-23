# Инструкция по настройке Resend + Supabase + Vercel для hr.labpro.in

Эта инструкция адаптирована под ваши скриншоты для верификации поддомена `hr.labpro.in`.

## Шаг 1: Добавление DNS записей в Vercel

Зайдите в настройки домена `labpro.in` на Vercel и добавьте следующие 3 записи.
**Не удаляйте существующие записи** для основного домена!

### 1. DKIM (TXT)
*   **Type:** `TXT`
*   **Name:** `resend._domainkey.hr`
*   **Value:** `p=MIGfMA0GCSqGSIb3DQEBAQUAA4G...` (Скопируйте полное значение из панели Resend)
*   **TTL:** Оставьте пустым или 60

### 2. SPF (MX)
*   **Type:** `MX`
*   **Name:** `send.hr`
*   **Value:** `feedback-smtp.ap-northeast-1.amazonses.com` (Скопируйте точно из Resend, регион может отличаться)
*   **Priority:** `10`

### 3. SPF (TXT)
*   **Type:** `TXT`
*   **Name:** `send.hr`
*   **Value:** `v=spf1 include:amazonses.com ~all`

> **Примечание:** Запись MX для "Enable Receiving" (имя `hr`) добавлять не обязательно, если вы не планируете обрабатывать входящую почту на этом поддомене.

## Шаг 2: Верификация в Resend

1.  После добавления всех записей в Vercel, вернитесь в Resend.
2.  Нажмите кнопку **Verify DNS Records** (или "I've added the records").
3.  Статус должен смениться на **Verified**.

## Шаг 3: Настройка SMTP в Supabase

После успешной верификации настройте Supabase (Project Settings -> Auth -> SMTP Settings):

1.  **Enable Custom SMTP:** ON
2.  **Sender Email:** `noreply@hr.labpro.in` (или `auth@hr.labpro.in` - обязательно используйте `@hr.labpro.in`)
3.  **Sender Name:** `HR Platform`
4.  **Host:** `smtp.resend.com`
5.  **Port:** `465`
6.  **Username:** `resend`
7.  **Password:** `re_h2XcTGUP_2NrtPuMREp5355mVmRwxzrXo`
8.  **Encryption:** `SSL`

Нажмите **Save**.

## Проверка

Попробуйте отправить письмо сброса пароля или зарегистрировать нового пользователя с реальным email. Письмо должно прийти от `noreply@hr.labpro.in`.