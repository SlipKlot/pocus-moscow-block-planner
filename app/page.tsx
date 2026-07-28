"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StoryStep = 0 | 1 | 2 | 3;
type Strategy = "balanced" | "motor" | "extended";
type UpperOperationId =
  | "clavicle"
  | "proximal-humerus"
  | "humeral-shaft"
  | "elbow"
  | "forearm"
  | "distal-radius"
  | "hand"
  | "finger"
  | "tendon";
type DiaphragmRisk = "Высокий" | "Умеренный" | "Низкий" | "Минимальный";
type AtlasZoneId = "upper" | "lower" | "myofascial" | "paravertebral" | "neuraxial";

const atlasZones: Array<{
  id: AtlasZoneId;
  index: string;
  label: string;
  title: string;
  focus: string;
  description: string;
  status: "LIVE" | "NEXT";
  href?: string;
}> = [
  {
    id: "upper",
    index: "01",
    label: "Верхняя конечность",
    title: "Плечевой пояс → кисть",
    focus: "BRACHIAL PLEXUS / UPPER LIMB",
    description:
      "Остеосинтез ключицы, плеча, предплечья и кисти. Сравнение стратегий с оценкой риска диафрагмальной дисфункции.",
    status: "LIVE",
    href: "#upper-limb",
  },
  {
    id: "lower",
    index: "02",
    label: "Нижняя конечность",
    title: "Таз → стопа",
    focus: "LUMBOSACRAL PLEXUS / LOWER LIMB",
    description:
      "Операция, хирургическая зона, нервные территории, мотор-сберегающие стратегии и ожидаемые слепые зоны.",
    status: "LIVE",
    href: "#planner",
  },
  {
    id: "myofascial",
    index: "03",
    label: "Миофасциальные блокады",
    title: "Грудная и брюшная стенка",
    focus: "FASCIAL PLANES / TRUNK",
    description:
      "Навигация по фасциальным пространствам, зоне хирургического доступа и ожидаемому распространению раствора.",
    status: "NEXT",
  },
  {
    id: "paravertebral",
    index: "04",
    label: "Паравертебральные блокады",
    title: "Паравертебральная зона",
    focus: "PARAVERTEBRAL SPACE",
    description:
      "Уровень вмешательства, дерматомное покрытие, плевра, сосудистые структуры и контроль распространения.",
    status: "NEXT",
  },
  {
    id: "neuraxial",
    index: "05",
    label: "Нейроаксиальная навигация",
    title: "Позвоночник и нейроаксиальная ось",
    focus: "NEURAXIAL / SPINE",
    description:
      "Выбор уровня, предоперационная УЗ-разметка, срединный и парамедианный доступ, антитромботический контроль.",
    status: "NEXT",
  },
];

const chapters = [
  {
    eyebrow: "00 / ЗАПРОС",
    title: "Назовите операцию.",
    text: "Система разложит хирургическое вмешательство на зоны боли, нервные территории и возможные стратегии регионарной анестезии.",
    layer: "OPERATION INPUT",
  },
  {
    eyebrow: "01 / ХИРУРГИЧЕСКАЯ ЗОНА",
    title: "Что будет источником боли?",
    text: "TKA затрагивает переднюю и заднюю капсулу, медиальный доступ и ткани операционного поля. Название операции — только начало навигации.",
    layer: "SURGICAL FIELD",
  },
  {
    eyebrow: "02 / ИННЕРВАЦИЯ",
    title: "Кто проводит болевой сигнал?",
    text: "Передняя и медиальная территории связаны с ветвями бедренного нерва. Задняя капсула требует отдельного анализа суставных ветвей.",
    layer: "NEURAL MAP",
  },
  {
    eyebrow: "03 / ПОКРЫТИЕ",
    title: "Что закрывает базовая стратегия?",
    text: "ACB и периартикулярная LIA формируют мотор-сберегающую основу, но покрытие нужно оценивать по территориям, а не по названию блока.",
    layer: "COVERAGE FIELD",
  },
  {
    eyebrow: "04 / СЛЕПАЯ ЗОНА",
    title: "Что может остаться без покрытия?",
    text: "Задняя капсула остаётся контрольной зоной. Она должна быть показана рядом с преимуществами стратегии, а не спрятана в примечаниях.",
    layer: "POSTERIOR GAP",
  },
  {
    eyebrow: "05 / РЕШЕНИЕ",
    title: "Собираем стратегию.",
    text: "Предварительная конфигурация: ACB + LIA. iPACK рассматривается как опциональное дополнение, если требуется усилить заднее покрытие.",
    layer: "BLOCK STRATEGY",
  },
];

const chapterStops = [0, 0.15, 0.32, 0.5, 0.68, 0.82];
const assetBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const strategies = {
  balanced: {
    label: "Сбалансированная",
    title: "ACB + LIA",
    subtitle: "Базовая стратегия",
    score: "Высокое",
    scoreLabel: "ожидаемое покрытие",
    motor: "Минимальное",
    motorLabel: "влияние на моторику",
    blind: "Задняя капсула",
    blindLabel: "зона для проверки",
    detail:
      "Сочетает сенсорное покрытие медиальной зоны с локальной инфильтрацией операционного поля.",
  },
  motor: {
    label: "Мотор-сберегающая",
    title: "Проксимальный ACB + LIA",
    subtitle: "Приоритет ранней мобилизации",
    score: "Высокое",
    scoreLabel: "ожидаемое покрытие",
    motor: "Низкое",
    motorLabel: "влияние на моторику",
    blind: "Задняя капсула",
    blindLabel: "зона для проверки",
    detail:
      "Фокус на сенсорном компоненте при сохранении функции четырёхглавой мышцы и ранней мобилизации.",
  },
  extended: {
    label: "Расширенная",
    title: "ACB + LIA + iPACK",
    subtitle: "Дополнительное заднее покрытие",
    score: "Расширенное",
    scoreLabel: "ожидаемое покрытие",
    motor: "Низкое",
    motorLabel: "влияние на моторику",
    blind: "Минимальная",
    blindLabel: "остаточная зона",
    detail:
      "Добавляет мотор-сберегающую работу с задней капсулой при наличии соответствующих показаний.",
  },
};

