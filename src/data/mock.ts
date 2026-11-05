import type {
  AgronomoContato,
  ClimaRegistro,
  Culture,
  FieldApplication,
  FieldPhoto,
  FeedUpdate,
  LiveCamera,
  PhenologyStage,
  Plot,
  StationWeather,
} from "../types";

/**
 * Safra 2026/27 do experimento da Coamo em São Domingos (SC).
 * Data de referência: 03 nov 2026.
 * Soja emergiu em 25 ago (DAE 70, R3). Milho emergiu em 04 set (DAE 60, R1).
 */
export const FIELD_TODAY = "2026-11-03T17:40:00";

export const fieldMeta = {
  title: "CAMPO VIRTUAL",
  subtitle: "Experimento de cultivares de híbridos da Coamo de São Domingos (SC)",
  location: "São Domingos, SC",
  season: "Safra 2026/27",
  areaHa: 18,
};

const photos = {
  sojaCanopy:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70",
  sojaRows:
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=70",
  aerial:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=70",
  leaves:
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=70",
  scout:
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=70",
  corn:
    "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=70",
  cornField:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=1200&q=70",
  seedling:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=70",
  close:
    "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=70",
  spray:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=70",
};

export const plots: Plot[] = [
  {
    id: "p01",
    number: "01",
    name: "BMX Zeus IPRO",
    culture: "soja",
    category: "soja",
    populationPerHa: 280_000,
    plantingDate: "2026-08-18",
    emergenceDate: "2026-08-25",
    stageCode: "R3",
    spacingM: 0.45,
  },
  {
    id: "p02",
    number: "02",
    name: "NEO 610 IPRO",
    culture: "soja",
    category: "soja",
    populationPerHa: 260_000,
    plantingDate: "2026-08-18",
    emergenceDate: "2026-08-25",
    stageCode: "R3",
    spacingM: 0.45,
  },
  {
    id: "p03",
    number: "03",
    name: "Ensaio de potássio em soja",
    culture: "soja",
    category: "nutricao",
    populationPerHa: 280_000,
    plantingDate: "2026-08-18",
    emergenceDate: "2026-08-25",
    stageCode: "R3",
    spacingM: 0.45,
  },
  {
    id: "p04",
    number: "04",
    name: "AG 8700 PRO4",
    culture: "milho",
    category: "milho",
    populationPerHa: 65_000,
    plantingDate: "2026-08-28",
    emergenceDate: "2026-09-04",
    stageCode: "R1",
    spacingM: 0.5,
  },
  {
    id: "p05",
    number: "05",
    name: "P3707VYH",
    culture: "milho",
    category: "milho",
    populationPerHa: 68_000,
    plantingDate: "2026-08-28",
    emergenceDate: "2026-09-04",
    stageCode: "R1",
    spacingM: 0.5,
  },
  {
    id: "p06",
    number: "06",
    name: "Ensaio de nitrogênio em milho",
    culture: "milho",
    category: "nutricao",
    populationPerHa: 65_000,
    plantingDate: "2026-08-28",
    emergenceDate: "2026-09-04",
    stageCode: "R1",
    spacingM: 0.5,
  },
];

export const plotsById: Record<string, Plot> = Object.fromEntries(plots.map((plot) => [plot.id, plot]));

export function getPlot(id: string) {
  const plot = plotsById[id];
  if (!plot) {
    throw new Error(`Parcela não encontrada: ${id}`);
  }
  return plot;
}

