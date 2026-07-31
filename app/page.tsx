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
type AtlasVisual = "front" | "posterior" | "shoulder-fracture" | "hip-arthroplasty";
type TrunkOperationId =
  | "thoracotomy"
  | "vats"
  | "sternotomy"
  | "breast"
  | "ribs"
  | "device"
  | "laparotomy"
  | "cholecystectomy"
  | "colorectal"
  | "caesarean"
  | "hernia"
  | "flank";
type TrunkProjection = "front" | "side" | "back";
type TrunkBlockId =
  | "pec1"
  | "pec2"
  | "deep-serratus"
  | "spip"
  | "dpip"
  | "tap-classic"
  | "tap-subcostal"
  | "rectus-sheath"
  | "ql1"
  | "ql2"
  | "ql3";

const atlasZones: Array<{
  id: AtlasZoneId;
  index: string;
  label: string;
  title: string;
  focus: string;
  description: string;
  visual: AtlasVisual;
  visualLabel: string;
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
    visual: "shoulder-fracture",
    visualLabel: "ПЕРЕЛОМ ХИРУРГИЧЕСКОЙ ШЕЙКИ ПЛЕЧА",
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
    visual: "hip-arthroplasty",
    visualLabel: "ТОТАЛЬНОЕ ЭНДОПРОТЕЗИРОВАНИЕ ТБС",
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
    visual: "front",
    visualLabel: "ПЕРЕДНЯЯ ПРОЕКЦИЯ / ФАСЦИАЛЬНЫЕ ПЛОСКОСТИ",
    status: "LIVE",
    href: "#trunk-wall",
  },
  {
    id: "paravertebral",
    index: "04",
    label: "Паравертебральные блокады",
    title: "Паравертебральная зона",
    focus: "PARAVERTEBRAL SPACE",
    description:
      "Уровень вмешательства, дерматомное покрытие, плевра, сосудистые структуры и контроль распространения.",
    visual: "posterior",
    visualLabel: "ЗАДНЯЯ ПРОЕКЦИЯ / ПАРАВЕРТЕБРАЛЬНАЯ ЗОНА",
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
    visual: "posterior",
    visualLabel: "ЗАДНЯЯ ПРОЕКЦИЯ / НЕЙРОАКСИАЛЬНАЯ ОСЬ",
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

type BlockMediaImage = {
  src: string;
  alt: string;
};

const pec1Images: BlockMediaImage[] = [
  {
    src: `${assetBasePath}/media/pec1/PEC1_probe_position_clean.png`,
    alt: "Положение ультразвукового датчика для блока PEC I",
  },
  {
    src: `${assetBasePath}/media/pec1/PEC1_anatomy_clean.png`,
    alt: "Анатомия межпекторальной плоскости PEC I",
  },
  {
    src: `${assetBasePath}/media/pec1/PEC1_ultrasound_clean.png`,
    alt: "Ультразвуковое изображение для блока PEC I",
  },
];

const interscaleneImages: BlockMediaImage[] = [
  {
    src: `${assetBasePath}/media/interscalene/INTERSCALENE_probe_position_clean.png`,
    alt: "Положение линейного датчика при межлестничной блокаде",
  },
  {
    src: `${assetBasePath}/media/interscalene/INTERSCALENE_ultrasound_clean.png`,
    alt: "Положение датчика и соответствующая ультразвуковая анатомия межлестничной области",
  },
  {
    src: `${assetBasePath}/media/interscalene/INTERSCALENE_anatomy_clean.png`,
    alt: "Поперечная анатомия межлестничного промежутка",
  },
  {
    src: `${assetBasePath}/media/interscalene/INTERSCALENE_distribution_clean.png`,
    alt: "Ожидаемая территория межлестничной блокады",
  },
];

const supraclavicularImages: BlockMediaImage[] = [
  {
    src: `${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_brachial_plexus_clean.png`,
    alt: "Схема плечевого сплетения на надключичном уровне",
  },
  {
    src: `${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_anatomy_clean.png`,
    alt: "Поперечная анатомия надключичной области",
  },
  {
    src: `${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_distribution_clean.png`,
    alt: "Ожидаемая территория надключичной блокады",
  },
  {
    src: `${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_probe_ultrasound_clean.png`,
    alt: "Положение датчика и ультразвуковая анатомия надключичной области",
  },
];

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

const trunkOperations: Array<{
  id: TrunkOperationId;
  short: string;
  title: string;
  zone: string;
  innervation: string;
  visceral: string;
  gap: string;
  strategies: Array<{
    name: string;
    blocks: string;
    reach: string;
    safety: string;
    note: string;
  }>;
}> = [
  {
    id: "thoracotomy",
    short: "Торакотомия",
    title: "Открытая торакотомия",
    zone: "Заднебоковой или переднебоковой разрез, межрёберные мышцы, рёбра, плевра и зона дренажей.",
    innervation: "Сегментарные межрёберные нервы; уровень и протяжённость зависят от разреза и расположения дренажей.",
    visceral: "Плевральная и глубокая боль не эквивалентны боли грудной стенки; требуется мультимодальная стратегия.",
    gap: "Плечо, медиальный край разреза, дренажи и сегменты выше/ниже предполагаемого распространения.",
    strategies: [
      {
        name: "Первая линия",
        blocks: "Грудная эпидуральная или паравертебральный катетер",
        reach: "Сегментарное глубокое покрытие",
        safety: "ГЛУБОКАЯ ТЕХНИКА",
        note: "PROSPECT рассматривает обе стратегии как варианты первой линии; выбор зависит от пациента, гемодинамики и противопоказаний.",
      },
      {
        name: "Альтернатива",
        blocks: "ESP / rhomboid intercostal / межрёберные блоки",
        reach: "Задняя и латеральная грудная стенка",
        safety: "ПЛЕВРА · LAST",
        note: "Кандидаты, когда эпидуральная или паравертебральная техника не используются; дренажи проверяются отдельно.",
      },
    ],
  },
  {
    id: "vats",
    short: "VATS",
    title: "Видеоассистированная торакоскопия",
    zone: "Несколько портов по латеральной грудной стенке и отдельная зона плеврального дренажа.",
    innervation: "Межрёберные нервы соответствующих уровней; каждый порт создаёт собственную соматическую территорию.",
    visceral: "Раздражение плевры и внутригрудные манипуляции могут сохранять боль вне кожного покрытия.",
    gap: "Самый нижний порт, задний порт и зона дренажа после удаления торакоскопов.",
    strategies: [
      {
        name: "Сегментарная",
        blocks: "Паравертебральный блок или ESP, single-shot / катетер",
        reach: "Порты и заднебоковая стенка",
        safety: "ГЛУБИНА · ПЛЕВРА",
        note: "Уровень блока сопоставляется с уровнями портов; катетер рассматривается при ожидаемой продолжительной боли.",
      },
      {
        name: "Латеральная",
        blocks: "Serratus anterior plane / межрёберные блоки",
        reach: "Латеральная грудная стенка",
        safety: "LAST · СОСУДЫ",
        note: "Полезна при латеральных портах; медиальные и задние территории могут потребовать другого компонента.",
      },
    ],
  },
  {
    id: "sternotomy",
    short: "Стернотомия",
    title: "Срединная стернотомия",
    zone: "Кожа и мягкие ткани парастернально, грудина, медиальные отделы грудной стенки и места дренажей.",
    innervation: "Передние кожные ветви межрёберных нервов, преимущественно T2–T6.",
    visceral: "Стернальная аналгезия не заменяет контроль глубокой медиастинальной боли и общей мультимодальной схемы.",
    gap: "Верхний край разреза, субксифоидальные дренажи и латеральное распространение.",
    strategies: [
      {
        name: "Поверхностная парастернальная",
        blocks: "Pecto-intercostal fascial plane block",
        reach: "Передняя медиальная грудная стенка",
        safety: "СОСУДЫ · LAST",
        note: "Плоскость выбирается с визуализацией внутренних грудных сосудов; двусторонняя доза суммируется.",
      },
      {
        name: "Глубокая парастернальная",
        blocks: "Deep parasternal intercostal plane block",
        reach: "Парастернальные ветви T2–T6",
        safety: "ПЛЕВРА · ПЕРИКАРД",
        note: "Более глубокая цель рядом с плеврой и внутренней грудной артерией требует непрерывной визуализации кончика иглы.",
      },
    ],
  },
  {
    id: "breast",
    short: "Молочная железа",
    title: "Онкологическая операция на молочной железе",
    zone: "Передняя грудная стенка, ткань молочной железы, подмышечная зона и возможная донорская область.",
    innervation: "Межрёберные нервы, латеральные и передние кожные ветви; pectoral nerves и intercostobrachial territory при аксиллярном доступе.",
    visceral: "Основной компонент боли соматический, но реконструктивный этап может добавлять отдельную донорскую зону.",
    gap: "Медиальный край у грудины, надключичная зона, intercostobrachial territory и дренажи.",
    strategies: [
      {
        name: "Паравертебральная",
        blocks: "Thoracic paravertebral block",
        reach: "Одностороннее сегментарное покрытие",
        safety: "ГЛУБОКАЯ ТЕХНИКА",
        note: "PROSPECT рекомендует как регионарную стратегию первой линии для онкологической хирургии молочной железы.",
      },
      {
        name: "Переднебоковая",
        blocks: "PECS II ± pecto-intercostal fascial plane",
        reach: "Грудная стенка и аксиллярный компонент",
        safety: "СОСУДЫ · LAST",
        note: "PECS может быть альтернативой; медиальный край разреза и надключичная территория проверяются отдельно.",
      },
    ],
  },
  {
    id: "ribs",
    short: "Переломы рёбер",
    title: "Множественные переломы рёбер",
    zone: "Зона переломов может быть задней, латеральной или передней и охватывать несколько несмежных уровней.",
    innervation: "Сегментарные межрёберные нервы и коллатеральные ветви; карта боли должна совпасть с КТ и пальпацией.",
    visceral: "Ушиб лёгкого, гемоторакс и дыхательная недостаточность не устраняются блокадой грудной стенки.",
    gap: "Задние переломы при латеральной технике, передние переломы при ESP и уровни за пределами распространения.",
    strategies: [
      {
        name: "Задняя плоскость",
        blocks: "ESP / паравертебральный блок",
        reach: "Задняя и часть латеральной стенки",
        safety: "ПЛЕВРА · КАТЕТЕР",
        note: "Выбор уровня и катетера зависит от протяжённости травмы и возможности безопасного позиционирования.",
      },
      {
        name: "Латеральная плоскость",
        blocks: "Serratus anterior plane / межрёберные блоки",
        reach: "Латеральные рёбра",
        safety: "LAST · ГЕМАТОМА",
        note: "Положение переломов важнее их количества; передние и задние участки могут остаться вне покрытия.",
      },
    ],
  },
  {
    id: "device",
    short: "ЭКС / ICD",
    title: "Имплантация кардиального устройства",
    zone: "Подключичный карман, кожный разрез, фасция большой грудной мышцы и путь электродов.",
    innervation: "Надключичные нервы и передние кожные ветви верхних межрёберных нервов; вариабельный вклад pectoral nerves.",
    visceral: "Фасциальный блок не заменяет седационную стратегию и контроль боли при венозном доступе и манипуляции электродами.",
    gap: "Кожа над ключицей, медиальный край кармана и зона туннелирования.",
    strategies: [
      {
        name: "Локальная",
        blocks: "Инфильтрация хирургом ± селективные поверхностные ветви",
        reach: "Карман и кожный разрез",
        safety: "СОСУДЫ · АНТИКОАГУЛЯЦИЯ",
        note: "Базовая стратегия сопоставляется с конкретным положением кармана и режимом антитромботической терапии.",
      },
      {
        name: "Фасциальная",
        blocks: "PECS I / pecto-intercostal fascial plane",
        reach: "Грудная фасция и медиальный край",
        safety: "LAST · СОСУДЫ",
        note: "Кандидатное дополнение; надключичная кожная территория может потребовать отдельного контроля.",
      },
    ],
  },
  {
    id: "laparotomy",
    short: "Лапаротомия",
    title: "Срединная открытая лапаротомия",
    zone: "Вертикальный разрез по средней линии, влагалище прямой мышцы, брюшина и зона дренажей.",
    innervation: "Передние кожные ветви торакоабдоминальных нервов; уровни определяются верхним и нижним краем разреза.",
    visceral: "Блоки брюшной стенки не обеспечивают полноценную висцеральную аналгезию.",
    gap: "Верхний/нижний край длинного разреза, брюшина, дренажи и стома.",
    strategies: [
      {
        name: "Нейроаксиальная",
        blocks: "Грудная эпидуральная аналгезия",
        reach: "Соматический и висцеральный компоненты",
        safety: "НЕЙРОАКСИАЛЬНАЯ",
        note: "Кандидат для большой открытой хирургии при отсутствии противопоказаний и в рамках локального ERAS-протокола.",
      },
      {
        name: "Стенка живота",
        blocks: "Rectus sheath ± subcostal/lateral TAP",
        reach: "Передняя брюшная стенка",
        safety: "LAST · БРЮШИНА",
        note: "Выбор плоскости привязывается к разрезу; висцеральный компонент остаётся отдельной задачей.",
      },
    ],
  },
  {
    id: "cholecystectomy",
    short: "Лап. холецистэктомия",
    title: "Лапароскопическая холецистэктомия",
    zone: "Эпигастральный и подреберные порты, умбиликальный порт и зона извлечения препарата.",
    innervation: "Торакоабдоминальные нервы передней брюшной стенки; каждый порт оценивается отдельно.",
    visceral: "Пневмоперитонеум, диафрагмальное раздражение и отражённая боль в плече не покрываются обычным TAP.",
    gap: "Эпигастральный порт, умбиликальная экстракция и отражённая боль в плече.",
    strategies: [
      {
        name: "Процедурная первая линия",
        blocks: "Инфильтрация портов / intraperitoneal LA по протоколу",
        reach: "Порт-сайты",
        safety: "СУММАРНАЯ ДОЗА",
        note: "PROSPECT ставит локальные техники впереди фасциальных блоков при стандартном лапароскопическом течении.",
      },
      {
        name: "Вторая линия",
        blocks: "Subcostal TAP или ESP",
        reach: "Подреберная стенка",
        safety: "LAST · ПЛЕВРА",
        note: "Рассматривается в специальных ситуациях; не должно автоматически добавляться к оптимальной базовой аналгезии.",
      },
    ],
  },
  {
    id: "colorectal",
    short: "Колоректальная",
    title: "Открытая колоректальная операция",
    zone: "Срединная или поперечная лапаротомия, зона стомы, дренажи и промежностный этап при комбинированном доступе.",
    innervation: "Торакоабдоминальные нервы соответствующих уровней; промежностная зона имеет отдельную иннервацию.",
    visceral: "Манипуляции на кишечнике формируют выраженный висцеральный компонент.",
    gap: "Стома, дренажи, промежностная рана и зоны вне протяжённости выбранной плоскости.",
    strategies: [
      {
        name: "Первая линия для open",
        blocks: "Грудная эпидуральная аналгезия",
        reach: "Разрез и висцеральный компонент",
        safety: "НЕЙРОАКСИАЛЬНАЯ",
        note: "Актуальный PROSPECT сохраняет эпидуральную аналгезию для открытой колэктомии.",
      },
      {
        name: "Если эпидуральная невозможна",
        blocks: "Двусторонний TAP / preperitoneal wound infusion",
        reach: "Соматическая боль стенки",
        safety: "СУММАРНАЯ ДОЗА",
        note: "Не сочетать несколько путей местного анестетика без расчёта общей дозы; висцеральная боль требует отдельного плана.",
      },
    ],
  },
  {
    id: "caesarean",
    short: "Кесарево сечение",
    title: "Плановое кесарево сечение",
    zone: "Поперечный надлобковый разрез, мышечно-фасциальные слои и матка.",
    innervation: "TAP/ilioinguinal-iliohypogastric territory для брюшной стенки; висцеральная афферентация матки отдельна.",
    visceral: "Фасциальный блок не заменяет нейроаксиальную анестезию и интратекальный длительно действующий опиоид.",
    gap: "Висцеральная боль, медиальная часть разреза и двусторонняя симметрия покрытия.",
    strategies: [
      {
        name: "Стандарт",
        blocks: "Нейроаксиальная анестезия + длительно действующий нейроаксиальный опиоид",
        reach: "Хирургическая анестезия и послеоперационная аналгезия",
        safety: "НЕЙРОАКСИАЛЬНАЯ",
        note: "Обновлённый PROSPECT 2026 сохраняет эту стратегию основной для планового кесарева сечения.",
      },
      {
        name: "Если нейроаксиальный опиоид не использован",
        blocks: "TAP / QL / II-IH / transversalis fascia",
        reach: "Брюшная стенка",
        safety: "LAST · БРЮШИНА",
        note: "Фасциальные и нервные блокады рассматриваются как альтернативный компонент послеоперационной аналгезии.",
      },
    ],
  },
  {
    id: "hernia",
    short: "Паховая грыжа",
    title: "Открытая паховая герниопластика",
    zone: "Кожа паховой области, апоневроз наружной косой мышцы, паховый канал и зона сетки.",
    innervation: "Ilioinguinal, iliohypogastric и genital branch genitofemoral nerve с индивидуальной вариабельностью.",
    visceral: "Манипуляции с грыжевым мешком и брюшиной могут оставлять глубокий компонент боли.",
    gap: "Лобковый бугорок, мошоночная/лабиальная территория и вариабельная генитальная ветвь.",
    strategies: [
      {
        name: "Селективная",
        blocks: "Ilioinguinal–iliohypogastric block + инфильтрация",
        reach: "Паховый разрез",
        safety: "СОСУДЫ · БРЮШИНА",
        note: "УЗ-навигация помогает сопоставить нервы и хирургическую зону, но не устраняет анатомическую вариабельность.",
      },
      {
        name: "Проксимальная плоскость",
        blocks: "Transversalis fascia plane / posterior TAP",
        reach: "T12–L1 территория",
        safety: "LAST · РЕТРОПЕРИТОНЕУМ",
        note: "TFP ориентирован на более проксимальное покрытие II/IH; возможное распространение оценивается отдельно.",
      },
    ],
  },
  {
    id: "flank",
    short: "Боковой доступ",
    title: "Фланковый и ретроперитонеальный доступ",
    zone: "Подреберный или фланковый разрез через боковую брюшную стенку, иногда с пересечением нескольких мышечных слоёв.",
    innervation: "Нижние торакоабдоминальные нервы, subcostal nerve и верхние ветви поясничного сплетения.",
    visceral: "Почка, мочеточник и ретроперитонеальные структуры формируют глубокий висцеральный компонент.",
    gap: "Задний край разреза, подреберная дуга, паховая территория и дренаж.",
    strategies: [
      {
        name: "Боковая стенка",
        blocks: "Subcostal TAP / QL",
        reach: "Подреберная и фланковая стенка",
        safety: "ПОЧКА · БРЮШИНА",
        note: "Точка инъекции и вариант QL выбираются по траектории разреза, глубине и антитромботическому профилю.",
      },
      {
        name: "Параспинальная",
        blocks: "ESP / paravertebral block",
        reach: "Заднебоковые сегменты",
        safety: "ГЛУБОКАЯ ТЕХНИКА",
        note: "Кандидат при длинном заднебоковом разрезе; висцеральное покрытие не считается гарантированным.",
      },
    ],
  },
];

const trunkBlockZones: Array<{
  id: TrunkBlockId;
  code: string;
  title: string;
  standardName: string;
  projection: TrunkProjection;
  group: "CHEST" | "ABDOMEN" | "POSTERIOR";
  target: string;
  expected: string;
  caution: string;
  layers: string[];
  targetAfter: number;
}> = [
  {
    id: "pec1",
    code: "PEC I",
    title: "Interpectoral plane",
    standardName: "Interpectoral plane block · традиционно PECS I",
    projection: "front",
    group: "CHEST",
    target: "Плоскость между большой и малой грудными мышцами.",
    expected: "Медиальный и латеральный грудные нервы; мышечно-фасциальный компонент передней грудной стенки.",
    caution: "Pectoral branch thoracoacromial artery, суммарная доза LA.",
    layers: ["Кожа", "Pectoralis major", "TARGET", "Pectoralis minor", "Рёбра / плевра"],
    targetAfter: 2,
  },
  {
    id: "pec2",
    code: "PEC II",
    title: "Pectoserratus plane",
    standardName: "Pectoserratus plane block · компонент PECS II",
    projection: "front",
    group: "CHEST",
    target: "Плоскость между малой грудной и передней зубчатой мышцами.",
    expected: "Переднебоковая грудная стенка и аксиллярный компонент; PECS II обычно включает interpectoral injection.",
    caution: "Thoracoacromial/lateral thoracic vessels, плевра глубже serratus.",
    layers: ["Кожа", "Pectoralis major", "Pectoralis minor", "TARGET", "Serratus anterior", "Рёбра / плевра"],
    targetAfter: 3,
  },
  {
    id: "deep-serratus",
    code: "DEEP SAP",
    title: "Deep serratus anterior plane",
    standardName: "Deep serratus anterior plane block",
    projection: "side",
    group: "CHEST",
    target: "Плоскость глубже serratus anterior, поверхностнее рёбер и наружных межрёберных мышц.",
    expected: "Латеральные кожные ветви межрёберных нервов и латеральная грудная стенка.",
    caution: "Плевра, межрёберные сосуды, соответствие уровням разреза или переломов.",
    layers: ["Кожа", "Latissimus / subcutaneous", "Serratus anterior", "TARGET", "Рёбра / intercostal", "Плевра"],
    targetAfter: 3,
  },
  {
    id: "spip",
    code: "SPIP",
    title: "Superficial parasternal plane",
    standardName: "Superficial Parasternal Intercostal Plane block",
    projection: "front",
    group: "CHEST",
    target: "Плоскость поверхностнее наружных межрёберных мышц, глубже pectoralis major, парастернально.",
    expected: "Передние кожные ветви межрёберных нервов и медиальная передняя грудная стенка.",
    caution: "Двусторонняя суммарная доза; spread вариабелен, не распространяется автоматически в rectus sheath.",
    layers: ["Кожа", "Pectoralis major", "TARGET", "External intercostal", "Internal intercostal", "Плевра"],
    targetAfter: 2,
  },
  {
    id: "dpip",
    code: "DPIP",
    title: "Deep parasternal plane",
    standardName: "Deep Parasternal Intercostal Plane block",
    projection: "front",
    group: "CHEST",
    target: "Глубже internal intercostal muscle и поверхностнее transversus thoracis.",
    expected: "Парастернальное распространение вдоль нескольких межрёберных промежутков.",
    caution: "ADVANCED: внутренняя грудная артерия и плевра находятся в непосредственной близости.",
    layers: ["Кожа", "Pectoralis major", "Intercostal muscles", "TARGET", "Transversus thoracis", "Плевра / перикард"],
    targetAfter: 3,
  },
  {
    id: "tap-classic",
    code: "TAP CLASSIC",
    title: "Lateral transversus abdominis plane",
    standardName: "Lateral TAP block · классический TAP",
    projection: "front",
    group: "ABDOMEN",
    target: "Плоскость между internal oblique и transversus abdominis по средней подмышечной линии.",
    expected: "Переднебоковая брюшная стенка, преимущественно ниже пупка; фактическое распространение вариабельно.",
    caution: "Брюшина и кишечник глубже TA, глубокая огибающая подвздошная артерия каудально.",
    layers: ["Кожа", "External oblique", "Internal oblique", "TARGET", "Transversus abdominis", "Брюшина"],
    targetAfter: 3,
  },
  {
    id: "tap-subcostal",
    code: "TAP SUBCOSTAL",
    title: "Subcostal TAP",
    standardName: "Subcostal transversus abdominis plane block",
    projection: "front",
    group: "ABDOMEN",
    target: "Плоскость под rectus abdominis между transversus abdominis и задней поверхностью rectus, вдоль подреберья.",
    expected: "Верхняя передняя брюшная стенка и супраумбиликальные порт-сайты.",
    caution: "Перитонеальная полость и верхние эпигастральные сосуды; не покрывает отражённую плечевую боль.",
    layers: ["Кожа", "Rectus abdominis", "TARGET", "Transversus abdominis", "Transversalis fascia", "Брюшина"],
    targetAfter: 2,
  },
  {
    id: "rectus-sheath",
    code: "RECTUS",
    title: "Rectus sheath",
    standardName: "Rectus sheath block",
    projection: "front",
    group: "ABDOMEN",
    target: "Глубже rectus abdominis, поверхностнее posterior rectus sheath.",
    expected: "Терминальные передние ветви для срединной передней брюшной стенки.",
    caution: "Верхние/нижние эпигастральные сосуды; ниже arcuate line задняя стенка влагалища отсутствует.",
    layers: ["Кожа", "Anterior rectus sheath", "Rectus abdominis", "TARGET", "Posterior sheath", "Брюшина"],
    targetAfter: 3,
  },
  {
    id: "ql1",
    code: "QLB-1",
    title: "Lateral quadratus lumborum",
    standardName: "Lateral QL block · прежнее название QLB-1",
    projection: "back",
    group: "POSTERIOR",
    target: "Латеральный край QL у места перехода апоневроза transversus abdominis.",
    expected: "Латеральная и нижняя брюшная стенка; распространение рассматривается как вероятностное.",
    caution: "Почка, брюшина и суммарная доза при двусторонней технике.",
    layers: ["Кожа", "Abdominal wall / latissimus", "TA aponeurosis", "TARGET", "Quadratus lumborum", "Почка / брюшина"],
    targetAfter: 3,
  },
  {
    id: "ql2",
    code: "QLB-2",
    title: "Posterior quadratus lumborum",
    standardName: "Posterior QL block · прежнее название QLB-2",
    projection: "back",
    group: "POSTERIOR",
    target: "Позади QL, в области middle layer thoracolumbar fascia / lumbar interfascial triangle.",
    expected: "Заднебоковая брюшная стенка; краниокаудальное распространение вариабельно.",
    caution: "Глубина, некомпрессируемость, почка и антитромботическая терапия.",
    layers: ["Кожа", "Latissimus / erector spinae", "TARGET", "Quadratus lumborum", "Anterior TLF", "Psoas / kidney"],
    targetAfter: 2,
  },
  {
    id: "ql3",
    code: "QLB-3",
    title: "Anterior quadratus lumborum",
    standardName: "Anterior QL block · transmuscular · прежнее QLB-3",
    projection: "back",
    group: "POSTERIOR",
    target: "Между QL и psoas major, спереди от QL.",
    expected: "Глубокое распространение вдоль anterior thoracolumbar fascia; клиническое покрытие вариабельно.",
    caution: "ADVANCED: глубокая некомпрессируемая зона, почка, сосуды и lumbar plexus рядом.",
    layers: ["Кожа", "Erector spinae", "Quadratus lumborum", "TARGET", "Psoas major", "Lumbar plexus / kidney"],
    targetAfter: 3,
  },
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
        <div className="atlas-media" data-zone={zone.id} data-visual={zone.visual} aria-hidden="true">
          <div className={`atlas-visual atlas-visual--front ${zone.visual === "front" ? "is-active" : ""}`}>
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
          <div
            className={`atlas-visual atlas-visual--posterior ${zone.visual === "posterior" ? "is-active" : ""}`}
            style={{ backgroundImage: `url("${assetBasePath}/media/body-atlas/posterior-atlas.webp")` }}
          />
          <div
            className={`atlas-visual atlas-visual--shoulder-fracture ${zone.visual === "shoulder-fracture" ? "is-active" : ""}`}
            style={{ backgroundImage: `url("${assetBasePath}/media/body-atlas/shoulder-fracture.webp")` }}
          />
          <div
            className={`atlas-visual atlas-visual--hip-arthroplasty ${zone.visual === "hip-arthroplasty" ? "is-active" : ""}`}
            style={{ backgroundImage: `url("${assetBasePath}/media/body-atlas/hip-arthroplasty.webp")` }}
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
          <span className="atlas-visual-label">{zone.visualLabel}</span>
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
          <span>VIEW</span>
          <b>{zone.visual === "posterior" ? "POSTERIOR" : "CLINICAL FOCUS"}</b>
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

function BlockMediaGallery({
  blockLabel,
  videoSrc,
  posterSrc,
  images,
  note,
}: {
  blockLabel: string;
  videoSrc: string;
  posterSrc: string;
  images: BlockMediaImage[];
  note: string;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current === null ? null : (current + images.length - 1) % images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current === null ? null : (current + 1) % images.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [images.length, lightboxIndex]);

  return (
    <>
      <div className="pec1-media">
        <video
          className="pec1-media__video"
          controls
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-label={`${blockLabel}: учебная анимация`}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="pec1-media__stills" aria-label={`${blockLabel}: опорные изображения`}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image.src}
              onClick={() => setLightboxIndex(index)}
              aria-label={`Открыть изображение: ${image.alt}`}
            >
              <img src={image.src} alt={image.alt} />
            </button>
          ))}
        </div>
        <p className="pec1-media__note">{note}</p>
      </div>

      {lightboxIndex !== null && (
        <div
          className="pec1-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Полноэкранный просмотр: ${blockLabel}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightboxIndex(null);
          }}
        >
          <button
            type="button"
            className="pec1-lightbox__close"
            onClick={() => setLightboxIndex(null)}
            aria-label="Закрыть полноэкранный просмотр"
          >
            ×
          </button>
          <button
            type="button"
            className="pec1-lightbox__nav pec1-lightbox__nav--previous"
            onClick={() =>
              setLightboxIndex(
                (lightboxIndex + images.length - 1) % images.length,
              )
            }
            aria-label="Предыдущее изображение"
          >
            ‹
          </button>
          <figure>
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
            />
            <figcaption>
              {images[lightboxIndex].alt} · {lightboxIndex + 1}/{images.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="pec1-lightbox__nav pec1-lightbox__nav--next"
            onClick={() =>
              setLightboxIndex((lightboxIndex + 1) % images.length)
            }
            aria-label="Следующее изображение"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
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

      <section className="upper-block-atlas" aria-labelledby="interscalene-title">
        <header className="upper-block-atlas__heading">
          <div>
            <span>BLOCK ATLAS / 01</span>
            <h3 id="interscalene-title">INTERSCALENE</h3>
            <p>Межлестничная блокада плечевого сплетения</p>
          </div>
          <b>SHOULDER · PROXIMAL HUMERUS</b>
        </header>

        <div className="upper-block-atlas__grid">
          <BlockMediaGallery
            blockLabel="Межлестничная блокада"
            videoSrc={`${assetBasePath}/media/interscalene/INTERSCALENE_Higgsfield_transition.mp4`}
            posterSrc={`${assetBasePath}/media/interscalene/INTERSCALENE_probe_position_clean.png`}
            images={interscaleneImages}
            note="Нажмите на изображение, чтобы открыть его полностью. Анимация показывает связь положения датчика, УЗ-картины и поперечной анатомии; траектория иглы и распространение раствора не моделируются."
          />

          <div className="upper-block-atlas__details">
            <dl>
              <div>
                <dt>Основные показания</dt>
                <dd>Операции на плечевом суставе, дистальной ключице и проксимальном отделе плечевой кости.</dd>
              </div>
              <div>
                <dt>УЗ-ориентиры</dt>
                <dd>Корешки/стволы плечевого сплетения между передней и средней лестничными мышцами; линейный датчик, поперечное сканирование.</dd>
              </div>
              <div>
                <dt>Рабочая стратегия</dt>
                <dd>Постеролатеральный доступ in-plane с постоянной визуализацией кончика иглы и контролем распространения в межлестничном промежутке.</dd>
              </div>
              <div>
                <dt>Ограничение покрытия</dt>
                <dd>Не считать надёжным выбором для операций на предплечье и кисти: нижний ствол C8-T1 может блокироваться неполно.</dd>
              </div>
            </dl>

            <div className="upper-block-atlas__warning">
              <span>КРИТИЧЕСКАЯ ПРОВЕРКА</span>
              <p>
                Дыхательный резерв и функция диафрагмы, ход диафрагмального нерва,
                позвоночная и шейные артерии, внутренняя яремная вена, а также
                риск внутриневрального, внутрисосудистого или нейроаксиального распространения.
              </p>
            </div>

            <p className="upper-block-atlas__alternative">
              <b>При высоком респираторном риске:</b> рассмотреть более селективную
              стратегию для плеча; «диафрагма-сберегающий» вариант не означает нулевой риск.
            </p>
          </div>
        </div>

        <div className="upper-block-atlas__source">
          <span>КЛИНИЧЕСКАЯ ОСНОВА</span>
          <a
            href="https://doi.org/10.1007/978-3-031-08804-9_5"
            target="_blank"
            rel="noreferrer"
          >
            Eisenberg, Gaertner, Clavert · Brachial Plexus Blocks · 2023 ↗
          </a>
        </div>
      </section>

      <section className="upper-block-atlas" aria-labelledby="supraclavicular-title">
        <header className="upper-block-atlas__heading">
          <div>
            <span>BLOCK ATLAS / 02</span>
            <h3 id="supraclavicular-title">SUPRACLAVICULAR</h3>
            <p>Надключичная блокада плечевого сплетения</p>
          </div>
          <b>ARM · ELBOW · FOREARM</b>
        </header>

        <div className="upper-block-atlas__grid">
          <BlockMediaGallery
            blockLabel="Надключичная блокада"
            videoSrc={`${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_Higgsfield_transition.mp4`}
            posterSrc={`${assetBasePath}/media/supraclavicular/SUPRACLAVICULAR_probe_ultrasound_clean.png`}
            images={supraclavicularImages}
            note="Нажмите на изображение, чтобы открыть его полностью. Анимация связывает схему плечевого сплетения, поперечную анатомию, ожидаемую зону блокады и реальную УЗ-картину; траектория иглы и распространение раствора не моделируются."
          />

          <div className="upper-block-atlas__details">
            <dl>
              <div>
                <dt>Основные показания</dt>
                <dd>Операции на плече дистальнее проксимального отдела, локтевом суставе и предплечье; особенно удобна при травме, когда перемещение конечности нежелательно.</dd>
              </div>
              <div>
                <dt>УЗ-ориентиры</dt>
                <dd>Плечевое сплетение краниальнее и латеральнее подключичной артерии, первое ребро и плевра; линейный датчик располагают поперечно, параллельно и непосредственно над ключицей.</dd>
              </div>
              <div>
                <dt>Рабочая стратегия</dt>
                <dd>Латеральный доступ in-plane с непрерывной визуализацией кончика иглы. Первое ребро должно находиться глубже цели и служить костным барьером перед плеврой.</dd>
              </div>
              <div>
                <dt>Ограничение покрытия</dt>
                <dd>Компоненты C8-T1 могут быть анатомически изолированы и блокироваться неполно; для операций на кисти покрытие локтевой территории нельзя считать гарантированным.</dd>
              </div>
            </dl>

            <div className="upper-block-atlas__warning">
              <span>КРИТИЧЕСКАЯ ПРОВЕРКА</span>
              <p>
                Обязательно включите Doppler и найдите подключичные сосуды, поперечную
                артерию шеи, дорсальную артерию лопатки и другие сосудистые ветви.
                До продвижения иглы визуализируйте первое ребро, плевру и лёгкое;
                сохраняйте кончик иглы в кадре на всей траектории.
              </p>
            </div>

            <p className="upper-block-atlas__alternative">
              <b>Ключевые риски:</b> пневмоторакс, сосудистая пункция и LAST,
              внутриневральная инъекция, а также парез диафрагмы. УЗ-навигация
              снижает риск, но не устраняет его полностью.
            </p>
          </div>
        </div>

        <div className="upper-block-atlas__source">
          <span>КЛИНИЧЕСКАЯ ОСНОВА</span>
          <a
            href="https://doi.org/10.1007/978-3-031-08804-9_5"
            target="_blank"
            rel="noreferrer"
          >
            Eisenberg, Gaertner, Clavert · Supraclavicular Block · 2023 ↗
          </a>
        </div>
      </section>

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

function TrunkAnatomyMap() {
  const [activeId, setActiveId] = useState<TrunkBlockId>("pec1");
  const active =
    trunkBlockZones.find((item) => item.id === activeId) ?? trunkBlockZones[0];
  const projection = active.projection;

  const selectProjection = (next: TrunkProjection) => {
    const defaults: Record<TrunkProjection, TrunkBlockId> = {
      front: "pec1",
      side: "deep-serratus",
      back: "ql1",
    };
    setActiveId(defaults[next]);
  };

  const svgZoneProps = (id: TrunkBlockId) => ({
    className: `trunk-zone trunk-zone--${id} ${activeId === id ? "is-active" : ""}`,
    role: "button" as const,
    tabIndex: 0,
    "aria-label": trunkBlockZones.find((item) => item.id === id)?.standardName,
    onClick: () => setActiveId(id),
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") setActiveId(id);
    },
  });

  return (
    <section className="trunk-atlas" id="trunk-atlas" aria-labelledby="trunk-atlas-title">
      <header className="trunk-atlas-heading">
        <div>
          <span>06 / INTERACTIVE FASCIAL ATLAS</span>
          <h3 id="trunk-atlas-title">Карта плоскостей.</h3>
        </div>
        <p>
          Выберите блок на карте или в списке. Схема показывает положение
          целевой плоскости, а не траекторию иглы или гарантированное распространение.
        </p>
      </header>

      <div className="projection-switch" role="group" aria-label="Проекция модели">
        {([
          ["front", "Передняя"],
          ["side", "Боковая"],
          ["back", "Задняя"],
        ] as Array<[TrunkProjection, string]>).map(([id, label]) => (
          <button
            type="button"
            key={id}
            className={projection === id ? "is-active" : ""}
            onClick={() => selectProjection(id)}
            aria-pressed={projection === id}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="trunk-atlas-shell">
        <div className="trunk-atlas-stage">
          <div className="atlas-orientation" aria-hidden="true">
            <span>{projection === "front" ? "ANTERIOR" : projection === "side" ? "LATERAL" : "POSTERIOR"}</span>
            <i />
            <span>MODEL / TRUNK-01</span>
          </div>

          <svg viewBox="0 0 720 760" role="img" aria-label={`Анатомическая карта: ${active.standardName}`}>
            <defs>
              <linearGradient id="torsoFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#15272b" />
                <stop offset="1" stopColor="#091114" />
              </linearGradient>
              <filter id="zoneGlow">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {projection === "front" && (
              <g className="torso-drawing torso-drawing--front">
                <path className="body-silhouette" d="M296 66 C273 91 272 126 260 151 C224 169 184 185 160 225 C139 260 151 322 167 359 C177 383 181 420 175 466 L151 694 C198 724 253 738 360 738 C467 738 522 724 569 694 L545 466 C539 420 543 383 553 359 C569 322 581 260 560 225 C536 185 496 169 460 151 C448 126 447 91 424 66 C390 42 330 42 296 66 Z" />
                <path className="anatomy-line" d="M360 92 L360 676" />
                <path className="sternum" d="M346 158 L374 158 L382 348 L338 348 Z" />
                {[190, 225, 260, 295, 330].map((y) => (
                  <path key={y} className="rib-line" d={`M352 ${y} C300 ${y - 24} 244 ${y - 10} 205 ${y + 22} M368 ${y} C420 ${y - 24} 476 ${y - 10} 515 ${y + 22}`} />
                ))}
                <path className="muscle-line" d="M214 194 C282 147 334 170 348 234 C318 283 254 305 195 270" />
                <path className="muscle-line" d="M506 194 C438 147 386 170 372 234 C402 283 466 305 525 270" />
                <path className="muscle-line" d="M304 373 L282 666 M416 373 L438 666 M360 374 L360 676" />
                <path className="muscle-line" d="M280 470 L440 470 M267 550 L453 550 M258 628 L462 628" />

                <g {...svgZoneProps("pec1")}>
                  <path d="M382 190 C416 169 457 176 479 208 C464 244 428 265 389 257 C374 235 373 211 382 190 Z" />
                  <text x="425" y="220">PEC I</text>
                </g>
                <g {...svgZoneProps("pec2")}>
                  <path d="M452 236 C497 235 530 257 538 294 L517 358 C476 347 445 320 426 286 Z" />
                  <text x="486" y="291">PEC II</text>
                </g>
                <g {...svgZoneProps("spip")}>
                  <rect x="306" y="182" width="30" height="178" rx="15" />
                  <text x="292" y="277" transform="rotate(-90 292 277)">SPIP</text>
                </g>
                <g {...svgZoneProps("dpip")}>
                  <rect x="344" y="182" width="24" height="178" rx="12" />
                  <text x="362" y="277" transform="rotate(-90 362 277)">DPIP</text>
                </g>
                <g {...svgZoneProps("tap-subcostal")}>
                  <path d="M238 377 C293 350 427 350 482 377 L461 426 C407 404 313 404 259 426 Z" />
                  <text x="360" y="393">SUBCOSTAL TAP</text>
                </g>
                <g {...svgZoneProps("rectus-sheath")}>
                  <path d="M299 417 L351 399 L351 666 L286 646 Z M369 399 L421 417 L434 646 L369 666 Z" />
                  <text x="360" y="528">RECTUS</text>
                </g>
                <g {...svgZoneProps("tap-classic")}>
                  <path d="M190 428 C221 405 258 410 284 438 L272 627 C237 648 201 636 178 610 Z M530 428 C499 405 462 410 436 438 L448 627 C483 648 519 636 542 610 Z" />
                  <text x="228" y="535">TAP</text>
                  <text x="492" y="535">TAP</text>
                </g>
              </g>
            )}

            {projection === "side" && (
              <g className="torso-drawing torso-drawing--side">
                <path className="body-silhouette" d="M328 55 C288 87 286 133 301 166 C246 190 213 239 217 310 C220 365 247 403 238 475 L214 693 C266 727 351 742 430 724 C478 713 506 689 515 653 L493 466 C486 408 516 350 509 286 C503 222 465 184 425 165 C433 121 413 72 377 53 C359 44 344 45 328 55 Z" />
                {[205, 243, 281, 319, 357].map((y) => (
                  <path key={y} className="rib-line" d={`M294 ${y} C365 ${y - 28} 444 ${y - 8} 476 ${y + 32}`} />
                ))}
                <path className="muscle-line" d="M265 213 C310 189 361 196 392 231 C369 257 340 283 300 315" />
                <path className="muscle-line" d="M272 300 L457 386 M260 332 L444 416 M254 365 L426 447" />
                <g {...svgZoneProps("deep-serratus")}>
                  <path d="M260 281 C309 262 387 282 451 342 L425 435 C361 393 303 365 248 352 Z" />
                  <text x="357" y="351">DEEP SERRATUS</text>
                </g>
              </g>
            )}

            {projection === "back" && (
              <g className="torso-drawing torso-drawing--back">
                <path className="body-silhouette" d="M296 66 C273 91 272 126 260 151 C224 169 184 185 160 225 C139 260 151 322 167 359 C177 383 181 420 175 466 L151 694 C198 724 253 738 360 738 C467 738 522 724 569 694 L545 466 C539 420 543 383 553 359 C569 322 581 260 560 225 C536 185 496 169 460 151 C448 126 447 91 424 66 C390 42 330 42 296 66 Z" />
                <path className="spine-line" d="M360 105 L360 675" />
                {[178, 213, 248, 283, 318, 353].map((y) => (
                  <path key={y} className="rib-line" d={`M351 ${y} C300 ${y - 22} 246 ${y - 8} 207 ${y + 24} M369 ${y} C420 ${y - 22} 474 ${y - 8} 513 ${y + 24}`} />
                ))}
                <path className="ql-muscle" d="M281 426 C305 396 338 404 348 435 L337 627 C315 659 283 646 269 612 Z M439 426 C415 396 382 404 372 435 L383 627 C405 659 437 646 451 612 Z" />
                <path className="pelvis-line" d="M224 626 C279 599 321 616 360 649 C399 616 441 599 496 626" />
                <g {...svgZoneProps("ql1")}>
                  <path d="M252 438 C270 420 288 417 302 430 L289 606 C271 617 251 606 241 585 Z M468 438 C450 420 432 417 418 430 L431 606 C449 617 469 606 479 585 Z" />
                  <text x="263" y="520">QL1</text>
                  <text x="457" y="520">QL1</text>
                </g>
                <g {...svgZoneProps("ql2")}>
                  <path d="M291 415 C317 397 338 410 346 442 L336 620 C320 643 299 638 286 612 Z M429 415 C403 397 382 410 374 442 L384 620 C400 643 421 638 434 612 Z" />
                  <text x="314" y="554">QL2</text>
                  <text x="406" y="554">QL2</text>
                </g>
                <g {...svgZoneProps("ql3")}>
                  <path d="M319 433 C334 420 347 433 350 461 L343 600 C334 620 322 613 316 590 Z M401 433 C386 420 373 433 370 461 L377 600 C386 620 398 613 404 590 Z" />
                  <text x="336" y="490">QL3</text>
                  <text x="384" y="490">QL3</text>
                </g>
              </g>
            )}
          </svg>

          <div className="active-zone-tag">
            <span>{active.code}</span>
            <b>{active.title}</b>
          </div>
        </div>

        <aside className="trunk-atlas-detail" aria-live="polite">
          <span className="micro-label">{active.group} / ACTIVE PLANE</span>
          <h4>{active.standardName}</h4>
          {active.id === "pec1" && (
            <BlockMediaGallery
              blockLabel="PEC I"
              videoSrc={`${assetBasePath}/media/pec1/PEC1_Higgsfield_transition.mp4`}
              posterSrc={`${assetBasePath}/media/pec1/PEC1_probe_position_clean.png`}
              images={pec1Images}
              note="Нажмите на изображение, чтобы открыть его полностью. Траектория иглы и распространение раствора не моделируются."
            />
          )}
          <dl>
            <div><dt>Целевая плоскость</dt><dd>{active.target}</dd></div>
            <div><dt>Ожидаемая территория</dt><dd>{active.expected}</dd></div>
            <div className="detail-caution"><dt>Критические структуры</dt><dd>{active.caution}</dd></div>
          </dl>
          <div className="layer-stack" aria-label="Слои от поверхностного к глубокому">
            <span>ПОВЕРХНОСТНО</span>
            {active.layers.map((layer, index) => (
              <i
                key={`${active.id}-${layer}-${index}`}
                className={index === active.targetAfter ? "is-target" : ""}
              >
                {layer === "TARGET" ? "ИНЪЕКЦИОННАЯ ПЛОСКОСТЬ" : layer}
              </i>
            ))}
            <span>ГЛУБОКО</span>
          </div>
        </aside>
      </div>

      <nav className="trunk-block-index" aria-label="Выбор фасциальной плоскости">
        {trunkBlockZones.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={active.id === item.id ? "is-active" : ""}
            onClick={() => setActiveId(item.id)}
            aria-pressed={active.id === item.id}
          >
            <i>{String(index + 1).padStart(2, "0")}</i>
            <span>{item.code}</span>
            <b>{item.title}</b>
          </button>
        ))}
      </nav>
    </section>
  );
}

function TrunkWallModule() {
  const [operationId, setOperationId] = useState<TrunkOperationId>("thoracotomy");
  const [strategyIndex, setStrategyIndex] = useState(0);
  const operation =
    trunkOperations.find((item) => item.id === operationId) ?? trunkOperations[0];
  const strategy = operation.strategies[strategyIndex] ?? operation.strategies[0];

  const chooseOperation = (id: TrunkOperationId) => {
    setOperationId(id);
    setStrategyIndex(0);
  };

  return (
    <section className="upper-module trunk-module" id="trunk-wall">
      <div className="upper-heading">
        <p className="section-kicker"><span>05</span> TRUNK WALL / ALPHA</p>
        <h2>Грудная и<br />брюшная стенка.</h2>
        <div className="upper-intro">
          <p>
            Навигатор связывает форму разреза, уровни иннервации и фасциальную
            плоскость — и отдельно показывает висцеральный компонент боли.
          </p>
          <span>12 СЦЕНАРИЕВ · ASRA/ESRA NOMENCLATURE · PROSPECT</span>
        </div>
      </div>

      <div className="clinical-shell">
        <nav className="operation-rail" aria-label="Операции на грудной и брюшной стенке">
          <span className="rail-title">01 / ОПЕРАЦИЯ</span>
          {trunkOperations.map((item, index) => (
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
            <span className="prototype-chip">SOMATIC ≠ VISCERAL</span>
          </div>

          <div className="clinical-map-grid clinical-map-grid--trunk">
            <article>
              <span>ХИРУРГИЧЕСКАЯ ЗОНА</span>
              <p>{operation.zone}</p>
            </article>
            <article>
              <span>ИННЕРВАЦИЯ СТЕНКИ</span>
              <p>{operation.innervation}</p>
            </article>
            <article className="visceral-card">
              <span>ВИСЦЕРАЛЬНЫЙ КОМПОНЕНТ</span>
              <p>{operation.visceral}</p>
            </article>
            <article className="gap-card">
              <span>ОБЯЗАТЕЛЬНО ПРОВЕРИТЬ</span>
              <p>{operation.gap}</p>
            </article>
          </div>

          <div className="strategy-header">
            <span className="micro-label">02 / СРАВНЕНИЕ СТРАТЕГИЙ</span>
            <p>Фасциальная плоскость выбирается по разрезу, а не только по названию операции.</p>
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
                  <span className="risk-chip risk-chip--warning">{item.safety}</span>
                </span>
                <strong>{item.name}</strong>
                <b>{item.blocks}</b>
                <span className="motor-line">ОЖИДАЕМАЯ ЗОНА / {item.reach}</span>
                <p>{item.note}</p>
              </button>
            ))}
          </div>

          <div className="selection-summary" aria-live="polite">
            <span>ТЕКУЩИЙ ФОКУС</span>
            <b>{strategy.blocks}</b>
            <div>
              <span>{strategy.reach}</span>
              <span className="risk-chip risk-chip--warning">{strategy.safety}</span>
            </div>
          </div>
        </div>
      </div>

      <TrunkAnatomyMap />

      <div className="trunk-principles">
        <article>
          <span>03 / SOMATIC MAP</span>
          <h3>Разрез сначала.</h3>
          <p>
            Верхний и нижний край, латеральность, дренажи, стома и донорская зона
            формируют карту покрытия до выбора названия блока.
          </p>
        </article>
        <article>
          <span>04 / VISCERAL CHECK</span>
          <h3>Стенка — не вся операция.</h3>
          <p>
            TAP, rectus sheath, PECS и serratus plane в первую очередь адресуют
            соматическую боль стенки. Висцеральный компонент отображается отдельно.
          </p>
        </article>
        <article>
          <span>05 / SAFETY</span>
          <h3>Суммарная доза.</h3>
          <p>
            Двусторонние и многоплоскостные техники, инфильтрация хирургом и другие
            пути местного анестетика должны суммироваться в калькуляторе LAST.
          </p>
        </article>
      </div>

      <div className="module-sources">
        <span>ОПОРНЫЕ ИСТОЧНИКИ</span>
        <a href="https://asra.com/news-publications/asra-updates/blog-landing/guidelines/2021/02/01/standardizing-nomenclature-in-regional-anesthesia"
          target="_blank" rel="noreferrer">ASRA–ESRA nomenclature consensus ↗</a>
        <a href="https://esraeurope.org/prospect/"
          target="_blank" rel="noreferrer">PROSPECT procedure-specific recommendations ↗</a>
        <a href="https://www.bjanaesthesia.org.uk/article/S0007-0912(23)00448-8/fulltext"
          target="_blank" rel="noreferrer">BJA: SPIP versus DPIP anatomy ↗</a>
      </div>

      <div className="module-disclaimer">
        <b>ALPHA / EDUCATIONAL DECISION SUPPORT</b>
        <p>
          Это карта для клинического обсуждения, а не автоматическое назначение.
          Дерматомы, распространение раствора, риски и рекомендации требуют
          экспертной верификации и сопоставления с локальным протоколом.
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
      <TrunkWallModule />

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
        <span>VERSION 0.6 / 2026</span>
      </footer>
    </main>
  );
}
