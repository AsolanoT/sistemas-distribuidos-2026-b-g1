# Estructura de un repositorio de documentación (plantilla genérica)

Patrón reusable para un **repositorio único de documentación** (SSOT documental) de un proyecto de software. La documentación se organiza en **carpetas numeradas** `00`–`15` que definen un **orden de lectura** — de lo estratégico (gobierno, contexto, dominio) a lo operativo (operaciones, formación, control) — más una carpeta `99-archive` para el histórico.

Cada carpeta incluye su propio `README.md` y, cuando aplica, **plantillas** `_template-*.md` para crear documentos nuevos con formato consistente.

---

## Árbol de carpetas

```
docs/
├── README.md                     # Punto de entrada: qué es el repo y cómo navegarlo
├── CONTRIBUTING.md               # Cómo contribuir a la documentación
├── CHANGELOG.md                  # Historial de cambios documentales (versionado)
├── LICENSE
├── <render-config>              # Config para renderizar contratos de API (p.ej. OpenAPI/Redoc)
│
├── 00-governance/                # Reglas del juego: convenciones, DoR/DoD, seguridad
├── 01-context/                   # Contexto, alcance y glosario del sistema
├── 02-domain/                    # Modelo de dominio: entidades, reglas, eventos
├── 03-product/                   # Visión de producto, backlog y roadmap
├── 04-requirements/              # Requisitos funcionales, no funcionales y trazabilidad
├── 05-architecture/              # Arquitectura del sistema + decisiones (ADRs)
│   └── decisions/
│       └── records/              # ADRs numerados (ADR-001, ADR-002, …)
├── 06-data/                      # Modelado de datos, diccionario y estrategia de migración
├── 07-api/                       # Guías de API y contratos
│   └── contracts/
│       └── openapi/              # Especificaciones de contrato (fuente de las APIs)
├── 08-uml/                       # Diagramas UML del sistema
│   └── diagrams/
│       ├── source/               # Fuentes editables de los diagramas
│       └── exports/              # Diagramas exportados (imágenes) para incrustar
├── 09-microservices/             # Documentación por servicio (catálogo + fronteras)
│   ├── _template/                # Plantillas base para documentar un servicio/componente
│   │   ├── service/
│   │   └── component/
│   └── services/                 # Un folder por servicio, con sus componentes
│       ├── service-01/
│       │   └── components/
│       │       └── <api>/
│       ├── service-02/
│       │   └── components/
│       │       ├── <api>/
│       │       ├── <worker>/
│       │       └── <workflow>/
│       └── service-NN/
│           └── components/…
├── 10-devops/                    # CI/CD, ambientes y setup local
├── 11-quality/                   # Estrategia de pruebas y revisión de código
├── 12-ux-ui/                     # Diseño UX/UI (design system, wireframes, mockups)
│   └── mockups/
│       ├── flows/                # Flujos de navegación/interacción
│       └── app/                  # Mockups por dominio + shell + screenshots
│           ├── <dominio-1>/
│           ├── <dominio-2>/
│           ├── shell/            # Cascarón común (layout, navegación)
│           ├── assets/           # Recursos del mockup
│           └── screenshots/
│               ├── desktop/
│               └── mobile/
├── 13-operations/                # Operación: observabilidad, backup, incidentes, runbooks
├── 14-training/                  # Manuales y onboarding (usuario, admin, técnico)
├── 15-project-control/           # Control del proyecto: riesgos, dependencias, deuda técnica
├── 99-archive/                   # Documentos deprecados / decisiones viejas (histórico)
│   ├── deprecated/
│   └── old-decisions/
│
└── assets/                       # Recursos globales del repo
    ├── diagrams/
    ├── images/
    └── logos/
```

---

## Propósito de cada carpeta

| Carpeta | Propósito |
|---|---|
| **00-governance** | Reglas del proyecto: convenciones (ágiles y de control de versiones), *Definition of Ready* / *Definition of Done*, reglas de documentación y política de seguridad. |
| **01-context** | Encuadre del sistema: visión general, alcance y glosario (lenguaje común del dominio). |
| **02-domain** | Modelo de dominio: entidades y reglas de negocio, mapa del dominio y eventos de dominio. |
| **03-product** | Visión de producto: framing del problema, discovery, backlog de producto y roadmap. |
| **04-requirements** | Requisitos: funcionales, no funcionales, historias de usuario (HU) y matriz de trazabilidad (requisito ↔ HU ↔ prueba). |
| **05-architecture** | Arquitectura: visión general, despliegue, aspectos transversales, guía de patrones y modelo de amenazas. Subcarpeta **decisions/records** = **ADRs** (registros de decisiones arquitectónicas numeradas). |
| **06-data** | Datos: modelos, diccionario de datos, convenciones de modelado, evaluación de normalización y estrategia de migración. |
| **07-api** | API: lineamientos y autenticación, más **contracts/openapi** (los contratos, fuente para render de la documentación de API). |
| **08-uml** | Diagramas UML: índice + **diagrams/source** (fuentes editables) y **diagrams/exports** (imágenes para incrustar). |
| **09-microservices** | Documentación por servicio: catálogo, mapa de dependencias, matriz de propiedad de datos, catálogo de eventos, patrones de comunicación y reglas de frontera. **_template/** = plantillas; **services/** = un folder por servicio, cada uno con sus **components** (api / worker / workflow). |
| **10-devops** | DevOps: CI/CD, ambientes y setup local, con plantillas de deployment / release / rollback. |
| **11-quality** | Calidad: estrategia de pruebas, revisión de código y plantillas de reporte QA / evidencia de pruebas. |
| **12-ux-ui** | Diseño: design system, wireframes, mapa de navegación y **mockups** navegables por dominio (+ shell, assets, screenshots desktop/mobile). |
| **13-operations** | Operación: observabilidad, backup y recuperación, gestión de incidentes y plantillas de runbook / postmortem / SLA-SLO-SLI. |
| **14-training** | Formación: manuales de usuario y administrador, y onboarding técnico. |
| **15-project-control** | Control del proyecto: riesgos, dependencias, preguntas abiertas, deuda técnica y plantillas de sprint / registro de riesgos. |
| **99-archive** | Histórico: documentos **deprecated** y **old-decisions** que ya no aplican pero se conservan para trazabilidad. |
| **assets** | Recursos globales del repo: diagramas, imágenes y logos. |

---

## Convenciones transversales

- **Prefijo numérico** (`00`–`15`): define el **orden de lectura**, de lo estratégico a lo operativo.
- **`README.md` por carpeta**: explica qué vive ahí y cómo se usa.
- **`_template-*.md`**: plantillas para crear documentos nuevos con formato uniforme (moldes, no documentos "reales").
- **Servicios numerados** (`service-01`, `service-02`, …): cada uno declara sus **componentes** reales (APIs, workers, workflows), reflejando la topología del sistema.
- **`99-archive`**: nada se borra; lo obsoleto se archiva para preservar la trazabilidad histórica.