export const feedUpdates: FeedUpdate[] = [
  {
    id: "f1",
    kind: "Vistoria de rotina",
    culture: "soja",
    plotId: "p01",
    datetime: "2026-11-03T08:40:00",
    image: photos.sojaCanopy,
    tags: ["#Soja", "#R3", "#P01"],
    text: "Canopy fechado na Zeus. Vagens de 5 a 8 mm no terço superior e flores ainda abertas no ponteiro. Sem sintoma de antracnose no baixeiro.",
    likes: 18,
  },
  {
    id: "f2",
    kind: "Manejo fitossanitário",
    culture: "soja",
    plotId: "p02",
    datetime: "2026-11-02T16:10:00",
    image: photos.close,
    tags: ["#Soja", "#Percevejo", "#P02"],
    text: "Percevejo-marrom (Euschistus heros) acima do nível de ação: 3 adultos por metro na NEO 610. Ninfas pequenas concentradas no terço médio.",
    likes: 7,
  },
  {
    id: "f3",
    kind: "Manejo fitossanitário",
    culture: "soja",
    plotId: "p02",
    datetime: "2026-11-02T17:45:00",
    image: photos.spray,
    tags: ["#Soja", "#Manejo", "#P02"],
    text: "Inseticida aplicado no fim da tarde, com vento abaixo de 10 km/h e umidade em 62%. Alvo: percevejo em R3. Reentrada liberada após 24 h.",
    likes: 11,
  },
  {
    id: "f4",
    kind: "Manejo fitossanitário",
    culture: "milho",
    plotId: "p04",
    datetime: "2026-11-01T11:20:00",
    image: photos.corn,
    tags: ["#Milho", "#Lagarta", "#P04"],
    text: "Armadilha com mariposas de Spodoptera frugiperda. Lagartas pequenas na ponta da espiga em formação na AG 8700. Amostrar de novo em 48 h.",
    likes: 4,
  },
  {
    id: "f5",
    kind: "Vistoria de rotina",
    culture: "milho",
    plotId: "p05",
    datetime: "2026-10-31T09:05:00",
    image: photos.cornField,
    tags: ["#Milho", "#R1", "#P05"],
    text: "Embonecamento uniforme na P3707. Estilo-estigmas viáveis e pendão com pólen soltando no período da manhã. Sem estresse hídrico aparente.",
    likes: 9,
  },
  {
    id: "f6",
    kind: "Organização de evento",
    culture: "milho",
    plotId: "p06",
    datetime: "2026-10-10T15:10:00",
    image: photos.aerial,
    tags: ["#Milho", "#Nutrição", "#P06"],
    text: "Cobertura nitrogenada do ensaio a lanço. Tratamentos com 0, 80 e 150 kg/ha de N na forma de ureia, sobre solo úmido após 6 mm de chuva.",
    likes: 6,
  },
  {
    id: "f7",
    kind: "Vistoria de rotina",
    culture: "soja",
    plotId: "p03",
    datetime: "2026-10-24T10:15:00",
    image: photos.leaves,
    tags: ["#Soja", "#R2", "#P03"],
    text: "Florescimento pleno no ensaio de potássio. Parcelas com K em cobertura mantêm o trifólio do ponteiro sem clorose marginal.",
    likes: 3,
  },
];

export const agronomosContatos: AgronomoContato[] = [
  {
    id: "agr-joao",
    nome: "Agrônomo João",
    especialidade: "Agronomo (a)",
    whatsapp: "5549991111001",
    ativo: true,
  },
  {
    id: "agr-maria",
    nome: "Agrônoma Maria",
    especialidade: "Agronomo (a)",
    whatsapp: "5549991111002",
    ativo: true,
  },
];

