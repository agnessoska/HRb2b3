# Данные для Google Cloud Branding (HR Platform v2.0)

Используйте эти данные для заполнения раздела **Branding** в Google Cloud Console (OAuth consent screen), чтобы пройти верификацию.

## Основная информация
- **App name:** `HR Platform v2.0`
- **User support email:** `support@hr.labpro.in`
- **App logo:** Используйте ваш официальный логотип (PNG/JPG, минимум 120x120px).

## Ссылки на домен (КРИТИЧЕСКИ ВАЖНО)
- **Application home page:** `https://hr.labpro.in`
- **Application privacy policy link:** `https://hr.labpro.in/public/privacy`
- **Application terms of service link:** `https://hr.labpro.in/public/terms`

## Авторизованные домены
- `hr.labpro.in`

---

## Чеклист финальных действий в Google Console:
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent).
2. Нажмите **Edit App**.
3. Заполните все поля выше.
4. В разделе **Authorized domains** добавьте `hr.labpro.in`.
5. Нажмите **Save and Continue**.
6. В разделе **Scopes** убедитесь, что добавлены `.../auth/userinfo.email` и `.../auth/userinfo.profile`.
7. Перейдите в **Verification Center** и нажмите **Submit for verification**.

---

## Проверка Supabase (для справки):
Убедитесь, что в Supabase Dashboard (Authentication -> URL Configuration) настроено:
- **Site URL:** `https://hr.labpro.in`
- **Redirect URLs:** `https://hr.labpro.in/**`
