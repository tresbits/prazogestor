'use client'

import { useState, useEffect } from 'react'
import { CardCliente } from './card-cliente'

type ObItem = {
  id: string
  due_date: string
  status: string
  acronym: string
  name: string
  value?: number | null
}

type ClientCard = {
  id: string
  name: string
  cnpj: string
  tax_regime: string
  email: string | null
  obs: ObItem[]
  overdues: ObItem[]
}

type DimmedClient = {
  id: string
  name: string
  cnpj: string
}

const PAGE_SIZE = 12

function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function CardsGrid({
  clients,
  dimmedClients,
  officeTemplate,
}: {
  clients: ClientCard[]
  dimmedClients: DimmedClient[]
  officeTemplate?: string | null
}) {
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Reseta ao mudar o conjunto de clientes (ex: filtro de busca)
  useEffect(() => {
    setVisible(PAGE_SIZE)
  }, [clients])

  const shown = clients.slice(0, visible)
  const remaining = Math.max(0, clients.length - visible)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {shown.map(c => (
        <CardCliente
          key={c.id}
          clientId={c.id}
          clientName={c.name}
          cnpj={c.cnpj}
          taxRegime={c.tax_regime}
          clientEmail={c.email}
          officeTemplate={officeTemplate}
          obligations={c.obs}
          totalPending={c.obs.length}
          overdueObligations={c.overdues}
        />
      ))}

      {remaining > 0 && (
        <div className="col-span-full flex justify-center mt-2">
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 shadow-card transition-all active:scale-[0.98]"
          >
            Ver mais {Math.min(remaining, PAGE_SIZE)} clientes
          </button>
        </div>
      )}

      {dimmedClients.slice(0, 2).map(c => (
        <div key={c.id} className="bg-card rounded-[16px] shadow-card p-6 opacity-40">
          <h3 className="font-heading text-[15px] font-semibold text-foreground">{c.name}</h3>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
            {formatCNPJ(c.cnpj)}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Sem vencimentos nos próximos 30 dias
          </p>
        </div>
      ))}
    </div>
  )
}
