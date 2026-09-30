import { LanguageProvider } from "@/components/language-provider"
import { toSafeLanguage } from "@/lib/i18n"

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = toSafeLanguage(lang)

  return (
    <LanguageProvider language={language}>
      <div lang={language}>{children}</div>
    </LanguageProvider>
  )
}
