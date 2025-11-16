-- Этап 4.1: Заполнение базы данных тестами

-- Вставка 6 основных психометрических тестов
INSERT INTO public.tests (code, name_ru, name_kk, name_en, description_ru, description_kk, description_en, test_type, total_questions, time_limit_minutes, sort_order, is_active)
VALUES
    ('big_five', 'Big Five (Большая пятерка)', 'Big Five (Үлкен бестік)', 'Big Five', 'Научно обоснованная модель личности, измеряющая 5 ключевых черт.', '5 негізгі қасиетті өлшейтін ғылыми негізделген тұлға моделі.', 'A scientifically validated personality model that measures 5 key traits.', 'scale', 50, null, 1, true),
    ('mbti', 'MBTI (Типология Майерс-Бриггс)', 'MBTI (Майерс-Бриггс типологиясы)', 'MBTI (Myers-Briggs Type Indicator)', 'Определяет 1 из 16 психологических типов по 4 дихотомиям.', '4 дихотомия бойынша 16 психологиялық типтің бірін анықтайды.', 'Determines 1 of 16 psychological types based on 4 dichotomies.', 'dichotomy', 60, null, 2, true),
    ('disc', 'DISC (Профиль поведения)', 'DISC (Мінез-құлық профилі)', 'DISC (Behavioral Profile)', 'Определяет доминирующий стиль поведения.', 'Басым мінез-құлық стилін анықтайды.', 'Determines the dominant behavioral style.', 'style', 40, null, 3, true),
    ('eq', 'EQ (Эмоциональный интеллект)', 'EQ (Эмоционалды интеллект)', 'EQ (Emotional Intelligence)', 'Оценка способности понимать и управлять эмоциями.', 'Эмоцияларды түсіну және басқару қабілетін бағалау.', 'Assessment of the ability to understand and manage emotions.', 'scale', 40, null, 4, true),
    ('soft_skills', 'Soft Skills (Мягкие навыки)', 'Soft Skills (Жұмсақ дағдылар)', 'Soft Skills', 'Оценка ключевых профессиональных компетенций.', 'Негізгі кәсіби құзыреттіліктерді бағалау.', 'Assessment of key professional competencies.', 'scale', 50, null, 5, true),
    ('motivation', 'Мотивационный профиль', 'Мотивациялық профиль', 'Motivation Profile', 'Определяет ключевые драйверы мотивации.', 'Мотивацияның негізгі драйверлерін анықтайды.', 'Identifies key motivational drivers.', 'scale', 60, null, 6, true);

-- Вставка шкал для тестов
-- Шкалы для Big Five
WITH test AS (SELECT id FROM public.tests WHERE code = 'big_five')
INSERT INTO public.test_scales (test_id, code, name_ru, name_kk, name_en, description_ru, description_kk, description_en, min_value, max_value, optimal_value, scale_type, sort_order)
VALUES
    ((SELECT id FROM test), 'openness', 'Открытость опыту', 'Тәжірибеге ашықтық', 'Openness', 'Интерес к новому, любознательность, креативность.', 'Жаңаға деген қызығушылық, білуге құмарлық, креативтілік.', 'Interest in new things, curiosity, creativity.', 0, 100, null, 'higher_is_better', 1),
    ((SELECT id FROM test), 'conscientiousness', 'Добросовестность', 'Адалдық', 'Conscientiousness', 'Организованность, надежность, самодисциплина.', 'Ұйымшылдық, сенімділік, өзін-өзі тәртіпке салу.', 'Organization, reliability, self-discipline.', 0, 100, null, 'higher_is_better', 2),
    ((SELECT id FROM test), 'extraversion', 'Экстраверсия', 'Экстраверсия', 'Extraversion', 'Общительность, энергичность, позитивные эмоции.', 'Адамдармен араласу, энергиялылық, позитивті эмоциялар.', 'Sociability, energy, positive emotions.', 0, 100, 50, 'optimal', 3),
    ((SELECT id FROM test), 'agreeableness', 'Доброжелательность', 'Ілтипаттылық', 'Agreeableness', 'Эмпатия, готовность к сотрудничеству, доверие.', 'Эмпатия, ынтымақтастыққа дайындық, сенім.', 'Empathy, willingness to cooperate, trust.', 0, 100, 65, 'optimal', 4),
    ((SELECT id FROM test), 'neuroticism', 'Нейротизм', 'Нейротизм', 'Neuroticism', 'Эмоциональная стабильность, уровень стресса.', 'Эмоционалды тұрақтылық, стресс деңгейі.', 'Emotional stability, stress level.', 0, 100, null, 'lower_is_better', 5);

