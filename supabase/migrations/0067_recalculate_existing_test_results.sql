-- Пересчитываем все существующие результаты тестов
DO $$
DECLARE
  test_result RECORD;
  calculated_result jsonb;
BEGIN
  FOR test_result IN
    SELECT id, test_id, answers
    FROM candidate_test_results
    WHERE answers IS NOT NULL
  LOOP
    -- Вызываем функцию пересчета
    SELECT calculate_test_results(test_result.test_id, test_result.answers)
    INTO calculated_result;
    
    -- Обновляем результат (используем -> для jsonb, а не ->> для text)
    UPDATE candidate_test_results
    SET
      raw_scores = calculated_result->'raw_scores',
      normalized_scores = calculated_result->'normalized_scores',
      detailed_result = calculated_result->>'detailed_result'
    WHERE id = test_result.id;
  END LOOP;
  
  RAISE NOTICE 'Recalculated all test results successfully';
END $$;