export const fieldPhotos: FieldPhoto[] = [
  {
    id: "ph1",
    culture: "soja",
    plotId: "p01",
    datetime: "2026-11-03T08:40:00",
    stageCode: "R3",
    image: photos.sojaCanopy,
    caption: "Vagens em início de formação no quarto nó a partir do ápice.",
  },
  {
    id: "ph2",
    culture: "soja",
    plotId: "p02",
    datetime: "2026-11-02T16:20:00",
    stageCode: "R3",
    image: photos.close,
    caption: "Adultos de percevejo-marrom abrigados no baixeiro, após o fechamento das entrelinhas.",
  },
  {
    id: "ph3",
    culture: "milho",
    plotId: "p05",
    datetime: "2026-11-01T09:30:00",
    stageCode: "R1",
    image: photos.cornField,
    caption: "Estilo-estigmas extrusados e pendão ainda emitindo pólen.",
  },
  {
    id: "ph4",
    culture: "milho",
    plotId: "p04",
    datetime: "2026-10-20T14:00:00",
    stageCode: "VT",
    image: photos.corn,
    caption: "Pendoamento. Última folha com colar visível e pendão exposto.",
  },
  {
    id: "ph5",
    culture: "soja",
    plotId: "p01",
    datetime: "2026-10-24T10:00:00",
    stageCode: "R2",
    image: photos.leaves,
    caption: "Flor aberta nos dois últimos nós com trifólio desenvolvido.",
  },
  {
    id: "ph6",
    culture: "soja",
    plotId: "p03",
    datetime: "2026-10-06T11:40:00",
    stageCode: "R1",
    image: photos.sojaRows,
    caption: "Primeira flor aberta em qualquer nó. Início da fase reprodutiva.",
  },
  {
    id: "ph7",
    culture: "milho",
    plotId: "p06",
    datetime: "2026-09-22T15:20:00",
    stageCode: "V6",
    image: photos.seedling,
    caption: "Seis folhas com colar visível, ponto de definição do número de fileiras da espiga.",
  },
  {
    id: "ph8",
    culture: "soja",
    plotId: "p02",
    datetime: "2026-09-20T09:10:00",
    stageCode: "V4",
    image: photos.scout,
    caption: "Quatro nós vegetativos. Entrelinha ainda aberta e ótima janela de monitoramento de vaquinha.",
  },
  {
    id: "ph9",
    culture: "soja",
    plotId: "p01",
    datetime: "2026-09-06T08:20:00",
    stageCode: "V1",
    image: photos.seedling,
    caption: "Primeiro trifólio expandido. Estande avaliado em 16 plantas por metro.",
  },
  {
    id: "ph10",
    culture: "milho",
    plotId: "p05",
    datetime: "2026-09-12T16:45:00",
    stageCode: "V3",
    image: photos.aerial,
    caption: "Três folhas com colar visível. Falhas de emergência abaixo de 4%.",
  },
];

export const applications: FieldApplication[] = [
  {
    id: "a1",
    culture: "soja",
    plotIds: ["p01", "p02"],
    date: "2026-11-02T17:30:00",
    target: "Controle de percevejo-marrom",
    note: "Aplicação terrestre com ponta de jato plano. Reentrada: 24 horas.",
    weather: { temperatureC: 27, humidityPct: 62, windKmh: 9 },
    activeIngredient: "Tiametoxam + Lambda-Cialotrina",
    doseGramsPerHa: 150,
    sprayVolumeLPerHa: 150,
    stageLabel: "R3",
  },
  {
    id: "a2",
    culture: "soja",
    plotIds: ["p01", "p02", "p03"],
    date: "2026-10-24T09:40:00",
    target: "Ferrugem-asiática e doenças de final de ciclo",
    note: "Primeira entrada do programa preventivo, com orvalho já seco.",
    weather: { temperatureC: 24, humidityPct: 71, windKmh: 7 },
    activeIngredient: "Azoxistrobina + Protioconazol",
    doseGramsPerHa: 300,
    sprayVolumeLPerHa: 120,
    stageLabel: "R2",
  },
  {
    id: "a3",
    culture: "milho",
    plotIds: ["p04", "p05", "p06"],
    date: "2026-10-02T16:15:00",
    target: "Plantas daninhas de folha larga",
    note: "Pós-emergente com milho em V6 e invasoras com até 4 folhas.",
    weather: { temperatureC: 29, humidityPct: 58, windKmh: 11 },
    activeIngredient: "Atrazina + Tembotriona",
    doseGramsPerHa: 1500,
    sprayVolumeLPerHa: 150,
    stageLabel: "V6",
  },
  {
    id: "a4",
    culture: "milho",
    plotIds: ["p06"],
    date: "2026-10-10T15:00:00",
    target: "Cobertura nitrogenada do ensaio",
    note: "Ureia a lanço, incorporada pela chuva prevista na madrugada. Tratamento testemunha sem N.",
    weather: { temperatureC: 26, humidityPct: 74, windKmh: 8 },
    activeIngredient: "Ureia",
    doseGramsPerHa: 150000,
    sprayVolumeLPerHa: null,
    stageLabel: "V8",
  },
  {
    id: "a5",
    culture: "soja",
    plotIds: ["p01", "p02", "p03"],
    date: "2026-09-18T10:20:00",
    target: "Buva e capim-amargoso",
    note: "Pós-emergência da soja Intacta, com jato dirigido na entrelinha.",
    weather: { temperatureC: 25, humidityPct: 66, windKmh: 6 },
    activeIngredient: "Glifosato",
    doseGramsPerHa: 1240,
    sprayVolumeLPerHa: 100,
    stageLabel: "V3",
  },
];

