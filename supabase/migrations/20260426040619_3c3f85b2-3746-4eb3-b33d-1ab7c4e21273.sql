DO $$
DECLARE
  v_sql text;
BEGIN
  SELECT pg_get_functiondef('public.seed_demo_run()'::regprocedure)
  INTO v_sql;

  IF v_sql IS NULL THEN
    RAISE EXCEPTION 'Function public.seed_demo_run() not found';
  END IF;

  IF position('DISABLE TRIGGER tasks_status_machine' in v_sql) = 0 THEN
    v_sql := replace(
      v_sql,
      'ALTER TABLE tasks DISABLE TRIGGER trg_validate_dept_status;',
      'ALTER TABLE tasks DISABLE TRIGGER trg_validate_dept_status;' || E'\n  ALTER TABLE tasks DISABLE TRIGGER tasks_status_machine;'
    );
  END IF;

  IF position('ENABLE TRIGGER tasks_status_machine' in v_sql) = 0 THEN
    v_sql := replace(
      v_sql,
      'ALTER TABLE tasks ENABLE TRIGGER trg_validate_dept_status;',
      'ALTER TABLE tasks ENABLE TRIGGER tasks_status_machine;' || E'\n  ALTER TABLE tasks ENABLE TRIGGER trg_validate_dept_status;'
    );
  END IF;

  EXECUTE v_sql;
END $$;