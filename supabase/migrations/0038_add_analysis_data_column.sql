-- Добавляем колонку analysis_data типа JSONB для хранения структурированного результата анализа
ALTER TABLE resume_analysis_results 
ADD COLUMN IF NOT EXISTS analysis_data JSONB;

-- Комментарий к колонке
COMMENT ON COLUMN resume_analysis_results.analysis_data IS 'Structured JSON data from AI analysis for rendering and PDF generation';