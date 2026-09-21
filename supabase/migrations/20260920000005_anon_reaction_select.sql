-- Los feeds consultan likes / helpful_marks / saves para marcar el estado del usuario.
-- Para un visitante (anon) esas subconsultas nunca devuelven filas, pero Postgres comprueba
-- el permiso de la tabla al planificar (y tras varias ejecuciones usa un plan genérico que ya
-- no las descarta), lo que provocaba "permission denied" de forma intermitente.
--
-- Conceder SELECT a anon es seguro: RLS está activo y las políticas de estas tablas son
-- `to authenticated using (user_id = auth.uid())`, así que anon sigue sin ver ninguna fila.
grant select on public.likes, public.helpful_marks, public.saves to anon;
