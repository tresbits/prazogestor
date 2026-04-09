'use client'

import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ModalEditarCliente } from './modal-editar-cliente'
import { ModalDeletarCliente } from './modal-deletar-cliente'
import type { Cliente } from '@/types'

const REGIME_LABEL: Record<string, string> = {
  simples: 'Simples Nacional',
  mei: 'MEI',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
}

function getIniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || nome.slice(0, 2).toUpperCase()
}

function formatarCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function CardClienteItem({ cliente }: { cliente: Cliente }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="bg-card rounded-[16px] flex flex-col">
        {/* Header tonal */}
        <div className="px-5 py-4 rounded-t-[16px] bg-muted/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-foreground">{getIniciais(cliente.nome)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-[15px] font-semibold text-foreground leading-tight truncate">
              {cliente.nome}
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              {formatarCNPJ(cliente.cnpj)}
            </span>
          </div>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1.5 rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={6}>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Regime</span>
            <span className="text-[11px] font-semibold text-foreground">
              {REGIME_LABEL[cliente.regime] ?? cliente.regime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Funcionários</span>
            <span className="text-[11px] font-semibold text-foreground">
              {cliente.tem_empregados ? 'Sim' : 'Não'}
            </span>
          </div>
        </div>
      </div>

      <ModalEditarCliente
        cliente={cliente}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <ModalDeletarCliente
        clienteId={cliente.id}
        clienteNome={cliente.nome}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}