const upperOperations: Array<{
  id: UpperOperationId;
  short: string;
  title: string;
  zone: string;
  nerves: string;
  gap: string;
  strategies: Array<{
    name: string;
    blocks: string;
    diaphragm: DiaphragmRisk;
    motor: string;
    note: string;
  }>;
}> = [
  {
    id: "clavicle",
    short: "Ключица",
    title: "Остеосинтез ключицы",
    zone: "Кожа над ключицей, надкостница, зона фиксации; доступ и медиальный/латеральный край уточняются.",
    nerves: "Надключичные нервы; вклад ветвей плечевого сплетения зависит от локализации перелома и доступа.",
    gap: "Медиальный или латеральный край разреза, донорская зона, дренаж.",
    strategies: [
      {
        name: "Диафрагма-сберегающая",
        blocks: "Клавипекторальный фасциальный блок + поверхностные шейные ветви",
        diaphragm: "Минимальный",
        motor: "Низкое",
        note: "Кандидат при приоритете сохранения функции диафрагмы; покрытие краёв доступа проверяется отдельно.",
      },
      {
        name: "Проксимальная",
        blocks: "Верхний ствол / интерскаленовый компонент + поверхностные шейные ветви",
        diaphragm: "Высокий",
        motor: "Выраженное",
        note: "Более проксимальная стратегия с существенным риском диафрагмальной дисфункции.",
      },
    ],
  },
  {
    id: "proximal-humerus",
    short: "Проксимальное плечо",
    title: "Остеосинтез проксимального отдела плечевой кости",
    zone: "Плечевой сустав, проксимальная плечевая кость, дельтопекторальный или латеральный доступ.",
    nerves: "Надлопаточный, подмышечный, латеральный грудной и другие суставные ветви.",
    gap: "Кожа медиальнее доступа и дистальное продолжение разреза.",
    strategies: [
      {
        name: "Проксимальная",
        blocks: "Интерскаленовая / верхний ствол",
        diaphragm: "Высокий",
        motor: "Выраженное",
        note: "Ожидаемо широкое плечевое покрытие, но дыхательный риск должен быть оценён до выбора.",
      },
      {
        name: "Селективная",
        blocks: "Надлопаточный + подмышечный нервы",
        diaphragm: "Низкий",
        motor: "Умеренное",
        note: "Диафрагма-сберегающий кандидат; полноту кожного и суставного покрытия необходимо проверить.",
      },
    ],
  },
  {
    id: "humeral-shaft",
    short: "Диафиз плеча",
    title: "Остеосинтез диафиза плечевой кости",
    zone: "Диафиз, периост, протяжённый передний или задний доступ.",
    nerves: "Лучевой, мышечно-кожный, медиальный кожный нерв плеча; вариабельные кожные ветви.",
    gap: "Проксимальный край доступа и зона турникета, если используется.",
    strategies: [
      {
        name: "Инфраклавикулярная",
        blocks: "Инфраклавикулярный / костоклавикулярный блок",
        diaphragm: "Низкий",
        motor: "Выраженное",
        note: "Кандидат для покрытия терминальных ветвей; протяжённость доступа требует отдельной проверки.",
      },
      {
        name: "Супраклавикулярная",
        blocks: "Супраклавикулярный блок",
        diaphragm: "Умеренный",
        motor: "Выраженное",
        note: "Плотное покрытие плечевого сплетения, но риск диафрагмальной дисфункции не равен нулю.",
      },
    ],
  },
  {
    id: "elbow",
    short: "Локоть",
    title: "Остеосинтез области локтевого сустава",
    zone: "Сустав, дистальный отдел плеча или проксимальные отделы предплечья; доступ уточняется.",
    nerves: "Лучевой, срединный, локтевой, мышечно-кожный и кожные ветви.",
    gap: "Медиальная/задняя кожа плеча, турникет и зона забора трансплантата.",
    strategies: [
      {
        name: "Инфраклавикулярная",
        blocks: "Инфраклавикулярный блок ± кожные ветви",
        diaphragm: "Низкий",
        motor: "Выраженное",
        note: "Позволяет работать дистальнее ключицы и отдельно закрывать кожные слепые зоны.",
      },
      {
        name: "Супраклавикулярная",
        blocks: "Супраклавикулярный блок",
        diaphragm: "Умеренный",
        motor: "Выраженное",
        note: "Компактная стратегия для верхней конечности; дыхательный риск оценивается до пункции.",
      },
    ],
  },
  {
    id: "forearm",
    short: "Предплечье",
    title: "Остеосинтез костей предплечья",
    zone: "Лучевая и/или локтевая кость, передний или задний доступ, возможно несколько разрезов.",
    nerves: "Срединный, локтевой, лучевой, мышечно-кожный и медиальный кожный нерв предплечья.",
    gap: "Турникет, проксимальная кожа и отдельные кожные ветви.",
    strategies: [
      {
        name: "Инфраклавикулярная",
        blocks: "Инфраклавикулярный / костоклавикулярный блок",
        diaphragm: "Низкий",
        motor: "Выраженное",
        note: "Кандидат для операций ниже локтя при необходимости катетера или удалённости от диафрагмы.",
      },
      {
        name: "Супраклавикулярная",
        blocks: "Супраклавикулярный блок",
        diaphragm: "Умеренный",
        motor: "Выраженное",
        note: "Широкое покрытие, но требуется отдельная оценка дыхательного резерва.",
      },
    ],
  },
  {
    id: "distal-radius",
    short: "Дистальный радиус",
    title: "Остеосинтез дистального отдела лучевой кости",
    zone: "Дистальное предплечье и запястье, чаще ладонный доступ.",
    nerves: "Срединный, лучевой, локтевой и кожные ветви предплечья.",
    gap: "Турникет и медиальный кожный нерв предплечья.",
    strategies: [
      {
        name: "Дистальная",
        blocks: "Аксиллярный блок / селективные терминальные нервы",
        diaphragm: "Минимальный",
        motor: "Дистальное",
        note: "Диафрагма-сберегающий кандидат; турникет и кожные территории проверяются отдельно.",
      },
      {
        name: "Инфраклавикулярная",
        blocks: "Инфраклавикулярный блок",
        diaphragm: "Низкий",
        motor: "Выраженное",
        note: "Проксимальнее аксиллярного уровня, но остаётся ниже ключицы.",
      },
    ],
  },
  {
    id: "hand",
    short: "Кисть",
    title: "Остеосинтез костей кисти",
    zone: "Пястные кости, тыл или ладонь кисти; один или несколько доступов.",
    nerves: "Срединный, локтевой и поверхностная ветвь лучевого нерва.",
    gap: "Турникет, дорсальные кожные ветви и перекрывающиеся территории.",
    strategies: [
      {
        name: "Аксиллярная",
        blocks: "Аксиллярный блок с отдельной идентификацией нервов",
        diaphragm: "Минимальный",
        motor: "Дистальное",
        note: "Позволяет адресно оценить срединный, локтевой, лучевой и мышечно-кожный нервы.",
      },
      {
        name: "Селективная",
        blocks: "Блоки нервов на уровне предплечья / запястья",
        diaphragm: "Минимальный",
        motor: "Локальное",
        note: "Максимально дистальная стратегия; выбор зависит от разреза и требований хирурга.",
      },
    ],
  },
  {
    id: "finger",
    short: "Пальцы",
    title: "Остеосинтез фаланг",
    zone: "Одна или несколько фаланг, ладонная или тыльная поверхность пальца.",
    nerves: "Собственные пальцевые нервы; проксимально — срединный или локтевой нервы.",
    gap: "Тыльные ветви, несколько пальцев и боль от турникета.",
    strategies: [
      {
        name: "Пальцевая",
        blocks: "Кольцевой / пальцевой блок",
        diaphragm: "Минимальный",
        motor: "Локальное",
        note: "Наиболее дистальный кандидат при изолированной операции на одном пальце.",
      },
      {
        name: "Запястье",
        blocks: "Селективные блоки срединного / локтевого / лучевого нервов",
        diaphragm: "Минимальный",
        motor: "Локальное",
        note: "Кандидат при нескольких хирургических территориях кисти.",
      },
    ],
  },
  {
    id: "tendon",
    short: "Сухожилия",
    title: "Шов сухожилий кисти",
    zone: "Ладонная или тыльная поверхность кисти/пальцев, иногда протяжённая зона ревизии.",
    nerves: "Срединный, локтевой и лучевой нервы в зависимости от зоны повреждения.",
    gap: "Несколько нервных территорий, турникет и необходимость оценки функции после операции.",
    strategies: [
      {
        name: "Селективная",
        blocks: "Терминальные нервы на предплечье / запястье",
        diaphragm: "Минимальный",
        motor: "Локальное",
        note: "Позволяет согласовать требуемую моторную блокаду с планом послеоперационной оценки.",
      },
      {
        name: "Аксиллярная",
        blocks: "Аксиллярный блок",
        diaphragm: "Минимальный",
        motor: "Дистальное",
        note: "Кандидат при широкой или множественной зоне вмешательства.",
      },
    ],
  },
];

