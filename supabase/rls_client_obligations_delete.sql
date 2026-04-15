-- RLS: política de DELETE para client_obligations
-- Permite que o usuário delete obrigações de clientes do seu próprio escritório

CREATE POLICY "office members can delete their client obligations"
ON client_obligations
FOR DELETE
USING (
  client_id IN (
    SELECT id FROM clients
    WHERE office_id IN (
      SELECT id FROM offices WHERE user_id = auth.uid()
    )
  )
);