-- Шкалы для EQ
WITH test AS (SELECT id FROM public.tests WHERE code = 'eq')
INSERT INTO public.test_scales (test_id, code, name_ru, name_kk, name_en, description_ru, description_kk, description_en, min_value, max_value, optimal_value, scale_type, sort_order)
VALUES
    ((SELECT id FROM test), 'self_awareness', 'Самосознание', 'Өзін-өзі тану', 'Self-Awareness', 'Понимание своих эмоций и их влияния.', 'Өз эмоцияларын және олардың әсерін түсіну.', 'Understanding your emotions and their impact.', 0, 100, null, 'higher_is_better', 1),
    ((SELECT id FROM test), 'self_management', 'Самоуправление', 'Өзін-өзі басқару', 'Self-Management', 'Контроль импульсов, адаптивность.', 'Импульстерді бақылау, бейімделу.', 'Controlling impulses, adaptability.', 0, 100, null, 'higher_is_better', 2),
    ((SELECT id FROM test), 'social_awareness', 'Социальная осведомленность', 'Әлеуметтік хабардарлық', 'Social Awareness', 'Эмпатия, понимание чувств других.', 'Эмпатия, басқалардың сезімдерін түсіну.', 'Empathy, understanding the feelings of others.', 0, 100, null, 'higher_is_better', 3),
    ((SELECT id FROM test), 'relationship_management', 'Управление отношениями', 'Қарым-қатынасты басқару', 'Relationship Management', 'Влияние, разрешение конфликтов.', 'Әсер ету, қақтығыстарды шешу.', 'Influence, conflict resolution.', 0, 100, null, 'higher_is_better', 4);

-- Шкалы для Soft Skills
WITH test AS (SELECT id FROM public.tests WHERE code = 'soft_skills')
INSERT INTO public.test_scales (test_id, code, name_ru, name_kk, name_en, description_ru, description_kk, description_en, min_value, max_value, optimal_value, scale_type, sort_order)
VALUES
    ((SELECT id FROM test), 'communication', 'Коммуникация', 'Коммуникация', 'Communication', 'Ясность выражения мыслей, активное слушание.', 'Ойды анық білдіру, белсенді тыңдау.', 'Clarity of expression, active listening.', 0, 100, null, 'higher_is_better', 1),
    ((SELECT id FROM test), 'teamwork', 'Работа в команде', 'Командада жұмыс', 'Teamwork', 'Коллаборация, поддержка коллег.', 'Ынтымақтастық, әріптестерді қолдау.', 'Collaboration, supporting colleagues.', 0, 100, null, 'higher_is_better', 2),
    ((SELECT id FROM test), 'critical_thinking', 'Критическое мышление', 'Сын тұрғысынан ойлау', 'Critical Thinking', 'Анализ, принятие решений.', 'Талдау, шешім қабылдау.', 'Analysis, decision making.', 0, 100, null, 'higher_is_better', 3),
    ((SELECT id FROM test), 'adaptability', 'Адаптивность', 'Бейімделу', 'Adaptability', 'Гибкость к изменениям, обучаемость.', 'Өзгерістерге икемділік, үйренуге қабілеттілік.', 'Flexibility to change, learnability.', 0, 100, null, 'higher_is_better', 4),
    ((SELECT id FROM test), 'initiative', 'Инициативность', 'Бастамашылдық', 'Initiative', 'Проактивность, drive к результату.', 'Проактивтілік, нәтижеге ұмтылу.', 'Proactivity, drive for results.', 0, 100, null, 'higher_is_better', 5);

-- Шкалы для Motivation
WITH test AS (SELECT id FROM public.tests WHERE code = 'motivation')
INSERT INTO public.test_scales (test_id, code, name_ru, name_kk, name_en, description_ru, description_kk, description_en, min_value, max_value, optimal_value, scale_type, sort_order)
VALUES
    ((SELECT id FROM test), 'achievement', 'Достижение', 'Жетістік', 'Achievement', 'Стремление к успеху, результативность.', 'Табысқа ұмтылу, нәтижелілік.', 'Striving for success, effectiveness.', 0, 100, null, 'higher_is_better', 1),
    ((SELECT id FROM test), 'power', 'Власть', 'Билік', 'Power', 'Влияние, контроль, лидерство.', 'Әсер ету, бақылау, көшбасшылық.', 'Influence, control, leadership.', 0, 100, 60, 'optimal', 2),
    ((SELECT id FROM test), 'affiliation', 'Принадлежность', 'Тиесілілік', 'Affiliation', 'Социальные связи, принятие.', 'Әлеуметтік байланыстар, қабылдау.', 'Social connections, acceptance.', 0, 100, 60, 'optimal', 3),
    ((SELECT id FROM test), 'autonomy', 'Автономность', 'Автономдылық', 'Autonomy', 'Независимость, самостоятельность.', 'Тәуелсіздік, дербестік.', 'Independence, self-reliance.', 0, 100, 65, 'optimal', 4),
    ((SELECT id FROM test), 'security', 'Безопасность', 'Қауіпсіздік', 'Security', 'Стабильность, предсказуемость.', 'Тұрақтылық, болжамдылық.', 'Stability, predictability.', 0, 100, 50, 'optimal', 5),
    ((SELECT id FROM test), 'growth', 'Рост', 'Өсу', 'Growth', 'Развитие, обучение, самосовершенствование.', 'Даму, оқу, өзін-өзі жетілдіру.', 'Development, learning, self-improvement.', 0, 100, null, 'higher_is_better', 6);