const anesthetics = [
  { id: "ropivacaine", label: "Ропивакаин", concentration: 0.375 },
  { id: "levobupivacaine", label: "Левобупивакаин", concentration: 0.25 },
  { id: "bupivacaine", label: "Бупивакаин", concentration: 0.25 },
  { id: "lidocaine", label: "Лидокаин", concentration: 1 },
];

function BodyAtlasHero() {
  const [zoneId, setZoneId] = useState<AtlasZoneId>("upper");
  const zone = atlasZones.find((item) => item.id === zoneId) ?? atlasZones[0];

  return (
    <section className="atlas-hero" id="top">
      <header className="site-header atlas-header">
        <a className="brand" href="#top" aria-label="POCUS MOSCOW — в начало">
          <span className="brand-mark">P</span>
          <span>POCUS MOSCOW<small>BLOCK PLANNER</small></span>
        </a>
        <div className="header-meta">
          <span className="live-chip"><i /> HUMAN ATLAS / HIGGSFIELD</span>
          <a href="#upper-limb">Открыть планировщик <span>↘</span></a>
        </div>
      </header>

      <div className="atlas-stage">
        <div className="atlas-media" data-zone={zone.id} aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={`${assetBasePath}/media/body-atlas/poster.webp`}
          >
            <source src={`${assetBasePath}/media/body-atlas/body-atlas-loop.mp4`} type="video/mp4" />
          </video>
          <div
            className="atlas-poster"
            style={{ backgroundImage: `url("${assetBasePath}/media/body-atlas/poster.webp")` }}
          />
        </div>
        <div className="atlas-vignette" />
        <div className="atlas-grid" />
        <div className="atlas-scan" />
        <div className={`atlas-target atlas-target--${zone.id}`}>
          <i />
          <span>{zone.focus}</span>
        </div>
      </div>

      <div className="atlas-interface">
        <div className="atlas-copy">
          <p>00 / ANATOMICAL NAVIGATION</p>
          <h1>Выберите<br />операцию.</h1>
          <span>
            Камера сфокусируется на нужной анатомической зоне, а планировщик
            покажет возможные стратегии и обязательные точки контроля.
          </span>
        </div>

        <div className="atlas-zone-card" aria-live="polite">
          <div>
            <span>ACTIVE REGION / {zone.index}</span>
            <i className={zone.status === "LIVE" ? "is-live" : ""}>{zone.status}</i>
          </div>
          <h2>{zone.title}</h2>
          <p>{zone.description}</p>
          {zone.href ? (
            <a href={zone.href}>Открыть раздел <span>↓</span></a>
          ) : (
            <span className="atlas-next">Следующий модуль базы знаний</span>
          )}
        </div>

        <nav className="atlas-nav" aria-label="Выбор анатомического направления">
          {atlasZones.map((item) => (
            <button
              type="button"
              key={item.id}
              className={zone.id === item.id ? "is-active" : ""}
              onClick={() => setZoneId(item.id)}
              aria-pressed={zone.id === item.id}
            >
              <i>{item.index}</i>
              <span>{item.label}</span>
              <b>{item.status}</b>
            </button>
          ))}
        </nav>

        <div className="atlas-data" aria-hidden="true">
          <span>MODEL / HF-001</span>
          <b>DIGITAL HUMAN · ADULT 18+</b>
          <i />
          <span>CAMERA TARGET</span>
          <b>{zone.focus}</b>
        </div>
      </div>
    </section>
  );
}

