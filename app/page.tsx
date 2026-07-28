"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StoryStep = 0 | 1 | 2 | 3;
type Strategy = "balanced" | "motor" | "extended";

const story = [
  {
    eyebrow: "01 / ОПЕРАЦИЯ",
    title: "Определяем хирургическую зону",
    text: "Тотальное эндопротезирование коленного сустава: передняя капсула, медиальный доступ и задняя капсула формируют разные источники боли.",
  },
  {
    eyebrow: "02 / ИННЕРВАЦИЯ",
    title: "Раскладываем боль по нервным территориям",
    text: "Передняя и медиальная зоны связаны с ветвями бедренного нерва. Задняя капсула требует отдельного внимания к терминальным суставным ветвям.",
  },
  {
    eyebrow: "03 / ПОКРЫТИЕ",
    title: "Находим слепые зоны",
    text: "Adductor Canal Block хорошо закрывает медиальную сенсорную территорию, но не должен автоматически считаться полным покрытием задней капсулы.",
  },
  {
    eyebrow: "04 / СТРАТЕГИЯ",
    title: "Собираем мультимодальный план",
    text: "Предварительная стратегия: ACB + хирургическая LIA. iPACK рассматривается как дополнение, когда важно усилить покрытие задней капсулы.",
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

export default function Home() {
  const [activeStep, setActiveStep] = useState<StoryStep>(0);
  const [strategy, setStrategy] = useState<Strategy>("balanced");
  const [query, setQuery] = useState("Тотальное эндопротезирование коленного сустава");
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);
  const selected = useMemo(() => strategies[strategy], [strategy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveStep(Number(visible.target.getAttribute("data-index")) as StoryStep);
      },
      { rootMargin: "-30% 0px -48% 0px", threshold: [0.15, 0.45, 0.75] },
    );
    panelsRef.current.forEach((panel) => panel && observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  const scrollToStory = () => document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="POCUS MOSCOW — в начало">
          <span className="brand-mark">P</span>
          <span>POCUS MOSCOW<small>BLOCK PLANNER</small></span>
        </a>
        <div className="header-meta">
          <span className="live-chip"><i /> PROTOTYPE 01</span>
          <a href="#planner">Открыть планировщик <span>↘</span></a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="orb orb--one" />
        <div className="hero-copy">
          <p className="section-kicker"><span>01</span> КЛИНИЧЕСКАЯ НАВИГАЦИЯ</p>
          <h1>Назовите<br />операцию.</h1>
          <p className="hero-lead">
            Система сопоставит хирургическую зону, иннервацию и варианты регионарной анестезии.
          </p>
          <label className="operation-search">
            <span>Операция</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Введите название операции"
            />
            <button type="button" onClick={scrollToStory} aria-label="Показать стратегию">→</button>
          </label>
          <div className="query-hints">
            <span>Также распознаёт:</span>
            <button type="button" onClick={() => setQuery("ТЭКС")}>ТЭКС</button>
            <button type="button" onClick={() => setQuery("TKA")}>TKA</button>
            <button type="button" onClick={() => setQuery("Замена коленного сустава")}>замена колена</button>
          </div>
        </div>
        <div className="hero-visual">
          <KneeMap step={3} />
          <div className="hero-data hero-data--top"><span>CASE</span><b>TKA / 001</b></div>
          <div className="hero-data hero-data--bottom"><span>REGION</span><b>LOWER LIMB</b></div>
        </div>
        <button className="scroll-cue" type="button" onClick={scrollToStory}>
          <span>Смотреть разбор</span><i />
        </button>
      </section>

      <section className="story" id="story">
        <div className="story-visual">
          <div className="story-index">
            {story.map((item, index) => (
              <button
                type="button"
                key={item.eyebrow}
                className={activeStep === index ? "is-active" : ""}
                onClick={() => panelsRef.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
                aria-label={`Перейти к шагу ${index + 1}`}
              >
                0{index + 1}
              </button>
            ))}
          </div>
          <KneeMap step={activeStep} />
          <div className="active-caption">
            <span>ACTIVE LAYER</span>
            <b>{["SURGICAL FIELD", "NEURAL MAP", "COVERAGE GAP", "BLOCK STRATEGY"][activeStep]}</b>
          </div>
        </div>
        <div className="story-copy">
          {story.map((item, index) => (
            <div
              className={`story-panel ${activeStep === index ? "is-active" : ""}`}
              key={item.eyebrow}
              data-index={index}
              ref={(node) => { panelsRef.current[index] = node; }}
            >
              <p>{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <span>{item.text}</span>
              <div className="story-fact">
                <i />
                <div>
                  <small>{["Хирургическая цель", "Ключевая логика", "Контрольный вопрос", "Результат"][index]}</small>
                  <b>{[
                    "Передняя + задняя капсула",
                    "Покрыть источник, а не название операции",
                    "Какая территория останется без покрытия?",
                    "План, который можно обсудить с командой",
                  ][index]}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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
        <span>VERSION 0.1 / 2026</span>
      </footer>
    </main>
  );
}
