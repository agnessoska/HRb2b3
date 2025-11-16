CREATE OR REPLACE FUNCTION public.make_document_public(p_document_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_organization_id uuid;
  v_hr_specialist_id uuid;
  v_document_type text;
BEGIN
  -- Получаем ID HR-специалиста, который вызывает функцию
  SELECT auth.uid() INTO v_hr_specialist_id;

  -- Получаем организацию HR
  SELECT organization_id INTO v_organization_id
  FROM public.hr_specialists
  WHERE user_id = v_hr_specialist_id;

  IF v_organization_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'HR specialist not found');
  END IF;

  -- Определяем, к какой таблице относится документ
  IF EXISTS (SELECT 1 FROM public.generated_documents WHERE id = p_document_id AND organization_id = v_organization_id) THEN
    UPDATE public.generated_documents
    SET is_public = true
    WHERE id = p_document_id;
    v_document_type := 'generated_documents';
  ELSIF EXISTS (SELECT 1 FROM public.candidate_full_analysis WHERE id = p_document_id AND organization_id = v_organization_id) THEN
    UPDATE public.candidate_full_analysis
    SET is_public = true
    WHERE id = p_document_id;
    v_document_type := 'candidate_full_analysis';
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Document not found or access denied');
  END IF;

  RETURN jsonb_build_object('success', true, 'document_id', p_document_id, 'type', v_document_type);
END;
$$;