function CinematicScroll({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const desiredFrameRef = useRef(0);
  const drawnFrameRef = useRef(-1);
  const animationRef = useRef<number | null>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const sourceFrameCount = 72;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const displayFrameCount = window.innerWidth < 760 ? 36 : sourceFrameCount;
    const frames = Array.from({ length: displayFrameCount }, (_, index) => {
      const mapped = Math.round((index * (sourceFrameCount - 1)) / (displayFrameCount - 1)) + 1;
      return `${assetBasePath}/media/knee-scroll/frames/frame-${String(mapped).padStart(3, "0")}.webp`;
    });
    const images = frames.map(() => new Image());
    imagesRef.current = images;
    let loaded = 0;
    let stopped = false;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      drawnFrameRef.current = -1;
    };

    const drawFrame = (index: number) => {
      const image = images[index];
      if (!image?.complete || image.naturalWidth === 0) return false;
      const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      drawnFrameRef.current = index;
      setCanvasReady(true);
      return true;
    };

    const render = () => {
      if (stopped) return;
      const target = desiredFrameRef.current;
      if (target !== drawnFrameRef.current) {
        if (!drawFrame(target)) {
          for (let distance = 1; distance < images.length; distance += 1) {
            const previous = target - distance;
            const next = target + distance;
            if (previous >= 0 && drawFrame(previous)) break;
            if (next < images.length && drawFrame(next)) break;
          }
        }
      }
      animationRef.current = window.requestAnimationFrame(render);
    };

    const updateFromScroll = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      desiredFrameRef.current = reducedMotion ? 0 : Math.round(progress * (images.length - 1));
      let nextChapter = 0;
      chapterStops.forEach((stop, index) => {
        if (progress >= stop) nextChapter = index;
      });
      setActiveChapter(nextChapter);
    };

    images.forEach((image, index) => {
      image.onload = () => {
        loaded += 1;
        setLoadProgress(Math.round((loaded / images.length) * 100));
        if (index === 0) drawFrame(0);
      };
      image.src = frames[index];
    });

    resizeCanvas();
    updateFromScroll();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    animationRef.current = window.requestAnimationFrame(render);

    return () => {
      stopped = true;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", updateFromScroll);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <section className="cinematic" id="knee-story" ref={sectionRef}>
      <div className="cinematic-sticky">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="POCUS MOSCOW — в начало">
            <span className="brand-mark">P</span>
            <span>POCUS MOSCOW<small>BLOCK PLANNER</small></span>
          </a>
          <div className="header-meta">
            <span className="live-chip"><i /> ONE-SHOT / TKA</span>
            <a href="#planner">Открыть результат <span>↘</span></a>
          </div>
        </header>

        <div className="cinematic-media" data-ready={canvasReady}>
          <div
            className="cinematic-poster"
            style={{ backgroundImage: `url("${assetBasePath}/media/knee-scroll/poster.webp")` }}
            aria-hidden="true"
          />
          <canvas ref={canvasRef} className="cinematic-canvas" aria-hidden="true" />
          <div className="cinematic-vignette" />
          <div className="cinematic-grid" />
        </div>

        <div className="cinematic-ui">
          <div className="chapter-stack">
            {chapters.map((chapter, index) => (
              <article
                className={`cinematic-chapter ${activeChapter === index ? "is-active" : ""}`}
                aria-hidden={activeChapter !== index}
                key={chapter.eyebrow}
              >
                <p>{chapter.eyebrow}</p>
                <h1>{chapter.title}</h1>
                <span>{chapter.text}</span>
                {index === 0 && (
                  <>
                    <label className="operation-search cinematic-search">
                      <span>Операция</span>
                      <input
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        aria-label="Введите название операции"
                      />
                    </label>
                    <div className="query-hints">
                      <span>Распознаёт:</span>
                      <button type="button" onClick={() => onQueryChange("ТЭКС")}>ТЭКС</button>
                      <button type="button" onClick={() => onQueryChange("TKA")}>TKA</button>
                      <button type="button" onClick={() => onQueryChange("Замена коленного сустава")}>замена колена</button>
                    </div>
                  </>
                )}
                {index === chapters.length - 1 && (
                  <a className="cinematic-cta" href="#planner">
                    Перейти к планировщику <span>↓</span>
                  </a>
                )}
              </article>
            ))}
          </div>

          <div className="cinematic-data" aria-hidden="true">
            <span>CASE / 001</span>
            <b>TKA · LOWER LIMB</b>
            <i />
            <span>ACTIVE LAYER</span>
            <b>{chapters[activeChapter].layer}</b>
          </div>

          <div className="cinematic-progress" aria-hidden="true">
            <span className="progress-number">0{activeChapter}</span>
            <div className="progress-track">
              <i style={{ height: `${Math.max(3, (activeChapter / (chapters.length - 1)) * 100)}%` }} />
            </div>
            <span>0{chapters.length - 1}</span>
          </div>

          <div className="frame-loader" aria-live="polite">
            <i style={{ width: `${loadProgress}%` }} />
            <span>{loadProgress < 100 ? `ATLAS LOADING ${loadProgress}%` : "ATLAS READY"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function KneeMap({ step, compact = false }: { step: StoryStep; compact?: boolean }) {
  return (
    <div className={`knee-map ${compact ? "knee-map--compact" : ""}`} data-step={step}>
      <div className="scan-line" />
      <div className="map-status">
        <span className="status-dot" />
        LIVE ANATOMY MAP
      </div>
      <svg
        viewBox="0 0 640 760"
        role="img"
        aria-label="Схематическая карта коленного сустава, нервных территорий и зон покрытия блоков"
      >
        <defs>
          <linearGradient id="bone" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d9f5f5" stopOpacity=".9" />
            <stop offset=".55" stopColor="#79a9ad" stopOpacity=".35" />
            <stop offset="1" stopColor="#d9f5f5" stopOpacity=".08" />
          </linearGradient>
          <radialGradient id="cyanHalo">
            <stop offset="0" stopColor="#35f2e4" stopOpacity=".28" />
            <stop offset=".65" stopColor="#35f2e4" stopOpacity=".10" />
            <stop offset="1" stopColor="#35f2e4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="amberHalo">
            <stop offset="0" stopColor="#ffb84d" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="redHalo">
            <stop offset="0" stopColor="#ff5e73" stopOpacity=".35" />
            <stop offset="1" stopColor="#ff5e73" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="7" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="grid-lines">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`h-${i}`} x1="38" x2="602" y1={80 + i * 82} y2={80 + i * 82} />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <line key={`v-${i}`} y1="42" y2="718" x1={76 + i * 82} x2={76 + i * 82} />
          ))}
        </g>

        <ellipse className="territory territory--anterior" cx="325" cy="365" rx="188" ry="186" fill="url(#cyanHalo)" />
        <ellipse className="territory territory--posterior" cx="438" cy="430" rx="138" ry="174" fill="url(#redHalo)" />
        <ellipse className="territory territory--coverage" cx="243" cy="390" rx="145" ry="198" fill="url(#amberHalo)" />

        <g className="bones">
          <path d="M252 50 C250 130 258 187 233 236 C207 287 215 336 260 358 C290 372 344 372 379 350 C421 324 426 279 400 234 C373 187 381 128 384 49 Z" fill="url(#bone)" />
          <path d="M246 374 C211 402 202 448 221 491 C241 535 260 574 257 710 L354 710 C351 574 374 525 396 483 C416 443 403 400 365 374 C335 353 276 352 246 374 Z" fill="url(#bone)" />
          <ellipse cx="303" cy="370" rx="118" ry="54" fill="none" />
          <path d="M291 315 C268 342 264 392 288 425 C302 444 326 444 341 424 C363 393 360 344 337 315 C324 299 304 299 291 315 Z" className="patella" />
        </g>

        <g className="nerves" filter="url(#glow)">
          <path className="nerve nerve--femoral" d="M170 81 C173 164 187 218 212 266 C237 314 241 357 232 428 C225 482 208 525 200 611" />
          <path className="nerve nerve--saphenous" d="M191 226 C147 277 131 327 138 390 C143 443 167 474 173 528" />
          <path className="nerve nerve--posterior" d="M462 158 C442 238 432 306 444 371 C451 410 469 445 483 501" />
          <circle className="nerve-node" cx="232" cy="428" r="8" />
          <circle className="nerve-node nerve-node--posterior" cx="444" cy="371" r="8" />
        </g>

        <g className="surgical-zone">
          <path d="M302 279 C283 323 281 382 300 429" />
          <path d="M320 277 C340 326 342 381 321 431" />
          <circle cx="311" cy="356" r="102" />
        </g>

        <g className="block-markers">
          <g className="marker marker--acb">
            <circle cx="172" cy="326" r="20" />
            <circle cx="172" cy="326" r="5" />
            <path d="M190 312 L246 268" />
            <text x="250" y="265">ACB</text>
          </g>
          <g className="marker marker--ipack">
            <circle cx="453" cy="414" r="20" />
            <circle cx="453" cy="414" r="5" />
            <path d="M468 428 L520 470" />
            <text x="524" y="478">iPACK</text>
          </g>
        </g>

        <g className="map-labels">
          <text x="56" y="690">ANTERIOR</text>
          <text x="486" y="690">POSTERIOR</text>
          <text className="label-anterior" x="74" y="118">FEMORAL / SAPHENOUS</text>
          <text className="label-posterior" x="414" y="116">POSTERIOR CAPSULE</text>
        </g>
      </svg>
      <div className="map-legend" aria-hidden="true">
        <span><i className="legend-cyan" />нервная территория</span>
        <span><i className="legend-amber" />покрытие</span>
        <span><i className="legend-red" />слепая зона</span>
      </div>
    </div>
  );
}

