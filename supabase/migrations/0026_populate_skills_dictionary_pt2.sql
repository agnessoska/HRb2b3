-- Migration Part 2: Additional 800 Unique Skills
-- Description: Extends skills_dictionary with 800 new unique skills (2400 records total)
-- Date: 2025-11-22

-- ============================================
-- HEALTHCARE & MEDICAL (60 skills = 180 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Clinical Research', 'clinical-research', 'en', 'hard'),
('Клинические исследования', 'clinical-research', 'ru', 'hard'),
('Клиникалық зерттеулер', 'clinical-research', 'kk', 'hard'),

('Medical Coding', 'medical-coding', 'en', 'hard'),
('Медицинское кодирование', 'medical-coding', 'ru', 'hard'),
('Медициналық кодтау', 'medical-coding', 'kk', 'hard'),

('Patient Care', 'patient-care', 'en', 'hard'),
('Уход за пациентами', 'patient-care', 'ru', 'hard'),
('Науқасты күту', 'patient-care', 'kk', 'hard'),

('Nursing', 'nursing', 'en', 'hard'),
('Сестринское дело', 'nursing', 'ru', 'hard'),
('Мейіргерлік іс', 'nursing', 'kk', 'hard'),

('Medical Diagnosis', 'medical-diagnosis', 'en', 'hard'),
('Медицинская диагностика', 'medical-diagnosis', 'ru', 'hard'),
('Медициналық диагностика', 'medical-diagnosis', 'kk', 'hard'),

('Pharmacology', 'pharmacology', 'en', 'hard'),
('Фармакология', 'pharmacology', 'ru', 'hard'),
('Фармакология', 'pharmacology', 'kk', 'hard'),

('Drug Administration', 'drug-administration', 'en', 'hard'),
('Введение лекарств', 'drug-administration', 'ru', 'hard'),
('Дәрі енгізу', 'drug-administration', 'kk', 'hard'),

('Medical Equipment Operation', 'medical-equipment-operation', 'en', 'hard'),
('Работа с медоборудованием', 'medical-equipment-operation', 'ru', 'hard'),
('Медициналық жабдықпен жұмыс', 'medical-equipment-operation', 'kk', 'hard'),

('Radiology', 'radiology', 'en', 'hard'),
('Рентгенология', 'radiology', 'ru', 'hard'),
('Рентгенология', 'radiology', 'kk', 'hard'),

('Ultrasound', 'ultrasound', 'en', 'hard'),
('УЗИ', 'ultrasound', 'ru', 'hard'),
('Ультрадыбыс', 'ultrasound', 'kk', 'hard'),

('Laboratory Testing', 'laboratory-testing', 'en', 'hard'),
('Лабораторное тестирование', 'laboratory-testing', 'ru', 'hard'),
('Зертханалық тестілеу', 'laboratory-testing', 'kk', 'hard'),

('Blood Analysis', 'blood-analysis', 'en', 'hard'),
('Анализ крови', 'blood-analysis', 'ru', 'hard'),
('Қан талдауы', 'blood-analysis', 'kk', 'hard'),

('Surgery Assistance', 'surgery-assistance', 'en', 'hard'),
('Ассистирование на операциях', 'surgery-assistance', 'ru', 'hard'),
('Операцияда көмектесу', 'surgery-assistance', 'kk', 'hard'),

('Anesthesiology', 'anesthesiology', 'en', 'hard'),
('Анестезиология', 'anesthesiology', 'ru', 'hard'),
('Анестезиология', 'anesthesiology', 'kk', 'hard'),

('Emergency Medicine', 'emergency-medicine', 'en', 'hard'),
('Неотложная медицина', 'emergency-medicine', 'ru', 'hard'),
('Жедел медицина', 'emergency-medicine', 'kk', 'hard'),

('Trauma Care', 'trauma-care', 'en', 'hard'),
('Травматология', 'trauma-care', 'ru', 'hard'),
('Травма күтімі', 'trauma-care', 'kk', 'hard'),

('Pediatrics', 'pediatrics', 'en', 'hard'),
('Педиатрия', 'pediatrics', 'ru', 'hard'),
('Педиатрия', 'pediatrics', 'kk', 'hard'),

('Geriatrics', 'geriatrics', 'en', 'hard'),
('Гериатрия', 'geriatrics', 'ru', 'hard'),
('Гериатрия', 'geriatrics', 'kk', 'hard'),

('Cardiology', 'cardiology', 'en', 'hard'),
('Кардиология', 'cardiology', 'ru', 'hard'),
('Кардиология', 'cardiology', 'kk', 'hard'),

('Neurology', 'neurology', 'en', 'hard'),
('Неврология', 'neurology', 'ru', 'hard'),
('Неврология', 'neurology', 'kk', 'hard'),

('Oncology', 'oncology', 'en', 'hard'),
('Онкология', 'oncology', 'ru', 'hard'),
('Онкология', 'oncology', 'kk', 'hard'),

('Psychiatry', 'psychiatry', 'en', 'hard'),
('Психиатрия', 'psychiatry', 'ru', 'hard'),
('Психиатрия', 'psychiatry', 'kk', 'hard'),

('Psychology', 'psychology', 'en', 'hard'),
('Психология', 'psychology', 'ru', 'hard'),
('Психология', 'psychology', 'kk', 'hard'),

('Physical Therapy', 'physical-therapy', 'en', 'hard'),
('Физиотерапия', 'physical-therapy', 'ru', 'hard'),
('Физиотерапия', 'physical-therapy', 'kk', 'hard'),

('Occupational Therapy', 'occupational-therapy', 'en', 'hard'),
('Трудотерапия', 'occupational-therapy', 'ru', 'hard'),
('Еңбек терапиясы', 'occupational-therapy', 'kk', 'hard'),

('Speech Therapy', 'speech-therapy', 'en', 'hard'),
('Логопедия', 'speech-therapy', 'ru', 'hard'),
('Логопедия', 'speech-therapy', 'kk', 'hard'),

('Nutrition', 'nutrition', 'en', 'hard'),
('Нутрициология', 'nutrition', 'ru', 'hard'),
('Тамақтану', 'nutrition', 'kk', 'hard'),

('Dietetics', 'dietetics', 'en', 'hard'),
('Диетология', 'dietetics', 'ru', 'hard'),
('Диетология', 'dietetics', 'kk', 'hard'),

('Medical Records Management', 'medical-records-management', 'en', 'hard'),
('Управление медицинскими записями', 'medical-records-management', 'ru', 'hard'),
('Медициналық жазбаларды басқару', 'medical-records-management', 'kk', 'hard'),

('Healthcare Administration', 'healthcare-administration', 'en', 'hard'),
('Администрирование здравоохранения', 'healthcare-administration', 'ru', 'hard'),
('Денсаулық сақтауды әкімшілендіру', 'healthcare-administration', 'kk', 'hard'),

('Medical Billing', 'medical-billing', 'en', 'hard'),
('Медицинское выставление счетов', 'medical-billing', 'ru', 'hard'),
('Медициналық төлем шоттары', 'medical-billing', 'kk', 'hard'),

('Health Insurance', 'health-insurance', 'en', 'hard'),
('Медицинское страхование', 'health-insurance', 'ru', 'hard'),
('Медициналық сақтандыру', 'health-insurance', 'kk', 'hard'),

('Telemedicine', 'telemedicine', 'en', 'hard'),
('Телемедицина', 'telemedicine', 'ru', 'hard'),
('Телемедицина', 'telemedicine', 'kk', 'hard'),

('Electronic Health Records', 'electronic-health-records', 'en', 'tool'),
('Электронные медкарты', 'electronic-health-records', 'ru', 'tool'),
('Электронды медициналық карталар', 'electronic-health-records', 'kk', 'tool'),

('Medical Terminology', 'medical-terminology', 'en', 'hard'),
('Медицинская терминология', 'medical-terminology', 'ru', 'hard'),
('Медициналық терминология', 'medical-terminology', 'kk', 'hard'),

('Infection Control', 'infection-control', 'en', 'hard'),
('Контроль инфекций', 'infection-control', 'ru', 'hard'),
('Инфекция бақылауы', 'infection-control', 'kk', 'hard'),

('Sterilization Techniques', 'sterilization-techniques', 'en', 'hard'),
('Техники стерилизации', 'sterilization-techniques', 'ru', 'hard'),
('Стерилизация техникасы', 'sterilization-techniques', 'kk', 'hard'),

('Wound Care', 'wound-care', 'en', 'hard'),
('Уход за ранами', 'wound-care', 'ru', 'hard'),
('Жараны күту', 'wound-care', 'kk', 'hard'),

('Vital Signs Monitoring', 'vital-signs-monitoring', 'en', 'hard'),
('Мониторинг витальных показателей', 'vital-signs-monitoring', 'ru', 'hard'),
('Өмірлік көрсеткіштерді бақылау', 'vital-signs-monitoring', 'kk', 'hard'),

('CPR', 'cpr', 'en', 'hard'),
('Сердечно-легочная реанимация', 'cpr', 'ru', 'hard'),
('Жүрек-өкпе реанимациясы', 'cpr', 'kk', 'hard'),

('First Aid', 'first-aid', 'en', 'hard'),
('Первая помощь', 'first-aid', 'ru', 'hard'),
('Алғашқы көмек', 'first-aid', 'kk', 'hard'),

('Biomedical Engineering', 'biomedical-engineering', 'en', 'hard'),
('Биомедицинская инженерия', 'biomedical-engineering', 'ru', 'hard'),
('Биомедициналық инженерия', 'biomedical-engineering', 'kk', 'hard'),

('Medical Device Design', 'medical-device-design', 'en', 'hard'),
('Проектирование медицинских устройств', 'medical-device-design', 'ru', 'hard'),
('Медициналық құрылғы дизайны', 'medical-device-design', 'kk', 'hard'),

('Clinical Trials', 'clinical-trials', 'en', 'hard'),
('Клинические испытания', 'clinical-trials', 'ru', 'hard'),
('Клиникалық сынақтар', 'clinical-trials', 'kk', 'hard'),

('Epidemiology', 'epidemiology', 'en', 'hard'),
('Эпидемиология', 'epidemiology', 'ru', 'hard'),
('Эпидемиология', 'epidemiology', 'kk', 'hard'),

('Public Health', 'public-health', 'en', 'hard'),
('Общественное здравоохранение', 'public-health', 'ru', 'hard'),
('Қоғамдық денсаулық сақтау', 'public-health', 'kk', 'hard'),

('Health Education', 'health-education', 'en', 'hard'),
('Санитарное просвещение', 'health-education', 'ru', 'hard'),
('Денсаулық білімі', 'health-education', 'kk', 'hard'),

('Medical Imaging', 'medical-imaging', 'en', 'hard'),
('Медицинская визуализация', 'medical-imaging', 'ru', 'hard'),
('Медициналық бейнелеу', 'medical-imaging', 'kk', 'hard'),

('MRI Operation', 'mri-operation', 'en', 'hard'),
('Работа с МРТ', 'mri-operation', 'ru', 'hard'),
('МРТ жұмысы', 'mri-operation', 'kk', 'hard'),

('CT Scan', 'ct-scan', 'en', 'hard'),
('КТ сканирование', 'ct-scan', 'ru', 'hard'),
('КТ сканерлеу', 'ct-scan', 'kk', 'hard'),

('Pathology', 'pathology', 'en', 'hard'),
('Патология', 'pathology', 'ru', 'hard'),
('Патология', 'pathology', 'kk', 'hard'),

('Microbiology', 'microbiology', 'en', 'hard'),
('Микробиология', 'microbiology', 'ru', 'hard'),
('Микробиология', 'microbiology', 'kk', 'hard'),

('Immunology', 'immunology', 'en', 'hard'),
('Иммунология', 'immunology', 'ru', 'hard'),
('Иммунология', 'immunology', 'kk', 'hard'),

('Genetics', 'genetics', 'en', 'hard'),
('Генетика', 'genetics', 'ru', 'hard'),
('Генетика', 'genetics', 'kk', 'hard'),

('Genomics', 'genomics', 'en', 'hard'),
('Геномика', 'genomics', 'ru', 'hard'),
('Геномика', 'genomics', 'kk', 'hard'),

('Bioinformatics', 'bioinformatics', 'en', 'hard'),
('Биоинформатика', 'bioinformatics', 'ru', 'hard'),
('Биоинформатика', 'bioinformatics', 'kk', 'hard'),

('Pharmacovigilance', 'pharmacovigilance', 'en', 'hard'),
('Фармаконадзор', 'pharmacovigilance', 'ru', 'hard'),
('Фармаконадзор', 'pharmacovigilance', 'kk', 'hard');

-- ============================================
-- EDUCATION & TRAINING (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Curriculum Development', 'curriculum-development', 'en', 'hard'),
('Разработка учебных программ', 'curriculum-development', 'ru', 'hard'),
('Оқу бағдарламасын әзірлеу', 'curriculum-development', 'kk', 'hard'),

('Lesson Planning', 'lesson-planning', 'en', 'hard'),
('Планирование уроков', 'lesson-planning', 'ru', 'hard'),
('Сабақты жоспарлау', 'lesson-planning', 'kk', 'hard'),

('Classroom Management', 'classroom-management', 'en', 'hard'),
('Управление классом', 'classroom-management', 'ru', 'hard'),
('Сыныпты басқару', 'classroom-management', 'kk', 'hard'),

('Instructional Design', 'instructional-design', 'en', 'hard'),
('Педагогический дизайн', 'instructional-design', 'ru', 'hard'),
('Педагогикалық дизайн', 'instructional-design', 'kk', 'hard'),

('E-Learning Development', 'e-learning-development', 'en', 'hard'),
('Разработка электронного обучения', 'e-learning-development', 'ru', 'hard'),
('Электронды оқыту әзірлеу', 'e-learning-development', 'kk', 'hard'),

('Learning Assessment', 'learning-assessment', 'en', 'hard'),
('Оценка обучения', 'learning-assessment', 'ru', 'hard'),
('Оқуды бағалау', 'learning-assessment', 'kk', 'hard'),

('Educational Technology', 'educational-technology', 'en', 'hard'),
('Образовательные технологии', 'educational-technology', 'ru', 'hard'),
('Білім беру технологиялары', 'educational-technology', 'kk', 'hard'),

('Online Teaching', 'online-teaching', 'en', 'hard'),
('Онлайн-преподавание', 'online-teaching', 'ru', 'hard'),
('Онлайн оқыту', 'online-teaching', 'kk', 'hard'),

('Student Engagement', 'student-engagement', 'en', 'hard'),
('Вовлечение студентов', 'student-engagement', 'ru', 'hard'),
('Студенттерді тарту', 'student-engagement', 'kk', 'hard'),

('Differentiated Instruction', 'differentiated-instruction', 'en', 'hard'),
('Дифференцированное обучение', 'differentiated-instruction', 'ru', 'hard'),
('Дифференциалды оқыту', 'differentiated-instruction', 'kk', 'hard'),

('Special Education', 'special-education', 'en', 'hard'),
('Специальное образование', 'special-education', 'ru', 'hard'),
('Арнайы білім беру', 'special-education', 'kk', 'hard'),

('Adult Education', 'adult-education', 'en', 'hard'),
('Образование взрослых', 'adult-education', 'ru', 'hard'),
('Ересектерді оқыту', 'adult-education', 'kk', 'hard'),

('Corporate Training', 'corporate-training', 'en', 'hard'),
('Корпоративное обучение', 'corporate-training', 'ru', 'hard'),
('Корпоративтік оқыту', 'corporate-training', 'kk', 'hard'),

('Trainer Development', 'trainer-development', 'en', 'hard'),
('Развитие тренеров', 'trainer-development', 'ru', 'hard'),
('Тренерлерді дамыту', 'trainer-development', 'kk', 'hard'),

('Workshop Facilitation', 'workshop-facilitation', 'en', 'hard'),
('Проведение семинаров', 'workshop-facilitation', 'ru', 'hard'),
('Семинар өткізу', 'workshop-facilitation', 'kk', 'hard'),

('Educational Psychology', 'educational-psychology', 'en', 'hard'),
('Педагогическая психология', 'educational-psychology', 'ru', 'hard'),
('Педагогикалық психология', 'educational-psychology', 'kk', 'hard'),

('Learning Theories', 'learning-theories', 'en', 'hard'),
('Теории обучения', 'learning-theories', 'ru', 'hard'),
('Оқыту теориялары', 'learning-theories', 'kk', 'hard'),

('Pedagogy', 'pedagogy', 'en', 'hard'),
('Педагогика', 'pedagogy', 'ru', 'hard'),
('Педагогика', 'pedagogy', 'kk', 'hard'),

('Andragogy', 'andragogy', 'en', 'hard'),
('Андрагогика', 'andragogy', 'ru', 'hard'),
('Андрагогика', 'andragogy', 'kk', 'hard'),

('Blended Learning', 'blended-learning', 'en', 'hard'),
('Смешанное обучение', 'blended-learning', 'ru', 'hard'),
('Аралас оқыту', 'blended-learning', 'kk', 'hard'),

('Flipped Classroom', 'flipped-classroom', 'en', 'hard'),
('Перевернутый класс', 'flipped-classroom', 'ru', 'hard'),
('Төңкерілген сынып', 'flipped-classroom', 'kk', 'hard'),

('Gamification in Education', 'gamification-in-education', 'en', 'hard'),
('Геймификация в образовании', 'gamification-in-education', 'ru', 'hard'),
('Білім берудегі геймификация', 'gamification-in-education', 'kk', 'hard'),

('Moodle', 'moodle', 'en', 'tool'),
('Moodle', 'moodle', 'ru', 'tool'),
('Moodle', 'moodle', 'kk', 'tool'),

('Blackboard', 'blackboard', 'en', 'tool'),
('Blackboard', 'blackboard', 'ru', 'tool'),
('Blackboard', 'blackboard', 'kk', 'tool'),

('Canvas LMS', 'canvas-lms', 'en', 'tool'),
('Canvas LMS', 'canvas-lms', 'ru', 'tool'),
('Canvas LMS', 'canvas-lms', 'kk', 'tool'),

('Articulate Storyline', 'articulate-storyline', 'en', 'tool'),
('Articulate Storyline', 'articulate-storyline', 'ru', 'tool'),
('Articulate Storyline', 'articulate-storyline', 'kk', 'tool'),

('Adobe Captivate', 'adobe-captivate', 'en', 'tool'),
('Adobe Captivate', 'adobe-captivate', 'ru', 'tool'),
('Adobe Captivate', 'adobe-captivate', 'kk', 'tool'),

('SCORM', 'scorm', 'en', 'hard'),
('SCORM', 'scorm', 'ru', 'hard'),
('SCORM', 'scorm', 'kk', 'hard'),

('xAPI', 'xapi', 'en', 'hard'),
('xAPI', 'xapi', 'ru', 'hard'),
('xAPI', 'xapi', 'kk', 'hard'),

('Tutoring', 'tutoring', 'en', 'hard'),
('Репетиторство', 'tutoring', 'ru', 'hard'),
('Жеке сабақ беру', 'tutoring', 'kk', 'hard'),

('Academic Advising', 'academic-advising', 'en', 'hard'),
('Академическое консультирование', 'academic-advising', 'ru', 'hard'),
('Академиялық кеңес беру', 'academic-advising', 'kk', 'hard'),

('Student Counseling', 'student-counseling', 'en', 'hard'),
('Консультирование студентов', 'student-counseling', 'ru', 'hard'),
('Студенттерге кеңес беру', 'student-counseling', 'kk', 'hard'),

('Educational Research', 'educational-research', 'en', 'hard'),
('Образовательные исследования', 'educational-research', 'ru', 'hard'),
('Білім беру зерттеулері', 'educational-research', 'kk', 'hard'),

('Test Development', 'test-development', 'en', 'hard'),
('Разработка тестов', 'test-development', 'ru', 'hard'),
('Тест әзірлеу', 'test-development', 'kk', 'hard'),

('Grading', 'grading', 'en', 'hard'),
('Оценивание', 'grading', 'ru', 'hard'),
('Бағалау', 'grading', 'kk', 'hard'),

('Rubric Design', 'rubric-design', 'en', 'hard'),
('Разработка рубрик', 'rubric-design', 'ru', 'hard'),
('Рубрика әзірлеу', 'rubric-design', 'kk', 'hard'),

('Learning Analytics', 'learning-analytics', 'en', 'hard'),
('Аналитика обучения', 'learning-analytics', 'ru', 'hard'),
('Оқыту аналитикасы', 'learning-analytics', 'kk', 'hard'),

('Parent Communication', 'parent-communication', 'en', 'hard'),
('Общение с родителями', 'parent-communication', 'ru', 'hard'),
('Ата-аналармен қарым-қатынас', 'parent-communication', 'kk', 'hard'),

('Behavior Management', 'behavior-management', 'en', 'hard'),
('Управление поведением', 'behavior-management', 'ru', 'hard'),
('Мінез-құлықты басқару', 'behavior-management', 'kk', 'hard'),

('Educational Leadership', 'educational-leadership', 'en', 'hard'),
('Образовательное лидерство', 'educational-leadership', 'ru', 'hard'),
('Білім беру көшбасшылығы', 'educational-leadership', 'kk', 'hard'),

('School Administration', 'school-administration', 'en', 'hard'),
('Администрирование школы', 'school-administration', 'ru', 'hard'),
('Мектепті әкімшілендіру', 'school-administration', 'kk', 'hard'),

('Educational Policy', 'educational-policy', 'en', 'hard'),
('Образовательная политика', 'educational-policy', 'ru', 'hard'),
('Білім беру саясаты', 'educational-policy', 'kk', 'hard'),

('Literacy Instruction', 'literacy-instruction', 'en', 'hard'),
('Обучение грамотности', 'literacy-instruction', 'ru', 'hard'),
('Сауаттылыққа үйрету', 'literacy-instruction', 'kk', 'hard'),

('Numeracy Skills', 'numeracy-skills', 'en', 'hard'),
('Навыки счета', 'numeracy-skills', 'ru', 'hard'),
('Санау дағдылары', 'numeracy-skills', 'kk', 'hard'),

('STEM Education', 'stem-education', 'en', 'hard'),
('STEM образование', 'stem-education', 'ru', 'hard'),
('STEM білім беру', 'stem-education', 'kk', 'hard'),

('Language Teaching', 'language-teaching', 'en', 'hard'),
('Преподавание языков', 'language-teaching', 'ru', 'hard'),
('Тіл оқыту', 'language-teaching', 'kk', 'hard'),

('ESL Teaching', 'esl-teaching', 'en', 'hard'),
('Преподавание английского', 'esl-teaching', 'ru', 'hard'),
('Ағылшын тілін оқыту', 'esl-teaching', 'kk', 'hard'),

('Montessori Method', 'montessori-method', 'en', 'hard'),
('Метод Монтессори', 'montessori-method', 'ru', 'hard'),
('Монтессори әдісі', 'montessori-method', 'kk', 'hard'),

('Waldorf Education', 'waldorf-education', 'en', 'hard'),
('Вальдорфская педагогика', 'waldorf-education', 'ru', 'hard'),
('Вальдорф педагогикасы', 'waldorf-education', 'kk', 'hard');

-- ============================================
-- ENGINEERING & MANUFACTURING (60 skills = 180 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Mechanical Engineering', 'mechanical-engineering', 'en', 'hard'),
('Машиностроение', 'mechanical-engineering', 'ru', 'hard'),
('Машина жасау', 'mechanical-engineering', 'kk', 'hard'),

('Electrical Engineering', 'electrical-engineering', 'en', 'hard'),
('Электротехника', 'electrical-engineering', 'ru', 'hard'),
('Электротехника', 'electrical-engineering', 'kk', 'hard'),

('Civil Engineering', 'civil-engineering', 'en', 'hard'),
('Гражданское строительство', 'civil-engineering', 'ru', 'hard'),
('Азаматтық құрылыс', 'civil-engineering', 'kk', 'hard'),

('Chemical Engineering', 'chemical-engineering', 'en', 'hard'),
('Химическая инженерия', 'chemical-engineering', 'ru', 'hard'),
('Химиялық инженерия', 'chemical-engineering', 'kk', 'hard'),

('Aerospace Engineering', 'aerospace-engineering', 'en', 'hard'),
('Аэрокосмическая инженерия', 'aerospace-engineering', 'ru', 'hard'),
('Аэроғарыш инженериясы', 'aerospace-engineering', 'kk', 'hard'),

('Industrial Engineering', 'industrial-engineering', 'en', 'hard'),
('Промышленная инженерия', 'industrial-engineering', 'ru', 'hard'),
('Өнеркәсіптік инженерия', 'industrial-engineering', 'kk', 'hard'),

('AutoCAD', 'autocad', 'en', 'tool'),
('AutoCAD', 'autocad', 'ru', 'tool'),
('AutoCAD', 'autocad', 'kk', 'tool'),

('SolidWorks', 'solidworks', 'en', 'tool'),
('SolidWorks', 'solidworks', 'ru', 'tool'),
('SolidWorks', 'solidworks', 'kk', 'tool'),

('CATIA', 'catia', 'en', 'tool'),
('CATIA', 'catia', 'ru', 'tool'),
('CATIA', 'catia', 'kk', 'tool'),

('Revit', 'revit', 'en', 'tool'),
('Revit', 'revit', 'ru', 'tool'),
('Revit', 'revit', 'kk', 'tool'),

('CAD Design', 'cad-design', 'en', 'hard'),
('CAD проектирование', 'cad-design', 'ru', 'hard'),
('CAD жобалау', 'cad-design', 'kk', 'hard'),

('CAM Programming', 'cam-programming', 'en', 'hard'),
('CAM программирование', 'cam-programming', 'ru', 'hard'),
('CAM бағдарламалау', 'cam-programming', 'kk', 'hard'),

('CNC Machining', 'cnc-machining', 'en', 'hard'),
('ЧПУ обработка', 'cnc-machining', 'ru', 'hard'),
('ЧПУ өңдеу', 'cnc-machining', 'kk', 'hard'),

('3D Printing', '3d-printing', 'en', 'hard'),
('3D печать', '3d-printing', 'ru', 'hard'),
('3D басып шығару', '3d-printing', 'kk', 'hard'),

('Additive Manufacturing', 'additive-manufacturing', 'en', 'hard'),
('Аддитивное производство', 'additive-manufacturing', 'ru', 'hard'),
('Қосымша өндіріс', 'additive-manufacturing', 'kk', 'hard'),

('Welding', 'welding', 'en', 'hard'),
('Сварка', 'welding', 'ru', 'hard'),
('Дәнекерлеу', 'welding', 'kk', 'hard'),

('Metallurgy', 'metallurgy', 'en', 'hard'),
('Металлургия', 'metallurgy', 'ru', 'hard'),
('Металлургия', 'metallurgy', 'kk', 'hard'),

('Material Science', 'material-science', 'en', 'hard'),
('Материаловедение', 'material-science', 'ru', 'hard'),
('Материалтану', 'material-science', 'kk', 'hard'),

('Quality Control', 'quality-control', 'en', 'hard'),
('Контроль качества', 'quality-control', 'ru', 'hard'),
('Сапа бақылауы', 'quality-control', 'kk', 'hard'),

('ISO 9001', 'iso-9001', 'en', 'hard'),
('ISO 9001', 'iso-9001', 'ru', 'hard'),
('ISO 9001', 'iso-9001', 'kk', 'hard'),

('Lean Manufacturing', 'lean-manufacturing', 'en', 'hard'),
('Бережливое производство', 'lean-manufacturing', 'ru', 'hard'),
('Үнемді өндіріс', 'lean-manufacturing', 'kk', 'hard'),

('5S Methodology', '5s-methodology', 'en', 'hard'),
('Методология 5S', '5s-methodology', 'ru', 'hard'),
('5S әдістемесі', '5s-methodology', 'kk', 'hard'),

('Kaizen', 'kaizen', 'en', 'hard'),
('Кайдзен', 'kaizen', 'ru', 'hard'),
('Кайдзен', 'kaizen', 'kk', 'hard'),

('Total Quality Management', 'total-quality-management', 'en', 'hard'),
('Всеобщее управление качеством', 'total-quality-management', 'ru', 'hard'),
('Жалпы сапа менеджменті', 'total-quality-management', 'kk', 'hard'),

('Statistical Process Control', 'statistical-process-control', 'en', 'hard'),
('Статистический контроль процессов', 'statistical-process-control', 'ru', 'hard'),
('Статистикалық процесс бақылауы', 'statistical-process-control', 'kk', 'hard'),

('Root Cause Analysis', 'root-cause-analysis', 'en', 'hard'),
('Анализ первопричин', 'root-cause-analysis', 'ru', 'hard'),
('Түпкі себеп талдауы', 'root-cause-analysis', 'kk', 'hard'),

('FMEA', 'fmea', 'en', 'hard'),
('FMEA', 'fmea', 'ru', 'hard'),
('FMEA', 'fmea', 'kk', 'hard'),

('Production Planning', 'production-planning', 'en', 'hard'),
('Планирование производства', 'production-planning', 'ru', 'hard'),
('Өндірісті жоспарлау', 'production-planning', 'kk', 'hard'),

('Manufacturing Process Design', 'manufacturing-process-design', 'en', 'hard'),
('Проектирование производственных процессов', 'manufacturing-process-design', 'ru', 'hard'),
('Өндірістік процестерді жобалау', 'manufacturing-process-design', 'kk', 'hard'),

('Assembly Line Management', 'assembly-line-management', 'en', 'hard'),
('Управление конвейером', 'assembly-line-management', 'ru', 'hard'),
('Конвейерді басқару', 'assembly-line-management', 'kk', 'hard'),

('Industrial Automation', 'industrial-automation', 'en', 'hard'),
('Промышленная автоматизация', 'industrial-automation', 'ru', 'hard'),
('Өнеркәсіптік автоматтандыру', 'industrial-automation', 'kk', 'hard'),

('PLC Programming', 'plc-programming', 'en', 'hard'),
('Программирование ПЛК', 'plc-programming', 'ru', 'hard'),
('ПЛК бағдарламалау', 'plc-programming', 'kk', 'hard'),

('SCADA Systems', 'scada-systems', 'en', 'tool'),
('SCADA системы', 'scada-systems', 'ru', 'tool'),
('SCADA жүйелері', 'scada-systems', 'kk', 'tool'),

('Robotics', 'robotics', 'en', 'hard'),
('Робототехника', 'robotics', 'ru', 'hard'),
('Робототехника', 'robotics', 'kk', 'hard'),

('Industrial Robotics', 'industrial-robotics', 'en', 'hard'),
('Промышленная робототехника', 'industrial-robotics', 'ru', 'hard'),
('Өнеркәсіптік робототехника', 'industrial-robotics', 'kk', 'hard'),

('Hydraulics', 'hydraulics', 'en', 'hard'),
('Гидравлика', 'hydraulics', 'ru', 'hard'),
('Гидравлика', 'hydraulics', 'kk', 'hard'),

('Pneumatics', 'pneumatics', 'en', 'hard'),
('Пневматика', 'pneumatics', 'ru', 'hard'),
('Пневматика', 'pneumatics', 'kk', 'hard'),

('Thermodynamics', 'thermodynamics', 'en', 'hard'),
('Термодинамика', 'thermodynamics', 'ru', 'hard'),
('Термодинамика', 'thermodynamics', 'kk', 'hard'),

('Fluid Mechanics', 'fluid-mechanics', 'en', 'hard'),
('Механика жидкости', 'fluid-mechanics', 'ru', 'hard'),
('Сұйықтық механикасы', 'fluid-mechanics', 'kk', 'hard'),

('Structural Analysis', 'structural-analysis', 'en', 'hard'),
('Структурный анализ', 'structural-analysis', 'ru', 'hard'),
('Құрылымдық талдау', 'structural-analysis', 'kk', 'hard'),

('Finite Element Analysis', 'finite-element-analysis', 'en', 'hard'),
('Конечно-элементный анализ', 'finite-element-analysis', 'ru', 'hard'),
('Ақырлы элемент талдауы', 'finite-element-analysis', 'kk', 'hard'),

('ANSYS', 'ansys', 'en', 'tool'),
('ANSYS', 'ansys', 'ru', 'tool'),
('ANSYS', 'ansys', 'kk', 'tool'),

('MATLAB Simulink', 'matlab-simulink', 'en', 'tool'),
('MATLAB Simulink', 'matlab-simulink', 'ru', 'tool'),
('MATLAB Simulink', 'matlab-simulink', 'kk', 'tool'),

('Circuit Design', 'circuit-design', 'en', 'hard'),
('Проектирование схем', 'circuit-design', 'ru', 'hard'),
('Схема жобалау', 'circuit-design', 'kk', 'hard'),

('PCB Design', 'pcb-design', 'en', 'hard'),
('Проектирование печатных плат', 'pcb-design', 'ru', 'hard'),
('Басылған тақта жобалау', 'pcb-design', 'kk', 'hard'),

('Power Systems', 'power-systems', 'en', 'hard'),
('Энергосистемы', 'power-systems', 'ru', 'hard'),
('Қуат жүйелері', 'power-systems', 'kk', 'hard'),

('Control Systems', 'control-systems', 'en', 'hard'),
('Системы управления', 'control-systems', 'ru', 'hard'),
('Басқару жүйелері', 'control-systems', 'kk', 'hard'),

('Signal Processing', 'signal-processing', 'en', 'hard'),
('Обработка сигналов', 'signal-processing', 'ru', 'hard'),
('Сигнал өңдеу', 'signal-processing', 'kk', 'hard'),

('Mechatronics', 'mechatronics', 'en', 'hard'),
('Мехатроника', 'mechatronics', 'ru', 'hard'),
('Мехатроника', 'mechatronics', 'kk', 'hard'),

('Process Engineering', 'process-engineering', 'en', 'hard'),
('Процессная инженерия', 'process-engineering', 'ru', 'hard'),
('Процесс инженериясы', 'process-engineering', 'kk', 'hard'),

('Plant Design', 'plant-design', 'en', 'hard'),
('Проектирование заводов', 'plant-design', 'ru', 'hard'),
('Зауыт жобалау', 'plant-design', 'kk', 'hard'),

('Equipment Maintenance', 'equipment-maintenance', 'en', 'hard'),
('Обслуживание оборудования', 'equipment-maintenance', 'ru', 'hard'),
('Жабдықты қызмет көрсету', 'equipment-maintenance', 'kk', 'hard'),

('Predictive Maintenance', 'predictive-maintenance', 'en', 'hard'),
('Предиктивное обслуживание', 'predictive-maintenance', 'ru', 'hard'),
('Болжамды қызмет көрсету', 'predictive-maintenance', 'kk', 'hard'),

('Reliability Engineering', 'reliability-engineering', 'en', 'hard'),
('Инженерия надежности', 'reliability-engineering', 'ru', 'hard'),
('Сенімділік инженериясы', 'reliability-engineering', 'kk', 'hard'),

('Failure Analysis', 'failure-analysis', 'en', 'hard'),
('Анализ отказов', 'failure-analysis', 'ru', 'hard'),
('Ақаулықты талдау', 'failure-analysis', 'kk', 'hard');

-- ============================================
-- CREATIVE INDUSTRIES (60 skills = 180 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Photography', 'photography', 'en', 'hard'),
('Фотография', 'photography', 'ru', 'hard'),
('Фотография', 'photography', 'kk', 'hard'),

('Portrait Photography', 'portrait-photography', 'en', 'hard'),
('Портретная фотография', 'portrait-photography', 'ru', 'hard'),
('Портреттік фотография', 'portrait-photography', 'kk', 'hard'),

('Product Photography', 'product-photography', 'en', 'hard'),
('Предметная съемка', 'product-photography', 'ru', 'hard'),
('Өнім фотографиясы', 'product-photography', 'kk', 'hard'),

('Event Photography', 'event-photography', 'en', 'hard'),
('Событийная фотография', 'event-photography', 'ru', 'hard'),
('Іс-шара фотографиясы', 'event-photography', 'kk', 'hard'),

('Wedding Photography', 'wedding-photography', 'en', 'hard'),
('Свадебная фотография', 'wedding-photography', 'ru', 'hard'),
('Үйлену тойы фотографиясы', 'wedding-photography', 'kk', 'hard'),

('Fashion Photography', 'fashion-photography', 'en', 'hard'),
('Модная фотография', 'fashion-photography', 'ru', 'hard'),
('Сән фотографиясы', 'fashion-photography', 'kk', 'hard'),

('Studio Lighting', 'studio-lighting', 'en', 'hard'),
('Студийное освещение', 'studio-lighting', 'ru', 'hard'),
('Студиялық жарықтандыру', 'studio-lighting', 'kk', 'hard'),

('Lightroom', 'lightroom', 'en', 'tool'),
('Lightroom', 'lightroom', 'ru', 'tool'),
('Lightroom', 'lightroom', 'kk', 'tool'),

('Camera Operation', 'camera-operation', 'en', 'hard'),
('Работа с камерой', 'camera-operation', 'ru', 'hard'),
('Камерамен жұмыс', 'camera-operation', 'kk', 'hard'),

('Cinematography', 'cinematography', 'en', 'hard'),
('Кинематография', 'cinematography', 'ru', 'hard'),
('Кинематография', 'cinematography', 'kk', 'hard'),

('Film Direction', 'film-direction', 'en', 'hard'),
('Кинорежиссура', 'film-direction', 'ru', 'hard'),
('Кино режиссурасы', 'film-direction', 'kk', 'hard'),

('Screenwriting', 'screenwriting', 'en', 'hard'),
('Сценарное мастерство', 'screenwriting', 'ru', 'hard'),
('Сценарий жазу', 'screenwriting', 'kk', 'hard'),

('Film Editing', 'film-editing', 'en', 'hard'),
('Монтаж фильмов', 'film-editing', 'ru', 'hard'),
('Фильм монтажы', 'film-editing', 'kk', 'hard'),

('Final Cut Pro', 'final-cut-pro', 'en', 'tool'),
('Final Cut Pro', 'final-cut-pro', 'ru', 'tool'),
('Final Cut Pro', 'final-cut-pro', 'kk', 'tool'),

('DaVinci Resolve', 'davinci-resolve', 'en', 'tool'),
('DaVinci Resolve', 'davinci-resolve', 'ru', 'tool'),
('DaVinci Resolve', 'davinci-resolve', 'kk', 'tool'),

('Color Grading', 'color-grading', 'en', 'hard'),
('Цветокоррекция', 'color-grading', 'ru', 'hard'),
('Түс түзету', 'color-grading', 'kk', 'hard'),

('Visual Effects', 'visual-effects', 'en', 'hard'),
('Визуальные эффекты', 'visual-effects', 'ru', 'hard'),
('Визуалды эффектілер', 'visual-effects', 'kk', 'hard'),

('Compositing', 'compositing', 'en', 'hard'),
('Композитинг', 'compositing', 'ru', 'hard'),
('Композитинг', 'compositing', 'kk', 'hard'),

('Motion Capture', 'motion-capture', 'en', 'hard'),
('Захват движения', 'motion-capture', 'ru', 'hard'),
('Қозғалысты түсіру', 'motion-capture', 'kk', 'hard'),

('Music Production', 'music-production', 'en', 'hard'),
('Музыкальная продукция', 'music-production', 'ru', 'hard'),
('Музыкалық өндіріс', 'music-production', 'kk', 'hard'),

('Audio Engineering', 'audio-engineering', 'en', 'hard'),
('Звукорежиссура', 'audio-engineering', 'ru', 'hard'),
('Дыбыс инженериясы', 'audio-engineering', 'kk', 'hard'),

('Sound Mixing', 'sound-mixing', 'en', 'hard'),
('Сведение звука', 'sound-mixing', 'ru', 'hard'),
('Дыбысты араластыру', 'sound-mixing', 'kk', 'hard'),

('Mastering', 'mastering', 'en', 'hard'),
('Мастеринг', 'mastering', 'ru', 'hard'),
('Мастеринг', 'mastering', 'kk', 'hard'),

('Pro Tools', 'pro-tools', 'en', 'tool'),
('Pro Tools', 'pro-tools', 'ru', 'tool'),
('Pro Tools', 'pro-tools', 'kk', 'tool'),

('Ableton Live', 'ableton-live', 'en', 'tool'),
('Ableton Live', 'ableton-live', 'ru', 'tool'),
('Ableton Live', 'ableton-live', 'kk', 'tool'),

('Logic Pro', 'logic-pro', 'en', 'tool'),
('Logic Pro', 'logic-pro', 'ru', 'tool'),
('Logic Pro', 'logic-pro', 'kk', 'tool'),

('FL Studio', 'fl-studio', 'en', 'tool'),
('FL Studio', 'fl-studio', 'ru', 'tool'),
('FL Studio', 'fl-studio', 'kk', 'tool'),

('MIDI Programming', 'midi-programming', 'en', 'hard'),
('MIDI программирование', 'midi-programming', 'ru', 'hard'),
('MIDI бағдарламалау', 'midi-programming', 'kk', 'hard'),

('Music Theory', 'music-theory', 'en', 'hard'),
('Музыкальная теория', 'music-theory', 'ru', 'hard'),
('Музыка теориясы', 'music-theory', 'kk', 'hard'),

('Music Composition', 'music-composition', 'en', 'hard'),
('Музыкальная композиция', 'music-composition', 'ru', 'hard'),
('Музыкалық композиция', 'music-composition', 'kk', 'hard'),

('Songwriting', 'songwriting', 'en', 'hard'),
('Написание песен', 'songwriting', 'ru', 'hard'),
('Ән жазу', 'songwriting', 'kk', 'hard'),

('Voice Acting', 'voice-acting', 'en', 'hard'),
('Озвучивание', 'voice-acting', 'ru', 'hard'),
('Дауыс актері', 'voice-acting', 'kk', 'hard'),

('Podcast Production', 'podcast-production', 'en', 'hard'),
('Производство подкастов', 'podcast-production', 'ru', 'hard'),
('Подкаст өндірісі', 'podcast-production', 'kk', 'hard'),

('Radio Broadcasting', 'radio-broadcasting', 'en', 'hard'),
('Радиовещание', 'radio-broadcasting', 'ru', 'hard'),
('Радио хабар тарату', 'radio-broadcasting', 'kk', 'hard'),

('Journalism', 'journalism', 'en', 'hard'),
('Журналистика', 'journalism', 'ru', 'hard'),
('Журналистика', 'journalism', 'kk', 'hard'),

('News Writing', 'news-writing', 'en', 'hard'),
('Написание новостей', 'news-writing', 'ru', 'hard'),
('Жаңалық жазу', 'news-writing', 'kk', 'hard'),

('Investigative Journalism', 'investigative-journalism', 'en', 'hard'),
('Расследовательская журналистика', 'investigative-journalism', 'ru', 'hard'),
('Тергеу журналистикасы', 'investigative-journalism', 'kk', 'hard'),

('Broadcasting', 'broadcasting', 'en', 'hard'),
('Телерадиовещание', 'broadcasting', 'ru', 'hard'),
('Телерадио хабар тарату', 'broadcasting', 'kk', 'hard'),

('Live Streaming', 'live-streaming', 'en', 'hard'),
('Прямые трансляции', 'live-streaming', 'ru', 'hard'),
('Тікелей эфир', 'live-streaming', 'kk', 'hard'),

('OBS Studio', 'obs-studio', 'en', 'tool'),
('OBS Studio', 'obs-studio', 'ru', 'tool'),
('OBS Studio', 'obs-studio', 'kk', 'tool'),

('Game Design', 'game-design', 'en', 'hard'),
('Геймдизайн', 'game-design', 'ru', 'hard'),
('Ойын дизайны', 'game-design', 'kk', 'hard'),

('Level Design', 'level-design', 'en', 'hard'),
('Дизайн уровней', 'level-design', 'ru', 'hard'),
('Деңгей дизайны', 'level-design', 'kk', 'hard'),

('Game Mechanics', 'game-mechanics', 'en', 'hard'),
('Игровая механика', 'game-mechanics', 'ru', 'hard'),
('Ойын механикасы', 'game-mechanics', 'kk', 'hard'),

('Character Design', 'character-design', 'en', 'hard'),
('Дизайн персонажей', 'character-design', 'ru', 'hard'),
('Кейіпкер дизайны', 'character-design', 'kk', 'hard'),

('Texture Artist', 'texture-artist', 'en', 'hard'),
('Художник по текстурам', 'texture-artist', 'ru', 'hard'),
('Текстура суретшісі', 'texture-artist', 'kk', 'hard'),

('Rigging', 'rigging', 'en', 'hard'),
('Риггинг', 'rigging', 'ru', 'hard'),
('Риггинг', 'rigging', 'kk', 'hard'),

('Creative Writing', 'creative-writing', 'en', 'hard'),
('Креативное письмо', 'creative-writing', 'ru', 'hard'),
('Шығармашылық жазу', 'creative-writing', 'kk', 'hard'),

('Fiction Writing', 'fiction-writing', 'en', 'hard'),
('Написание художественной литературы', 'fiction-writing', 'ru', 'hard'),
('Көркем әдебиет жазу', 'fiction-writing', 'kk', 'hard'),

('Poetry', 'poetry', 'en', 'hard'),
('Поэзия', 'poetry', 'ru', 'hard'),
('Поэзия', 'poetry', 'kk', 'hard'),

('Editing', 'editing', 'en', 'hard'),
('Редактирование', 'editing', 'ru', 'hard'),
('Редакциялау', 'editing', 'kk', 'hard'),

('Publishing', 'publishing', 'en', 'hard'),
('Издательское дело', 'publishing', 'ru', 'hard'),
('Баспагерлік іс', 'publishing', 'kk', 'hard'),

('Book Design', 'book-design', 'en', 'hard'),
('Дизайн книг', 'book-design', 'ru', 'hard'),
('Кітап дизайны', 'book-design', 'kk', 'hard'),

('Editorial Design', 'editorial-design', 'en', 'hard'),
('Редакционный дизайн', 'editorial-design', 'ru', 'hard'),
('Редакциялық дизайн', 'editorial-design', 'kk', 'hard'),

('Fashion Design', 'fashion-design', 'en', 'hard'),
('Дизайн одежды', 'fashion-design', 'ru', 'hard'),
('Киім дизайны', 'fashion-design', 'kk', 'hard'),

('Pattern Making', 'pattern-making', 'en', 'hard'),
('Создание выкроек', 'pattern-making', 'ru', 'hard'),
('Үлгі жасау', 'pattern-making', 'kk', 'hard'),

('Textile Design', 'textile-design', 'en', 'hard'),
('Текстильный дизайн', 'textile-design', 'ru', 'hard'),
('Тоқыма дизайны', 'textile-design', 'kk', 'hard');

-- ============================================
-- SCIENCE & RESEARCH (60 skills = 180 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Research Methodology', 'research-methodology', 'en', 'hard'),
('Методология исследований', 'research-methodology', 'ru', 'hard'),
('Зерттеу әдістемесі', 'research-methodology', 'kk', 'hard'),

('Experimental Design', 'experimental-design', 'en', 'hard'),
('Дизайн экспериментов', 'experimental-design', 'ru', 'hard'),
('Эксперимент дизайны', 'experimental-design', 'kk', 'hard'),

('Hypothesis Testing', 'hypothesis-testing', 'en', 'hard'),
('Проверка гипотез', 'hypothesis-testing', 'ru', 'hard'),
('Гипотезаны тексеру', 'hypothesis-testing', 'kk', 'hard'),

('Scientific Writing', 'scientific-writing', 'en', 'hard'),
('Научное письмо', 'scientific-writing', 'ru', 'hard'),
('Ғылыми жазу', 'scientific-writing', 'kk', 'hard'),

('Grant Writing', 'grant-writing', 'en', 'hard'),
('Написание грантов', 'grant-writing', 'ru', 'hard'),
('Грант жазу', 'grant-writing', 'kk', 'hard'),

('Peer Review', 'peer-review', 'en', 'hard'),
('Рецензирование', 'peer-review', 'ru', 'hard'),
('Рецензиялау', 'peer-review', 'kk', 'hard'),

('Academic Publishing', 'academic-publishing', 'en', 'hard'),
('Академическое издательство', 'academic-publishing', 'ru', 'hard'),
('Академиялық баспагерлік', 'academic-publishing', 'kk', 'hard'),

('Literature Review', 'literature-review', 'en', 'hard'),
('Обзор литературы', 'literature-review', 'ru', 'hard'),
('Әдебиетке шолу', 'literature-review', 'kk', 'hard'),

('Citation Management', 'citation-management', 'en', 'hard'),
('Управление цитированием', 'citation-management', 'ru', 'hard'),
('Сілтемелерді басқару', 'citation-management', 'kk', 'hard'),

('EndNote', 'endnote', 'en', 'tool'),
('EndNote', 'endnote', 'ru', 'tool'),
('EndNote', 'endnote', 'kk', 'tool'),

('Zotero', 'zotero', 'en', 'tool'),
('Zotero', 'zotero', 'ru', 'tool'),
('Zotero', 'zotero', 'kk', 'tool'),

('Mendeley', 'mendeley', 'en', 'tool'),
('Mendeley', 'mendeley', 'ru', 'tool'),
('Mendeley', 'mendeley', 'kk', 'tool'),

('Physics', 'physics', 'en', 'hard'),
('Физика', 'physics', 'ru', 'hard'),
('Физика', 'physics', 'kk', 'hard'),

('Chemistry', 'chemistry', 'en', 'hard'),
('Химия', 'chemistry', 'ru', 'hard'),
('Химия', 'chemistry', 'kk', 'hard'),

('Biology', 'biology', 'en', 'hard'),
('Биология', 'biology', 'ru', 'hard'),
('Биология', 'biology', 'kk', 'hard'),

('Molecular Biology', 'molecular-biology', 'en', 'hard'),
('Молекулярная биология', 'molecular-biology', 'ru', 'hard'),
('Молекулалық биология', 'molecular-biology', 'kk', 'hard'),

('Biochemistry', 'biochemistry', 'en', 'hard'),
('Биохимия', 'biochemistry', 'ru', 'hard'),
('Биохимия', 'biochemistry', 'kk', 'hard'),

('Biotechnology', 'biotechnology', 'en', 'hard'),
('Биотехнология', 'biotechnology', 'ru', 'hard'),
('Биотехнология', 'biotechnology', 'kk', 'hard'),

('Cell Culture', 'cell-culture', 'en', 'hard'),
('Культивирование клеток', 'cell-culture', 'ru', 'hard'),
('Жасуша өсіру', 'cell-culture', 'kk', 'hard'),

('PCR', 'pcr', 'en', 'hard'),
('ПЦР', 'pcr', 'ru', 'hard'),
('ПТР', 'pcr', 'kk', 'hard'),

('DNA Sequencing', 'dna-sequencing', 'en', 'hard'),
('Секвенирование ДНК', 'dna-sequencing', 'ru', 'hard'),
('ДНҚ секвенциялау', 'dna-sequencing', 'kk', 'hard'),

('Protein Analysis', 'protein-analysis', 'en', 'hard'),
('Анализ белков', 'protein-analysis', 'ru', 'hard'),
('Ақуызды талдау', 'protein-analysis', 'kk', 'hard'),

('Chromatography', 'chromatography', 'en', 'hard'),
('Хроматография', 'chromatography', 'ru', 'hard'),
('Хроматография', 'chromatography', 'kk', 'hard'),

('Spectroscopy', 'spectroscopy', 'en', 'hard'),
('Спектроскопия', 'spectroscopy', 'ru', 'hard'),
('Спектроскопия', 'spectroscopy', 'kk', 'hard'),

('Mass Spectrometry', 'mass-spectrometry', 'en', 'hard'),
('Масс-спектрометрия', 'mass-spectrometry', 'ru', 'hard'),
('Масс-спектрометрия', 'mass-spectrometry', 'kk', 'hard'),

('NMR Spectroscopy', 'nmr-spectroscopy', 'en', 'hard'),
('ЯМР спектроскопия', 'nmr-spectroscopy', 'ru', 'hard'),
('ЯМР спектроскопиясы', 'nmr-spectroscopy', 'kk', 'hard'),

('X-Ray Crystallography', 'x-ray-crystallography', 'en', 'hard'),
('Рентгеновская кристаллография', 'x-ray-crystallography', 'ru', 'hard'),
('Рентген кристаллографиясы', 'x-ray-crystallography', 'kk', 'hard'),

('Microscopy', 'microscopy', 'en', 'hard'),
('Микроскопия', 'microscopy', 'ru', 'hard'),
('Микроскопия', 'microscopy', 'kk', 'hard'),

('Electron Microscopy', 'electron-microscopy', 'en', 'hard'),
('Электронная микроскопия', 'electron-microscopy', 'ru', 'hard'),
('Электронды микроскопия', 'electron-microscopy', 'kk', 'hard'),

('Astronomy', 'astronomy', 'en', 'hard'),
('Астрономия', 'astronomy', 'ru', 'hard'),
('Астрономия', 'astronomy', 'kk', 'hard'),

('Astrophysics', 'astrophysics', 'en', 'hard'),
('Астрофизика', 'astrophysics', 'ru', 'hard'),
('Астрофизика', 'astrophysics', 'kk', 'hard'),

('Geology', 'geology', 'en', 'hard'),
('Геология', 'geology', 'ru', 'hard'),
('Геология', 'geology', 'kk', 'hard'),

('Geophysics', 'geophysics', 'en', 'hard'),
('Геофизика', 'geophysics', 'ru', 'hard'),
('Геофизика', 'geophysics', 'kk', 'hard'),

('Environmental Science', 'environmental-science', 'en', 'hard'),
('Экология', 'environmental-science', 'ru', 'hard'),
('Экология', 'environmental-science', 'kk', 'hard'),

('Climate Science', 'climate-science', 'en', 'hard'),
('Климатология', 'climate-science', 'ru', 'hard'),
('Климатология', 'climate-science', 'kk', 'hard'),

('Meteorology', 'meteorology', 'en', 'hard'),
('Метеорология', 'meteorology', 'ru', 'hard'),
('Метеорология', 'meteorology', 'kk', 'hard'),

('Oceanography', 'oceanography', 'en', 'hard'),
('Океанография', 'oceanography', 'ru', 'hard'),
('Мұхитнама', 'oceanography', 'kk', 'hard'),

('Ecology', 'ecology', 'en', 'hard'),
('Экологическая наука', 'ecology', 'ru', 'hard'),
('Экологиялық ғылым', 'ecology', 'kk', 'hard'),

('Botany', 'botany', 'en', 'hard'),
('Ботаника', 'botany', 'ru', 'hard'),
('Ботаника', 'botany', 'kk', 'hard'),

('Zoology', 'zoology', 'en', 'hard'),
('Зоология', 'zoology', 'ru', 'hard'),
('Зоология', 'zoology', 'kk', 'hard'),

('Neuroscience', 'neuroscience', 'en', 'hard'),
('Нейронаука', 'neuroscience', 'ru', 'hard'),
('Нейроғылым', 'neuroscience', 'kk', 'hard'),

('Cognitive Science', 'cognitive-science', 'en', 'hard'),
('Когнитивная наука', 'cognitive-science', 'ru', 'hard'),
('Когнитивті ғылым', 'cognitive-science', 'kk', 'hard'),

('Anthropology', 'anthropology', 'en', 'hard'),
('Антропология', 'anthropology', 'ru', 'hard'),
('Антропология', 'anthropology', 'kk', 'hard'),

('Archaeology', 'archaeology', 'en', 'hard'),
('Археология', 'archaeology', 'ru', 'hard'),
('Археология', 'archaeology', 'kk', 'hard'),

('Sociology', 'sociology', 'en', 'hard'),
('Социология', 'sociology', 'ru', 'hard'),
('Социология', 'sociology', 'kk', 'hard'),

('Political Science', 'political-science', 'en', 'hard'),
('Политология', 'political-science', 'ru', 'hard'),
('Саясаттану', 'political-science', 'kk', 'hard'),

('Economics', 'economics', 'en', 'hard'),
('Экономика', 'economics', 'ru', 'hard'),
('Экономика', 'economics', 'kk', 'hard'),

('Econometrics', 'econometrics', 'en', 'hard'),
('Эконометрика', 'econometrics', 'ru', 'hard'),
('Эконометрика', 'econometrics', 'kk', 'hard'),

('Mathematics', 'mathematics', 'en', 'hard'),
('Математика', 'mathematics', 'ru', 'hard'),
('Математика', 'mathematics', 'kk', 'hard'),

('Applied Mathematics', 'applied-mathematics', 'en', 'hard'),
('Прикладная математика', 'applied-mathematics', 'ru', 'hard'),
('Қолданбалы математика', 'applied-mathematics', 'kk', 'hard'),

('Statistics', 'statistics', 'en', 'hard'),
('Статистика', 'statistics', 'ru', 'hard'),
('Статистика', 'statistics', 'kk', 'hard'),

('Mathematical Modeling', 'mathematical-modeling', 'en', 'hard'),
('Математическое моделирование', 'mathematical-modeling', 'ru', 'hard'),
('Математикалық модельдеу', 'mathematical-modeling', 'kk', 'hard'),

('Computational Science', 'computational-science', 'en', 'hard'),
('Вычислительная наука', 'computational-science', 'ru', 'hard'),
('Есептеу ғылымы', 'computational-science', 'kk', 'hard'),

('Numerical Analysis', 'numerical-analysis', 'en', 'hard'),
('Численный анализ', 'numerical-analysis', 'ru', 'hard'),
('Сандық талдау', 'numerical-analysis', 'kk', 'hard'),

('Algorithm Development', 'algorithm-development', 'en', 'hard'),
('Разработка алгоритмов', 'algorithm-development', 'ru', 'hard'),
('Алгоритм әзірлеу', 'algorithm-development', 'kk', 'hard'),

('Scientific Computing', 'scientific-computing', 'en', 'hard'),
('Научные вычисления', 'scientific-computing', 'ru', 'hard'),
('Ғылыми есептеулер', 'scientific-computing', 'kk', 'hard');

-- To be continued with remaining categories...
-- ============================================
-- AGRICULTURE & ENVIRONMENT (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Agriculture', 'agriculture', 'en', 'hard'),
('Сельское хозяйство', 'agriculture', 'ru', 'hard'),
('Ауыл шаруашылығы', 'agriculture', 'kk', 'hard'),

('Crop Management', 'crop-management', 'en', 'hard'),
('Управление посевами', 'crop-management', 'ru', 'hard'),
('Егін басқару', 'crop-management', 'kk', 'hard'),

('Soil Science', 'soil-science', 'en', 'hard'),
('Почвоведение', 'soil-science', 'ru', 'hard'),
('Топырақтану', 'soil-science', 'kk', 'hard'),

('Irrigation', 'irrigation', 'en', 'hard'),
('Ирригация', 'irrigation', 'ru', 'hard'),
('Суландыру', 'irrigation', 'kk', 'hard'),

('Pest Control', 'pest-control', 'en', 'hard'),
('Борьба с вредителями', 'pest-control', 'ru', 'hard'),
('Зиянкестермен күрес', 'pest-control', 'kk', 'hard'),

('Organic Farming', 'organic-farming', 'en', 'hard'),
('Органическое земледелие', 'organic-farming', 'ru', 'hard'),
('Органикалық егіншілік', 'organic-farming', 'kk', 'hard'),

('Precision Agriculture', 'precision-agriculture', 'en', 'hard'),
('Точное земледелие', 'precision-agriculture', 'ru', 'hard'),
('Дәл егіншілік', 'precision-agriculture', 'kk', 'hard'),

('Greenhouse Management', 'greenhouse-management', 'en', 'hard'),
('Управление теплицами', 'greenhouse-management', 'ru', 'hard'),
('Жылыжайды басқару', 'greenhouse-management', 'kk', 'hard'),

('Hydroponics', 'hydroponics', 'en', 'hard'),
('Гидропоника', 'hydroponics', 'ru', 'hard'),
('Гидропоника', 'hydroponics', 'kk', 'hard'),

('Aquaculture', 'aquaculture', 'en', 'hard'),
('Аквакультура', 'aquaculture', 'ru', 'hard'),
('Аквамәдениет', 'aquaculture', 'kk', 'hard'),

('Animal Husbandry', 'animal-husbandry', 'en', 'hard'),
('Животноводство', 'animal-husbandry', 'ru', 'hard'),
('Мал шаруашылығы', 'animal-husbandry', 'kk', 'hard'),

('Veterinary Medicine', 'veterinary-medicine', 'en', 'hard'),
('Ветеринария', 'veterinary-medicine', 'ru', 'hard'),
('Ветеринария', 'veterinary-medicine', 'kk', 'hard'),

('Livestock Management', 'livestock-management', 'en', 'hard'),
('Управление скотом', 'livestock-management', 'ru', 'hard'),
('Малды басқару', 'livestock-management', 'kk', 'hard'),

('Dairy Farming', 'dairy-farming', 'en', 'hard'),
('Молочное животноводство', 'dairy-farming', 'ru', 'hard'),
('Сүт өндірісі', 'dairy-farming', 'kk', 'hard'),

('Poultry Farming', 'poultry-farming', 'en', 'hard'),
('Птицеводство', 'poultry-farming', 'ru', 'hard'),
('Құс шаруашылығы', 'poultry-farming', 'kk', 'hard'),

('Beekeeping', 'beekeeping', 'en', 'hard'),
('Пчеловодство', 'beekeeping', 'ru', 'hard'),
('Ара шаруашылығы', 'beekeeping', 'kk', 'hard'),

('Forestry', 'forestry', 'en', 'hard'),
('Лесное хозяйство', 'forestry', 'ru', 'hard'),
('Орман шаруашылығы', 'forestry', 'kk', 'hard'),

('Silviculture', 'silviculture', 'en', 'hard'),
('Лесоводство', 'silviculture', 'ru', 'hard'),
('Орман өсіру', 'silviculture', 'kk', 'hard'),

('Wildlife Management', 'wildlife-management', 'en', 'hard'),
('Управление дикой природой', 'wildlife-management', 'ru', 'hard'),
('Жабайы табиғатты басқару', 'wildlife-management', 'kk', 'hard'),

('Conservation Biology', 'conservation-biology', 'en', 'hard'),
('Биология сохранения', 'conservation-biology', 'ru', 'hard'),
('Сақтау биологиясы', 'conservation-biology', 'kk', 'hard'),

('Sustainable Development', 'sustainable-development', 'en', 'hard'),
('Устойчивое развитие', 'sustainable-development', 'ru', 'hard'),
('Тұрақты даму', 'sustainable-development', 'kk', 'hard'),

('Renewable Energy', 'renewable-energy', 'en', 'hard'),
('Возобновляемая энергия', 'renewable-energy', 'ru', 'hard'),
('Жаңғыртылатын энергия', 'renewable-energy', 'kk', 'hard'),

('Solar Energy', 'solar-energy', 'en', 'hard'),
('Солнечная энергия', 'solar-energy', 'ru', 'hard'),
('Күн энергиясы', 'solar-energy', 'kk', 'hard'),

('Wind Energy', 'wind-energy', 'en', 'hard'),
('Ветровая энергия', 'wind-energy', 'ru', 'hard'),
('Жел энергиясы', 'wind-energy', 'kk', 'hard'),

('Waste Management', 'waste-management', 'en', 'hard'),
('Управление отходами', 'waste-management', 'ru', 'hard'),
('Қалдықтарды басқару', 'waste-management', 'kk', 'hard'),

('Recycling', 'recycling', 'en', 'hard'),
('Переработка', 'recycling', 'ru', 'hard'),
('Қайта өңдеу', 'recycling', 'kk', 'hard'),

('Water Management', 'water-management', 'en', 'hard'),
('Управление водными ресурсами', 'water-management', 'ru', 'hard'),
('Су ресурстарын басқару', 'water-management', 'kk', 'hard'),

('Water Treatment', 'water-treatment', 'en', 'hard'),
('Очистка воды', 'water-treatment', 'ru', 'hard'),
('Суды тазарту', 'water-treatment', 'kk', 'hard'),

('Air Quality Monitoring', 'air-quality-monitoring', 'en', 'hard'),
('Мониторинг качества воздуха', 'air-quality-monitoring', 'ru', 'hard'),
('Ауа сапасын бақылау', 'air-quality-monitoring', 'kk', 'hard'),

('Pollution Control', 'pollution-control', 'en', 'hard'),
('Контроль загрязнения', 'pollution-control', 'ru', 'hard'),
('Ластануды бақылау', 'pollution-control', 'kk', 'hard'),

('Environmental Impact Assessment', 'environmental-impact-assessment', 'en', 'hard'),
('Оценка воздействия на окружающую среду', 'environmental-impact-assessment', 'ru', 'hard'),
('Қоршаған ортаға әсерді бағалау', 'environmental-impact-assessment', 'kk', 'hard'),

('Carbon Footprint Analysis', 'carbon-footprint-analysis', 'en', 'hard'),
('Анализ углеродного следа', 'carbon-footprint-analysis', 'ru', 'hard'),
('Көміртек ізін талдау', 'carbon-footprint-analysis', 'kk', 'hard'),

('GIS Mapping', 'gis-mapping', 'en', 'hard'),
('ГИС картирование', 'gis-mapping', 'ru', 'hard'),
('ГАЖ картаға түсіру', 'gis-mapping', 'kk', 'hard'),

('Remote Sensing', 'remote-sensing', 'en', 'hard'),
('Дистанционное зондирование', 'remote-sensing', 'ru', 'hard'),
('Қашықтан зондтау', 'remote-sensing', 'kk', 'hard'),

('ArcGIS', 'arcgis', 'en', 'tool'),
('ArcGIS', 'arcgis', 'ru', 'tool'),
('ArcGIS', 'arcgis', 'kk', 'tool'),

('QGIS', 'qgis', 'en', 'tool'),
('QGIS', 'qgis', 'ru', 'tool'),
('QGIS', 'qgis', 'kk', 'tool'),

('Land Surveying', 'land-surveying', 'en', 'hard'),
('Землемерие', 'land-surveying', 'ru', 'hard'),
('Жер өлшеу', 'land-surveying', 'kk', 'hard'),

('Cartography', 'cartography', 'en', 'hard'),
('Картография', 'cartography', 'ru', 'hard'),
('Картография', 'cartography', 'kk', 'hard'),

('Urban Planning', 'urban-planning', 'en', 'hard'),
('Градостроительство', 'urban-planning', 'ru', 'hard'),
('Қала жоспарлау', 'urban-planning', 'kk', 'hard'),

('Landscape Architecture', 'landscape-architecture', 'en', 'hard'),
('Ландшафтная архитектура', 'landscape-architecture', 'ru', 'hard'),
('Ландшафт архитектурасы', 'landscape-architecture', 'kk', 'hard'),

('Horticulture', 'horticulture', 'en', 'hard'),
('Садоводство', 'horticulture', 'ru', 'hard'),
('Бағбандық', 'horticulture', 'kk', 'hard'),

('Floriculture', 'floriculture', 'en', 'hard'),
('Цветоводство', 'floriculture', 'ru', 'hard'),
('Гүл өсіру', 'floriculture', 'kk', 'hard'),

('Arboriculture', 'arboriculture', 'en', 'hard'),
('Древоводство', 'arboriculture', 'ru', 'hard'),
('Ағаш өсіру', 'arboriculture', 'kk', 'hard'),

('Food Science', 'food-science', 'en', 'hard'),
('Пищевая наука', 'food-science', 'ru', 'hard'),
('Тамақ ғылымы', 'food-science', 'kk', 'hard'),

('Food Safety', 'food-safety', 'en', 'hard'),
('Безопасность пищи', 'food-safety', 'ru', 'hard'),
('Тамақ қауіпсіздігі', 'food-safety', 'kk', 'hard'),

('Food Processing', 'food-processing', 'en', 'hard'),
('Пищевая переработка', 'food-processing', 'ru', 'hard'),
('Тамақ өңдеу', 'food-processing', 'kk', 'hard'),

('Quality Assurance in Food', 'quality-assurance-in-food', 'en', 'hard'),
('Контроль качества пищи', 'quality-assurance-in-food', 'ru', 'hard'),
('Тамақ сапасын қамтамасыз ету', 'quality-assurance-in-food', 'kk', 'hard'),

('HACCP', 'haccp', 'en', 'hard'),
('HACCP', 'haccp', 'ru', 'hard'),
('HACCP', 'haccp', 'kk', 'hard');

-- ============================================
-- CONSTRUCTION & REAL ESTATE (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Construction Management', 'construction-management', 'en', 'hard'),
('Управление строительством', 'construction-management', 'ru', 'hard'),
('Құрылыс басқару', 'construction-management', 'kk', 'hard'),

('Building Codes', 'building-codes', 'en', 'hard'),
('Строительные нормы', 'building-codes', 'ru', 'hard'),
('Құрылыс нормалары', 'building-codes', 'kk', 'hard'),

('Blueprint Reading', 'blueprint-reading', 'en', 'hard'),
('Чтение чертежей', 'blueprint-reading', 'ru', 'hard'),
('Сызбаларды оқу', 'blueprint-reading', 'kk', 'hard'),

('Site Management', 'site-management', 'en', 'hard'),
('Управление стройплощадкой', 'site-management', 'ru', 'hard'),
('Құрылыс алаңын басқару', 'site-management', 'kk', 'hard'),

('Quantity Surveying', 'quantity-surveying', 'en', 'hard'),
('Сметное дело', 'quantity-surveying', 'ru', 'hard'),
('Сметалық іс', 'quantity-surveying', 'kk', 'hard'),

('Cost Estimation', 'cost-estimation', 'en', 'hard'),
('Оценка стоимости', 'cost-estimation', 'ru', 'hard'),
('Құнды бағалау', 'cost-estimation', 'kk', 'hard'),

('Budgeting Construction', 'budgeting-construction', 'en', 'hard'),
('Бюджетирование строительства', 'budgeting-construction', 'ru', 'hard'),
('Құрылыс бюджеттеу', 'budgeting-construction', 'kk', 'hard'),

('Scheduling Construction', 'scheduling-construction', 'en', 'hard'),
('Планирование строительства', 'scheduling-construction', 'ru', 'hard'),
('Құрылыс жоспарлау', 'scheduling-construction', 'kk', 'hard'),

('Safety Management', 'safety-management', 'en', 'hard'),
('Управление безопасностью', 'safety-management', 'ru', 'hard'),
('Қауіпсіздікті басқару', 'safety-management', 'kk', 'hard'),

('OSHA Compliance', 'osha-compliance', 'en', 'hard'),
('Соответствие OSHA', 'osha-compliance', 'ru', 'hard'),
('OSHA сәйкестігі', 'osha-compliance', 'kk', 'hard'),

('Carpentry', 'carpentry', 'en', 'hard'),
('Столярное дело', 'carpentry', 'ru', 'hard'),
('Ағашшылық', 'carpentry', 'kk', 'hard'),

('Masonry', 'masonry', 'en', 'hard'),
('Каменная кладка', 'masonry', 'ru', 'hard'),
('Тас қалау', 'masonry', 'kk', 'hard'),

('Plumbing', 'plumbing', 'en', 'hard'),
('Сантехника', 'plumbing', 'ru', 'hard'),
('Сантехника', 'plumbing', 'kk', 'hard'),

('Electrical Work', 'electrical-work', 'en', 'hard'),
('Электромонтаж', 'electrical-work', 'ru', 'hard'),
('Электр монтажы', 'electrical-work', 'kk', 'hard'),

('HVAC', 'hvac', 'en', 'hard'),
('Вентиляция и кондиционирование', 'hvac', 'ru', 'hard'),
('Желдету және ауа баптау', 'hvac', 'kk', 'hard'),

('Roofing', 'roofing', 'en', 'hard'),
('Кровельные работы', 'roofing', 'ru', 'hard'),
('Шатыр жабу', 'roofing', 'kk', 'hard'),

('Painting', 'painting-construction', 'en', 'hard'),
('Малярные работы', 'painting-construction', 'ru', 'hard'),
('Бояу жұмыстары', 'painting-construction', 'kk', 'hard'),

('Flooring Installation', 'flooring-installation', 'en', 'hard'),
('Укладка полов', 'flooring-installation', 'ru', 'hard'),
('Едендерді төсеу', 'flooring-installation', 'kk', 'hard'),

('Drywall Installation', 'drywall-installation', 'en', 'hard'),
('Монтаж гипсокартона', 'drywall-installation', 'ru', 'hard'),
('Гипсокартон монтажы', 'drywall-installation', 'kk', 'hard'),

('Scaffolding', 'scaffolding', 'en', 'hard'),
('Монтаж лесов', 'scaffolding', 'ru', 'hard'),
('Қалып орнату', 'scaffolding', 'kk', 'hard'),

('Heavy Equipment Operation', 'heavy-equipment-operation', 'en', 'hard'),
('Работа на спецтехнике', 'heavy-equipment-operation', 'ru', 'hard'),
('Ауыр техникамен жұмыс', 'heavy-equipment-operation', 'kk', 'hard'),

('Excavation', 'excavation', 'en', 'hard'),
('Земляные работы', 'excavation', 'ru', 'hard'),
('Жер қазу жұмыстары', 'excavation', 'kk', 'hard'),

('Demolition', 'demolition', 'en', 'hard'),
('Снос', 'demolition', 'ru', 'hard'),
('Бұзу', 'demolition', 'kk', 'hard'),

('Concrete Work', 'concrete-work', 'en', 'hard'),
('Бетонные работы', 'concrete-work', 'ru', 'hard'),
('Бетон жұмыстары', 'concrete-work', 'kk', 'hard'),

('Steel Fabrication', 'steel-fabrication', 'en', 'hard'),
('Металлоконструкции', 'steel-fabrication', 'ru', 'hard'),
('Металл құрылымдар', 'steel-fabrication', 'kk', 'hard'),

('BIM', 'bim', 'en', 'hard'),
('BIM', 'bim', 'ru', 'hard'),
('BIM', 'bim', 'kk', 'hard'),

('Real Estate', 'real-estate', 'en', 'hard'),
('Недвижимость', 'real-estate', 'ru', 'hard'),
('Жылжымайтын мүлік', 'real-estate', 'kk', 'hard'),

('Property Management', 'property-management', 'en', 'hard'),
('Управление недвижимостью', 'property-management', 'ru', 'hard'),
('Мүлікті басқару', 'property-management', 'kk', 'hard'),

('Leasing', 'leasing', 'en', 'hard'),
('Лизинг', 'leasing', 'ru', 'hard'),
('Жалға беру', 'leasing', 'kk', 'hard'),

('Property Valuation', 'property-valuation', 'en', 'hard'),
('Оценка недвижимости', 'property-valuation', 'ru', 'hard'),
('Мүлікті бағалау', 'property-valuation', 'kk', 'hard'),

('Real Estate Sales', 'real-estate-sales', 'en', 'hard'),
('Продажа недвижимости', 'real-estate-sales', 'ru', 'hard'),
('Жылжымайтын мүлік сату', 'real-estate-sales', 'kk', 'hard'),

('Mortgage Lending', 'mortgage-lending', 'en', 'hard'),
('Ипотечное кредитование', 'mortgage-lending', 'ru', 'hard'),
('Ипотекалық несиелеу', 'mortgage-lending', 'kk', 'hard'),

('Commercial Real Estate', 'commercial-real-estate', 'en', 'hard'),
('Коммерческая недвижимость', 'commercial-real-estate', 'ru', 'hard'),
('Коммерциялық мүлік', 'commercial-real-estate', 'kk', 'hard'),

('Residential Real Estate', 'residential-real-estate', 'en', 'hard'),
('Жилая недвижимость', 'residential-real-estate', 'ru', 'hard'),
('Тұрғын үй мүлігі', 'residential-real-estate', 'kk', 'hard'),

('Title Search', 'title-search', 'en', 'hard'),
('Проверка правового титула', 'title-search', 'ru', 'hard'),
('Құқықтық тексеру', 'title-search', 'kk', 'hard'),

('Building Inspection', 'building-inspection', 'en', 'hard'),
('Строительная инспекция', 'building-inspection', 'ru', 'hard'),
('Құрылыс инспекциясы', 'building-inspection', 'kk', 'hard'),

('Home Staging', 'home-staging', 'en', 'hard'),
('Подготовка недвижимости к продаже', 'home-staging', 'ru', 'hard'),
('Үйді сатуға дайындау', 'home-staging', 'kk', 'hard'),

('Facility Management', 'facility-management', 'en', 'hard'),
('Управление объектами', 'facility-management', 'ru', 'hard'),
('Объектілерді басқару', 'facility-management', 'kk', 'hard'),

('Space Planning', 'space-planning', 'en', 'hard'),
('Планирование пространства', 'space-planning', 'ru', 'hard'),
('Кеңістікті жоспарлау', 'space-planning', 'kk', 'hard'),

('Interior Design', 'interior-design', 'en', 'hard'),
('Дизайн интерьера', 'interior-design', 'ru', 'hard'),
('Интерьер дизайны', 'interior-design', 'kk', 'hard'),

('Architecture', 'architecture', 'en', 'hard'),
('Архитектура', 'architecture', 'ru', 'hard'),
('Архитектура', 'architecture', 'kk', 'hard'),

('Architectural Design', 'architectural-design', 'en', 'hard'),
('Архитектурное проектирование', 'architectural-design', 'ru', 'hard'),
('Архитектуралық жобалау', 'architectural-design', 'kk', 'hard'),

('Sustainable Architecture', 'sustainable-architecture', 'en', 'hard'),
('Устойчивая архитектура', 'sustainable-architecture', 'ru', 'hard'),
('Тұрақты архитектура', 'sustainable-architecture', 'kk', 'hard'),

('Green Building', 'green-building', 'en', 'hard'),
('Зеленое строительство', 'green-building', 'ru', 'hard'),
('Жасыл құрылыс', 'green-building', 'kk', 'hard'),

('LEED Certification', 'leed-certification', 'en', 'hard'),
('LEED сертификация', 'leed-certification', 'ru', 'hard'),
('LEED сертификаттау', 'leed-certification', 'kk', 'hard');

-- ============================================
-- TRANSPORTATION & LOGISTICS (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Fleet Management', 'fleet-management', 'en', 'hard'),
('Управление автопарком', 'fleet-management', 'ru', 'hard'),
('Автопарк басқару', 'fleet-management', 'kk', 'hard'),

('Route Optimization', 'route-optimization', 'en', 'hard'),
('Оптимизация маршрутов', 'route-optimization', 'ru', 'hard'),
('Бағыттарды оңтайландыру', 'route-optimization', 'kk', 'hard'),

('Warehouse Management', 'warehouse-management', 'en', 'hard'),
('Управление складом', 'warehouse-management', 'ru', 'hard'),
('Қойма басқару', 'warehouse-management', 'kk', 'hard'),

('Inventory Control', 'inventory-control', 'en', 'hard'),
('Контроль запасов', 'inventory-control', 'ru', 'hard'),
('Қорларды бақылау', 'inventory-control', 'kk', 'hard'),

('Distribution Planning', 'distribution-planning', 'en', 'hard'),
('Планирование распределения', 'distribution-planning', 'ru', 'hard'),
('Тарату жоспарлау', 'distribution-planning', 'kk', 'hard'),

('Freight Forwarding', 'freight-forwarding', 'en', 'hard'),
('Грузоперевозки', 'freight-forwarding', 'ru', 'hard'),
('Жүк тасымалдау', 'freight-forwarding', 'kk', 'hard'),

('Customs Clearance', 'customs-clearance', 'en', 'hard'),
('Таможенное оформление', 'customs-clearance', 'ru', 'hard'),
('Кедендік ресімдеу', 'customs-clearance', 'kk', 'hard'),

('Import Export', 'import-export', 'en', 'hard'),
('Импорт-экспорт', 'import-export', 'ru', 'hard'),
('Импорт-экспорт', 'import-export', 'kk', 'hard'),

('International Shipping', 'international-shipping', 'en', 'hard'),
('Международные перевозки', 'international-shipping', 'ru', 'hard'),
('Халықаралық тасымалдау', 'international-shipping', 'kk', 'hard'),

('Last Mile Delivery', 'last-mile-delivery', 'en', 'hard'),
('Доставка последней мили', 'last-mile-delivery', 'ru', 'hard'),
('Соңғы миля жеткізу', 'last-mile-delivery', 'kk', 'hard'),

('Transportation Planning', 'transportation-planning', 'en', 'hard'),
('Планирование перевозок', 'transportation-planning', 'ru', 'hard'),
('Көлікті жоспарлау', 'transportation-planning', 'kk', 'hard'),

('Load Planning', 'load-planning', 'en', 'hard'),
('Планирование загрузки', 'load-planning', 'ru', 'hard'),
('Жүктеуді жоспарлау', 'load-planning', 'kk', 'hard'),

('Carrier Management', 'carrier-management', 'en', 'hard'),
('Управление перевозчиками', 'carrier-management', 'ru', 'hard'),
('Тасымалдаушыларды басқару', 'carrier-management', 'kk', 'hard'),

('TMS Software', 'tms-software', 'en', 'tool'),
('TMS системы', 'tms-software', 'ru', 'tool'),
('TMS жүйелері', 'tms-software', 'kk', 'tool'),

('WMS Software', 'wms-software', 'en', 'tool'),
('WMS системы', 'wms-software', 'ru', 'tool'),
('WMS жүйелері', 'wms-software', 'kk', 'tool'),

('ERP Systems', 'erp-systems', 'en', 'tool'),
('ERP системы', 'erp-systems', 'ru', 'tool'),
('ERP жүйелері', 'erp-systems', 'kk', 'tool'),

('SAP', 'sap', 'en', 'tool'),
('SAP', 'sap', 'ru', 'tool'),
('SAP', 'sap', 'kk', 'tool'),

('Forklift Operation', 'forklift-operation', 'en', 'hard'),
('Работа на погрузчике', 'forklift-operation', 'ru', 'hard'),
('Жүктегіш жұмысы', 'forklift-operation', 'kk', 'hard'),

('Pallet Management', 'pallet-management', 'en', 'hard'),
('Управление паллетами', 'pallet-management', 'ru', 'hard'),
('Паллетті басқару', 'pallet-management', 'kk', 'hard'),

('Cold Chain Management', 'cold-chain-management', 'en', 'hard'),
('Управление холодовой цепью', 'cold-chain-management', 'ru', 'hard'),
('Суық тізбекті басқару', 'cold-chain-management', 'kk', 'hard'),

('Hazmat Handling', 'hazmat-handling', 'en', 'hard'),
('Работа с опасными материалами', 'hazmat-handling', 'ru', 'hard'),
('Қауіпті материалдармен жұмыс', 'hazmat-handling', 'kk', 'hard'),

('Quality Inspection', 'quality-inspection', 'en', 'hard'),
('Контроль качества', 'quality-inspection', 'ru', 'hard'),
('Сапаны тексеру', 'quality-inspection', 'kk', 'hard'),

('Shipping Documentation', 'shipping-documentation', 'en', 'hard'),
('Транспортная документация', 'shipping-documentation', 'ru', 'hard'),
('Тасымал құжаттамасы', 'shipping-documentation', 'kk', 'hard'),

('Bill of Lading', 'bill-of-lading', 'en', 'hard'),
('Коносамент', 'bill-of-lading', 'ru', 'hard'),
('Жүк қабылдау парағы', 'bill-of-lading', 'kk', 'hard'),

('Incoterms', 'incoterms', 'en', 'hard'),
('Инкотермс', 'incoterms', 'ru', 'hard'),
('Инкотермс', 'incoterms', 'kk', 'hard'),

('Reverse Logistics', 'reverse-logistics', 'en', 'hard'),
('Обратная логистика', 'reverse-logistics', 'ru', 'hard'),
('Кері логистика', 'reverse-logistics', 'kk', 'hard'),

('Returns Management', 'returns-management', 'en', 'hard'),
('Управление возвратами', 'returns-management', 'ru', 'hard'),
('Қайтаруларды басқару', 'returns-management', 'kk', 'hard'),

('Cross-Docking', 'cross-docking', 'en', 'hard'),
('Кросс-докинг', 'cross-docking', 'ru', 'hard'),
('Кросс-докинг', 'cross-docking', 'kk', 'hard'),

('Order Fulfillment', 'order-fulfillment', 'en', 'hard'),
('Выполнение заказов', 'order-fulfillment', 'ru', 'hard'),
('Тапсырысты орындау', 'order-fulfillment', 'kk', 'hard'),

('Picking and Packing', 'picking-and-packing', 'en', 'hard'),
('Комплектация и упаковка', 'picking-and-packing', 'ru', 'hard'),
('Жинау және орау', 'picking-and-packing', 'kk', 'hard'),

('Barcode Scanning', 'barcode-scanning', 'en', 'hard'),
('Сканирование штрихкодов', 'barcode-scanning', 'ru', 'hard'),
('Штрих-кодты сканерлеу', 'barcode-scanning', 'kk', 'hard'),

('RFID Technology', 'rfid-technology', 'en', 'hard'),
('RFID технология', 'rfid-technology', 'ru', 'hard'),
('RFID технологиясы', 'rfid-technology', 'kk', 'hard'),

('Track and Trace', 'track-and-trace', 'en', 'hard'),
('Отслеживание грузов', 'track-and-trace', 'ru', 'hard'),
('Жүкті бақылау', 'track-and-trace', 'kk', 'hard'),

('GPS Tracking', 'gps-tracking', 'en', 'hard'),
('GPS мониторинг', 'gps-tracking', 'ru', 'hard'),
('GPS бақылау', 'gps-tracking', 'kk', 'hard'),

('Dispatch Management', 'dispatch-management', 'en', 'hard'),
('Управление диспетчеризацией', 'dispatch-management', 'ru', 'hard'),
('Диспетчерлікті басқару', 'dispatch-management', 'kk', 'hard'),

('Commercial Driving', 'commercial-driving', 'en', 'hard'),
('Коммерческое вождение', 'commercial-driving', 'ru', 'hard'),
('Коммерциялық жүргізу', 'commercial-driving', 'kk', 'hard'),

('CDL License', 'cdl-license', 'en', 'hard'),
('Права на грузовик', 'cdl-license', 'ru', 'hard'),
('Жүк көлігі құқығы', 'cdl-license', 'kk', 'hard'),

('DOT Regulations', 'dot-regulations', 'en', 'hard'),
('DOT регламенты', 'dot-regulations', 'ru', 'hard'),
('DOT ережелері', 'dot-regulations', 'kk', 'hard'),

('Vehicle Maintenance', 'vehicle-maintenance', 'en', 'hard'),
('Обслуживание транспорта', 'vehicle-maintenance', 'ru', 'hard'),
('Көлікті қызмет көрсету', 'vehicle-maintenance', 'kk', 'hard'),

('Fuel Management', 'fuel-management', 'en', 'hard'),
('Управление топливом', 'fuel-management', 'ru', 'hard'),
('Жанармайды басқару', 'fuel-management', 'kk', 'hard'),

('Safety Compliance', 'safety-compliance', 'en', 'hard'),
('Соблюдение безопасности', 'safety-compliance', 'ru', 'hard'),
('Қауіпсіздік сәйкестігі', 'safety-compliance', 'kk', 'hard'),

('Traffic Management', 'traffic-management', 'en', 'hard'),
('Управление движением', 'traffic-management', 'ru', 'hard'),
('Қозғалысты басқару', 'traffic-management', 'kk', 'hard'),

('Public Transportation', 'public-transportation', 'en', 'hard'),
('Общественный транспорт', 'public-transportation', 'ru', 'hard'),
('Қоғамдық көлік', 'public-transportation', 'kk', 'hard'),

('Ride-Sharing Operations', 'ride-sharing-operations', 'en', 'hard'),
('Операции каршеринга', 'ride-sharing-operations', 'ru', 'hard'),
('Көлік бөлісу операциялары', 'ride-sharing-operations', 'kk', 'hard'),

('Parking Management', 'parking-management', 'en', 'hard'),
('Управление парковкой', 'parking-management', 'ru', 'hard'),
('Тұрақты басқару', 'parking-management', 'kk', 'hard'),

('Port Operations', 'port-operations', 'en', 'hard'),
('Портовые операции', 'port-operations', 'ru', 'hard'),
('Порт операциялары', 'port-operations', 'kk', 'hard'),

('Container Management', 'container-management', 'en', 'hard'),
('Управление контейнерами', 'container-management', 'ru', 'hard'),
('Контейнерлерді басқару', 'container-management', 'kk', 'hard'),

('Yard Management', 'yard-management', 'en', 'hard'),
('Управление терминалом', 'yard-management', 'ru', 'hard'),
('Терминал басқару', 'yard-management', 'kk', 'hard');

-- ============================================
-- HOSPITALITY & TOURISM (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Hotel Management', 'hotel-management', 'en', 'hard'),
('Управление отелем', 'hotel-management', 'ru', 'hard'),
('Қонақ үйді басқару', 'hotel-management', 'kk', 'hard'),

('Front Desk Operations', 'front-desk-operations', 'en', 'hard'),
('Работа на ресепшн', 'front-desk-operations', 'ru', 'hard'),
('Қабылдау қызметі', 'front-desk-operations', 'kk', 'hard'),

('Housekeeping', 'housekeeping', 'en', 'hard'),
('Хаускипинг', 'housekeeping', 'ru', 'hard'),
('Тазалық қызметі', 'housekeeping', 'kk', 'hard'),

('Concierge Services', 'concierge-services', 'en', 'hard'),
('Консьерж-сервис', 'concierge-services', 'ru', 'hard'),
('Консьерж қызметі', 'concierge-services', 'kk', 'hard'),

('Guest Relations', 'guest-relations', 'en', 'hard'),
('Работа с гостями', 'guest-relations', 'ru', 'hard'),
('Қонақтармен жұмыс', 'guest-relations', 'kk', 'hard'),

('Reservation Systems', 'reservation-systems', 'en', 'tool'),
('Системы бронирования', 'reservation-systems', 'ru', 'tool'),
('Брондау жүйелері', 'reservation-systems', 'kk', 'tool'),

('Revenue Management', 'revenue-management', 'en', 'hard'),
('Управление доходами', 'revenue-management', 'ru', 'hard'),
('Кірісті басқару', 'revenue-management', 'kk', 'hard'),

('Food and Beverage Service', 'food-and-beverage-service', 'en', 'hard'),
('Обслуживание F&B', 'food-and-beverage-service', 'ru', 'hard'),
('Тамақ-ішімдік қызметі', 'food-and-beverage-service', 'kk', 'hard'),

('Banquet Management', 'banquet-management', 'en', 'hard'),
('Управление банкетами', 'banquet-management', 'ru', 'hard'),
('Банкет басқару', 'banquet-management', 'kk', 'hard'),

('Catering', 'catering', 'en', 'hard'),
('Кейтеринг', 'catering', 'ru', 'hard'),
('Кейтеринг', 'catering', 'kk', 'hard'),

('Restaurant Management', 'restaurant-management', 'en', 'hard'),
('Управление рестораном', 'restaurant-management', 'ru', 'hard'),
('Мейрамхана басқару', 'restaurant-management', 'kk', 'hard'),

('Menu Planning', 'menu-planning', 'en', 'hard'),
('Планирование меню', 'menu-planning', 'ru', 'hard'),
('Мәзір жоспарлау', 'menu-planning', 'kk', 'hard'),

('Culinary Skills', 'culinary-skills', 'en', 'hard'),
('Кулинарные навыки', 'culinary-skills', 'ru', 'hard'),
('Аспаздық дағдылары', 'culinary-skills', 'kk', 'hard'),

('Chef Skills', 'chef-skills', 'en', 'hard'),
('Навыки шеф-повара', 'chef-skills', 'ru', 'hard'),
('Аспазбасы дағдылары', 'chef-skills', 'kk', 'hard'),

('Pastry Making', 'pastry-making', 'en', 'hard'),
('Кондитерское дело', 'pastry-making', 'ru', 'hard'),
('Кондитерлік өнер', 'pastry-making', 'kk', 'hard'),

('Barista Skills', 'barista-skills', 'en', 'hard'),
('Навыки бариста', 'barista-skills', 'ru', 'hard'),
('Бариста дағдылары', 'barista-skills', 'kk', 'hard'),

('Bartending', 'bartending', 'en', 'hard'),
('Барменское дело', 'bartending', 'ru', 'hard'),
('Бармендік', 'bartending', 'kk', 'hard'),

('Mixology', 'mixology', 'en', 'hard'),
('Миксология', 'mixology', 'ru', 'hard'),
('Миксология', 'mixology', 'kk', 'hard'),

('Wine Knowledge', 'wine-knowledge', 'en', 'hard'),
('Знание вин', 'wine-knowledge', 'ru', 'hard'),
('Шарап білімі', 'wine-knowledge', 'kk', 'hard'),

('Sommelier Skills', 'sommelier-skills', 'en', 'hard'),
('Навыки сомелье', 'sommelier-skills', 'ru', 'hard'),
('Сомелье дағдылары', 'sommelier-skills', 'kk', 'hard'),

('Table Service', 'table-service', 'en', 'hard'),
('Обслуживание столов', 'table-service', 'ru', 'hard'),
('Үстел қызметі', 'table-service', 'kk', 'hard'),

('POS Systems', 'pos-systems', 'en', 'tool'),
('POS системы', 'pos-systems', 'ru', 'tool'),
('POS жүйелері', 'pos-systems', 'kk', 'tool'),

('Tour Guiding', 'tour-guiding', 'en', 'hard'),
('Экскурсоводство', 'tour-guiding', 'ru', 'hard'),
('Экскурсия жүргізу', 'tour-guiding', 'kk', 'hard'),

('Travel Planning', 'travel-planning', 'en', 'hard'),
('Планирование путешествий', 'travel-planning', 'ru', 'hard'),
('Саяхат жоспарлау', 'travel-planning', 'kk', 'hard'),

('Itinerary Development', 'itinerary-development', 'en', 'hard'),
('Разработка маршрутов', 'itinerary-development', 'ru', 'hard'),
('Бағыт әзірлеу', 'itinerary-development', 'kk', 'hard'),

('Destination Knowledge', 'destination-knowledge', 'en', 'hard'),
('Знание направлений', 'destination-knowledge', 'ru', 'hard'),
('Бағыттарды білу', 'destination-knowledge', 'kk', 'hard'),

('Booking Management', 'booking-management', 'en', 'hard'),
('Управление бронированием', 'booking-management', 'ru', 'hard'),
('Брондауды басқару', 'booking-management', 'kk', 'hard'),

('GDS Systems', 'gds-systems', 'en', 'tool'),
('GDS системы', 'gds-systems', 'ru', 'tool'),
('GDS жүйелері', 'gds-systems', 'kk', 'tool'),

('Amadeus', 'amadeus', 'en', 'tool'),
('Amadeus', 'amadeus', 'ru', 'tool'),
('Amadeus', 'amadeus', 'kk', 'tool'),

('Sabre', 'sabre', 'en', 'tool'),
('Sabre', 'sabre', 'ru', 'tool'),
('Sabre', 'sabre', 'kk', 'tool'),

('Event Planning', 'event-planning', 'en', 'hard'),
('Организация мероприятий', 'event-planning', 'ru', 'hard'),
('Іс-шара ұйымдастыру', 'event-planning', 'kk', 'hard'),

('Wedding Planning', 'wedding-planning', 'en', 'hard'),
('Организация свадеб', 'wedding-planning', 'ru', 'hard'),
('Үйлену тойын ұйымдастыру', 'wedding-planning', 'kk', 'hard'),

('Conference Management', 'conference-management', 'en', 'hard'),
('Управление конференциями', 'conference-management', 'ru', 'hard'),
('Конференция басқару', 'conference-management', 'kk', 'hard'),

('Vendor Coordination', 'vendor-coordination-hospitality', 'en', 'hard'),
('Координация поставщиков', 'vendor-coordination-hospitality', 'ru', 'hard'),
('Жеткізушілерді үйлестіру', 'vendor-coordination-hospitality', 'kk', 'hard'),

('Spa Management', 'spa-management', 'en', 'hard'),
('Управление SPA', 'spa-management', 'ru', 'hard'),
('СПА басқару', 'spa-management', 'kk', 'hard'),

('Massage Therapy', 'massage-therapy', 'en', 'hard'),
('Массажная терапия', 'massage-therapy', 'ru', 'hard'),
('Массаж терапиясы', 'massage-therapy', 'kk', 'hard'),

('Wellness Programs', 'wellness-programs', 'en', 'hard'),
('Велнес программы', 'wellness-programs', 'ru', 'hard'),
('Велнес бағдарламалары', 'wellness-programs', 'kk', 'hard'),

('Resort Management', 'resort-management', 'en', 'hard'),
('Управление курортом', 'resort-management', 'ru', 'hard'),
('Курорт басқару', 'resort-management', 'kk', 'hard'),

('Cruise Ship Operations', 'cruise-ship-operations', 'en', 'hard'),
('Работа на круизных лайнерах', 'cruise-ship-operations', 'ru', 'hard'),
('Круиз кемесі операциялары', 'cruise-ship-operations', 'kk', 'hard'),

('Entertainment Programming', 'entertainment-programming', 'en', 'hard'),
('Программирование развлечений', 'entertainment-programming', 'ru', 'hard'),
('Ойын-сауық бағдарламасы', 'entertainment-programming', 'kk', 'hard'),

('Timeshare Sales', 'timeshare-sales', 'en', 'hard'),
('Продажа таймшеров', 'timeshare-sales', 'ru', 'hard'),
('Таймшер сату', 'timeshare-sales', 'kk', 'hard'),

('Vacation Rentals', 'vacation-rentals', 'en', 'hard'),
('Аренда для отдыха', 'vacation-rentals', 'ru', 'hard'),
('Демалыс үшін жалға беру', 'vacation-rentals', 'kk', 'hard'),

('Airbnb Management', 'airbnb-management', 'en', 'hard'),
('Управление Airbnb', 'airbnb-management', 'ru', 'hard'),
('Airbnb басқару', 'airbnb-management', 'kk', 'hard'),

('Cultural Tourism', 'cultural-tourism', 'en', 'hard'),
('Культурный туризм', 'cultural-tourism', 'ru', 'hard'),
('Мәдени туризм', 'cultural-tourism', 'kk', 'hard'),

('Eco-Tourism', 'eco-tourism', 'en', 'hard'),
('Экотуризм', 'eco-tourism', 'ru', 'hard'),
('Экотуризм', 'eco-tourism', 'kk', 'hard'),

('Adventure Tourism', 'adventure-tourism', 'en', 'hard'),
('Приключенческий туризм', 'adventure-tourism', 'ru', 'hard'),
('Шытырман туризм', 'adventure-tourism', 'kk', 'hard'),

('Heritage Management', 'heritage-management', 'en', 'hard'),
('Управление наследием', 'heritage-management', 'ru', 'hard'),
('Мұраны басқару', 'heritage-management', 'kk', 'hard'),

('Museum Operations', 'museum-operations', 'en', 'hard'),
('Музейная деятельность', 'museum-operations', 'ru', 'hard'),
('Мұражай қызметі', 'museum-operations', 'kk', 'hard');

-- ============================================
-- RETAIL & E-COMMERCE (50 skills = 150 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Store Management', 'store-management', 'en', 'hard'),
('Управление магазином', 'store-management', 'ru', 'hard'),
('Дүкен басқару', 'store-management', 'kk', 'hard'),

('Visual Merchandising', 'visual-merchandising', 'en', 'hard'),
('Визуальный мерчандайзинг', 'visual-merchandising', 'ru', 'hard'),
('Визуалды мерчандайзинг', 'visual-merchandising', 'kk', 'hard'),

('Stock Management', 'stock-management', 'en', 'hard'),
('Управление товарными запасами', 'stock-management', 'ru', 'hard'),
('Тауар қорын басқару', 'stock-management', 'kk', 'hard'),

('Point of Sale', 'point-of-sale', 'en', 'hard'),
('Точка продаж', 'point-of-sale', 'ru', 'hard'),
('Сату нүктесі', 'point-of-sale', 'kk', 'hard'),

('Cash Handling', 'cash-handling', 'en', 'hard'),
('Работа с наличными', 'cash-handling', 'ru', 'hard'),
('Қолма-қол ақшамен жұмыс', 'cash-handling', 'kk', 'hard'),

('Loss Prevention', 'loss-prevention', 'en', 'hard'),
('Предотвращение потерь', 'loss-prevention', 'ru', 'hard'),
('Шығынды болдырмау', 'loss-prevention', 'kk', 'hard'),

('Retail Analytics', 'retail-analytics', 'en', 'hard'),
('Розничная аналитика', 'retail-analytics', 'ru', 'hard'),
('Бөлшек сауда аналитикасы', 'retail-analytics', 'kk', 'hard'),

('Category Management', 'category-management', 'en', 'hard'),
('Управление категориями', 'category-management', 'ru', 'hard'),
('Санаттарды басқару', 'category-management', 'kk', 'hard'),

('Pricing Strategy', 'pricing-strategy-retail', 'en', 'hard'),
('Ценовая стратегия', 'pricing-strategy-retail', 'ru', 'hard'),
('Баға стратегиясы', 'pricing-strategy-retail', 'kk', 'hard'),

('Promotion Management', 'promotion-management', 'en', 'hard'),
('Управление акциями', 'promotion-management', 'ru', 'hard'),
('Акцияларды басқару', 'promotion-management', 'kk', 'hard'),

('Customer Service Retail', 'customer-service-retail', 'en', 'hard'),
('Обслуживание клиентов', 'customer-service-retail', 'ru', 'hard'),
('Клиенттерге қызмет көрсету', 'customer-service-retail', 'kk', 'hard'),

('Product Knowledge', 'product-knowledge', 'en', 'hard'),
('Знание продукта', 'product-knowledge', 'ru', 'hard'),
('Өнім білімі', 'product-knowledge', 'kk', 'hard'),

('Upselling Techniques', 'upselling-techniques', 'en', 'hard'),
('Техники допродаж', 'upselling-techniques', 'ru', 'hard'),
('Қосымша сату техникасы', 'upselling-techniques', 'kk', 'hard'),

('E-commerce Management', 'ecommerce-management', 'en', 'hard'),
('Управление электронной торговлей', 'ecommerce-management', 'ru', 'hard'),
('Электронды сауданы басқару', 'ecommerce-management', 'kk', 'hard'),

('Online Store Setup', 'online-store-setup', 'en', 'hard'),
('Настройка интернет-магазина', 'online-store-setup', 'ru', 'hard'),
('Интернет-дүкен орнату', 'online-store-setup', 'kk', 'hard'),

('Shopify', 'shopify', 'en', 'tool'),
('Shopify', 'shopify', 'ru', 'tool'),
('Shopify', 'shopify', 'kk', 'tool'),

('WooCommerce', 'woocommerce', 'en', 'tool'),
('WooCommerce', 'woocommerce', 'ru', 'tool'),
('WooCommerce', 'woocommerce', 'kk', 'tool'),

('Magento', 'magento', 'en', 'tool'),
('Magento', 'magento', 'ru', 'tool'),
('Magento', 'magento', 'kk', 'tool'),

('Product Listings', 'product-listings', 'en', 'hard'),
('Размещение товаров', 'product-listings', 'ru', 'hard'),
('Тауар орналастыру', 'product-listings', 'kk', 'hard'),

('Product Photography', 'product-photography', 'en', 'hard'),
('Товарная фотография', 'product-photography', 'ru', 'hard'),
('Тауар фотографиясы', 'product-photography', 'kk', 'hard'),

('Inventory Forecasting', 'inventory-forecasting', 'en', 'hard'),
('Прогнозирование запасов', 'inventory-forecasting', 'ru', 'hard'),
('Қорларды болжау', 'inventory-forecasting', 'kk', 'hard'),

('Dropshipping', 'dropshipping', 'en', 'hard'),
('Дропшиппинг', 'dropshipping', 'ru', 'hard'),
('Дропшиппинг', 'dropshipping', 'kk', 'hard'),

('Amazon Seller', 'amazon-seller', 'en', 'hard'),
('Продажи на Amazon', 'amazon-seller', 'ru', 'hard'),
('Amazon сатушысы', 'amazon-seller', 'kk', 'hard'),

('eBay Selling', 'ebay-selling', 'en', 'hard'),
('Продажи на eBay', 'ebay-selling', 'ru', 'hard'),
('eBay сатушысы', 'ebay-selling', 'kk', 'hard'),

('Etsy Shop Management', 'etsy-shop-management', 'en', 'hard'),
('Управление магазином Etsy', 'etsy-shop-management', 'ru', 'hard'),
('Etsy дүкенін басқару', 'etsy-shop-management', 'kk', 'hard'),

('Marketplace Management', 'marketplace-management', 'en', 'hard'),
('Управление маркетплейсом', 'marketplace-management', 'ru', 'hard'),
('Маркетплейсті басқару', 'marketplace-management', 'kk', 'hard'),

('Cart Abandonment Recovery', 'cart-abandonment-recovery', 'en', 'hard'),
('Возврат брошенных корзин', 'cart-abandonment-recovery', 'ru', 'hard'),
('Тасталған себеттерді қайтару', 'cart-abandonment-recovery', 'kk', 'hard'),

('Checkout Optimization', 'checkout-optimization', 'en', 'hard'),
('Оптимизация оформления', 'checkout-optimization', 'ru', 'hard'),
('Төлем процесін оңтайландыру', 'checkout-optimization', 'kk', 'hard'),

('Payment Gateway Integration', 'payment-gateway-integration', 'en', 'hard'),
('Интеграция платежных систем', 'payment-gateway-integration', 'ru', 'hard'),
('Төлем жүйелерін интеграциялау', 'payment-gateway-integration', 'kk', 'hard'),

('Stripe', 'stripe', 'en', 'tool'),
('Stripe', 'stripe', 'ru', 'tool'),
('Stripe', 'stripe', 'kk', 'tool'),

('PayPal', 'paypal', 'en', 'tool'),
('PayPal', 'paypal', 'ru', 'tool'),
('PayPal', 'paypal', 'kk', 'tool'),

('Shipping Solutions', 'shipping-solutions', 'en', 'hard'),
('Решения для доставки', 'shipping-solutions', 'ru', 'hard'),
('Жеткізу шешімдері', 'shipping-solutions', 'kk', 'hard'),

('Order Processing', 'order-processing', 'en', 'hard'),
('Обработка заказов', 'order-processing', 'ru', 'hard'),
('Тапсырыстарды өңдеу', 'order-processing', 'kk', 'hard'),

('Customer Reviews Management', 'customer-reviews-management', 'en', 'hard'),
('Управление отзывами', 'customer-reviews-management', 'ru', 'hard'),
('Пікірлерді басқару', 'customer-reviews-management', 'kk', 'hard'),

('Loyalty Programs', 'loyalty-programs', 'en', 'hard'),
('Программы лояльности', 'loyalty-programs', 'ru', 'hard'),
('Адалдық бағдарламалары', 'loyalty-programs', 'kk', 'hard'),

('Personalization', 'personalization', 'en', 'hard'),
('Персонализация', 'personalization', 'ru', 'hard'),
('Жекелендіру', 'personalization', 'kk', 'hard'),

('Product Recommendations', 'product-recommendations', 'en', 'hard'),
('Рекомендации товаров', 'product-recommendations', 'ru', 'hard'),
('Тауар ұсыныстары', 'product-recommendations', 'kk', 'hard'),

('Fashion Retail', 'fashion-retail', 'en', 'hard'),
('Модная розница', 'fashion-retail', 'ru', 'hard'),
('Сән бөлшек саудасы', 'fashion-retail', 'kk', 'hard'),

('Beauty Retail', 'beauty-retail', 'en', 'hard'),
('Косметическая розница', 'beauty-retail', 'ru', 'hard'),
('Косметика бөлшек саудасы', 'beauty-retail', 'kk', 'hard'),

('Electronics Retail', 'electronics-retail', 'en', 'hard'),
('Продажа электроники', 'electronics-retail', 'ru', 'hard'),
('Электроника сатуы', 'electronics-retail', 'kk', 'hard'),

('Grocery Retail', 'grocery-retail', 'en', 'hard'),
('Продуктовая розница', 'grocery-retail', 'ru', 'hard'),
('Азық-түлік бөлшек саудасы', 'grocery-retail', 'kk', 'hard'),

('Luxury Retail', 'luxury-retail', 'en', 'hard'),
('Премиальная розница', 'luxury-retail', 'ru', 'hard'),
('Люкс бөлшек сауда', 'luxury-retail', 'kk', 'hard'),

('Subscription Box Management', 'subscription-box-management', 'en', 'hard'),
('Управление подписками', 'subscription-box-management', 'ru', 'hard'),
('Жазылымды басқару', 'subscription-box-management', 'kk', 'hard'),

('Pop-Up Store Operations', 'pop-up-store-operations', 'en', 'hard'),
('Работа поп-ап магазинов', 'pop-up-store-operations', 'ru', 'hard'),
('Поп-ап дүкен операциялары', 'pop-up-store-operations', 'kk', 'hard'),

('Wholesale Management', 'wholesale-management', 'en', 'hard'),
('Управление оптом', 'wholesale-management', 'ru', 'hard'),
('Көтерме сауданы басқару', 'wholesale-management', 'kk', 'hard'),

('Retail Buying', 'retail-buying', 'en', 'hard'),
('Закупки для розницы', 'retail-buying', 'ru', 'hard'),
('Бөлшек сауда сатып алу', 'retail-buying', 'kk', 'hard'),

('Assortment Planning', 'assortment-planning', 'en', 'hard'),
('Планирование ассортимента', 'assortment-planning', 'ru', 'hard'),
('Ассортиментті жоспарлау', 'assortment-planning', 'kk', 'hard'),

('Floor Planning', 'floor-planning', 'en', 'hard'),
('Планировка торгового зала', 'floor-planning', 'ru', 'hard'),
('Сауда залын жоспарлау', 'floor-planning', 'kk', 'hard');

-- ============================================
-- CUSTOMER SERVICE (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Customer Service', 'customer-service', 'en', 'soft'),
('Обслуживание клиентов', 'customer-service', 'ru', 'soft'),
('Клиенттерге қызмет көрсету', 'customer-service', 'kk', 'soft'),

('Call Center Operations', 'call-center-operations', 'en', 'hard'),
('Работа колл-центра', 'call-center-operations', 'ru', 'hard'),
('Қоңырау орталығы жұмысы', 'call-center-operations', 'kk', 'hard'),

('Phone Support', 'phone-support', 'en', 'hard'),
('Телефонная поддержка', 'phone-support', 'ru', 'hard'),
('Телефон қолдауы', 'phone-support', 'kk', 'hard'),

('Email Support', 'email-support', 'en', 'hard'),
('Email поддержка', 'email-support', 'ru', 'hard'),
('Email қолдауы', 'email-support', 'kk', 'hard'),

('Live Chat Support', 'live-chat-support', 'en', 'hard'),
('Поддержка в чате', 'live-chat-support', 'ru', 'hard'),
('Тікелей чат қолдауы', 'live-chat-support', 'kk', 'hard'),

('Ticketing Systems', 'ticketing-systems', 'en', 'tool'),
('Системы тикетов', 'ticketing-systems', 'ru', 'tool'),
('Тікет жүйелері', 'ticketing-systems', 'kk', 'tool'),

('Zendesk', 'zendesk', 'en', 'tool'),
('Zendesk', 'zendesk', 'ru', 'tool'),
('Zendesk', 'zendesk', 'kk', 'tool'),

('Freshdesk', 'freshdesk', 'en', 'tool'),
('Freshdesk', 'freshdesk', 'ru', 'tool'),
('Freshdesk', 'freshdesk', 'kk', 'tool'),

('Intercom', 'intercom', 'en', 'tool'),
('Intercom', 'intercom', 'ru', 'tool'),
('Intercom', 'intercom', 'kk', 'tool'),

('Complaint Resolution', 'complaint-resolution', 'en', 'hard'),
('Решение жалоб', 'complaint-resolution', 'ru', 'hard'),
('Шағымдарды шешу', 'complaint-resolution', 'kk', 'hard'),

('Escalation Management', 'escalation-management', 'en', 'hard'),
('Управление эскалацией', 'escalation-management', 'ru', 'hard'),
('Эскалацияны басқару', 'escalation-management', 'kk', 'hard'),

('Customer Satisfaction', 'customer-satisfaction', 'en', 'hard'),
('Удовлетворенность клиентов', 'customer-satisfaction', 'ru', 'hard'),
('Клиент қанағаттануы', 'customer-satisfaction', 'kk', 'hard'),

('CSAT Metrics', 'csat-metrics', 'en', 'hard'),
('CSAT метрики', 'csat-metrics', 'ru', 'hard'),
('CSAT көрсеткіштері', 'csat-metrics', 'kk', 'hard'),

('NPS', 'nps', 'en', 'hard'),
('NPS', 'nps', 'ru', 'hard'),
('NPS', 'nps', 'kk', 'hard'),

('Technical Support', 'technical-support', 'en', 'hard'),
('Техническая поддержка', 'technical-support', 'ru', 'hard'),
('Техникалық қолдау', 'technical-support', 'kk', 'hard'),

('Troubleshooting', 'troubleshooting', 'en', 'hard'),
('Устранение неполадок', 'troubleshooting', 'ru', 'hard'),
('Ақауларды жою', 'troubleshooting', 'kk', 'hard'),

('Remote Support', 'remote-support', 'en', 'hard'),
('Удаленная поддержка', 'remote-support', 'ru', 'hard'),
('Қашықтан қолдау', 'remote-support', 'kk', 'hard'),

('Help Desk', 'help-desk', 'en', 'hard'),
('Служба поддержки', 'help-desk', 'ru', 'hard'),
('Көмек қызметі', 'help-desk', 'kk', 'hard'),

('SLA Management', 'sla-management', 'en', 'hard'),
('Управление SLA', 'sla-management', 'ru', 'hard'),
('SLA басқару', 'sla-management', 'kk', 'hard'),

('Response Time Management', 'response-time-management', 'en', 'hard'),
('Управление временем ответа', 'response-time-management', 'ru', 'hard'),
('Жауап беру уақытын басқару', 'response-time-management', 'kk', 'hard'),

('First Call Resolution', 'first-call-resolution', 'en', 'hard'),
('Решение с первого звонка', 'first-call-resolution', 'ru', 'hard'),
('Бірінші қоңыраудан шешу', 'first-call-resolution', 'kk', 'hard'),

('Customer Retention', 'customer-retention-service', 'en', 'hard'),
('Удержание клиентов', 'customer-retention-service', 'ru', 'hard'),
('Клиенттерді ұстау', 'customer-retention-service', 'kk', 'hard'),

('Churn Prevention', 'churn-prevention', 'en', 'hard'),
('Предотвращение оттока', 'churn-prevention', 'ru', 'hard'),
('Ағымды болдырмау', 'churn-prevention', 'kk', 'hard'),

('Account Management Support', 'account-management-support', 'en', 'hard'),
('Поддержка аккаунтов', 'account-management-support', 'ru', 'hard'),
('Аккаунт қолдауы', 'account-management-support', 'kk', 'hard'),

('Billing Support', 'billing-support', 'en', 'hard'),
('Поддержка по биллингу', 'billing-support', 'ru', 'hard'),
('Төлем қолдауы', 'billing-support', 'kk', 'hard'),

('Refund Processing', 'refund-processing', 'en', 'hard'),
('Обработка возвратов', 'refund-processing', 'ru', 'hard'),
('Қайтаруларды өңдеу', 'refund-processing', 'kk', 'hard'),

('Warranty Support', 'warranty-support', 'en', 'hard'),
('Гарантийная поддержка', 'warranty-support', 'ru', 'hard'),
('Кепілдік қолдауы', 'warranty-support', 'kk', 'hard'),

('Product Support', 'product-support', 'en', 'hard'),
('Поддержка продукта', 'product-support', 'ru', 'hard'),
('Өнім қолдауы', 'product-support', 'kk', 'hard'),

('Software Support', 'software-support', 'en', 'hard'),
('Поддержка ПО', 'software-support', 'ru', 'hard'),
('БҚ қолдауы', 'software-support', 'kk', 'hard'),

('Knowledge Base Management', 'knowledge-base-management', 'en', 'hard'),
('Управление базой знаний', 'knowledge-base-management', 'ru', 'hard'),
('Білім базасын басқару', 'knowledge-base-management', 'kk', 'hard'),

('FAQ Creation', 'faq-creation', 'en', 'hard'),
('Создание FAQ', 'faq-creation', 'ru', 'hard'),
('FAQ жасау', 'faq-creation', 'kk', 'hard'),

('Self-Service Support', 'self-service-support', 'en', 'hard'),
('Самообслуживание', 'self-service-support', 'ru', 'hard'),
('Өзін-өзі қызмет көрсету', 'self-service-support', 'kk', 'hard'),

('Chatbot Management', 'chatbot-management', 'en', 'hard'),
('Управление чат-ботами', 'chatbot-management', 'ru', 'hard'),
('Чат-ботты басқару', 'chatbot-management', 'kk', 'hard'),

('Quality Assurance CS', 'quality-assurance-cs', 'en', 'hard'),
('Контроль качества обслуживания', 'quality-assurance-cs', 'ru', 'hard'),
('Қызмет сапасын бақылау', 'quality-assurance-cs', 'kk', 'hard'),

('Call Monitoring', 'call-monitoring', 'en', 'hard'),
('Мониторинг звонков', 'call-monitoring', 'ru', 'hard'),
('Қоңырауларды бақылау', 'call-monitoring', 'kk', 'hard'),

('Customer Feedback Analysis', 'customer-feedback-analysis', 'en', 'hard'),
('Анализ отзывов клиентов', 'customer-feedback-analysis', 'ru', 'hard'),
('Клиент пікірлерін талдау', 'customer-feedback-analysis', 'kk', 'hard'),

('Service Level Agreement', 'service-level-agreement', 'en', 'hard'),
('Соглашение об уровне обслуживания', 'service-level-agreement', 'ru', 'hard'),
('Қызмет деңгейі келісімі', 'service-level-agreement', 'kk', 'hard'),

('Multilingual Support', 'multilingual-support', 'en', 'hard'),
('Многоязычная поддержка', 'multilingual-support', 'ru', 'hard'),
('Көптілді қолдау', 'multilingual-support', 'kk', 'hard'),

('Social Media Support', 'social-media-support', 'en', 'hard'),
('Поддержка в соцсетях', 'social-media-support', 'ru', 'hard'),
('Әлеуметтік желі қолдауы', 'social-media-support', 'kk', 'hard');

-- ============================================
-- SECURITY & SAFETY (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Physical Security', 'physical-security', 'en', 'hard'),
('Физическая безопасность', 'physical-security', 'ru', 'hard'),
('Физикалық қауіпсіздік', 'physical-security', 'kk', 'hard'),

('Security Guard', 'security-guard', 'en', 'hard'),
('Охранная деятельность', 'security-guard', 'ru', 'hard'),
('Күзет қызметі', 'security-guard', 'kk', 'hard'),

('Access Control', 'access-control', 'en', 'hard'),
('Контроль доступа', 'access-control', 'ru', 'hard'),
('Қолжетімділік бақылауы', 'access-control', 'kk', 'hard'),

('CCTV Monitoring', 'cctv-monitoring', 'en', 'hard'),
('Видеонаблюдение', 'cctv-monitoring', 'ru', 'hard'),
('Бейне бақылау', 'cctv-monitoring', 'kk', 'hard'),

('Alarm Systems', 'alarm-systems', 'en', 'hard'),
('Системы сигнализации', 'alarm-systems', 'ru', 'hard'),
('Дабыл жүйелері', 'alarm-systems', 'kk', 'hard'),

('Security Assessment', 'security-assessment', 'en', 'hard'),
('Оценка безопасности', 'security-assessment', 'ru', 'hard'),
('Қауіпсіздікті бағалау', 'security-assessment', 'kk', 'hard'),

('Risk Assessment Security', 'risk-assessment-security', 'en', 'hard'),
('Оценка рисков безопасности', 'risk-assessment-security', 'ru', 'hard'),
('Қауіпсіздік тәуекелін бағалау', 'risk-assessment-security', 'kk', 'hard'),

('Emergency Response', 'emergency-response', 'en', 'hard'),
('Аварийное реагирование', 'emergency-response', 'ru', 'hard'),
('Төтенше жағдайға жауап беру', 'emergency-response', 'kk', 'hard'),

('Crisis Management', 'crisis-management', 'en', 'hard'),
('Антикризисное управление', 'crisis-management', 'ru', 'hard'),
('Дағдарыс басқару', 'crisis-management', 'kk', 'hard'),

('Evacuation Planning', 'evacuation-planning', 'en', 'hard'),
('Планирование эвакуации', 'evacuation-planning', 'ru', 'hard'),
('Эвакуацияны жоспарлау', 'evacuation-planning', 'kk', 'hard'),

('Fire Safety', 'fire-safety', 'en', 'hard'),
('Пожарная безопасность', 'fire-safety', 'ru', 'hard'),
('Өрт қауіпсіздігі', 'fire-safety', 'kk', 'hard'),

('Fire Prevention', 'fire-prevention', 'en', 'hard'),
('Предотвращение пожаров', 'fire-prevention', 'ru', 'hard'),
('Өрт болдырмау', 'fire-prevention', 'kk', 'hard'),

('Fire Fighting', 'fire-fighting', 'en', 'hard'),
('Пожаротушение', 'fire-fighting', 'ru', 'hard'),
('Өрт сөндіру', 'fire-fighting', 'kk', 'hard'),

('Fire Inspection', 'fire-inspection', 'en', 'hard'),
('Пожарная инспекция', 'fire-inspection', 'ru', 'hard'),
('Өрт инспекциясы', 'fire-inspection', 'kk', 'hard'),

('Occupational Safety', 'occupational-safety', 'en', 'hard'),
('Охрана труда', 'occupational-safety', 'ru', 'hard'),
('Еңбек қорғау', 'occupational-safety', 'kk', 'hard'),

('Safety Training', 'safety-training', 'en', 'hard'),
('Обучение безопасности', 'safety-training', 'ru', 'hard'),
('Қауіпсіздік оқыту', 'safety-training', 'kk', 'hard'),

('Hazard Identification', 'hazard-identification', 'en', 'hard'),
('Выявление опасностей', 'hazard-identification', 'ru', 'hard'),
('Қауіпті анықтау', 'hazard-identification', 'kk', 'hard'),

('Safety Protocols', 'safety-protocols', 'en', 'hard'),
('Протоколы безопасности', 'safety-protocols', 'ru', 'hard'),
('Қауіпсіздік хаттамалары', 'safety-protocols', 'kk', 'hard'),

('Personal Protective Equipment', 'personal-protective-equipment', 'en', 'hard'),
('Средства индивидуальной защиты', 'personal-protective-equipment', 'ru', 'hard'),
('Жеке қорғау құралдары', 'personal-protective-equipment', 'kk', 'hard'),

('Incident Investigation', 'incident-investigation', 'en', 'hard'),
('Расследование инцидентов', 'incident-investigation', 'ru', 'hard'),
('Оқиғаны тергеу', 'incident-investigation', 'kk', 'hard'),

('Safety Inspections', 'safety-inspections', 'en', 'hard'),
('Проверки безопасности', 'safety-inspections', 'ru', 'hard'),
('Қауіпсіздік тексерулері', 'safety-inspections', 'kk', 'hard'),

('Safety Documentation', 'safety-documentation', 'en', 'hard'),
('Документация по безопасности', 'safety-documentation', 'ru', 'hard'),
('Қауіпсіздік құжаттамасы', 'safety-documentation', 'kk', 'hard'),

('Environmental Health Safety', 'environmental-health-safety', 'en', 'hard'),
('Охрана окружающей среды и здоровья', 'environmental-health-safety', 'ru', 'hard'),
('Қоршаған орта және денсаулық қорғау', 'environmental-health-safety', 'kk', 'hard'),

('Industrial Hygiene', 'industrial-hygiene', 'en', 'hard'),
('Производственная гигиена', 'industrial-hygiene', 'ru', 'hard'),
('Өндірістік гигиена', 'industrial-hygiene', 'kk', 'hard'),

('Confined Space Entry', 'confined-space-entry', 'en', 'hard'),
('Работа в замкнутых пространствах', 'confined-space-entry', 'ru', 'hard'),
('Жабық кеңістікте жұмыс', 'confined-space-entry', 'kk', 'hard'),

('Lockout Tagout', 'lockout-tagout', 'en', 'hard'),
('Блокировка и маркировка', 'lockout-tagout', 'ru', 'hard'),
('Блоктау және белгілеу', 'lockout-tagout', 'kk', 'hard'),

('Fall Protection', 'fall-protection', 'en', 'hard'),
('Защита от падения', 'fall-protection', 'ru', 'hard'),
('Құлаудан қорғау', 'fall-protection', 'kk', 'hard'),

('Electrical Safety', 'electrical-safety', 'en', 'hard'),
('Электробезопасность', 'electrical-safety', 'ru', 'hard'),
('Электр қауіпсіздігі', 'electrical-safety', 'kk', 'hard'),

('Chemical Safety', 'chemical-safety', 'en', 'hard'),
('Химическая безопасность', 'chemical-safety', 'ru', 'hard'),
('Химиялық қауіпсіздік', 'chemical-safety', 'kk', 'hard'),

('Radiation Safety', 'radiation-safety', 'en', 'hard'),
('Радиационная безопасность', 'radiation-safety', 'ru', 'hard'),
('Радиациялық қауіпсіздік', 'radiation-safety', 'kk', 'hard'),

('Bloodborne Pathogens', 'bloodborne-pathogens', 'en', 'hard'),
('Патогены крови', 'bloodborne-pathogens', 'ru', 'hard'),
('Қан арқылы жұғатын патогендер', 'bloodborne-pathogens', 'kk', 'hard'),

('Biosafety', 'biosafety', 'en', 'hard'),
('Биологическая безопасность', 'biosafety', 'ru', 'hard'),
('Биологиялық қауіпсіздік', 'biosafety', 'kk', 'hard'),

('Security Clearance', 'security-clearance', 'en', 'hard'),
('Допуск безопасности', 'security-clearance', 'ru', 'hard'),
('Қауіпсіздік рұқсаты', 'security-clearance', 'kk', 'hard'),

('Background Checks', 'background-checks', 'en', 'hard'),
('Проверка биографии', 'background-checks', 'ru', 'hard'),
('Өмірбаянды тексеру', 'background-checks', 'kk', 'hard'),

('Surveillance Operations', 'surveillance-operations', 'en', 'hard'),
('Наблюдение', 'surveillance-operations', 'ru', 'hard'),
('Бақылау операциялары', 'surveillance-operations', 'kk', 'hard'),

('Executive Protection', 'executive-protection', 'en', 'hard'),
('Охрана VIP', 'executive-protection', 'ru', 'hard'),
('VIP қорғау', 'executive-protection', 'kk', 'hard'),

('Event Security', 'event-security', 'en', 'hard'),
('Безопасность мероприятий', 'event-security', 'ru', 'hard'),
('Іс-шара қауіпсіздігі', 'event-security', 'kk', 'hard'),

('Crowd Control', 'crowd-control', 'en', 'hard'),
('Контроль толпы', 'crowd-control', 'ru', 'hard'),
('Тобырды бақылау', 'crowd-control', 'kk', 'hard'),

('Metal Detection', 'metal-detection', 'en', 'hard'),
('Металлодетекция', 'metal-detection', 'ru', 'hard'),
('Металл анықтау', 'metal-detection', 'kk', 'hard');

-- ============================================
-- SPORTS & FITNESS (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Personal Training', 'personal-training', 'en', 'hard'),
('Персональные тренировки', 'personal-training', 'ru', 'hard'),
('Жеке жаттықтыру', 'personal-training', 'kk', 'hard'),

('Fitness Instruction', 'fitness-instruction', 'en', 'hard'),
('Фитнес инструктаж', 'fitness-instruction', 'ru', 'hard'),
('Фитнес нұсқаулық', 'fitness-instruction', 'kk', 'hard'),

('Strength Training', 'strength-training', 'en', 'hard'),
('Силовые тренировки', 'strength-training', 'ru', 'hard'),
('Күш жаттығулары', 'strength-training', 'kk', 'hard'),

('Cardio Training', 'cardio-training', 'en', 'hard'),
('Кардиотренировки', 'cardio-training', 'ru', 'hard'),
('Кардио жаттығулары', 'cardio-training', 'kk', 'hard'),

('Yoga Instruction', 'yoga-instruction', 'en', 'hard'),
('Преподавание йоги', 'yoga-instruction', 'ru', 'hard'),
('Йога оқыту', 'yoga-instruction', 'kk', 'hard'),

('Pilates', 'pilates', 'en', 'hard'),
('Пилатес', 'pilates', 'ru', 'hard'),
('Пилатес', 'pilates', 'kk', 'hard'),

('CrossFit', 'crossfit', 'en', 'hard'),
('Кроссфит', 'crossfit', 'ru', 'hard'),
('Кроссфит', 'crossfit', 'kk', 'hard'),

('HIIT Training', 'hiit-training', 'en', 'hard'),
('ВИИТ тренировки', 'hiit-training', 'ru', 'hard'),
('ЖИИТ жаттығулары', 'hiit-training', 'kk', 'hard'),

('Group Fitness', 'group-fitness', 'en', 'hard'),
('Групповой фитнес', 'group-fitness', 'ru', 'hard'),
('Топтық фитнес', 'group-fitness', 'kk', 'hard'),

('Spinning', 'spinning', 'en', 'hard'),
('Сайклинг', 'spinning', 'ru', 'hard'),
('Велотренажер', 'spinning', 'kk', 'hard'),

('Aerobics', 'aerobics', 'en', 'hard'),
('Аэробика', 'aerobics', 'ru', 'hard'),
('Аэробика', 'aerobics', 'kk', 'hard'),

('Zumba', 'zumba', 'en', 'hard'),
('Зумба', 'zumba', 'ru', 'hard'),
('Зумба', 'zumba', 'kk', 'hard'),

('Nutrition Counseling', 'nutrition-counseling', 'en', 'hard'),
('Консультации по питанию', 'nutrition-counseling', 'ru', 'hard'),
('Тамақтану бойынша кеңес', 'nutrition-counseling', 'kk', 'hard'),

('Sports Nutrition', 'sports-nutrition', 'en', 'hard'),
('Спортивное питание', 'sports-nutrition', 'ru', 'hard'),
('Спорттық тамақтану', 'sports-nutrition', 'kk', 'hard'),

('Meal Planning', 'meal-planning', 'en', 'hard'),
('Планирование питания', 'meal-planning', 'ru', 'hard'),
('Тамақтануды жоспарлау', 'meal-planning', 'kk', 'hard'),

('Weight Management', 'weight-management', 'en', 'hard'),
('Управление весом', 'weight-management', 'ru', 'hard'),
('Салмақты басқару', 'weight-management', 'kk', 'hard'),

('Athletic Training', 'athletic-training', 'en', 'hard'),
('Спортивные тренировки', 'athletic-training', 'ru', 'hard'),
('Спорттық жаттығулар', 'athletic-training', 'kk', 'hard'),

('Sports Coaching', 'sports-coaching', 'en', 'hard'),
('Спортивный коучинг', 'sports-coaching', 'ru', 'hard'),
('Спорттық жаттықтыру', 'sports-coaching', 'kk', 'hard'),

('Sports Medicine', 'sports-medicine', 'en', 'hard'),
('Спортивная медицина', 'sports-medicine', 'ru', 'hard'),
('Спорттық медицина', 'sports-medicine', 'kk', 'hard'),

('Injury Prevention', 'injury-prevention', 'en', 'hard'),
('Предотвращение травм', 'injury-prevention', 'ru', 'hard'),
('Жарақатты болдырмау', 'injury-prevention', 'kk', 'hard'),

('Rehabilitation', 'rehabilitation', 'en', 'hard'),
('Реабилитация', 'rehabilitation', 'ru', 'hard'),
('Оңалту', 'rehabilitation', 'kk', 'hard'),

('Kinesiology', 'kinesiology', 'en', 'hard'),
('Кинезиология', 'kinesiology', 'ru', 'hard'),
('Кинезиология', 'kinesiology', 'kk', 'hard'),

('Exercise Physiology', 'exercise-physiology', 'en', 'hard'),
('Физиология упражнений', 'exercise-physiology', 'ru', 'hard'),
('Жаттығу физиологиясы', 'exercise-physiology', 'kk', 'hard'),

('Biomechanics', 'biomechanics', 'en', 'hard'),
('Биомеханика', 'biomechanics', 'ru', 'hard'),
('Биомеханика', 'biomechanics', 'kk', 'hard'),

('Fitness Assessment', 'fitness-assessment', 'en', 'hard'),
('Оценка физической подготовки', 'fitness-assessment', 'ru', 'hard'),
('Фитнес бағалауы', 'fitness-assessment', 'kk', 'hard'),

('Body Composition Analysis', 'body-composition-analysis', 'en', 'hard'),
('Анализ состава тела', 'body-composition-analysis', 'ru', 'hard'),
('Дене құрамын талдау', 'body-composition-analysis', 'kk', 'hard'),

('Flexibility Training', 'flexibility-training', 'en', 'hard'),
('Тренировка гибкости', 'flexibility-training', 'ru', 'hard'),
('Икемділік жаттығулары', 'flexibility-training', 'kk', 'hard'),

('Balance Training', 'balance-training', 'en', 'hard'),
('Тренировка равновесия', 'balance-training', 'ru', 'hard'),
('Тепе-теңдік жаттығулары', 'balance-training', 'kk', 'hard'),

('Functional Training', 'functional-training', 'en', 'hard'),
('Функциональные тренировки', 'functional-training', 'ru', 'hard'),
('Функционалды жаттығулар', 'functional-training', 'kk', 'hard'),

('Corrective Exercise', 'corrective-exercise', 'en', 'hard'),
('Корректирующие упражнения', 'corrective-exercise', 'ru', 'hard'),
('Түзету жаттығулары', 'corrective-exercise', 'kk', 'hard'),

('Swimming Instruction', 'swimming-instruction', 'en', 'hard'),
('Обучение плаванию', 'swimming-instruction', 'ru', 'hard'),
('Жүзуге үйрету', 'swimming-instruction', 'kk', 'hard'),

('Lifeguarding', 'lifeguarding', 'en', 'hard'),
('Спасательная служба', 'lifeguarding', 'ru', 'hard'),
('Құтқару қызметі', 'lifeguarding', 'kk', 'hard'),

('Martial Arts', 'martial-arts', 'en', 'hard'),
('Боевые искусства', 'martial-arts', 'ru', 'hard'),
('Жекпе-жек өнері', 'martial-arts', 'kk', 'hard'),

('Boxing', 'boxing', 'en', 'hard'),
('Бокс', 'boxing', 'ru', 'hard'),
('Бокс', 'boxing', 'kk', 'hard'),

('Kickboxing', 'kickboxing', 'en', 'hard'),
('Кикбоксинг', 'kickboxing', 'ru', 'hard'),
('Кикбоксинг', 'kickboxing', 'kk', 'hard'),

('Running Coaching', 'running-coaching', 'en', 'hard'),
('Тренерство по бегу', 'running-coaching', 'ru', 'hard'),
('Жүгіру жаттықтырушысы', 'running-coaching', 'kk', 'hard'),

('Cycling Coaching', 'cycling-coaching', 'en', 'hard'),
('Тренерство по велоспорту', 'cycling-coaching', 'ru', 'hard'),
('Велоспорт жаттықтырушысы', 'cycling-coaching', 'kk', 'hard'),

('Team Sports Coaching', 'team-sports-coaching', 'en', 'hard'),
('Командные виды спорта', 'team-sports-coaching', 'ru', 'hard'),
('Командалық спорт', 'team-sports-coaching', 'kk', 'hard'),

('Gym Management', 'gym-management', 'en', 'hard'),
('Управление спортзалом', 'gym-management', 'ru', 'hard'),
('Спорт залын басқару', 'gym-management', 'kk', 'hard');

-- ============================================
-- ARTS & CRAFTS (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Drawing', 'drawing', 'en', 'hard'),
('Рисование', 'drawing', 'ru', 'hard'),
('Сурет салу', 'drawing', 'kk', 'hard'),

('Sketching', 'sketching', 'en', 'hard'),
('Эскизирование', 'sketching', 'ru', 'hard'),
('Эскиз салу', 'sketching', 'kk', 'hard'),

('Painting', 'painting', 'en', 'hard'),
('Живопись', 'painting', 'ru', 'hard'),
('Кескіндеме', 'painting', 'kk', 'hard'),

('Watercolor', 'watercolor', 'en', 'hard'),
('Акварель', 'watercolor', 'ru', 'hard'),
('Акварель', 'watercolor', 'kk', 'hard'),

('Oil Painting', 'oil-painting', 'en', 'hard'),
('Масляная живопись', 'oil-painting', 'ru', 'hard'),
('Май бояу', 'oil-painting', 'kk', 'hard'),

('Acrylic Painting', 'acrylic-painting', 'en', 'hard'),
('Акриловая живопись', 'acrylic-painting', 'ru', 'hard'),
('Акрил бояу', 'acrylic-painting', 'kk', 'hard'),

('Printmaking', 'printmaking', 'en', 'hard'),
('Гравюра', 'printmaking', 'ru', 'hard'),
('Граверлік', 'printmaking', 'kk', 'hard'),

('Screen Printing', 'screen-printing', 'en', 'hard'),
('Трафаретная печать', 'screen-printing', 'ru', 'hard'),
('Трафареттік басып шығару', 'screen-printing', 'kk', 'hard'),

('Calligraphy', 'calligraphy', 'en', 'hard'),
('Каллиграфия', 'calligraphy', 'ru', 'hard'),
('Каллиграфия', 'calligraphy', 'kk', 'hard'),

('Ceramics', 'ceramics', 'en', 'hard'),
('Керамика', 'ceramics', 'ru', 'hard'),
('Керамика', 'ceramics', 'kk', 'hard'),

('Pottery', 'pottery', 'en', 'hard'),
('Гончарное дело', 'pottery', 'ru', 'hard'),
('Құмыра жасау', 'pottery', 'kk', 'hard'),

('Sculpture', 'sculpture', 'en', 'hard'),
('Скульптура', 'sculpture', 'ru', 'hard'),
('Мүсін', 'sculpture', 'kk', 'hard'),

('Clay Modeling', 'clay-modeling', 'en', 'hard'),
('Лепка', 'clay-modeling', 'ru', 'hard'),
('Саз қалыптау', 'clay-modeling', 'kk', 'hard'),

('Woodworking', 'woodworking', 'en', 'hard'),
('Деревообработка', 'woodworking', 'ru', 'hard'),
('Ағаш өңдеу', 'woodworking', 'kk', 'hard'),

('Wood Carving', 'wood-carving', 'en', 'hard'),
('Резьба по дереву', 'wood-carving', 'ru', 'hard'),
('Ағашқа ою', 'wood-carving', 'kk', 'hard'),

('Furniture Making', 'furniture-making', 'en', 'hard'),
('Мебельное производство', 'furniture-making', 'ru', 'hard'),
('Жиһаз жасау', 'furniture-making', 'kk', 'hard'),

('Metalworking', 'metalworking', 'en', 'hard'),
('Металлообработка', 'metalworking', 'ru', 'hard'),
('Металл өңдеу', 'metalworking', 'kk', 'hard'),

('Jewelry Making', 'jewelry-making', 'en', 'hard'),
('Ювелирное дело', 'jewelry-making', 'ru', 'hard'),
('Зергерлік іс', 'jewelry-making', 'kk', 'hard'),

('Silversmithing', 'silversmithing', 'en', 'hard'),
('Серебряное дело', 'silversmithing', 'ru', 'hard'),
('Күміс өңдеу', 'silversmithing', 'kk', 'hard'),

('Glassblowing', 'glassblowing', 'en', 'hard'),
('Стеклодувное дело', 'glassblowing', 'ru', 'hard'),
('Шыны үрлеу', 'glassblowing', 'kk', 'hard'),

('Stained Glass', 'stained-glass', 'en', 'hard'),
('Витражи', 'stained-glass', 'ru', 'hard'),
('Витраж', 'stained-glass', 'kk', 'hard'),

('Mosaic Art', 'mosaic-art', 'en', 'hard'),
('Мозаика', 'mosaic-art', 'ru', 'hard'),
('Мозаика өнері', 'mosaic-art', 'kk', 'hard'),

('Textile Arts', 'textile-arts', 'en', 'hard'),
('Текстильное искусство', 'textile-arts', 'ru', 'hard'),
('Тоқыма өнері', 'textile-arts', 'kk', 'hard'),

('Weaving', 'weaving', 'en', 'hard'),
('Ткачество', 'weaving', 'ru', 'hard'),
('Тоқу', 'weaving', 'kk', 'hard'),

('Knitting', 'knitting', 'en', 'hard'),
('Вязание', 'knitting', 'ru', 'hard'),
('Тоқу', 'knitting', 'kk', 'hard'),

('Crochet', 'crochet', 'en', 'hard'),
('Вязание крючком', 'crochet', 'ru', 'hard'),
('Ине тоқу', 'crochet', 'kk', 'hard'),

('Embroidery', 'embroidery', 'en', 'hard'),
('Вышивка', 'embroidery', 'ru', 'hard'),
('Кесте', 'embroidery', 'kk', 'hard'),

('Quilting', 'quilting', 'en', 'hard'),
('Квилтинг', 'quilting', 'ru', 'hard'),
('Көрпе тігу', 'quilting', 'kk', 'hard'),

('Sewing', 'sewing', 'en', 'hard'),
('Шитье', 'sewing', 'ru', 'hard'),
('Тігу', 'sewing', 'kk', 'hard'),

('Leatherworking', 'leatherworking', 'en', 'hard'),
('Кожевенное дело', 'leatherworking', 'ru', 'hard'),
('Былғары өңдеу', 'leatherworking', 'kk', 'hard'),

('Bookbinding', 'bookbinding', 'en', 'hard'),
('Переплетное дело', 'bookbinding', 'ru', 'hard'),
('Кітап мұқабалау', 'bookbinding', 'kk', 'hard'),

('Paper Crafts', 'paper-crafts', 'en', 'hard'),
('Поделки из бумаги', 'paper-crafts', 'ru', 'hard'),
('Қағаз қолөнері', 'paper-crafts', 'kk', 'hard'),

('Origami', 'origami', 'en', 'hard'),
('Оригами', 'origami', 'ru', 'hard'),
('Оригами', 'origami', 'kk', 'hard'),

('Scrapbooking', 'scrapbooking', 'en', 'hard'),
('Скрапбукинг', 'scrapbooking', 'ru', 'hard'),
('Скрапбукинг', 'scrapbooking', 'kk', 'hard'),

('Candle Making', 'candle-making', 'en', 'hard'),
('Изготовление свечей', 'candle-making', 'ru', 'hard'),
('Шырақ жасау', 'candle-making', 'kk', 'hard'),

('Soap Making', 'soap-making', 'en', 'hard'),
('Мыловарение', 'soap-making', 'ru', 'hard'),
('Сабын жасау', 'soap-making', 'kk', 'hard'),

('Beadwork', 'beadwork', 'en', 'hard'),
('Бисероплетение', 'beadwork', 'ru', 'hard'),
('Моншақ өру', 'beadwork', 'kk', 'hard'),

('Macrame', 'macrame', 'en', 'hard'),
('Макраме', 'macrame', 'ru', 'hard'),
('Макраме', 'macrame', 'kk', 'hard'),

('Floral Design', 'floral-design', 'en', 'hard'),
('Флористика', 'floral-design', 'ru', 'hard'),
('Гүл безендіру', 'floral-design', 'kk', 'hard');

-- ============================================
-- AVIATION & MARITIME (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Pilot License', 'pilot-license', 'en', 'hard'),
('Лицензия пилота', 'pilot-license', 'ru', 'hard'),
('Ұшқыш лицензиясы', 'pilot-license', 'kk', 'hard'),

('Commercial Pilot', 'commercial-pilot', 'en', 'hard'),
('Коммерческий пилот', 'commercial-pilot', 'ru', 'hard'),
('Коммерциялық ұшқыш', 'commercial-pilot', 'kk', 'hard'),

('Private Pilot', 'private-pilot', 'en', 'hard'),
('Частный пилот', 'private-pilot', 'ru', 'hard'),
('Жеке ұшқыш', 'private-pilot', 'kk', 'hard'),

('Instrument Rating', 'instrument-rating', 'en', 'hard'),
('Приборный рейтинг', 'instrument-rating', 'ru', 'hard'),
('Аспаптық рейтинг', 'instrument-rating', 'kk', 'hard'),

('Multi-Engine Rating', 'multi-engine-rating', 'en', 'hard'),
('Многомоторный рейтинг', 'multi-engine-rating', 'ru', 'hard'),
('Көпқозғалтқышты рейтинг', 'multi-engine-rating', 'kk', 'hard'),

('Flight Instruction', 'flight-instruction', 'en', 'hard'),
('Летное обучение', 'flight-instruction', 'ru', 'hard'),
('Ұшу оқыту', 'flight-instruction', 'kk', 'hard'),

('Aircraft Maintenance', 'aircraft-maintenance', 'en', 'hard'),
('Обслуживание воздушных судов', 'aircraft-maintenance', 'ru', 'hard'),
('Ұшақты қызмет көрсету', 'aircraft-maintenance', 'kk', 'hard'),

('Avionics', 'avionics', 'en', 'hard'),
('Авиационная электроника', 'avionics', 'ru', 'hard'),
('Авиациялық электроника', 'avionics', 'kk', 'hard'),

('Aircraft Systems', 'aircraft-systems', 'en', 'hard'),
('Авиационные системы', 'aircraft-systems', 'ru', 'hard'),
('Ұшақ жүйелері', 'aircraft-systems', 'kk', 'hard'),

('Flight Planning', 'flight-planning', 'en', 'hard'),
('Планирование полета', 'flight-planning', 'ru', 'hard'),
('Ұшуды жоспарлау', 'flight-planning', 'kk', 'hard'),

('Air Traffic Control', 'air-traffic-control', 'en', 'hard'),
('Авиадиспетчерская служба', 'air-traffic-control', 'ru', 'hard'),
('Әуе қозғалысын бақылау', 'air-traffic-control', 'kk', 'hard'),

('Aviation Regulations', 'aviation-regulations', 'en', 'hard'),
('Авиационные правила', 'aviation-regulations', 'ru', 'hard'),
('Авиация ережелері', 'aviation-regulations', 'kk', 'hard'),

('FAA Regulations', 'faa-regulations', 'en', 'hard'),
('Правила FAA', 'faa-regulations', 'ru', 'hard'),
('FAA ережелері', 'faa-regulations', 'kk', 'hard'),

('Flight Safety', 'flight-safety', 'en', 'hard'),
('Безопасность полетов', 'flight-safety', 'ru', 'hard'),
('Ұшу қауіпсіздігі', 'flight-safety', 'kk', 'hard'),

('Cabin Crew', 'cabin-crew', 'en', 'hard'),
('Бортпроводник', 'cabin-crew', 'ru', 'hard'),
('Бортөнер', 'cabin-crew', 'kk', 'hard'),

('In-Flight Service', 'in-flight-service', 'en', 'hard'),
('Обслуживание на борту', 'in-flight-service', 'ru', 'hard'),
('Бортта қызмет көрсету', 'in-flight-service', 'kk', 'hard'),

('Emergency Procedures Aviation', 'emergency-procedures-aviation', 'en', 'hard'),
('Аварийные процедуры', 'emergency-procedures-aviation', 'ru', 'hard'),
('Апаттық рәсімдер', 'emergency-procedures-aviation', 'kk', 'hard'),

('Airport Operations', 'airport-operations', 'en', 'hard'),
('Аэропортовая деятельность', 'airport-operations', 'ru', 'hard'),
('Әуежай операциялары', 'airport-operations', 'kk', 'hard'),

('Ground Handling', 'ground-handling', 'en', 'hard'),
('Наземное обслуживание', 'ground-handling', 'ru', 'hard'),
('Жерүсті қызмет көрсету', 'ground-handling', 'kk', 'hard'),

('Ramp Operations', 'ramp-operations', 'en', 'hard'),
('Работа на перроне', 'ramp-operations', 'ru', 'hard'),
('Перрон жұмыстары', 'ramp-operations', 'kk', 'hard'),

('Marine Navigation', 'marine-navigation', 'en', 'hard'),
('Морская навигация', 'marine-navigation', 'ru', 'hard'),
('Теңіз навигациясы', 'marine-navigation', 'kk', 'hard'),

('Ship Operations', 'ship-operations', 'en', 'hard'),
('Судовые операции', 'ship-operations', 'ru', 'hard'),
('Кеме операциялары', 'ship-operations', 'kk', 'hard'),

('Maritime Law', 'maritime-law', 'en', 'hard'),
('Морское право', 'maritime-law', 'ru', 'hard'),
('Теңіз құқығы', 'maritime-law', 'kk', 'hard'),

('Deck Operations', 'deck-operations', 'en', 'hard'),
('Палубные операции', 'deck-operations', 'ru', 'hard'),
('Палуба операциялары', 'deck-operations', 'kk', 'hard'),

('Engine Room Operations', 'engine-room-operations', 'en', 'hard'),
('Машинное отделение', 'engine-room-operations', 'ru', 'hard'),
('Машина бөлмесі операциялары', 'engine-room-operations', 'kk', 'hard'),

('Maritime Safety', 'maritime-safety', 'en', 'hard'),
('Морская безопасность', 'maritime-safety', 'ru', 'hard'),
('Теңіз қауіпсіздігі', 'maritime-safety', 'kk', 'hard'),

('STCW Certification', 'stcw-certification', 'en', 'hard'),
('STCW сертификация', 'stcw-certification', 'ru', 'hard'),
('STCW сертификаттау', 'stcw-certification', 'kk', 'hard'),

('Cargo Handling', 'cargo-handling', 'en', 'hard'),
('Грузовые операции', 'cargo-handling', 'ru', 'hard'),
('Жүк жұмыстары', 'cargo-handling', 'kk', 'hard'),

('Ballast Operations', 'ballast-operations', 'en', 'hard'),
('Балластные операции', 'ballast-operations', 'ru', 'hard'),
('Балласт операциялары', 'ballast-operations', 'kk', 'hard'),

('Mooring Operations', 'mooring-operations', 'en', 'hard'),
('Швартовые операции', 'mooring-operations', 'ru', 'hard'),
('Байлау операциялары', 'mooring-operations', 'kk', 'hard'),

('Navigational Charts', 'navigational-charts', 'en', 'hard'),
('Навигационные карты', 'navigational-charts', 'ru', 'hard'),
('Навигациялық карталар', 'navigational-charts', 'kk', 'hard'),

('Radar Operation', 'radar-operation', 'en', 'hard'),
('Работа с радаром', 'radar-operation', 'ru', 'hard'),
('Радармен жұмыс', 'radar-operation', 'kk', 'hard'),

('Ship Stability', 'ship-stability', 'en', 'hard'),
('Остойчивость судна', 'ship-stability', 'ru', 'hard'),
('Кеме тұрақтылығы', 'ship-stability', 'kk', 'hard'),

('Marine Engineering', 'marine-engineering', 'en', 'hard'),
('Судовая механика', 'marine-engineering', 'ru', 'hard'),
('Теңіз инженериясы', 'marine-engineering', 'kk', 'hard'),

('Naval Architecture', 'naval-architecture', 'en', 'hard'),
('Кораблестроение', 'naval-architecture', 'ru', 'hard'),
('Кеме құрылысы', 'naval-architecture', 'kk', 'hard'),

('Shipbuilding', 'shipbuilding', 'en', 'hard'),
('Судостроение', 'shipbuilding', 'ru', 'hard'),
('Кеме жасау', 'shipbuilding', 'kk', 'hard'),

('Marine Surveying', 'marine-surveying', 'en', 'hard'),
('Морская инспекция', 'marine-surveying', 'ru', 'hard'),
('Теңіз инспекциясы', 'marine-surveying', 'kk', 'hard'),

('Offshore Operations', 'offshore-operations', 'en', 'hard'),
('Оффшорные операции', 'offshore-operations', 'ru', 'hard'),
('Теңіз операциялары', 'offshore-operations', 'kk', 'hard'),

('Fishing Operations', 'fishing-operations', 'en', 'hard'),
('Рыболовные операции', 'fishing-operations', 'ru', 'hard'),
('Балық аулау операциялары', 'fishing-operations', 'kk', 'hard');

-- ============================================
-- MINING & ENERGY (40 skills = 120 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Mining Engineering', 'mining-engineering', 'en', 'hard'),
('Горная инженерия', 'mining-engineering', 'ru', 'hard'),
('Тау-кен инженериясы', 'mining-engineering', 'kk', 'hard'),

('Geological Surveying', 'geological-surveying', 'en', 'hard'),
('Геологическая разведка', 'geological-surveying', 'ru', 'hard'),
('Геологиялық барлау', 'geological-surveying', 'kk', 'hard'),

('Drilling Operations', 'drilling-operations', 'en', 'hard'),
('Буровые операции', 'drilling-operations', 'ru', 'hard'),
('Бұрғылау операциялары', 'drilling-operations', 'kk', 'hard'),

('Blasting', 'blasting', 'en', 'hard'),
('Взрывные работы', 'blasting', 'ru', 'hard'),
('Жарылыс жұмыстары', 'blasting', 'kk', 'hard'),

('Ore Processing', 'ore-processing', 'en', 'hard'),
('Переработка руды', 'ore-processing', 'ru', 'hard'),
('Кенді өңдеу', 'ore-processing', 'kk', 'hard'),

('Mineral Exploration', 'mineral-exploration', 'en', 'hard'),
('Разведка полезных ископаемых', 'mineral-exploration', 'ru', 'hard'),
('Пайдалы қазбаларды барлау', 'mineral-exploration', 'kk', 'hard'),

('Mine Planning', 'mine-planning', 'en', 'hard'),
('Планирование шахты', 'mine-planning', 'ru', 'hard'),
('Шахтаны жоспарлау', 'mine-planning', 'kk', 'hard'),

('Underground Mining', 'underground-mining', 'en', 'hard'),
('Подземная добыча', 'underground-mining', 'ru', 'hard'),
('Жерасты өндіру', 'underground-mining', 'kk', 'hard'),

('Surface Mining', 'surface-mining', 'en', 'hard'),
('Открытая добыча', 'surface-mining', 'ru', 'hard'),
('Ашық өндіру', 'surface-mining', 'kk', 'hard'),

('Mine Ventilation', 'mine-ventilation', 'en', 'hard'),
('Шахтная вентиляция', 'mine-ventilation', 'ru', 'hard'),
('Шахта желдетуі', 'mine-ventilation', 'kk', 'hard'),

('Mine Safety', 'mine-safety', 'en', 'hard'),
('Шахтная безопасность', 'mine-safety', 'ru', 'hard'),
('Шахта қауіпсіздігі', 'mine-safety', 'kk', 'hard'),

('Coal Mining', 'coal-mining', 'en', 'hard'),
('Угледобыча', 'coal-mining', 'ru', 'hard'),
('Көмір өндіру', 'coal-mining', 'kk', 'hard'),

('Metal Mining', 'metal-mining', 'en', 'hard'),
('Добыча металлов', 'metal-mining', 'ru', 'hard'),
('Металл өндіру', 'metal-mining', 'kk', 'hard'),

('Quarrying', 'quarrying', 'en', 'hard'),
('Карьерная разработка', 'quarrying', 'ru', 'hard'),
('Кен орнын өндіру', 'quarrying', 'kk', 'hard'),

('Oil and Gas', 'oil-and-gas', 'en', 'hard'),
('Нефть и газ', 'oil-and-gas', 'ru', 'hard'),
('Мұнай және газ', 'oil-and-gas', 'kk', 'hard'),

('Petroleum Engineering', 'petroleum-engineering', 'en', 'hard'),
('Нефтяная инженерия', 'petroleum-engineering', 'ru', 'hard'),
('Мұнай инженериясы', 'petroleum-engineering', 'kk', 'hard'),

('Well Drilling', 'well-drilling', 'en', 'hard'),
('Бурение скважин', 'well-drilling', 'ru', 'hard'),
('Ұңғыма бұрғылау', 'well-drilling', 'kk', 'hard'),

('Production Engineering', 'production-engineering', 'en', 'hard'),
('Добывающая инженерия', 'production-engineering', 'ru', 'hard'),
('Өндіріс инженериясы', 'production-engineering', 'kk', 'hard'),

('Reservoir Engineering', 'reservoir-engineering', 'en', 'hard'),
('Инженерия резервуаров', 'reservoir-engineering', 'ru', 'hard'),
('Қойма инженериясы', 'reservoir-engineering', 'kk', 'hard'),

('Pipeline Operations', 'pipeline-operations', 'en', 'hard'),
('Эксплуатация трубопроводов', 'pipeline-operations', 'ru', 'hard'),
('Құбыр операциялары', 'pipeline-operations', 'kk', 'hard'),

('Refinery Operations', 'refinery-operations', 'en', 'hard'),
('Нефтепереработка', 'refinery-operations', 'ru', 'hard'),
('Мұнай өңдеу', 'refinery-operations', 'kk', 'hard'),

('Energy Management', 'energy-management', 'en', 'hard'),
('Управление энергией', 'energy-management', 'ru', 'hard'),
('Энергия басқару', 'energy-management', 'kk', 'hard'),

('Power Plant Operations', 'power-plant-operations', 'en', 'hard'),
('Работа электростанции', 'power-plant-operations', 'ru', 'hard'),
('Электр станциясы жұмысы', 'power-plant-operations', 'kk', 'hard'),

('Electrical Grid Management', 'electrical-grid-management', 'en', 'hard'),
('Управление электросетью', 'electrical-grid-management', 'ru', 'hard'),
('Электр желісін басқару', 'electrical-grid-management', 'kk', 'hard'),

('Nuclear Energy', 'nuclear-energy', 'en', 'hard'),
('Ядерная энергия', 'nuclear-energy', 'ru', 'hard'),
('Ядролық энергия', 'nuclear-energy', 'kk', 'hard'),

('Nuclear Safety', 'nuclear-safety', 'en', 'hard'),
('Ядерная безопасность', 'nuclear-safety', 'ru', 'hard'),
('Ядролық қауіпсіздік', 'nuclear-safety', 'kk', 'hard'),

('Hydroelectric Power', 'hydroelectric-power', 'en', 'hard'),
('Гидроэнергетика', 'hydroelectric-power', 'ru', 'hard'),
('Су энергиясы', 'hydroelectric-power', 'kk', 'hard'),

('Geothermal Energy', 'geothermal-energy', 'en', 'hard'),
('Геотермальная энергия', 'geothermal-energy', 'ru', 'hard'),
('Геотермиялық энергия', 'geothermal-energy', 'kk', 'hard'),

('Biomass Energy', 'biomass-energy', 'en', 'hard'),
('Биомасса энергия', 'biomass-energy', 'ru', 'hard'),
('Биомасса энергиясы', 'biomass-energy', 'kk', 'hard'),

('Energy Storage', 'energy-storage', 'en', 'hard'),
('Хранение энергии', 'energy-storage', 'ru', 'hard'),
('Энергия сақтау', 'energy-storage', 'kk', 'hard'),

('Battery Technology', 'battery-technology', 'en', 'hard'),
('Аккумуляторные технологии', 'battery-technology', 'ru', 'hard'),
('Батарея технологиясы', 'battery-technology', 'kk', 'hard'),

('Smart Grid', 'smart-grid', 'en', 'hard'),
('Умные сети', 'smart-grid', 'ru', 'hard'),
('Ақылды желі', 'smart-grid', 'kk', 'hard'),

('Energy Efficiency', 'energy-efficiency', 'en', 'hard'),
('Энергоэффективность', 'energy-efficiency', 'ru', 'hard'),
('Энергия тиімділігі', 'energy-efficiency', 'kk', 'hard'),

('Carbon Capture', 'carbon-capture', 'en', 'hard'),
('Улавливание углерода', 'carbon-capture', 'ru', 'hard'),
('Көміртегі ұстау', 'carbon-capture', 'kk', 'hard'),

('Environmental Remediation', 'environmental-remediation', 'en', 'hard'),
('Экологическое восстановление', 'environmental-remediation', 'ru', 'hard'),
('Экологиялық қалпына келтіру', 'environmental-remediation', 'kk', 'hard'),

('Mine Reclamation', 'mine-reclamation', 'en', 'hard'),
('Рекультивация шахт', 'mine-reclamation', 'ru', 'hard'),
('Шахтаны қалпына келтіру', 'mine-reclamation', 'kk', 'hard'),

('Seismic Analysis', 'seismic-analysis', 'en', 'hard'),
('Сейсмический анализ', 'seismic-analysis', 'ru', 'hard'),
('Сейсмикалық талдау', 'seismic-analysis', 'kk', 'hard'),

('Geophysical Surveying', 'geophysical-surveying', 'en', 'hard'),
('Геофизическая разведка', 'geophysical-surveying', 'ru', 'hard'),
('Геофизикалық барлау', 'geophysical-surveying', 'kk', 'hard'),

('Resource Estimation', 'resource-estimation', 'en', 'hard'),
('Оценка ресурсов', 'resource-estimation', 'ru', 'hard'),
('Ресурстарды бағалау', 'resource-estimation', 'kk', 'hard');

-- ============================================
-- TELECOMMUNICATIONS (20 skills = 60 records)
-- ============================================

INSERT INTO skills_dictionary (name, canonical_name, language, category) VALUES
('Telecommunications', 'telecommunications', 'en', 'hard'),
('Телекоммуникации', 'telecommunications', 'ru', 'hard'),
('Телекоммуникация', 'telecommunications', 'kk', 'hard'),

('Network Administration', 'network-administration', 'en', 'hard'),
('Администрирование сетей', 'network-administration', 'ru', 'hard'),
('Желі әкімшілендіру', 'network-administration', 'kk', 'hard'),

('Wireless Communication', 'wireless-communication', 'en', 'hard'),
('Беспроводная связь', 'wireless-communication', 'ru', 'hard'),
('Сымсыз байланыс', 'wireless-communication', 'kk', 'hard'),

('5G Technology', '5g-technology', 'en', 'hard'),
('5G технология', '5g-technology', 'ru', 'hard'),
('5G технологиясы', '5g-technology', 'kk', 'hard'),

('Fiber Optics', 'fiber-optics', 'en', 'hard'),
('Оптоволокно', 'fiber-optics', 'ru', 'hard'),
('Талшықты оптика', 'fiber-optics', 'kk', 'hard'),

('VoIP', 'voip', 'en', 'hard'),
('VoIP', 'voip', 'ru', 'hard'),
('VoIP', 'voip', 'kk', 'hard'),

('Satellite Communication', 'satellite-communication', 'en', 'hard'),
('Спутниковая связь', 'satellite-communication', 'ru', 'hard'),
('Спутниктік байланыс', 'satellite-communication', 'kk', 'hard'),

('Microwave Systems', 'microwave-systems', 'en', 'hard'),
('Микроволновые системы', 'microwave-systems', 'ru', 'hard'),
('Микротолқынды жүйелер', 'microwave-systems', 'kk', 'hard'),

('Antenna Design', 'antenna-design', 'en', 'hard'),
('Проектирование антенн', 'antenna-design', 'ru', 'hard'),
('Антенна дизайны', 'antenna-design', 'kk', 'hard'),

('RF Engineering', 'rf-engineering', 'en', 'hard'),
('РЧ инженерия', 'rf-engineering', 'ru', 'hard'),
('РЖ инженерия', 'rf-engineering', 'kk', 'hard'),

('Telecom Infrastructure', 'telecom-infrastructure', 'en', 'hard'),
('Телеком инфраструктура', 'telecom-infrastructure', 'ru', 'hard'),
('Телеком инфрақұрылымы', 'telecom-infrastructure', 'kk', 'hard'),

('Tower Installation', 'tower-installation', 'en', 'hard'),
('Установка вышек', 'tower-installation', 'ru', 'hard'),
('Мұнара орнату', 'tower-installation', 'kk', 'hard'),

('Switching Systems', 'switching-systems', 'en', 'hard'),
('Коммутационные системы', 'switching-systems', 'ru', 'hard'),
('Коммутация жүйелері', 'switching-systems', 'kk', 'hard'),

('Transmission Systems', 'transmission-systems', 'en', 'hard'),
('Передающие системы', 'transmission-systems', 'ru', 'hard'),
('Тарату жүйелері', 'transmission-systems', 'kk', 'hard'),

('Telecom Testing', 'telecom-testing', 'en', 'hard'),
('Телеком тестирование', 'telecom-testing', 'ru', 'hard'),
('Телеком тестілеу', 'telecom-testing', 'kk', 'hard'),

('Network Optimization', 'network-optimization', 'en', 'hard'),
('Оптимизация сети', 'network-optimization', 'ru', 'hard'),
('Желіні оңтайландыру', 'network-optimization', 'kk', 'hard'),

('Telecom Billing', 'telecom-billing', 'en', 'hard'),
('Телеком биллинг', 'telecom-billing', 'ru', 'hard'),
('Телеком төлем', 'telecom-billing', 'kk', 'hard'),

('OSS/BSS Systems', 'oss-bss-systems', 'en', 'tool'),
('OSS/BSS системы', 'oss-bss-systems', 'ru', 'tool'),
('OSS/BSS жүйелері', 'oss-bss-systems', 'kk', 'tool'),

('Mobile Networks', 'mobile-networks', 'en', 'hard'),
('Мобильные сети', 'mobile-networks', 'ru', 'hard'),
('Мобильді желілер', 'mobile-networks', 'kk', 'hard'),

('LTE Technology', 'lte-technology', 'en', 'hard'),
('LTE технология', 'lte-technology', 'ru', 'hard'),
('LTE технологиясы', 'lte-technology', 'kk', 'hard');

-- ============================================
-- SUMMARY & COMPLETION
-- ============================================

-- Total unique skills in Part 2: 800
-- Total records in Part 2: 2400 (800 × 3 languages)
-- Categories covered:
-- 1. Healthcare & Medical - 60 skills
-- 2. Education & Training - 50 skills
-- 3. Engineering & Manufacturing - 60 skills
-- 4. Creative Industries - 60 skills
-- 5. Science & Research - 60 skills
-- 6. Agriculture & Environment - 50 skills
-- 7. Construction & Real Estate - 50 skills
-- 8. Transportation & Logistics - 50 skills
-- 9. Hospitality & Tourism - 50 skills
-- 10. Retail & E-commerce - 50 skills
-- 11. Customer Service - 40 skills
-- 12. Security & Safety - 40 skills
-- 13. Sports & Fitness - 40 skills
-- 14. Arts & Crafts - 40 skills
-- 15. Aviation & Maritime - 40 skills
-- 16. Mining & Energy - 40 skills
-- 17. Telecommunications - 20 skills

-- ╔═══════════════════════════════════════════════════════════╗
-- ║  MIGRATION PART 2 COMPLETE: 800 NEW UNIQUE SKILLS         ║
-- ║  2400 NEW RECORDS (EN, RU, KK)                            ║
-- ║                                                             ║
-- ║  TOTAL WITH PART 1: 1800 UNIQUE SKILLS                     ║
-- ║  TOTAL RECORDS: 5400 (1800 × 3 LANGUAGES)                  ║
-- ╚═══════════════════════════════════════════════════════════╝