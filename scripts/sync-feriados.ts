/**
 * Sincroniza feriados nacionais via BrasilAPI → tabela `feriados` no Supabase.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/sync-feriados.ts 2026
 *   npx tsx --env-file=.env.local scripts/sync-feriados.ts 2026 2027
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type FeriadoBrasilAPI = {
  date: string   // YYYY-MM-DD
  name: string
  type: string   // 'national' | 'bank' | ...
}

async function sincronizarAno(ano: number) {
  const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${ano}`)
  if (!res.ok) throw new Error(`BrasilAPI erro ${res.status} para ${ano}`)

  const feriados: FeriadoBrasilAPI[] = await res.json()

  const rows = feriados.map((f) => ({
    data: f.date,
    descricao: f.name,
    tipo: 'nacional' as const,
    estado: null,
    municipio_ibge: null,
  }))

  const { error } = await supabase
    .from('feriados')
    .upsert(rows, { onConflict: 'data', ignoreDuplicates: false })

  if (error) throw error
  console.log(`✓ ${rows.length} feriados de ${ano} sincronizados`)
}

async function main() {
  const anos = process.argv.slice(2).map(Number).filter(Boolean)
  if (!anos.length) {
    anos.push(new Date().getFullYear())
  }

  for (const ano of anos) {
    await sincronizarAno(ano)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