function RiskChip({ risk }: { risk: DiaphragmRisk }) {
  const tone =
    risk === "Высокий" ? "danger" : risk === "Умеренный" ? "warning" : "safe";
  return <span className={`risk-chip risk-chip--${tone}`}>{risk}</span>;
}

function UpperLimbModule() {
  const [operationId, setOperationId] = useState<UpperOperationId>("clavicle");
  const [strategyIndex, setStrategyIndex] = useState(0);
  const [weight, setWeight] = useState(70);
  const [anestheticId, setAnestheticId] = useState("ropivacaine");
  const activeAnesthetic =
    anesthetics.find((item) => item.id === anestheticId) ?? anesthetics[0];
  const [concentration, setConcentration] = useState(activeAnesthetic.concentration);
  const [volume, setVolume] = useState(15);
  const [baselineExcursion, setBaselineExcursion] = useState(2.1);
  const [postExcursion, setPostExcursion] = useState(1.7);
  const [expThickness, setExpThickness] = useState(0.2);
  const [inspThickness, setInspThickness] = useState(0.32);
  const [blockDepth, setBlockDepth] = useState("deep");
  const [antithrombotic, setAntithrombotic] = useState("Апиксабан");
  const [catheter, setCatheter] = useState(false);
  const operation =
    upperOperations.find((item) => item.id === operationId) ?? upperOperations[0];
  const selectedStrategy = operation.strategies[strategyIndex] ?? operation.strategies[0];

  const doseMg = Math.max(0, volume) * Math.max(0, concentration) * 10;
  const dosePerKg = weight > 0 ? doseMg / weight : 0;
  const excursionChange =
    baselineExcursion > 0
      ? ((postExcursion - baselineExcursion) / baselineExcursion) * 100
      : 0;
  const thickeningFraction =
    expThickness > 0
      ? ((inspThickness - expThickness) / expThickness) * 100
      : 0;

  const chooseOperation = (id: UpperOperationId) => {
    setOperationId(id);
    setStrategyIndex(0);
  };

  const chooseAnesthetic = (id: string) => {
    const next = anesthetics.find((item) => item.id === id) ?? anesthetics[0];
    setAnestheticId(next.id);
    setConcentration(next.concentration);
  };

  return (
    <section className="upper-module" id="upper-limb">
      <div className="upper-heading">
        <p className="section-kicker"><span>04</span> UPPER LIMB / ALPHA</p>
        <h2>Верхняя<br />конечность.</h2>
        <div className="upper-intro">
          <p>
            Маршрут от операции к кандидатам на блокаду — с явной оценкой слепых зон,
            моторики и риска диафрагмальной дисфункции.
          </p>
          <span>ВЗРОСЛЫЕ 18+ · РЕШЕНИЕ ПРИНИМАЕТ ВРАЧ</span>
        </div>
      </div>

      <div className="clinical-shell">
        <nav className="operation-rail" aria-label="Операции верхней конечности">
          <span className="rail-title">01 / ОПЕРАЦИЯ</span>
          {upperOperations.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={operation.id === item.id ? "is-active" : ""}
              onClick={() => chooseOperation(item.id)}
              aria-pressed={operation.id === item.id}
            >
              <i>{String(index + 1).padStart(2, "0")}</i>
              <span>{item.short}</span>
            </button>
          ))}
        </nav>

        <div className="clinical-content">
          <div className="case-overview">
            <div>
              <span className="micro-label">ВЫБРАННЫЙ КЕЙС</span>
              <h3>{operation.title}</h3>
            </div>
            <span className="prototype-chip">PROTOTYPE LOGIC</span>
          </div>

          <div className="clinical-map-grid">
            <article>
              <span>ХИРУРГИЧЕСКАЯ ЗОНА</span>
              <p>{operation.zone}</p>
            </article>
            <article>
              <span>НЕРВНЫЕ ТЕРРИТОРИИ</span>
              <p>{operation.nerves}</p>
            </article>
            <article className="gap-card">
              <span>ОБЯЗАТЕЛЬНО ПРОВЕРИТЬ</span>
              <p>{operation.gap}</p>
            </article>
          </div>

          <div className="strategy-header">
            <span className="micro-label">02 / СРАВНЕНИЕ СТРАТЕГИЙ</span>
            <p>Кандидаты для клинического обсуждения, не автоматическое назначение.</p>
          </div>

          <div className="upper-strategies">
            {operation.strategies.map((item, index) => (
              <button
                type="button"
                key={`${operation.id}-${item.name}`}
                className={strategyIndex === index ? "is-active" : ""}
                onClick={() => setStrategyIndex(index)}
                aria-pressed={strategyIndex === index}
              >
                <span className="strategy-topline">
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <RiskChip risk={item.diaphragm} />
                </span>
                <strong>{item.name}</strong>
                <b>{item.blocks}</b>
                <span className="motor-line">МОТОРИКА / {item.motor}</span>
                <p>{item.note}</p>
              </button>
            ))}
          </div>

          <div className="selection-summary" aria-live="polite">
            <span>ТЕКУЩИЙ ФОКУС</span>
            <b>{selectedStrategy.blocks}</b>
            <div>
              <span>Риск диафрагмы <RiskChip risk={selectedStrategy.diaphragm} /></span>
              <span>Моторный эффект: {selectedStrategy.motor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tool-grid">
        <article className="clinical-tool diaphragm-tool">
          <header>
            <span>03 / ДИАФРАГМА</span>
            <b>УЗ-оценка до / после</b>
          </header>
          <p className="tool-note">
            Измеряйте в одинаковом положении пациента и при одинаковом дыхательном манёвре.
          </p>
          <div className="input-pair">
            <label>
              Экскурсия до, см
              <input type="number" min="0" step="0.1" value={baselineExcursion}
                onChange={(event) => setBaselineExcursion(Number(event.target.value))} />
            </label>
            <label>
              Экскурсия после, см
              <input type="number" min="0" step="0.1" value={postExcursion}
                onChange={(event) => setPostExcursion(Number(event.target.value))} />
            </label>
          </div>
          <div className="input-pair">
            <label>
              Толщина выдох, см
              <input type="number" min="0" step="0.01" value={expThickness}
                onChange={(event) => setExpThickness(Number(event.target.value))} />
            </label>
            <label>
              Толщина вдох, см
              <input type="number" min="0" step="0.01" value={inspThickness}
                onChange={(event) => setInspThickness(Number(event.target.value))} />
            </label>
          </div>
          <div className="metric-output">
            <div><span>ИЗМЕНЕНИЕ ЭКСКУРСИИ</span><b>{excursionChange.toFixed(0)}%</b></div>
            <div><span>THICKENING FRACTION</span><b>{thickeningFraction.toFixed(0)}%</b></div>
          </div>
          <div className="locked-note">
            <i>!</i>
            <span>Диагностический порог не задан: интерпретировать вместе с исходным УЗИ, симптомами и дыхательным резервом.</span>
          </div>
        </article>

        <article className="clinical-tool dose-tool">
          <header>
            <span>04 / ДОЗА</span>
            <b>Арифметический калькулятор</b>
          </header>
          <div className="input-grid">
            <label>
              Масса, кг
              <input type="number" min="1" step="1" value={weight}
                onChange={(event) => setWeight(Number(event.target.value))} />
            </label>
            <label>
              Препарат
              <select value={anestheticId} onChange={(event) => chooseAnesthetic(event.target.value)}>
                {anesthetics.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>
              Концентрация, %
              <input type="number" min="0" step="0.025" value={concentration}
                onChange={(event) => setConcentration(Number(event.target.value))} />
            </label>
            <label>
              Объём, мл
              <input type="number" min="0" step="1" value={volume}
                onChange={(event) => setVolume(Number(event.target.value))} />
            </label>
          </div>
          <div className="dose-equation">
            <span>{concentration || 0}% × 10 = {(concentration * 10).toFixed(2)} мг/мл</span>
            <b>{doseMg.toFixed(1)} мг</b>
            <strong>{dosePerKg.toFixed(2)} мг/кг</strong>
          </div>
          <div className="locked-note locked-note--amber">
            <i>⌁</i>
            <span>Лимит мг/кг и абсолютный максимум заблокированы до утверждения локального протокола. Результат не означает «безопасно».</span>
          </div>
        </article>

        <article className="clinical-tool last-tool">
          <header>
            <span>05 / LAST</span>
            <b>Системная токсичность</b>
          </header>
          <div className="last-flow">
            <div><i>01</i><p><b>Распознать</b>Необычные неврологические симптомы, судороги, аритмия или нестабильность после местного анестетика.</p></div>
            <div><i>02</i><p><b>Остановить введение</b>Позвать помощь, обеспечить дыхательные пути и оксигенацию, активировать локальный протокол LAST.</p></div>
            <div><i>03</i><p><b>Достать чек-лист</b>Подготовить липидную эмульсию и следовать актуальному чек-листу ASRA и локальному алгоритму реанимации.</p></div>
          </div>
          <a href="https://asra.com/news-publications/asra-updates/blog-landing/guidelines/2020/11/01/checklist-for-treatment-of-local-anesthetic-systemic-toxicity"
            target="_blank" rel="noreferrer">
            Открыть официальный ASRA LAST checklist ↗
          </a>
        </article>

        <article className="clinical-tool antithrombotic-tool">
          <header>
            <span>06 / АНТИТРОМБОТИЧЕСКАЯ ТЕРАПИЯ</span>
            <b>Навигатор ASRA 2025</b>
          </header>
          <div className="input-grid">
            <label>
              Препарат / группа
              <input value={antithrombotic} onChange={(event) => setAntithrombotic(event.target.value)} />
            </label>
            <label>
              Тип блока
              <select value={blockDepth} onChange={(event) => setBlockDepth(event.target.value)}>
                <option value="superficial">Поверхностный / компрессируемый</option>
                <option value="deep">Глубокий плексус / периферический</option>
              </select>
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={catheter}
              onChange={(event) => setCatheter(event.target.checked)} />
            Планируется катетер
          </label>
          <div className="decision-path">
            <span>МАРШРУТ ПРОВЕРКИ</span>
            <b>{antithrombotic || "Препарат не указан"}</b>
            <p>
              {blockDepth === "deep"
                ? "Глубокий блок: применить интервалы ASRA для deep plexus/peripheral с учётом дозы, функции почек и времени последнего приёма."
                : "Поверхностный компрессируемый блок: оценить кровоточивость зоны и возможность компрессии; глубокие интервалы автоматически не переносить."}
            </p>
            {catheter && <p className="catheter-alert">Катетер: отдельно проверить удаление и время возобновления терапии.</p>}
          </div>
          <div className="locked-note">
            <i>!</i>
            <span>Числовые интервалы скрыты до экспертной верификации таблицы ASRA 2025 и локального протокола.</span>
          </div>
        </article>
      </div>

      <div className="module-disclaimer">
        <b>ALPHA / EDUCATIONAL DECISION SUPPORT</b>
        <p>
          Модуль не хранит введённые данные, не формирует назначение и не заменяет клиническое решение,
          оценку пациента, инструкцию к препарату или локальный протокол.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [query, setQuery] = useState("Тотальное эндопротезирование коленного сустава");
  const selected = useMemo(() => strategies[strategy], [strategy]);

  return (
    <main>
      <BodyAtlasHero />
      <CinematicScroll query={query} onQueryChange={setQuery} />

      <section className="planner" id="planner">
        <div className="planner-heading">
          <p className="section-kicker"><span>02</span> BLOCK PLANNER / DEMO</p>
          <h2>Стратегия для<br />первого кейса.</h2>
          <p>
            Выберите клинический приоритет. Прототип перестроит рекомендуемую конфигурацию и покажет зону, которую важно проверить.
          </p>
        </div>

        <div className="planner-shell">
          <div className="planner-toolbar">
            <div>
              <span>ОПЕРАЦИЯ</span>
              <b>TKA · Тотальное эндопротезирование колена</b>
            </div>
            <span className="case-chip">CASE 001</span>
          </div>

          <div className="planner-controls" role="group" aria-label="Выбор клинического приоритета">
            {(Object.keys(strategies) as Strategy[]).map((key) => (
              <button
                type="button"
                key={key}
                className={strategy === key ? "is-active" : ""}
                onClick={() => setStrategy(key)}
              >
                <i />
                {strategies[key].label}
              </button>
            ))}
          </div>

          <div className="planner-result">
            <div className="result-main">
              <div className="result-label">
                <span>ПРЕДВАРИТЕЛЬНАЯ СТРАТЕГИЯ</span>
                <i>01</i>
              </div>
              <h3>{selected.title}</h3>
              <p>{selected.subtitle}</p>
              <div className="result-metrics">
                <div><b>{selected.score}</b><span>{selected.scoreLabel}</span></div>
                <div><b>{selected.motor}</b><span>{selected.motorLabel}</span></div>
                <div className="metric-alert"><b>{selected.blind}</b><span>{selected.blindLabel}</span></div>
              </div>
              <p className="result-detail">{selected.detail}</p>
            </div>
            <div className="result-map">
              <KneeMap step={strategy === "extended" ? 3 : 2} compact />
            </div>
          </div>

          <div className="planner-grid">
            <article>
              <span className="card-number">01</span>
              <div className="card-icon">ACB</div>
              <h4>Adductor Canal Block</h4>
              <p>Сенсорное покрытие медиальной зоны с приоритетом сохранения моторной функции.</p>
              <div className="tags"><span>Медиальная зона</span><span>Motor-sparing</span></div>
            </article>
            <article>
              <span className="card-number">02</span>
              <div className="card-icon">LIA</div>
              <h4>Local Infiltration</h4>
              <p>Инфильтрация хирургом тканей операционного поля как часть мультимодальной схемы.</p>
              <div className="tags"><span>Операционное поле</span><span>Surgeon</span></div>
            </article>
            <article className={strategy === "extended" ? "is-selected" : ""}>
              <span className="card-number">03</span>
              <div className="card-icon">iP</div>
              <h4>iPACK</h4>
              <p>Опциональное дополнение для работы с терминальными ветвями задней капсулы.</p>
              <div className="tags"><span>Задняя капсула</span><span>Optional</span></div>
            </article>
          </div>
        </div>
      </section>

      <UpperLimbModule />

      <section className="evidence">
        <div>
          <p className="section-kicker"><span>03</span> ПРОВЕРЯЕМАЯ БАЗА ЗНАНИЙ</p>
          <h2>Каждая рекомендация<br />должна объяснять «почему».</h2>
        </div>
        <div className="evidence-list">
          <div><span>01</span><p><b>Хирургическая зона</b>Какие ткани являются ожидаемым источником боли.</p></div>
          <div><span>02</span><p><b>Нервная территория</b>Какие нервы и суставные ветви участвуют в иннервации.</p></div>
          <div><span>03</span><p><b>Покрытие и ограничения</b>Что блок закрывает, а что остаётся за его пределами.</p></div>
          <div><span>04</span><p><b>Источник решения</b>Рекомендации, обзоры и локальный экспертный консенсус.</p></div>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">P</span>
          <span>POCUS MOSCOW<small>BLOCK PLANNER</small></span>
        </div>
        <p>
          Демонстрационный прототип для обсуждения логики продукта. Не является клинической рекомендацией и требует экспертной валидации перед применением.
        </p>
        <span>VERSION 0.3 / 2026</span>
      </footer>
    </main>
  );
}
