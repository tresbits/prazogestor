import Link from 'next/link'
import { CalendarDays, Bell, CheckCircle2, Mail, Shield, Building2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Navbar ──────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-heading text-[15px] font-extrabold tracking-tight text-foreground">
          PrazoGestor
        </span>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="px-4 py-1.5 rounded-full text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 bg-dot-grid text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Simples · MEI · Lucro Presumido · Lucro Real
        </div>
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Nunca mais perca<br />um prazo fiscal
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          O PrazoGestor gera automaticamente o calendário tributário dos seus clientes
          e envia alertas antes de cada vencimento.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Começar grátis por 14 dias
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Já tenho conta
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}

// ─── Como funciona ────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    title: 'Cadastre o cliente',
    description: 'Informe CNPJ, regime tributário e se tem funcionários. O sistema busca a razão social automaticamente.',
  },
  {
    number: '02',
    title: 'Calendário gerado na hora',
    description: 'DAS, PGDAS-D, eSocial, DCTFWeb, PIS, COFINS e mais — tudo calculado com ajuste por feriados nacionais.',
  },
  {
    number: '03',
    title: 'Alertas automáticos',
    description: 'Você e sua equipe recebem e-mail 7, 3 e 1 dia antes de cada vencimento. Marque como concluído com um clique.',
  },
]

