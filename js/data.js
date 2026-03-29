export const skillData = {
    "Análisis de Datos": {
        description: "Especialista en saneamiento de ecosistemas de datos y optimización de conversión mediante tracking forense.",
        impact: [
            { label: "Revenue ID", value: "$2.57M" },
            { label: "Data Quality", value: "99.9%" }
        ],
        bullets: [
            "Auditoría profunda de Google Tag Manager para Centro de Salud (USA), eliminando disparos duplicados.",
            "Reconstrucción completa de funnels de conversión en GA4 para visibilidad real del ROAS.",
            "Identificación de anomalías en pipelines de datos que causaban sub-reporte de ingresos.",
            "Documentación técnica de arquitectura de tracking para escalabilidad multiciudad."
        ],
        images: [
            { url: "assets/portfolio/ga4-dashboard-metrics.png", caption: "GA4: Monitoreo de eventos de conversión saneados (Formularios y CTM)." }
        ]
    },
    "Arquitectura & Gestión SQL": {
        description: "Diseño de infraestructuras de datos relacionales optimizadas para el análisis masivo de transacciones.",
        impact: [
            { label: "Transacciones", value: "952K+" },
            { label: "Query Speed", value: "300%" }
        ],
        bullets: [
            "Modelado de esquemas estrella (Hechos/Dimensiones) para facilitar reportes de BI complejos.",
            "Optimización de consultas SQL en AWS Aurora para procesamiento de historiales de 5 años.",
            "Saneamiento de lógica en consultas de extracción de ingresos financieros.",
            "Administración de bases de datos para plataformas con más de 25 clientes activos."
        ]
    },
    "Estrategia de Tracking & Automatización": {
        description: "Orquestación de sistemas que conectan marketing, ventas y operaciones en tiempo real.",
        impact: [
            { label: "Ciclo Reporte", value: "30→1 Día" },
            { label: "Alertas KPI", value: "Real-time" }
        ],
        bullets: [
            "Integración de CallTrackingMetrics (CTM) con Slack y GA4 mediante webhooks de n8n.",
            "Automatización de alertas de Google Ads (vía OAuth2) para detección de anomalías en el presupuesto.",
            "Desarrollo de SOPs técnicos para el despliegue masivo de contenedores de GTM.",
            "Sincronización de CRM -> Hojas de Cálculo -> Dashboards sin intervención manual."
        ],
        images: [
            { url: "assets/portfolio/n8n-alert-flow.png", caption: "n8n Workflow: Automatización de alertas inteligentes de KPIs para Google Ads." },
            { url: "assets/portfolio/n8n-ctm-integration.png", caption: "n8n Workflow: Integración LIVE del Call Tracking con el ecosistema de Slack." }
        ]
    },
    "Infraestructura & Soporte Técnico": {
        description: "Garantía de alta disponibilidad y seguridad en entornos de automatización cloud.",
        bullets: [
            "Administración de servidores n8n auto-alojados con gestión de backups automáticos.",
            "Implementación de protocolos de seguridad para el manejo de llaves API y OAuth2.",
            "Resolución de conflictos de infraestructura en integraciones API REST complejas.",
            "Monitoreo proactivo de estabilidad en servicios de tracking en la nube."
        ]
    },
    "Visualización & Business Intelligence": {
        description: "Fusión de inteligencia artificial y visualización de datos para la optimización de costos.",
        impact: [
            { label: "Ahorro Software", value: "$500/mes" },
            { label: "Leads Procesa", value: "24/7" }
        ],
        bullets: [
            "Desarrollo de Widget de Chat con IA (Custom JS/n8n) para calificación de leads sin intervención humana.",
            "Reemplazo de herramientas costosas (TalkFurther) por soluciones propietarias integradas vía GTM.",
            "Creación de Storytelling interactivo con datos enfocado en métricas de retención de clientes.",
            "Dashboards corporativos en Looker Studio con visualización de ROAS por canal."
        ],
        images: [
            { url: "assets/portfolio/chat-widget-1.png", caption: "Asistente Virtual IA: Interfaz de usuario implementada directamente en el sitio del cliente." },
            { url: "assets/portfolio/chat-widget-2.png", caption: "Calificación de Leads: Flujo de conversación que captura datos valiosos antes de llegar al CRM." },
            { url: "assets/portfolio/chat-widget-3.png", caption: "Backend Logic: Integración del chat con n8n para inyección inmediata de prospectos." }
        ]
    }
};
