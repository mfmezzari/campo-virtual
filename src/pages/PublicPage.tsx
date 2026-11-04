import { useMemo, useState } from "react";
import type { ActiveSheet, Culture, CultureFilter, TabId } from "../types";
import { plots } from "../data/mock";
import { feedCategoryLabel } from "../lib/feed";
import { doubtMessage, formatWhatsapp, whatsappLink } from "../lib/whatsapp";
import { useField } from "../state/FieldContext";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { BottomSheet } from "../components/BottomSheet";
import { FeedScreen } from "../components/FeedScreen";
import { PhotoGallery } from "../components/PhotoGallery";
import { ManejoList } from "../components/ManejoList";
import { PhenologyView } from "../components/PhenologyView";
import { CroquiTab } from "../components/CroquiTab";
import { ClimaTab } from "../components/ClimaTab";
import { LiveView } from "../components/LiveView";
import { PhoneFrame } from "../components/PhoneFrame";
import { PublicFooter } from "../components/PublicFooter";

export function PublicPage() {
  const { feed, photos, applications, currentStageByCulture, stageCode, agronomos, likedPostIds, toggleLike, parcelasCroqui } =
    useField();
  const [tab, setTab] = useState<TabId>("feed");
  const [culture, setCulture] = useState<CultureFilter>("todas");
  const [openedAlertIds, setOpenedAlertIds] = useState<Set<string>>(() => new Set());
  const [sheet, setSheet] = useState<ActiveSheet>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [photoPlotId, setPhotoPlotId] = useState<string | null>(null);

  const livePlots = plots.map((plot) => ({ ...plot, stageCode: stageCode(plot.culture) }));
  const likedIds = useMemo(() => new Set(likedPostIds), [likedPostIds]);
  const activeAgronomos = agronomos.filter((contato) => contato.ativo);
  const unreadAlerts = feed.filter((item) => item.kind === "Manejo fitossanitário" && !openedAlertIds.has(item.id));
  const notifications = useMemo(
    () => feed.filter((item) => item.kind === "Manejo fitossanitário" || item.kind === "Organização de evento"),
    [feed],
  );

  const doubtUpdate = sheet?.type === "doubt" ? feed.find((item) => item.id === sheet.updateId) : undefined;
  const doubtPlot = doubtUpdate ? livePlots.find((plot) => plot.id === doubtUpdate.plotId) : undefined;
  const phenologyCulture: Culture = culture === "milho" ? "milho" : "soja";

  function openDoubt(id: string) {
    setSheet({ type: "doubt", updateId: id });
  }

  return (
    <PhoneFrame>
      <Header
        culture={culture}
        unreadCount={unreadAlerts.length}
        onCultureChange={setCulture}
        onOpenNotifications={() => setSheet({ type: "notifications" })}
      />
      <main className="scroll-area flex-1 overflow-y-auto px-4">
        <div key={tab} className="screen-enter">
          {tab === "feed" ? (
            <FeedScreen
              updates={feed}
              culture={culture}
              likedIds={likedIds}
              highlightId={highlightId}
              onToggleLike={toggleLike}
              onAsk={openDoubt}
            />
          ) : null}
          {tab === "photos" ? (
            <PhotoGallery
              photos={photos}
              culture={culture}
              plotId={photoPlotId}
              onCultureChange={setCulture}
              onClearPlot={() => setPhotoPlotId(null)}
            />
          ) : null}
          {tab === "manejos" ? <ManejoList applications={applications} culture={culture} /> : null}
          {tab === "clima" ? (
            <ClimaTab
              sojaStage={stageCode("soja")}
              milhoStage={stageCode("milho")}
              onOpenPhenology={() => setTab("phenology")}
            />
          ) : null}
          {tab === "phenology" ? (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setTab("clima")}
                className="text-sm font-extrabold text-leaf-700"
              >
                Voltar ao clima
              </button>
              <PhenologyView
                key={phenologyCulture}
                initialCulture={phenologyCulture}
                currentStageByCulture={currentStageByCulture}
              />
            </div>
          ) : null}
          {tab === "croqui" ? <CroquiTab parcelas={parcelasCroqui} culture={culture} /> : null}
          {tab === "live" ? <LiveView culture={culture} /> : null}
        </div>
        <PublicFooter />
      </main>
      <BottomNav
        active={tab === "phenology" ? "clima" : tab}
        onChange={(next) => {
          setHighlightId(null);
          setTab(next);
        }}
      />

      <BottomSheet
        open={sheet?.type === "notifications"}
        title="Notificações"
        description={unreadAlerts.length > 0 ? `${unreadAlerts.length} atividades sem leitura` : "Tudo em dia"}
        onClose={() => setSheet(null)}
      >
        <ul className="space-y-2">
          {notifications.map((item) => {
            const plot = item.plotId ? livePlots.find((entry) => entry.id === item.plotId) : undefined;
            const unread = item.kind === "Manejo fitossanitário" && !openedAlertIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCulture(item.culture === "soja" || item.culture === "milho" ? item.culture : "todas");
                    setOpenedAlertIds((current) => new Set(current).add(item.id));
                    setHighlightId(item.id);
                    setTab("feed");
                    setSheet(null);
                  }}
                  className="w-full rounded-2xl bg-white px-3 py-3 text-left"
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wide text-ink-500">
                    Nova atividade · {feedCategoryLabel[item.kind]}
                    {unread ? <span className="rounded-full bg-sun-400 px-2 py-0.5 text-ink-900">Novo</span> : null}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-ink-900">
                    {plot ? `Parcela ${plot.number} · ${plot.name}` : item.culture}
                  </span>
                  <span className="mt-1 block text-sm text-ink-700">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>

      <BottomSheet
        open={sheet?.type === "doubt"}
        title="Dúvida ao agrônomo"
        description={
          doubtUpdate ? (doubtPlot ? `Parcela ${doubtPlot.number} · ${doubtPlot.name}` : doubtUpdate.culture) : undefined
        }
        onClose={() => setSheet(null)}
      >
        {activeAgronomos.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-4 text-sm font-semibold text-ink-700">
            Nenhum agrônomo ativo no momento. A equipe DETEC ainda não publicou um contato.
          </p>
        ) : (
          <ul className="space-y-2">
            {activeAgronomos.map((contato) => {
              const plotNumber = doubtPlot?.number ?? doubtUpdate?.culture ?? "";
              const href = whatsappLink(contato.whatsapp, doubtMessage(plotNumber));
              return (
                <li key={contato.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-3xl bg-white px-4 py-4"
                  >
                    <span className="block font-extrabold text-ink-900">{contato.nome}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">{contato.especialidade}</span>
                    <span className="mt-2 block text-sm font-extrabold text-leaf-700">
                      WhatsApp {formatWhatsapp(contato.whatsapp)}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </BottomSheet>
    </PhoneFrame>
  );
}