function ComoFunciona() {
  return (
    <section className="py-20 px-6 bg-muted/40 border-y border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Como funciona
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Do cadastro ao alerta em menos de 5 minutos.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step) => (
            <div key={step.number} className="bg-card rounded-[20px] shadow-card px-6 py-7 space-y-3">
              <span className="font-heading text-4xl font-extrabold text-foreground/10 leading-none">
                {step.number}
              </span>
              <h3 className="font-heading text-[15px] font-extrabold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Funcionalidades ──────────────────────────────────────────
const FEATURES = [
  {
    icon: CalendarDays,
    title: 'Calendário visual',
    description: 'Visualize todos os vencimentos em uma grade mensal. Filtre por cliente, regime ou status.',
  },
  {
    icon: Bell,
    title: 'Alertas antecipados',
    description: 'E-mail automático 7, 3 e 1 dia antes. Um digest por escritório — sem spam.',
  },
  {
    icon: CheckCircle2,
    title: 'Registro de conclusão',
    description: 'Marque como concluído com responsável e data/hora. Histórico completo de entregas.',
  },
  {
    icon: Mail,
    title: 'E-mail ao cliente',
    description: 'Envie ao cliente uma lista das obrigações pendentes com mensagem personalizada.',
  },
  {
    icon: Shield,
    title: 'Ajuste por feriados',
    description: 'Datas ajustadas automaticamente por feriados nacionais — prorrogação ou antecipação conforme a regra de cada tributo.',
  },
  {
    icon: Building2,
    title: 'Todos os regimes',
    description: 'Simples Nacional, MEI, Lucro Presumido e Lucro Real. Cada um com seu calendário correto.',
  },
]

function Funcionalidades() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Tudo que seu escritório precisa
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Controle completo de prazos, do DAS ao ECF.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-card rounded-[16px] shadow-card px-5 py-5 space-y-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <f.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-heading text-[13px] font-extrabold text-foreground">
                {f.title}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Depoimentos ──────────────────────────────────────────────
const DEPOIMENTOS = [
  {
    quote: 'Antes controlava tudo em planilha. Perdi um prazo de DCTFWeb e levei multa de R$500. Depois do PrazoGestor nunca mais passei por isso.',
    name: 'Fernanda Souza',
    role: 'Contadora · São Paulo, SP',
    initials: 'FS',
  },
  {
    quote: 'Cadastrei meus 23 clientes em uma tarde. Cada um com seu regime, tudo gerado automaticamente. Economizo pelo menos 3 horas por semana.',
    name: 'Ricardo Melo',
    role: 'Escritório contábil · Belo Horizonte, MG',
    initials: 'RM',
  },
  {
    quote: 'O alerta de 7 dias dá tempo de organizar tudo sem correria. Simples, funciona, sem enrolação.',
    name: 'Patrícia Andrade',
    role: 'Contadora · Curitiba, PR',
    initials: 'PA',
  },
]

function Depoimentos() {
  return (
    <section className="py-20 px-6 bg-muted/40 border-y border-border/40">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            O que os contadores dizem
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {DEPOIMENTOS.map((d) => (
            <div key={d.name} className="bg-card rounded-[20px] shadow-card px-6 py-6 space-y-4 flex flex-col">
              <p className="text-sm text-foreground leading-relaxed flex-1">
                "{d.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-foreground">{d.initials}</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-foreground">{d.name}</p>
                  <p className="text-[11px] text-muted-foreground">{d.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Preços ───────────────────────────────────────────────────
const PLANOS = [
  {
    name: 'Essencial',
    price: 'R$97',
    description: 'Para escritórios pequenos começando a organizar prazos.',
    features: [
      'Até 15 clientes',
      'Simples Nacional e MEI',
      'Alertas por e-mail',
      '1 usuário',
    ],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$197',
    description: 'O plano mais escolhido por escritórios em crescimento.',
    features: [
      'Até 50 clientes',
      'Todos os regimes (LP, LR)',
      'Alertas por e-mail',
      '3 usuários',
      'Envio de e-mail ao cliente',
    ],
    cta: 'Começar grátis',
    highlight: true,
  },
  {
    name: 'Agência',
    price: 'R$347',
    description: 'Para escritórios maiores com carteira extensa de clientes.',
    features: [
      'Clientes ilimitados',
      'Todos os regimes',
      'Alertas por e-mail',
      'Usuários ilimitados',
      'Suporte prioritário',
    ],
    cta: 'Começar grátis',
    highlight: false,
  },
]

function Precos() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            Planos e preços
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            14 dias grátis em todos os planos. Sem cartão de crédito.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {PLANOS.map((plano) => (
            <div
              key={plano.name}
              className={cn(
                'rounded-[20px] px-6 py-7 space-y-5 flex flex-col',
                plano.highlight
                  ? 'bg-foreground text-background shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-0'
                  : 'bg-card shadow-card border border-border/40'
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    'text-[10px] font-bold uppercase tracking-widest',
                    plano.highlight ? 'text-background/60' : 'text-muted-foreground'
                  )}>
                    {plano.name}
                  </span>
                  {plano.highlight && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background/20 text-background uppercase tracking-wider">
                      Popular
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn(
                    'font-heading text-3xl font-extrabold',
                    plano.highlight ? 'text-background' : 'text-foreground'
                  )}>
                    {plano.price}
                  </span>
                  <span className={cn(
                    'text-xs',
                    plano.highlight ? 'text-background/60' : 'text-muted-foreground'
                  )}>
                    /mês
                  </span>
                </div>
                <p className={cn(
                  'text-[12px] leading-relaxed',
                  plano.highlight ? 'text-background/70' : 'text-muted-foreground'
                )}>
                  {plano.description}
                </p>
              </div>

              <ul className="space-y-2 flex-1">
                {plano.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      plano.highlight ? 'bg-background/60' : 'bg-muted-foreground/40'
                    )} />
                    <span className={cn(
                      'text-[12px]',
                      plano.highlight ? 'text-background/80' : 'text-foreground'
                    )}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  'block text-center py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90',
                  plano.highlight
                    ? 'bg-background text-foreground'
                    : 'bg-foreground text-background'
                )}
              >
                {plano.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
          Reajuste anual pelo IPCA · Cancele quando quiser
        </p>
      </div>
    </section>
  )
}

// ─── CTA Final ────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section className="py-20 px-6 bg-foreground">
      <div className="max-w-2xl mx-auto text-center space-y-5">
        <h2 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-background">
          Comece a usar hoje
        </h2>
        <p className="text-sm text-background/60 leading-relaxed">
          14 dias grátis, sem cartão de crédito. Configure seu escritório, cadastre os clientes
          e tenha o calendário fiscal completo em minutos.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Criar conta gratuita
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-border/40">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="font-heading text-[13px] font-extrabold text-foreground">
            PrazoGestor
          </span>
          <p className="text-[11px] text-muted-foreground">
            Tresbits Serviços de Informática LTDA · CNPJ 08.686.721/0001-09
          </p>
        </div>
        <div className="flex items-center gap-6 text-[11px] text-muted-foreground">
          <Link href="/login" className="hover:text-foreground transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="hover:text-foreground transition-colors">
            Cadastrar
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ComoFunciona />
      <Funcionalidades />
      <Depoimentos />
      <Precos />
      <CTAFinal />
      <Footer />
    </>
  )
}
