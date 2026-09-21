import { Card } from "@/components/ui/Card";

export function InfoPage({
  title,
  draft,
  children,
}: {
  title: string;
  /** muestra un aviso de borrador (textos legales pendientes de revisión) */
  draft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-8">
      <h1 className="text-2xl font-extrabold text-ink">{title}</h1>
      {draft ? (
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Borrador en revisión. Este texto resume cómo funciona hoy TheProKnow y aún no es un documento legal definitivo.
        </p>
      ) : null}
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink [&_h2]:pt-2 [&_h2]:text-lg [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </Card>
  );
}