-- Вставка вопросов для тестов
DO $$
DECLARE
    big_five_id uuid;
    mbti_id uuid;
    disc_id uuid;
    eq_id uuid;
    soft_skills_id uuid;
    motivation_id uuid;
BEGIN
    -- Получаем ID тестов
    SELECT id INTO big_five_id FROM public.tests WHERE code = 'big_five';
    SELECT id INTO mbti_id FROM public.tests WHERE code = 'mbti';
    SELECT id INTO disc_id FROM public.tests WHERE code = 'disc';
    SELECT id INTO eq_id FROM public.tests WHERE code = 'eq';
    SELECT id INTO soft_skills_id FROM public.tests WHERE code = 'soft_skills';
    SELECT id INTO motivation_id FROM public.tests WHERE code = 'motivation';

    -- JSON с вариантами ответов для шкальных тестов
    DECLARE
        scale_options jsonb := '{
            "ru": ["Совершенно не согласен", "Скорее не согласен", "Нейтрально", "Скорее согласен", "Полностью согласен"],
            "kk": ["Мүлдем келіспеймін", "Келіспеймін", "Бейтарап", "Келісемін", "Толығымен келісемін"],
            "en": ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
            "values": [0, 25, 50, 75, 100]
        }';
    BEGIN
        -- Вопросы для Big Five (50 вопросов)
        INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
        VALUES
            -- Openness (10)
            (big_five_id, 1, 'Я люблю исследовать новые идеи и концепции.', 'Мен жаңа идеялар мен тұжырымдамаларды зерттеуді ұнатамын.', 'I enjoy exploring new ideas and concepts.', 'openness', false, scale_options),
            (big_five_id, 2, 'У меня богатое воображение.', 'Менің қиялым бай.', 'I have a rich imagination.', 'openness', false, scale_options),
            (big_five_id, 3, 'Я ценю искусство и красоту.', 'Мен өнер мен сұлулықты бағалаймын.', 'I appreciate art and beauty.', 'openness', false, scale_options),
            (big_five_id, 4, 'Я предпочитаю разнообразие рутине.', 'Мен күнделікті жұмыстан гөрі әртүрлілікті қалаймын.', 'I prefer variety to routine.', 'openness', false, scale_options),
            (big_five_id, 5, 'Я любопытен ко многим вещам.', 'Мен көп нәрсеге қызығамын.', 'I am curious about many things.', 'openness', false, scale_options),
            (big_five_id, 6, 'Я предпочитаю придерживаться проверенных методов.', 'Мен тексерілген әдістерді ұстануды жөн көремін.', 'I prefer to stick to proven methods.', 'openness', true, scale_options),
            (big_five_id, 7, 'Мне не очень интересно обсуждать абстрактные идеи.', 'Маған абстрактілі идеяларды талқылау қызық емес.', 'I am not very interested in discussing abstract ideas.', 'openness', true, scale_options),
            (big_five_id, 8, 'Я не считаю себя очень творческим человеком.', 'Мен өзімді өте шығармашыл адам деп санамаймын.', 'I do not consider myself a very creative person.', 'openness', true, scale_options),
            (big_five_id, 9, 'Мне комфортно в знакомой обстановке.', 'Маған таныс ортада ыңғайлы.', 'I am comfortable in a familiar environment.', 'openness', true, scale_options),
            (big_five_id, 10, 'Я редко ищу новый опыт.', 'Мен жаңа тәжірибелерді сирек іздеймін.', 'I rarely seek new experiences.', 'openness', true, scale_options),
            -- Conscientiousness (10)
            (big_five_id, 11, 'Я всегда подготовлен.', 'Мен әрқашан дайынмын.', 'I am always prepared.', 'conscientiousness', false, scale_options),
            (big_five_id, 12, 'Я обращаю внимание на детали.', 'Мен егжей-тегжейге назар аударамын.', 'I pay attention to details.', 'conscientiousness', false, scale_options),
            (big_five_id, 13, 'Я люблю порядок и чистоту.', 'Мен тәртіп пен тазалықты жақсы көремін.', 'I like order and cleanliness.', 'conscientiousness', false, scale_options),
            (big_five_id, 14, 'Я выполняю свои обязанности сразу.', 'Мен өз міндеттерімді бірден орындаймын.', 'I get my chores done right away.', 'conscientiousness', false, scale_options),
            (big_five_id, 15, 'Я следую расписанию.', 'Мен кестені ұстанамын.', 'I follow a schedule.', 'conscientiousness', false, scale_options),
            (big_five_id, 16, 'Я часто оставляю беспорядок.', 'Мен жиі ретсіздік қалдырамын.', 'I often leave a mess.', 'conscientiousness', true, scale_options),
            (big_five_id, 17, 'Я часто забываю положить вещи на свои места.', 'Мен заттарды өз орнына қоюды жиі ұмытамын.', 'I often forget to put things back in their proper place.', 'conscientiousness', true, scale_options),
            (big_five_id, 18, 'Я склонен откладывать дела.', 'Мен істерді кейінге қалдыруға бейіммін.', 'I tend to procrastinate.', 'conscientiousness', true, scale_options),
            (big_five_id, 19, 'Я не очень методичен в своей работе.', 'Мен өз жұмысымда өте әдістемелік емеспін.', 'I am not very methodical in my work.', 'conscientiousness', true, scale_options),
            (big_five_id, 20, 'Я могу быть несколько небрежным.', 'Мен біраз салақ болуым мүмкін.', 'I can be somewhat careless.', 'conscientiousness', true, scale_options),
            -- Extraversion (10)
            (big_five_id, 21, 'Я душа компании.', 'Мен компанияның жанымын.', 'I am the life of the party.', 'extraversion', false, scale_options),
            (big_five_id, 22, 'Мне нравится быть в центре внимания.', 'Маған назар ортасында болған ұнайды.', 'I enjoy being the center of attention.', 'extraversion', false, scale_options),
            (big_five_id, 23, 'Я легко завожу разговор с незнакомцами.', 'Мен бейтаныс адамдармен оңай сөйлесемін.', 'I easily start conversations with strangers.', 'extraversion', false, scale_options),
            (big_five_id, 24, 'Я чувствую себя комфортно в окружении людей.', 'Мен адамдардың ортасында өзімді жайлы сезінемін.', 'I feel comfortable around people.', 'extraversion', false, scale_options),
            (big_five_id, 25, 'Я много говорю.', 'Мен көп сөйлеймін.', 'I talk a lot.', 'extraversion', false, scale_options),
            (big_five_id, 26, 'Я предпочитаю проводить время в одиночестве.', 'Мен уақытты жалғыз өткізгенді жөн көремін.', 'I prefer to spend time alone.', 'extraversion', true, scale_options),
            (big_five_id, 27, 'Я не люблю большие вечеринки.', 'Мен үлкен кештерді ұнатпаймын.', 'I don''t like big parties.', 'extraversion', true, scale_options),
            (big_five_id, 28, 'Я много не говорю.', 'Мен көп сөйлемеймін.', 'I don''t talk a lot.', 'extraversion', true, scale_options),
            (big_five_id, 29, 'Я держусь в тени.', 'Мен көлеңкеде қаламын.', 'I keep in the background.', 'extraversion', true, scale_options),
            (big_five_id, 30, 'Я не люблю привлекать к себе внимание.', 'Мен өзіме назар аударғанды ұнатпаймын.', 'I don''t like to draw attention to myself.', 'extraversion', true, scale_options),
            -- Agreeableness (10)
            (big_five_id, 31, 'Я сочувствую чувствам других.', 'Мен басқалардың сезімдеріне жанашырлық танытамын.', 'I sympathize with others'' feelings.', 'agreeableness', false, scale_options),
            (big_five_id, 32, 'У меня мягкое сердце.', 'Менің жүрегім жұмсақ.', 'I have a soft heart.', 'agreeableness', false, scale_options),
            (big_five_id, 33, 'Я нахожу время для других.', 'Мен басқаларға уақыт табамын.', 'I make time for others.', 'agreeableness', false, scale_options),
            (big_five_id, 34, 'Я чувствую эмоции других.', 'Мен басқалардың эмоцияларын сезінемін.', 'I feel others'' emotions.', 'agreeableness', false, scale_options),
            (big_five_id, 35, 'Я стараюсь, чтобы люди чувствовали себя комфортно.', 'Мен адамдардың өздерін жайлы сезінуіне тырысамын.', 'I try to make people feel at ease.', 'agreeableness', false, scale_options),
            (big_five_id, 36, 'Меня не очень интересуют проблемы других.', 'Мені басқалардың мәселелері қатты қызықтырмайды.', 'I am not really interested in others'' problems.', 'agreeableness', true, scale_options),
            (big_five_id, 37, 'Я могу быть резок с людьми.', 'Мен адамдармен қатал болуым мүмкін.', 'I can be harsh with people.', 'agreeableness', true, scale_options),
            (big_five_id, 38, 'Меня не очень интересуют другие люди.', 'Мені басқа адамдар қатты қызықтырмайды.', 'I am not very interested in other people.', 'agreeableness', true, scale_options),
            (big_five_id, 39, 'Я оскорбляю людей.', 'Мен адамдарды ренжітемін.', 'I insult people.', 'agreeableness', true, scale_options),
            (big_five_id, 40, 'Я не склонен к сотрудничеству.', 'Мен ынтымақтастыққа бейім емеспін.', 'I am not inclined to cooperate.', 'agreeableness', true, scale_options),
            -- Neuroticism (10)
            (big_five_id, 41, 'Я легко впадаю в стресс.', 'Мен оңай стресске түсемін.', 'I get stressed out easily.', 'neuroticism', false, scale_options),
            (big_five_id, 42, 'Я часто беспокоюсь.', 'Мен жиі уайымдаймын.', 'I worry a lot.', 'neuroticism', false, scale_options),
            (big_five_id, 43, 'Я легко расстраиваюсь.', 'Мен оңай ренжимін.', 'I get upset easily.', 'neuroticism', false, scale_options),
            (big_five_id, 44, 'У меня частые перепады настроения.', 'Менің көңіл-күйім жиі өзгереді.', 'I have frequent mood swings.', 'neuroticism', false, scale_options),
            (big_five_id, 45, 'Я легко раздражаюсь.', 'Мен оңай ашуланамын.', 'I get irritated easily.', 'neuroticism', false, scale_options),
            (big_five_id, 46, 'Я большую часть времени расслаблен.', 'Мен көп уақыт бойы босаңсыған күйде боламын.', 'I am relaxed most of the time.', 'neuroticism', true, scale_options),
            (big_five_id, 47, 'Я редко чувствую себя подавленным.', 'Мен сирек жабырқаймын.', 'I seldom feel blue.', 'neuroticism', true, scale_options),
            (big_five_id, 48, 'Я эмоционально стабилен.', 'Мен эмоционалды тұрақтымын.', 'I am emotionally stable.', 'neuroticism', true, scale_options),
            (big_five_id, 49, 'Я редко испытываю тревогу.', 'Мен сирек мазасызданамын.', 'I rarely feel anxious.', 'neuroticism', true, scale_options),
            (big_five_id, 50, 'Мое настроение стабильно.', 'Менің көңіл-күйім тұрақты.', 'My mood is stable.', 'neuroticism', true, scale_options);

        -- Вопросы для MBTI (60 вопросов)
        DECLARE
            mbti_options jsonb;
        BEGIN
            -- E/I
            mbti_options := '{"ru": ["Да", "Нет"], "kk": ["Иә", "Жоқ"], "en": ["Yes", "No"], "values": [1, 0]}';
            INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
            VALUES
                (mbti_id, 1, 'После общения с людьми я обычно чувствую прилив энергии.', 'Адамдармен қарым-қатынастан кейін мен әдетте қуат сезінемін.', 'After socializing, I usually feel energized.', 'EI', false, mbti_options),
                (mbti_id, 2, 'Я предпочитаю выражать свои мысли, а не держать их при себе.', 'Мен өз ойымды ішімде сақтағаннан гөрі, оны білдіргенді жөн көремін.', 'I prefer to express my thoughts rather than keep them to myself.', 'EI', false, mbti_options),
                (mbti_id, 3, 'Мне нравится знакомиться с новыми людьми.', 'Маған жаңа адамдармен танысқан ұнайды.', 'I enjoy meeting new people.', 'EI', false, mbti_options),
                (mbti_id, 4, 'Я часто выступаю инициатором разговора.', 'Мен жиі әңгімені бастаушы боламын.', 'I often initiate conversations.', 'EI', false, mbti_options),
                (mbti_id, 5, 'Большие компании меня заряжают энергией.', 'Үлкен компаниялар маған қуат береді.', 'Large groups energize me.', 'EI', false, mbti_options),
                (mbti_id, 6, 'Я предпочитаю слушать, а не говорить.', 'Мен сөйлегеннен гөрі тыңдағанды жөн көремін.', 'I prefer listening to talking.', 'EI', true, mbti_options),
                (mbti_id, 7, 'Мне нужно время в одиночестве, чтобы восстановить силы.', 'Маған күш-қуатымды қалпына келтіру үшін жалғыздық қажет.', 'I need time alone to recharge.', 'EI', true, mbti_options),
                (mbti_id, 8, 'Я обдумываю вещи про себя.', 'Мен іштей ойланамын.', 'I reflect on things internally.', 'EI', true, mbti_options),
                (mbti_id, 9, 'Я предпочитаю общаться с несколькими близкими друзьями, а не с большой компанией.', 'Мен үлкен компаниядан гөрі бірнеше жақын доспен араласқанды жөн көремін.', 'I prefer to socialize with a few close friends rather than a large group.', 'EI', true, mbti_options),
                (mbti_id, 10, 'Я не люблю быть в центре внимания.', 'Мен назар ортасында болғанды ұнатпаймын.', 'I dislike being the center of attention.', 'EI', true, mbti_options);
            -- S/N
            mbti_options := '{"ru": ["Да", "Нет"], "kk": ["Иә", "Жоқ"], "en": ["Yes", "No"], "values": [1, 0]}';
            INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
            VALUES
                (mbti_id, 11, 'Я больше доверяю фактам, чем теориям.', 'Мен теориялардан гөрі фактілерге көбірек сенемін.', 'I trust facts more than theories.', 'SN', false, mbti_options),
                (mbti_id, 12, 'Я предпочитаю работать с конкретными данными.', 'Мен нақты деректермен жұмыс істегенді жөн көремін.', 'I prefer to work with concrete data.', 'SN', false, mbti_options),
                (mbti_id, 13, 'Я замечаю детали, которые другие упускают.', 'Мен басқалар байқамайтын бөлшектерді байқаймын.', 'I notice details that others miss.', 'SN', false, mbti_options),
                (mbti_id, 14, 'Я реалист.', 'Мен реалистпін.', 'I am a realist.', 'SN', false, mbti_options),
                (mbti_id, 15, 'Я живу настоящим моментом.', 'Мен осы сәтпен өмір сүремін.', 'I live in the present moment.', 'SN', false, mbti_options),
                (mbti_id, 16, 'Меня больше интересуют возможности, чем реальность.', 'Мені шындықтан гөрі мүмкіндіктер көбірек қызықтырады.', 'I am more interested in possibilities than reality.', 'SN', true, mbti_options),
                (mbti_id, 17, 'Я часто витаю в облаках.', 'Мен жиі қиялдаймын.', 'I often daydream.', 'SN', true, mbti_options),
                (mbti_id, 18, 'Я люблю обсуждать абстрактные концепции.', 'Мен абстрактілі тұжырымдамаларды талқылағанды ұнатамын.', 'I enjoy discussing abstract concepts.', 'SN', true, mbti_options),
                (mbti_id, 19, 'Я доверяю своей интуиции.', 'Мен өз интуицияма сенемін.', 'I trust my intuition.', 'SN', true, mbti_options),
                (mbti_id, 20, 'Я думаю о будущем.', 'Мен болашақ туралы ойлаймын.', 'I think about the future.', 'SN', true, mbti_options);
            -- T/F
            mbti_options := '{"ru": ["Да", "Нет"], "kk": ["Иә", "Жоқ"], "en": ["Yes", "No"], "values": [1, 0]}';
            INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
            VALUES
                (mbti_id, 21, 'При принятии решений я руководствуюсь логикой.', 'Шешім қабылдағанда мен логиканы басшылыққа аламын.', 'I am guided by logic when making decisions.', 'TF', false, mbti_options),
                (mbti_id, 22, 'Я ценю объективность и справедливость.', 'Мен объективтілік пен әділдікті бағалаймын.', 'I value objectivity and fairness.', 'TF', false, mbti_options),
                (mbti_id, 23, 'Я могу быть критичным.', 'Мен сыншыл бола аламын.', 'I can be critical.', 'TF', false, mbti_options),
                (mbti_id, 24, 'Я предпочитаю правду, даже если она ранит.', 'Мен шындықты, тіпті ол ауыр тисе де, жөн көремін.', 'I prefer the truth, even if it hurts.', 'TF', false, mbti_options),
                (mbti_id, 25, 'Я анализирую плюсы и минусы.', 'Мен артықшылықтар мен кемшіліктерді талдаймын.', 'I analyze the pros and cons.', 'TF', false, mbti_options),
                (mbti_id, 26, 'Я принимаю решения, основываясь на своих чувствах.', 'Мен өз сезімдеріме сүйеніп шешім қабылдаймын.', 'I make decisions based on my feelings.', 'TF', true, mbti_options),
                (mbti_id, 27, 'Я учитываю, как мои решения повлияют на других.', 'Мен шешімдерімнің басқаларға қалай әсер ететінін ескеремін.', 'I consider how my decisions will affect others.', 'TF', true, mbti_options),
                (mbti_id, 28, 'Я стремлюсь к гармонии.', 'Мен үйлесімділікке ұмтыламын.', 'I strive for harmony.', 'TF', true, mbti_options),
                (mbti_id, 29, 'Я эмпатичен.', 'Мен эмпатиялымын.', 'I am empathetic.', 'TF', true, mbti_options),
                (mbti_id, 30, 'Я избегаю конфликтов.', 'Мен қақтығыстардан аулақ боламын.', 'I avoid conflicts.', 'TF', true, mbti_options);
            -- J/P
            mbti_options := '{"ru": ["Да", "Нет"], "kk": ["Иә", "Жоқ"], "en": ["Yes", "No"], "values": [1, 0]}';
            INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
            VALUES
                (mbti_id, 31, 'Я люблю, когда все спланировано.', 'Маған бәрі жоспарланған кезде ұнайды.', 'I like to have things planned.', 'JP', false, mbti_options),
                (mbti_id, 32, 'Я придерживаюсь сроков.', 'Мен мерзімдерді сақтаймын.', 'I stick to deadlines.', 'JP', false, mbti_options),
                (mbti_id, 33, 'Я люблю доводить дела до конца.', 'Мен істерді соңына дейін жеткізгенді ұнатамын.', 'I like to finish things.', 'JP', false, mbti_options),
                (mbti_id, 34, 'Я организован.', 'Мен ұйымшылмын.', 'I am organized.', 'JP', false, mbti_options),
                (mbti_id, 35, 'Я предпочитаю определенность.', 'Мен анықтылықты жөн көремін.', 'I prefer certainty.', 'JP', false, mbti_options),
                (mbti_id, 36, 'Я люблю оставлять варианты открытыми.', 'Мен нұсқаларды ашық қалдырғанды ұнатамын.', 'I like to keep my options open.', 'JP', true, mbti_options),
                (mbti_id, 37, 'Я спонтанен.', 'Мен спонтандымын.', 'I am spontaneous.', 'JP', true, mbti_options),
                (mbti_id, 38, 'Я легко адаптируюсь к новым ситуациям.', 'Мен жаңа жағдайларға оңай бейімделемін.', 'I adapt easily to new situations.', 'JP', true, mbti_options),
                (mbti_id, 39, 'Мне нравится гибкость.', 'Маған икемділік ұнайды.', 'I enjoy flexibility.', 'JP', true, mbti_options),
                (mbti_id, 40, 'Я люблю начинать новые проекты, но не всегда их заканчиваю.', 'Мен жаңа жобаларды бастағанды ұнатамын, бірақ оларды әрқашан аяқтамаймын.', 'I like to start new projects, but don''t always finish them.', 'JP', true, mbti_options);
        END;

        -- Вопросы для DISC (40 вопросов)
        DECLARE
            disc_options jsonb := '{
                "ru": ["Очень похоже на меня", "Похоже на меня", "Не очень похоже на меня", "Совсем не похоже на меня"],
                "kk": ["Маған өте ұқсайды", "Маған ұқсайды", "Маған онша ұқсамайды", "Маған мүлдем ұқсамайды"],
                "en": ["Very much like me", "Like me", "Not much like me", "Not at all like me"],
                "values": [3, 2, 1, 0]
            }';
        BEGIN
            INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
            VALUES
                -- D (10)
                (disc_id, 1, 'Я принимаю решения быстро.', 'Мен тез шешім қабылдаймын.', 'I make decisions quickly.', 'D', false, disc_options),
                (disc_id, 2, 'Я люблю вызовы.', 'Мен қиындықтарды ұнатамын.', 'I love challenges.', 'D', false, disc_options),
                (disc_id, 3, 'Я прямолинеен.', 'Мен турашылмын.', 'I am direct.', 'D', false, disc_options),
                (disc_id, 4, 'Я ориентирован на результат.', 'Мен нәтижеге бағытталғанмын.', 'I am results-oriented.', 'D', false, disc_options),
                (disc_id, 5, 'Я беру на себя ответственность.', 'Мен жауапкершілікті өз мойныма аламын.', 'I take charge.', 'D', false, disc_options),
                -- I (10)
                (disc_id, 11, 'Я оптимист.', 'Мен оптимистпін.', 'I am optimistic.', 'I', false, disc_options),
                (disc_id, 12, 'Я люблю общаться.', 'Мен араласқанды ұнатамын.', 'I love to socialize.', 'I', false, disc_options),
                (disc_id, 13, 'Я легко вдохновляю других.', 'Мен басқаларды оңай шабыттандырамын.', 'I easily inspire others.', 'I', false, disc_options),
                (disc_id, 14, 'Я разговорчив.', 'Мен сөйлегенді жақсы көремін.', 'I am talkative.', 'I', false, disc_options),
                (disc_id, 15, 'Я энтузиаст.', 'Мен энтузиастпын.', 'I am enthusiastic.', 'I', false, disc_options),
                -- S (10)
                (disc_id, 21, 'Я терпелив.', 'Мен сабырлымын.', 'I am patient.', 'S', false, disc_options),
                (disc_id, 22, 'Я хороший слушатель.', 'Мен жақсы тыңдаушымын.', 'I am a good listener.', 'S', false, disc_options),
                (disc_id, 23, 'Я предпочитаю стабильность.', 'Мен тұрақтылықты жөн көремін.', 'I prefer stability.', 'S', false, disc_options),
                (disc_id, 24, 'Я надежен.', 'Мен сенімдімін.', 'I am reliable.', 'S', false, disc_options),
                (disc_id, 25, 'Я поддерживаю других.', 'Мен басқаларды қолдаймын.', 'I am supportive of others.', 'S', false, disc_options),
                -- C (10)
                (disc_id, 31, 'Я точен.', 'Мен дәлмін.', 'I am accurate.', 'C', false, disc_options),
                (disc_id, 32, 'Я следую правилам.', 'Мен ережелерді сақтаймын.', 'I follow the rules.', 'C', false, disc_options),
                (disc_id, 33, 'Я аналитичен.', 'Мен аналитикпін.', 'I am analytical.', 'C', false, disc_options),
                (disc_id, 34, 'Я обращаю внимание на детали.', 'Мен егжей-тегжейге назар аударамын.', 'I pay attention to details.', 'C', false, disc_options),
                (disc_id, 35, 'Я систематичен.', 'Мен жүйелімін.', 'I am systematic.', 'C', false, disc_options);
        END;

        -- Вопросы для EQ, Soft Skills, Motivation (используют scale_options)
        INSERT INTO public.test_questions (test_id, question_number, text_ru, text_kk, text_en, scale_code, reverse_scored, options)
        VALUES
            -- EQ (40)
            (eq_id, 1, 'Я хорошо осознаю свои эмоции в момент их возникновения.', 'Мен өз эмоцияларымды пайда болған сәтте жақсы түсінемін.', 'I am well aware of my emotions as they arise.', 'self_awareness', false, scale_options),
            (eq_id, 2, 'Я понимаю, как мои чувства влияют на мои мысли и поведение.', 'Менің сезімдерімнің ойларыма және мінез-құлқыма қалай әсер ететінін түсінемін.', 'I understand how my feelings affect my thoughts and behavior.', 'self_awareness', false, scale_options),
            (eq_id, 11, 'Я способен сохранять спокойствие в стрессовых ситуациях.', 'Мен стресстік жағдайларда сабырлы бола аламын.', 'I am able to stay calm in stressful situations.', 'self_management', false, scale_options),
            (eq_id, 12, 'Я могу контролировать свои импульсивные реакции.', 'Мен өз импульсивті реакцияларымды бақылай аламын.', 'I can control my impulsive reactions.', 'self_management', false, scale_options),
            (eq_id, 21, 'Я легко понимаю эмоциональное состояние других людей.', 'Мен басқа адамдардың эмоционалдық жағдайын жеңіл түсінемін.', 'I easily understand the emotional state of other people.', 'social_awareness', false, scale_options),
            (eq_id, 22, 'Я замечаю невербальные сигналы в общении.', 'Мен қарым-қатынаста вербалды емес сигналдарды байқаймын.', 'I notice non-verbal cues in communication.', 'social_awareness', false, scale_options),
            (eq_id, 31, 'Я умею эффективно разрешать конфликты.', 'Мен қақтығыстарды тиімді шешуді білемін.', 'I know how to resolve conflicts effectively.', 'relationship_management', false, scale_options),
            (eq_id, 32, 'Я могу вдохновлять и мотивировать других.', 'Мен басқаларды шабыттандырып, ынталандыра аламын.', 'I can inspire and motivate others.', 'relationship_management', false, scale_options),
            -- Soft Skills (50)
            (soft_skills_id, 1, 'Я ясно и четко излагаю свои мысли.', 'Мен өз ойымды анық және нақты жеткіземін.', 'I express my thoughts clearly and concisely.', 'communication', false, scale_options),
            (soft_skills_id, 11, 'Я эффективно сотрудничаю с коллегами для достижения общей цели.', 'Мен ортақ мақсатқа жету үшін әріптестеріммен тиімді ынтымақтасамын.', 'I collaborate effectively with colleagues to achieve a common goal.', 'teamwork', false, scale_options),
            (soft_skills_id, 21, 'Я анализирую информацию из разных источников перед принятием решения.', 'Мен шешім қабылдамас бұрын әртүрлі дереккөздерден алынған ақпаратты талдаймын.', 'I analyze information from various sources before making a decision.', 'critical_thinking', false, scale_options),
            (soft_skills_id, 31, 'Я быстро приспосабливаюсь к изменениям в рабочих процессах.', 'Мен жұмыс процестеріндегі өзгерістерге тез бейімделемін.', 'I quickly adapt to changes in work processes.', 'adaptability', false, scale_options),
            (soft_skills_id, 41, 'Я часто предлагаю новые идеи для улучшения работы.', 'Мен жұмысты жақсарту үшін жиі жаңа идеялар ұсынамын.', 'I often propose new ideas to improve work.', 'initiative', false, scale_options),
            -- Motivation (60)
            (motivation_id, 1, 'Для меня важно достигать сложных целей.', 'Мен үшін қиын мақсаттарға жету маңызды.', 'It is important for me to achieve challenging goals.', 'achievement', false, scale_options),
            (motivation_id, 11, 'Мне нравится влиять на принятие решений.', 'Маған шешім қабылдауға әсер еткен ұнайды.', 'I like to influence decision-making.', 'power', false, scale_options),
            (motivation_id, 21, 'Для меня важны хорошие отношения с коллегами.', 'Мен үшін әріптестермен жақсы қарым-қатынас маңызды.', 'Good relationships with colleagues are important to me.', 'affiliation', false, scale_options),
            (motivation_id, 31, 'Я предпочитаю самостоятельно определять, как выполнять свою работу.', 'Мен өз жұмысымды қалай орындау керектігін өзім анықтағанды жөн көремін.', 'I prefer to decide for myself how to do my work.', 'autonomy', false, scale_options),
            (motivation_id, 41, 'Стабильность и предсказуемость в работе важны для меня.', 'Жұмыстағы тұрақтылық пен болжамдылық мен үшін маңызды.', 'Stability and predictability at work are important to me.', 'security', false, scale_options),
            (motivation_id, 51, 'Я постоянно ищу возможности для обучения и профессионального роста.', 'Мен үнемі оқу және кәсіби өсу мүмкіндіктерін іздеймін.', 'I am constantly looking for opportunities for learning and professional growth.', 'growth', false, scale_options);
    END;
END $$;
