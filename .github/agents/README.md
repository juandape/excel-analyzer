---
mode: agent
description: Índice maestro del equipo de agentes de Excel Analyzer. Referencia rápida de roles, responsabilidades y cuándo invocar a cada agente.
---

# Equipo de Agentes — Excel Analyzer

## Estructura del Equipo

```
                        ┌──────────────┐
                        │  MEDIADOR    │
                        │  (00)        │
                        │ Coordinación │
                        │ y Decisiones │
                        └──────┬───────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
   ┌──────▼──────┐    ┌────────▼───────┐   ┌───────▼──────┐
   │  ARCHITECT  │    │   BACKEND      │   │  FRONTEND    │
   │  (01)       │    │   ENGINEER     │   │  ENGINEER    │
   │  Contratos  │    │   (02)         │   │  (03)        │
   │  y ADRs     │    │   Python/API   │   │  Electron/   │
   └─────────────┘    └────────────────┘   │  React       │
                                           └──────────────┘
          │                    │                    │
   ┌──────▼──────┐    ┌────────▼───────┐   ┌───────▼──────┐
   │  UI/UX      │    │   QA           │   │  SECURITY    │
   │  DESIGNER   │    │   ENGINEER     │   │  AUDITOR     │
   │  (04)       │    │   (05)         │   │  (06)        │
   │  Diseño y   │    │   Tests y      │   │  Seguridad   │
   │  Experiencia│    │   Calidad      │   │  y Privacidad│
   └─────────────┘    └────────────────┘   └──────────────┘
          │                    │                    │
   ┌──────▼──────┐    ┌────────▼───────┐   ┌───────▼──────┐
   │  DEVOPS     │    │   AI/PROMPT    │   │  DOCUMENT    │
   │  ENGINEER   │    │   ENGINEER     │   │  SPECIALIST  │
   │  (07)       │    │   (08)         │   │  (09)        │
   │  Build y    │    │   IA y Prompts │   │  Formatos    │
   │  CI/CD      │    │               │   │  Complejos   │
   └─────────────┘    └────────────────┘   └──────────────┘
```

---

## Referencia Rápida: ¿Cuándo invocar a cada agente?

| Necesitas...                                     | Llama a...                                |
| ------------------------------------------------ | ----------------------------------------- |
| Decidir cómo resolver un conflicto entre agentes | **Mediador**                              |
| Priorizar tareas del sprint                      | **Mediador**                              |
| Definir un contrato de interfaz nuevo            | **Architect**                             |
| Aprobar una dependencia nueva                    | **Architect**                             |
| Revisar si un cambio rompe la arquitectura       | **Architect**                             |
| Implementar un procesador de archivo             | **Backend Engineer**                      |
| Integrar un nuevo proveedor de IA                | **Backend Engineer** + **AI Engineer**    |
| Generar un reporte Word o PPTX                   | **Backend Engineer**                      |
| Implementar una pantalla de la UI                | **Frontend Engineer**                     |
| Gestionar la comunicación IPC Electron           | **Frontend Engineer**                     |
| Diseñar el flujo de una pantalla nueva           | **UI/UX Designer**                        |
| Definir el copy de mensajes de error             | **UI/UX Designer**                        |
| Escribir tests unitarios                         | **QA Engineer**                           |
| Definir casos borde de un procesador             | **QA Engineer** + **Document Specialist** |
| Revisar código por vulnerabilidades              | **Security Auditor**                      |
| Aprobar un release de producción                 | **Security Auditor**                      |
| Configurar el pipeline de CI/CD                  | **DevOps Engineer**                       |
| Empaquetar el binario Win/Mac                    | **DevOps Engineer**                       |
| Diseñar el system prompt de IA                   | **AI/Prompt Engineer**                    |
| Optimizar el contexto enviado a la IA            | **AI/Prompt Engineer**                    |
| Excel con tablas dinámicas que no se leen bien   | **Document Specialist**                   |
| PDF que mezcla páginas nativas y escaneadas      | **Document Specialist**                   |
| Cualquier formato de archivo que da problemas    | **Document Specialist**                   |

---

## Archivos de los Agentes

| Agente              | Archivo                                                                |
| ------------------- | ---------------------------------------------------------------------- |
| Mediador            | [00-mediador.prompt.md](./00-mediador.prompt.md)                       |
| Architect           | [01-architect.prompt.md](./01-architect.prompt.md)                     |
| Backend Engineer    | [02-backend.prompt.md](./02-backend.prompt.md)                         |
| Frontend Engineer   | [03-frontend.prompt.md](./03-frontend.prompt.md)                       |
| UI/UX Designer      | [04-ui-ux.prompt.md](./04-ui-ux.prompt.md)                             |
| QA Engineer         | [05-qa.prompt.md](./05-qa.prompt.md)                                   |
| Security Auditor    | [06-auditor.prompt.md](./06-auditor.prompt.md)                         |
| DevOps Engineer     | [07-devops.prompt.md](./07-devops.prompt.md)                           |
| AI/Prompt Engineer  | [08-ai-engineer.prompt.md](./08-ai-engineer.prompt.md)                 |
| Document Specialist | [09-document-specialist.prompt.md](./09-document-specialist.prompt.md) |

---

## Cómo Usar Este Sistema en VS Code

1. Abre el panel de GitHub Copilot Chat
2. Selecciona el modo **Agent**
3. Escribe `#` para referenciar el archivo del agente que necesitas
4. O usa `/` seguido del nombre del agente si está configurado como modo personalizado

### Ejemplo de flujo de trabajo:

```
Tú → Mediador: "Necesito implementar el procesador de Excel"

Mediador → Architect: "Valida el contrato ExtractedContent antes de implementar"
Architect → confirma contrato

Mediador → Document Specialist: "¿Hay casos borde de Excel que el Backend debe conocer?"
Document Specialist → lista de casos borde

Mediador → Backend Engineer: "Implementa excel.py con estos casos borde en mente"
Backend Engineer → implementa

Mediador → QA: "Escribe los tests para excel.py"
QA → tests

Mediador → Security Auditor: "Revisa excel.py por vulnerabilidades de path traversal"
Security Auditor → aprueba con observaciones

Mediador → cierra la tarea
```

---

## Principios del Equipo

1. **El Mediador siempre tiene la última palabra en prioridades, no en implementación**
2. **El Architect tiene la última palabra en decisiones de diseño**
3. **El Security Auditor puede bloquear cualquier release — sin excepciones**
4. **Ningún agente trabaja en aislamiento — siempre revisa los contratos del Architect**
5. **Los contratos de interfaz existen ANTES de que cualquier agente implemente**