const sojaImages = [photos.seedling, photos.scout, photos.sojaRows, photos.leaves, photos.sojaCanopy, photos.close];
const milhoImages = [photos.seedling, photos.aerial, photos.corn, photos.cornField, photos.scout];

function stage(
  culture: Culture,
  code: string,
  name: string,
  observe: string,
  recommendation: string,
  image: string,
): PhenologyStage {
  return {
    id: `${culture}-${code.toLowerCase()}`,
    culture,
    code,
    name,
    observe,
    recommendation,
    image,
  };
}

/**
 * Soja: Fehr e Caviness (1977), na redação da Embrapa
 * (Ageitec e “500 perguntas, 500 respostas — Soja”).
 * Uma folha está completamente desenvolvida quando as bordas dos
 * folíolos da folha do nó acima não mais se tocam.
 *
 * Milho: Ritchie, Hanway e Benson (1993), como publicado pela
 * Kansas State University. O estádio vegetativo é o número de
 * folhas com colar visível; a primeira folha tem ponta arredondada.
 */
export const phenologyStages: PhenologyStage[] = [
  stage("soja", "VE", "Emergência", "Cotilédones acima da superfície do solo, formando ângulo de 90° ou mais com o hipocótilo.", "Conferir a emergência e o estande assim que a linha fechar.", sojaImages[0]),
  stage("soja", "VC", "Cotilédone", "Cotilédones completamente abertos. No campo, as bordas das folhas unifolioladas não mais se tocam.", "Ainda é cedo para contar trifólios: o critério deste estádio é o par unifoliolado.", sojaImages[0]),
  stage("soja", "V1", "Primeiro nó", "Folhas unifolioladas completamente desenvolvidas: os bordos da primeira folha trifoliolada não mais se tocam.", "O primeiro trifólio ainda não está completamente desenvolvido neste estádio.", sojaImages[1]),
  stage("soja", "V2", "Segundo nó", "Primeira folha trifoliolada completamente desenvolvida.", "A contagem sobe um nó a cada trifólio cuja folha de cima já abriu os bordos.", sojaImages[1]),
  stage("soja", "V3", "Terceiro nó", "Segunda folha trifoliolada completamente desenvolvida.", "Há dois trifólios desenvolvidos acima do nó unifoliolado, não três.", sojaImages[2]),
  stage("soja", "V4", "Quarto nó", "Terceira folha trifoliolada completamente desenvolvida.", "Conferir nós na haste principal, de baixo para cima, a partir do nó unifoliolado.", sojaImages[1]),
  stage("soja", "V5", "Quinto nó", "Quarta folha trifoliolada completamente desenvolvida.", "A escala segue em V6, V7 e assim por diante; não há salto de número.", sojaImages[2]),
  stage("soja", "V6", "Sexto nó", "Quinta folha trifoliolada completamente desenvolvida.", "Depois de V6 a contagem continua: Vn é o número de nós acima do nó cotiledonar com folha completamente desenvolvida.", sojaImages[2]),
  stage("soja", "R1", "Início do florescimento", "Uma flor aberta em qualquer nó da haste principal.", "A partir daqui o estádio reprodutivo descreve a planta, mesmo que os nós vegetativos continuem aumentando.", sojaImages[2]),
  stage("soja", "R2", "Florescimento pleno", "Uma flor aberta em um dos dois últimos nós da haste com folha completamente desenvolvida.", "Os dois nós de referência são os superiores que já têm folha desenvolvida.", sojaImages[3]),
  stage("soja", "R3", "Início da formação da vagem", "Vagem com 5 mm de comprimento em um dos quatro últimos nós da haste com folha completamente desenvolvida.", "Medir a vagem nos quatro nós superiores com folha desenvolvida, não em qualquer nó.", sojaImages[4]),
  stage("soja", "R4", "Vagem completamente desenvolvida", "Vagem com 2 cm de comprimento em um dos quatro últimos nós da haste com folha completamente desenvolvida.", "O critério é o comprimento da vagem, de 2 cm, nesses quatro nós.", sojaImages[4]),
  stage("soja", "R5", "Início do enchimento do grão", "Grão com 3 mm de comprimento em uma vagem de um dos quatro últimos nós da haste com folha completamente desenvolvida.", "O grão de 3 mm marca o início do enchimento, ainda nos quatro nós superiores.", sojaImages[5]),
  stage("soja", "R6", "Grão cheio", "Vagem com grãos verdes preenchendo a cavidade, em um dos quatro últimos nós da haste com folha completamente desenvolvida.", "A vagem de referência continua sendo a dos quatro nós superiores.", sojaImages[5]),
  stage("soja", "R7", "Início da maturação", "Uma vagem normal na haste principal atingiu a coloração de madura.", "Uma única vagem madura na haste principal basta para caracterizar R7.", sojaImages[3]),
  stage("soja", "R8", "Maturação plena", "95% das vagens atingiram a coloração de madura.", "A escala termina quando 95% das vagens estão maduras, não quando o grão atinge a umidade de colheita.", sojaImages[3]),
  stage("milho", "VE", "Emergência", "Coleóptilo visível acima do solo. Nenhuma folha está completamente desenvolvida.", "A emergência é o coleóptilo na superfície, antes do primeiro colar foliar.", milhoImages[0]),
  stage("milho", "V1", "Primeira folha", "Uma folha com colar visível. A primeira folha tem a ponta arredondada e é a única com esse formato.", "O ponto de crescimento permanece abaixo do solo até o fim de V5.", milhoImages[0]),
  stage("milho", "V2", "Segunda folha", "Duas folhas com colar visível. Folha ainda enrolada, sem o colar exposto, não entra na conta.", "Conte de baixo para cima, a partir da folha de ponta arredondada.", milhoImages[1]),
  stage("milho", "V4", "Quarta folha", "Quatro folhas com colar visível.", "O ponto de crescimento ainda está abaixo da superfície neste estádio.", milhoImages[0]),
  stage("milho", "V6", "Sexta folha", "Seis folhas com colar visível. O ponto de crescimento passa a ficar acima do solo.", "Entre V6 e V10 define-se o número potencial de fileiras da espiga. A primeira folha pode já ter senescido: ela continua na conta.", milhoImages[1]),
  stage("milho", "V8", "Oitava folha", "Oito folhas com colar visível. O estádio vegetativo é sempre a folha mais alta com colar exposto.", "V3, V5, V7 e V9 existem e seguem a mesma regra do colar; a escala não pula esses números.", milhoImages[2]),
  stage("milho", "V10", "Décima folha", "Dez folhas com colar visível. Os brotos de espiga já podem ser vistos e a formação do pendão começa.", "Até aqui o ritmo típico é de cerca de 2 a 3 dias por folha, segundo a Kansas State.", milhoImages[2]),
  stage("milho", "VT", "Pendoamento", "Pendão completamente estendido e estilo-estigmas ainda não visíveis. Em geral dura 2 a 3 dias antes de R1.", "Todas as folhas da planta já estão visíveis neste estádio.", milhoImages[2]),
  stage("milho", "R1", "Embonecamento", "Estilo-estigmas visíveis fora das palhas. O grão de pólen leva cerca de 24 horas para fecundar o óvulo.", "Estresse e falta de umidade secam o estilo-estigma e limitam a fecundação.", milhoImages[3]),
  stage("milho", "R2", "Bolha", "Grãos pequenos e brancos, com fluido claro. Os estilo-estigmas escurecem e os grãos têm cerca de 85% de água.", "Grão sem volume neste ponto indica óvulo não fecundado.", milhoImages[3]),
  stage("milho", "R3", "Grão leitoso", "Grãos amarelados por fora e com fluido leitoso, pelo acúmulo de amido.", "O acúmulo de matéria seca está acelerado; estresse neste ponto limita o tamanho do grão.", milhoImages[2]),
  stage("milho", "R4", "Grão pastoso", "O amido do grão engrossa e deixa a consistência leitosa. A espiga fica mais amarela e o sabugo começa a avermelhar.", "Deste ponto em diante o estresse pesa no peso do grão, não mais no número.", milhoImages[4]),
  stage("milho", "R5", "Dente", "A maioria dos grãos está dentada. No início do estádio a umidade fica em torno de 55%, e o amido endurece do topo em direção ao sabugo.", "A linha entre amido duro e amido pastoso, a linha de leite, desce em direção ao sabugo.", milhoImages[4]),
  stage("milho", "R6", "Maturidade fisiológica", "Camada preta formada na base do grão. A matéria seca atingiu o máximo e a umidade inicial fica em torno de 30% a 35%.", "A camada preta encerra o enchimento. A perda de umidade até a colheita ocorre depois deste estádio.", milhoImages[1]),
];

