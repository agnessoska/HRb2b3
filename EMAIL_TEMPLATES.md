# Шаблоны писем для Supabase Auth (RU / KK / EN)

Скопируйте HTML-код ниже и вставьте его в соответствующие разделы в **Supabase Dashboard -> Authentication -> Email Templates**.

---

## 1. Confirm Your Signup (Подтверждение регистрации)

Вставьте этот код в поле **Message Body**.
**Subject:** `Подтвердите регистрацию / Тіркелуді растаңыз / Confirm your signup`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #000; text-decoration: none; }
    .content { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
    .block { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #eee; }
    .block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .btn { display: block; width: fit-content; margin: 20px auto; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; }
    h2 { margin-top: 0; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">HR Platform</span>
  </div>
  
  <div class="content">
    <!-- Russian -->
    <div class="block">
      <h2>Подтвердите ваш Email</h2>
      <p>Вы зарегистрировались на HR Platform. Чтобы начать работу, пожалуйста, подтвердите ваш адрес электронной почты.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Подтвердить почту</a>
    </div>

    <!-- Kazakh -->
    <div class="block">
      <h2>Email мекенжайыңызды растаңыз</h2>
      <p>Сіз HR Platform-да тіркелдіңіз. Жұмысты бастау үшін электрондық поштаңызды растауыңызды сұраймыз.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Поштаны растау</a>
    </div>

    <!-- English -->
    <div class="block">
      <h2>Confirm your Email</h2>
      <p>You have registered on HR Platform. To get started, please confirm your email address.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Confirm Email</a>
    </div>
  </div>

  <div class="footer">
    <p>Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.</p>
    <p>Егер сіз біздің сайтта тіркелмеген болсаңыз, бұл хатты елемеңіз.</p>
    <p>If you didn't register on our site, just ignore this email.</p>
  </div>
</body>
</html>
```

---

## 2. Reset Password (Сброс пароля)

Вставьте этот код в поле **Message Body**.
**Subject:** `Сброс пароля / Құпиясөзді қалпына келтіру / Reset Password`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #000; text-decoration: none; }
    .content { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #eee; }
    .block { margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid #eee; }
    .block:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .btn { display: block; width: fit-content; margin: 20px auto; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; }
    h2 { margin-top: 0; font-size: 18px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="logo">HR Platform</span>
  </div>
  
  <div class="content">
    <!-- Russian -->
    <div class="block">
      <h2>Сброс пароля</h2>
      <p>Мы получили запрос на сброс пароля для вашего аккаунта. Нажмите на кнопку ниже, чтобы задать новый пароль.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Сбросить пароль</a>
    </div>

    <!-- Kazakh -->
    <div class="block">
      <h2>Құпиясөзді қалпына келтіру</h2>
      <p>Біз сіздің аккаунтыңыздың құпиясөзін қалпына келтіру туралы сұраныс алдық. Жаңа құпиясөз орнату үшін төмендегі түймені басыңыз.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Құпиясөзді өзгерту</a>
    </div>

    <!-- English -->
    <div class="block">
      <h2>Reset Password</h2>
      <p>We received a request to reset the password for your account. Click the button below to set a new password.</p>
      <a href="{{ .ConfirmationURL }}" class="btn">Reset Password</a>
    </div>
  </div>

  <div class="footer">
    <p>Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
    <p>Егер сіз құпиясөзді өзгертуді сұрамасаңыз, бұл хатты елемеңіз.</p>
    <p>If you didn't request a password reset, ignore this email.</p>
  </div>
</body>
</html>