export const currentStageByCulture: Record<Culture, string> = {
  soja: "soja-r3",
  milho: "milho-r1",
};

export const liveCameras: LiveCamera[] = [
  {
    id: "cam-drone",
    label: "Drone do talhão",
    culture: "geral",
    description: "Visão geral a 40 m, sentido norte-sul.",
    image: photos.aerial,
  },
  {
    id: "cam-soja",
    label: "Parcela 01 · Soja",
    culture: "soja",
    description: "Câmera fixa na altura do dossel, BMX Zeus em R3.",
    image: photos.sojaCanopy,
  },
  {
    id: "cam-milho",
    label: "Parcela 05 · Milho",
    culture: "milho",
    description: "Câmera na entrelinha, embonecamento da P3707.",
    image: photos.cornField,
  },
];

export const climaAtual: ClimaRegistro = {
  id: "clima-2026-11-03",
  station: "Estação Coamo",
  locality: fieldMeta.location,
  recordedAt: FIELD_TODAY,
  temperatureC: 22,
  humidityPct: 78,
  windKmh: 9,
  rainTodayMm: 6.4,
  rainAccumulatedMm: 214.8,
  forecast: [
    { date: "2026-11-04", condition: "chuva", tempMinC: 16, tempMaxC: 21, rainMm: 12 },
    { date: "2026-11-05", condition: "nublado", tempMinC: 15, tempMaxC: 23, rainMm: 2 },
    { date: "2026-11-06", condition: "parcial", tempMinC: 14, tempMaxC: 25, rainMm: 0 },
    { date: "2026-11-07", condition: "sol", tempMinC: 13, tempMaxC: 26, rainMm: 0 },
    { date: "2026-11-08", condition: "parcial", tempMinC: 15, tempMaxC: 24, rainMm: 1 },
  ],
};

export const stationWeather: StationWeather = {
  temperatureC: climaAtual.temperatureC,
  rainTodayMm: climaAtual.rainTodayMm,
  humidityPct: climaAtual.humidityPct,
  windKmh: climaAtual.windKmh,
  updatedAt: climaAtual.recordedAt,
  station: `${climaAtual.station} · ${climaAtual.locality}`,
};

export const categoryLabel: Record<Plot["category"], string> = {
  soja: "Cultivar de soja",
  milho: "Híbrido de milho",
  nutricao: "Teste nutricional",
};

export const categoryColor: Record<Plot["category"], string> = {
  soja: "#2b7146",
  milho: "#e0b03a",
  nutricao: "#3c7ea6",
};
