# Invitación de boda — Fredy & Fátima

> **Versión:** 7.0 (recortada — ver nota abajo)
> **Fecha del evento:** 20 de diciembre de 2026, 4:30 p.m. (`America/El_Salvador`, UTC−6, sin horario de verano)
> **Cierre de confirmaciones:** 25 de octubre de 2026, 23:59:59 (hora local)
> **URL de producción:** `fredyfatimawedding.vercel.app`
> **Equipo:** 2 personas

> **Nota sobre esta versión.** Este documento se recortó a propósito (2026-09-19) para que contenga solo reglas y estado vigentes, no historia. El detalle de cómo se llegó a cada decisión, los bugs encontrados y corregidos, y las notas de verificación en vivo de sesiones pasadas ya no viven aquí — están en el historial de git (`git log`), que es la fuente correcta para eso. Si necesitas esa narrativa, búscala ahí antes de asumir que no existe.

---

## 0. Cómo usar este documento

Fuente de verdad del proyecto. Si el código y este documento se contradicen, el documento gana; si el documento está equivocado, se corrige en el mismo PR que corrige el código.

El diseño se está rehaciendo. El backlog está partido en dos vías (§6): **vía A**, no depende del diseño; **vía B**, espera el Figma v2 (ya recibido el 2026-09-16). Antes de tomar un ticket, verificar a qué vía pertenece.

**Antes de escribir código:** leer §9 (Convenciones de código, obligatorias, CI las verifica), §3 (Modelo de datos) y §4 (Contratos de API) — nombres de campos, rutas y códigos de error son los que están ahí, textualmente. Localizar el ticket en §6 y tratar sus criterios de aceptación como la definición de "terminado".

### Reglas que no se negocian

- **Todo el código en inglés.** Identificadores, archivos, rutas, campos de Firestore, tokens CSS, anclas del DOM, variables de entorno, commits, nombres de tests y de ramas. El español solo aparece como valor dentro de `src/content/`.
- **Sin comentarios en el código.** Única excepción: JSDoc sobre declaraciones exportadas de `api/_lib/`.
- **Nunca importar `firebase/firestore` fuera de `api/`.** El navegador no habla con la base de datos.
- **Nunca poner un secreto en una variable `VITE_`.** Se compilan en el bundle y son públicas.
- **Toda validación de negocio vive en el servidor.** El cliente valida para dar buena experiencia, no para proteger.
- **Antes de cada commit, analizar y limpiar el código que se va a commitear.** Revisar duplicación evitable, funciones/archivos de un solo uso, nombres, complejidad y superficie de seguridad. No es un paso opcional.

### Si algo falta o no encaja

No inventar campos, endpoints ni comportamientos que no estén en §3, §4 o §6. Proponer el cambio a este documento primero.

---

## 1. Resumen

Sitio de invitación de boda con RSVP por enlace personalizado (token opaco), más una consola de administración con CRUD de invitados. Cada invitado recibe por WhatsApp un enlace único; al abrirlo ve un sobre cerrado que anima al tocarlo y da paso a la invitación con música de fondo. Confirma cuántas personas asistirán, hasta `guestLimit`.

### Reglas de negocio

- **R1 — El que calla, otorga.** Quien no confirma antes del 25 de octubre se considera ausente. No hay opción explícita de declinar.
- **R2 — La confirmación es irreversible para el invitado.** Un segundo intento de confirmar muestra: _"Ya confirmaste tu asistencia, en caso de querer hacer un cambio ponte en contacto con los novios por medio de Whatsapp"_. Solo la consola puede modificar una confirmación existente.
- **R3 — El límite manda.** La cantidad confirmada nunca excede `guestLimit`, validado en servidor.

### Fuera de alcance

Dominio propio · notificación automatizada vía WhatsApp Business API · diseño responsive de la invitación (ADR-004) · internacionalización · nombres de acompañantes/restricciones alimentarias/mensajes libres · correos transaccionales · autogestión de cambios por el invitado (R2).

---

## 2. Decisiones de arquitectura

| Área            | Decisión                                                     |
| --------------- | ------------------------------------------------------------ |
| Frontend        | React 18 + Vite + TypeScript (`strict`)                      |
| Estilos         | Tailwind CSS + variables CSS                                 |
| Router          | React Router v6                                              |
| Estado servidor | TanStack Query                                               |
| Formularios     | React Hook Form + Zod                                        |
| Animaciones     | Framer Motion (`LazyMotion` + `m`)                           |
| Audio           | HTML5 `<audio>` nativo, sin librería                         |
| Backend         | Vercel Serverless Functions (`/api/*.ts`)                    |
| Base de datos   | Firebase Firestore (plan Spark)                              |
| Auth            | Firebase Auth, email + contraseña, 1 usuario                 |
| Hosting         | Vercel (Hobby)                                               |
| Testing         | Vitest + Testing Library. Sin e2e automatizado (ver ADR-011) |

**ADR-001 — El navegador nunca habla directo con Firestore.** Todo acceso a datos pasa por funciones serverless con `firebase-admin`. Security Rules deniegan todo (`allow read, write: if false`); son red de seguridad, no defensa principal. Excepción: el SDK de Firebase Auth vive en el cliente, solo en el chunk de `/admin`.

**ADR-002 — Token opaco, no payload firmado.** `/i/{token}` con `nanoid(21)`. La URL no transporta `guestLimit`; eso se lee de Firestore. Token alterado → 404. La protección real del límite es `count <= guestLimit` en servidor.

**ADR-003 — Guardar primero, notificar después.** `POST /api/rsvp` → Firestore → pantalla de éxito → **botón** (no redirección automática) que abre `wa.me`. iOS Safari bloquea `window.open` tras un `await` fuera del gesto directo del usuario.

**ADR-004 — Diseño de ancho fijo, no responsive.** La invitación se renderiza en una columna fluida hasta 432 px, con tope a partir de ahí (`width: 100%` + `max-width: 432px`, nunca un px duro). El color base se extiende a los lados en desktop. Aplica solo a la invitación; `/admin` sí es responsive. **Factor de escala del Figma v2:** artboard 885 px → 432 px reales, factor `432/885 ≈ 0.4878` (verificado con el tamaño de fuente del cuerpo). Usar este factor, no 2.5 (ese era del v1, descartado).

**ADR-005 — El sobre es la puerta de entrada.** Es el elemento LCP. El tap es el gesto de usuario legítimo para iniciar el audio (las políticas de autoplay bloquean cualquier otro momento). Debe ser un `<button>` real, no un `div` con listeners — si no es operable por teclado/lector de pantalla, el sitio entero queda inaccesible.

**ADR-006 — La confirmación no es idempotente.** `POST /api/rsvp` rechaza con `409 ALREADY_CONFIRMED` cualquier envío de un invitado con `confirmed === true` (R2). Por eso el formulario exige un paso de confirmación explícito antes del envío, advirtiendo que la acción no se puede deshacer — es la única defensa del usuario contra su propio mis-tap. La única vía de escape es `PATCH /api/admin/guests/[id]`.

**ADR-007 — El "porqué" vive en tests, no en comentarios.** Reglas de comportamiento no evidentes se documentan en el nombre de los tests (ej. `rejectsConcurrentConfirmationsSoOnlyOneSucceeds`). Único comentario permitido: JSDoc `/** … */` sobre declaraciones exportadas de `api/_lib/`.

**ADR-008 — El Figma v2 (recibido 2026-09-16).** `Invitación Responsive` (`fileKey` `3EAiInlH81ry1gAoHABKC4`, nodo raíz `1:62`). Tiene componentes reales con variantes y el sobre ya construido en dos hojas + sello. **La mayoría de los bloques de contenido** (calendario, contador, collage, itinerario, código de vestimenta, recordatorios) están pegados como **una sola imagen PNG plana por bloque**, sin estructura editable — sirven como maqueta de referencia pixel-a-pixel, no como fuente de datos de color/espaciado. Los tickets de E5 que cubren esas secciones se construyen en HTML/CSS real usando la imagen como referencia. Solo texto, colores y componentes de botón que SÍ son nodos nativos se verificaron con exactitud (ver §5). **Excepción explícita — WED-54 (calendario y contador).** El bloque `calendario-con-fecha` no tiene estructura editable que reconstruir (nodo `59:5`, sin hijos) y muestra contenido que no va a cambiar antes del evento, así que a pedido directo del usuario `CalendarCard` renderiza la imagen extraída tal cual en vez de recodificar la grilla en HTML — es la única sección de E5 que rompe la regla general de este ADR, y solo para esa imagen. **Contador — capas mixtas, decisión final.** El nodo `marco-de-contador` (`59:6`) es solo el marco floral decorativo, sin recuadros por dígito — esos números siguen siendo HTML real calculado cada segundo (`useCountdown`), no podrían venir de una imagen estática. La imagen se usa como fondo (`<img>` debajo) y los cuatro recuadros oscuros (`bg-surface-dark`) con los números se superponen encima, posicionados con `inset-x/y` en porcentaje para caer dentro del recuadro que ya trae la imagen. Las etiquetas visibles son una sola letra (`D`/`H`/`M`/`S`, según diseño); el nombre completo (`Días`/`Horas`/`Min.`/`Seg.`) queda disponible para lectores de pantalla vía `sr-only`. **Decisión sobre ornamentos:** WebP con transparencia a 2×, no SVG (son ilustraciones decorativas/fotográficas, un SVG de 80 paths pesa más). Excepción: iconos funcionales (Waze, Google Maps, itinerario, chevron del select) sí van en SVG.

**ADR-009 — El sobre ya está construido en dos hojas.** `Capa 1`/`Group 2`, cada uno con su textura, sello centrado sobre la costura. Es la estructura que necesita la animación de apertura (WED-60): dos hojas que rotan hacia afuera, sello partiéndose en la unión — no hay que rehacer la geometría. **Falta la especificación de la animación** (duración, easing, orden): no está en Figma, es decisión nuestra o del diseñador.

**ADR-011 — Un solo ambiente: todo corre en producción.** No hay proyecto Firebase de pruebas; Preview y Production de Vercel apuntan al mismo proyecto. **Consecuencia:** WED-94 (e2e con Playwright) queda eliminado del backlog — automatizarlo contra producción arriesgaría quemar la confirmación real de un invitado (R2) o alterar datos reales. La red de seguridad del flujo de RSVP son los tests unitarios de WED-41 y el ensayo manual de WED-102. **Al probar en un Preview deploy:** nunca usar tokens de invitados reales (se quema su única confirmación) ni hacer CRUD real irreversible contra un invitado real. Crear un invitado de prueba marcado en `titleLabel` (ej. `"TEST - borrar antes del lanzamiento"`) y borrarlo después.

**Nota permanente de UI (no ADR, pero es regla activa):** la invitación fuerza `color-scheme: light only` en todas las capas (meta tag, `tokens.css`, reafirmación bajo `prefers-color-scheme: dark`) porque no tiene ni tendrá modo oscuro propio — Android/Samsung Internet repintan colores no declarados. El admin conserva su propio selector claro/oscuro independiente.

---

## 3. Modelo de datos

### Colección `guests/{guestId}`

| Campo            | Tipo              | Obligatorio | Default | Notas                                                                            |
| ---------------- | ----------------- | ----------- | ------- | -------------------------------------------------------------------------------- |
| `token`          | string            | sí          | —       | `nanoid(21)`, generado en servidor                                               |
| `firstName`      | string            | sí          | —       | 1–60 caracteres                                                                  |
| `lastName`       | string \| null    | no          | `null`  | 0–60 caracteres                                                                  |
| `titleLabel`     | string \| null    | no          | `null`  | Texto del sobre, ej. `"Tío Orlando y Familia."` Si es `null`, se usa `firstName` |
| `guestLimit`     | number            | sí          | —       | Entero, 1–20                                                                     |
| `phone`          | string            | sí          | —       | E.164, ej. `+50370000000`                                                        |
| `confirmed`      | boolean           | sí          | `false` | Una vez `true`, el invitado no puede volver a enviar (R2)                        |
| `confirmedCount` | number            | sí          | `0`     | Entero, 0 ≤ n ≤ `guestLimit`                                                     |
| `confirmedAt`    | Timestamp \| null | no          | `null`  |                                                                                  |
| `firstOpenedAt`  | Timestamp \| null | no          | `null`  | Se llena en el primer `GET` del enlace                                           |
| `invitedAt`      | Timestamp \| null | no          | `null`  | Se llena cuando la consola marca el envío por WhatsApp                           |
| `createdAt`      | Timestamp         | sí          | —       |                                                                                  |
| `updatedAt`      | Timestamp         | sí          | —       |                                                                                  |

`titleLabel` existe aparte de `firstName`/`lastName` porque el sobre muestra tratamientos ("Tío Orlando y Familia.") que no se derivan de esos campos, que siguen siendo indispensables para el mensaje de WhatsApp y para buscar/ordenar en la consola. `confirmed` es booleano porque bajo R1 no hace falta distinguir "declinó" de "no respondió". No existe campo `notes` (se eliminó del modelo — usar `titleLabel` para marcar invitados de prueba, ver ADR-011).

### Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
  }
}
```

### Variables de entorno

| Variable                    | Ámbito   | Valor / descripción            |
| --------------------------- | -------- | ------------------------------ |
| `FIREBASE_PROJECT_ID`       | Servidor |                                |
| `FIREBASE_CLIENT_EMAIL`     | Servidor | Service account                |
| `FIREBASE_PRIVATE_KEY`      | Servidor | Con `\n` escapados             |
| `BRIDE_WHATSAPP`            | Servidor | `50376982534`                  |
| `RSVP_DEADLINE`             | Servidor | `2026-10-25T23:59:59-06:00`    |
| `VITE_FIREBASE_API_KEY`     | Cliente  | Solo Auth, solo chunk de admin |
| `VITE_FIREBASE_AUTH_DOMAIN` | Cliente  | Ídem                           |

> Toda variable con prefijo `VITE_` queda compilada en el bundle y es **pública**.

---

## 4. Contratos de API

### Públicos

**`GET /api/invitation/[token]`**

```jsonc
// 200
{
  "titleLabel": "Tío Orlando y Familia.",
  "firstName": "Orlando",
  "guestLimit": 3,
  "confirmed": false,
  "confirmedCount": 0,
  "rsvpOpen": true,
}
// 404 { "code": "TOKEN_NOT_FOUND" }
```

Nunca devuelve `phone` ni `token`. Escribe `firstOpenedAt` solo si estaba en `null`.

**`POST /api/rsvp`**

```jsonc
// Request
{ "token": "V1StGXR8_Z5jdHi6B-myT", "count": 3 }

// 200
{ "ok": true, "waLink": "https://wa.me/50376982534?text=..." }

// 400 { "code": "INVALID_PAYLOAD" | "COUNT_OUT_OF_RANGE" }
// 404 { "code": "TOKEN_NOT_FOUND" }
// 409 { "code": "ALREADY_CONFIRMED" }
// 409 { "code": "RSVP_CLOSED" }
// 429 { "code": "RATE_LIMITED" }
```

Validaciones en servidor: `count` entero, `1 <= count <= guestLimit`; `Date.now() <= RSVP_DEADLINE`; `confirmed === false` (R2). Anti-bot: 429 si `firstOpenedAt` es `null` o pasaron menos de 3s desde esa apertura. Rate limit: >5 envíos por IP/minuto → 429.

### Administración

Requieren `Authorization: Bearer <firebase-id-token>` (`admin.auth().verifyIdToken()`). Sin token válido → `401 { "code": "UNAUTHORIZED" }`.

| Método   | Ruta                                  | Descripción                                           |
| -------- | ------------------------------------- | ----------------------------------------------------- |
| `GET`    | `/api/admin/guests`                   | Lista + estadísticas                                  |
| `POST`   | `/api/admin/guests`                   | Crea, genera `token`                                  |
| `PATCH`  | `/api/admin/guests/[id]`              | Actualiza (única vía para modificar una confirmación) |
| `DELETE` | `/api/admin/guests/[id]`              | Elimina                                               |
| `POST`   | `/api/admin/guests/[id]/rotate-token` | Regenera token                                        |
| `GET`    | `/api/admin/export`                   | CSV completo                                          |
| `POST`   | `/api/admin/guests/import`            | Importa invitados desde CSV                           |

`PATCH` edita `firstName`, `lastName`, `titleLabel`, `guestLimit`, `phone`, `confirmed`, `confirmedCount`; `token`/`createdAt` se descartan silenciosamente (Zod `strip`). Reducir `guestLimit` por debajo de `confirmedCount` → 400 `GUEST_LIMIT_BELOW_CONFIRMED_COUNT`. Rotar token invalida el enlace anterior (pasa a 404). Export CSV: encabezados en español, BOM UTF-8, `Content-Disposition: attachment; filename="invitados.csv"`.

**`POST /api/admin/guests/import`.** Encabezado **humano** (`HUMAN_SHEET_HEADER` de `scripts/lib/humanGuestSheet.ts`): `Nombre,Apellido,Texto en sobre,Cupo de invitados,Teléfono` — no el header en inglés que exige el script de CLI. `parseCsv` detecta automáticamente `,` vs `;` (Excel en español exporta con `;`). Todo-o-nada. Duplicados por `phone` se omiten, no se sobreescriben.

```jsonc
// Request
{ "csv": "Nombre;Apellido;Texto en sobre;Cupo de invitados;Teléfono\nOrlando;;Tío Orlando y Familia.;3;7000-0000\n" }
// 200
{ "imported": 3, "skipped": 1 }
// 400 { "code": "INVALID_PAYLOAD" }
// 400 { "code": "INVALID_CSV", "errors": [{ "row": 3, "message": "..." }] }
```

---

## 5. Design system

### Color

`--bg-base`/`--bg-hero` `#F6D5A9` · `--envelope-text` `#465641` · `--surface-dark` `#48553F` · `--surface-sage` `#97A98F` · `--surface-muted` `#EBC9A0` · `--accent-coral` `#E5AB84` · `--accent-terracotta` `#20431E` · `--text-heading` `#4A5A46` · `--text-body` `#454F42` · `--text-on-dark` `#F6D5A9` · `--text-on-sage` `#454F42` · `--text-hero` `#FFFFFF`.

El papel del sobre y el sello no son colores sino imágenes (ADR-008). `--surface-dark`/`--surface-sage`/`--surface-muted`/`--text-heading` siguen aproximados (sus únicas apariciones en el v2 están dentro de bloques flattened); se verifican por muestreo al implementar cada sección de E5. El resto está verificado contra nodos nativos del Figma v2.

**Contraste WCAG AA** (`src/lib/color.ts`, expuesto en `/styleguide`): `--text-body` sobre `--bg-base` da 6.13:1, pasa AA. **`--text-on-sage` sobre `--surface-sage` da 3.42:1 — no alcanza AA para texto normal** (mínimo 4.5:1; sí alcanza el piso de texto grande, 3:1). Pendiente de decisión de diseño antes de cerrar WED-70 (botón "Enviar").

Radio/sombra reales: `--radius-invitation-sm: 5px`, `--shadow-invitation-badge: 2px 2px 1px rgba(0,0,0,0.25)`.

### Tipografía

**Great Vibes** (script, títulos) y **Inter** (Regular/Bold, cuerpo/botones) — ambas Google Fonts SIL OFL, autohospedadas en `public/fonts/` como WOFF2, subset `latin` únicamente (cubre acentos y `ñ`; `latin-ext` no aplica al español). `--font-sans`/`--font-script` en `src/styles/tokens.css`. Tamaños del archivo a escala 885 → dividir por el factor de ADR-004 (0.4878), no por 2.5.

### Estructura

**Pantalla 0 — Sobre (gate).** Sobre vertical, dos hojas, sello de lacre "F&F". "Para:" + `titleLabel` en script, inferior derecha.

**Página (tras la apertura), ancho 432 px máx.:**

| #   | Sección                                                                            | Ancla         | Componente         |
| --- | ---------------------------------------------------------------------------------- | ------------- | ------------------ |
| 1   | Portada — foto vertical, "Fredy y Fátima" en script blanco, borde floral           | `#cover`      | `CoverSection`     |
| 2   | "¡Nos vamos a casar!" — calendario diciembre 2026, "4:30 p.m.", cuenta regresiva   | `#date`       | `DateSection`      |
| 3   | Collage de 5 polaroids + "Hemos elegido caminar juntos para siempre…"              | `#about-us`   | `AboutUsSection`   |
| 4   | "Ceremonia y Recepción." — foto venue, dirección, botones Waze/Google Maps         | `#venue`      | `VenueSection`     |
| 5   | "Itinerario." — timeline zigzag, 7 hitos                                           | `#timeline`   | `TimelineSection`  |
| 6   | "Código de Vestimenta" — ilustración, nota, colores a evitar por género            | `#dress-code` | `DressCodeSection` |
| 7   | "-Recuerda-" — solo adultos, regalo de sobre, fecha límite, selector, botón Enviar | `#rsvp`       | `RsvpSection`      |

El nombre del invitado aparece solo en el sobre, no en la portada. **Elemento flotante:** `MusicToggle`, disco giratorio inferior izquierdo, fijo, se oculta al entrar `#rsvp` en viewport.

### Contenido fijo

**Lugar:** Hotel Álamo Internacional — Lomas de San Francisco, final calle 3, No 7, Antiguo Cuscatlán (cerca de la UCA y el Estadio Cuscatlán).

**Itinerario:** 4:30 Ceremonia Religiosa · 5:30 Fotos · 6:00 Primer Baile de Esposos · 6:30 Cena · 7:30 Pastel · 8:00 Fiesta/Baile · 9:00 Despedida y recuerdos.

**Vestimenta:** formal. Mujeres evitan blanco/marfil; hombres evitan verde menta/militar.

**Recordatorios:** evento exclusivo para adultos; regalo de sobre; confirmar antes del 25 de octubre.

---

## 6. Backlog

**Vía A** (no depende del diseño): E1, E2, E4, E8, WED-03, WED-04, WED-101. **Vía B** (bloqueada hasta Figma v2 — ya desbloqueada desde 2026-09-16): E0, E3, E5, E6, E7. Puente único: WED-70 consume `POST /api/rsvp`, que la vía A ya dejó terminado. Los contratos de §4 no cambian salvo que el diseño obligue — en ese caso se cambia el contrato primero.

Estimación: 1 = <1h · 2 = medio día · 3 = 1 día · 5 = 2–3 días · 8 = 1 semana. **DoD global:** compila sin errores, pasa `lint`/`typecheck`/`test`, cumple §9, revisado en preview deploy, probado en iOS Safari y Android Chrome reales, sin errores en consola.

### Cerrados (referencia rápida, sin detalle)

E1 completa (WED-10 a WED-15, salvo la protección de rama de WED-13, no verificable desde el repo). WED-12, WED-14 (parcial: falta `noindex` permanente en `/i/*`/`/admin` una vez existan esas rutas, y el mecanismo que distinga preview de producción lanzada). E2 completa (WED-20 a WED-23). E4 completa (WED-40 a WED-43). E8: WED-79 a WED-84 completas en código, pendiente verificación visual en navegador real con sesión iniciada. WED-50/51 (E5, vía A) completas; el overflow horizontal en viewports angostos que quedaba pendiente de verificar era un bug real (`CoverSection`: `flex-1` sin `min-w-0` en los ornamentos florales, corregido). WED-52 completa en código, pendiente animación (WED-60) y medición de LCP real. WED-53 completa (con corrección: el texto real del Figma dice "Fredy y Fátima", no "Fredy & Fátima"). WED-30/31/32 completas en código; WED-31 pendiente de verificar Great Vibes en iOS Safari real. WED-33 parcial: Waze/Google Maps resueltos; los 7 iconos del itinerario y el disco de música siguen bloqueados (sin fuente vectorial extraíble / sección aún no construida). WED-54 completa: calendario y contador usan las imágenes reales extraídas de Figma en vez de HTML codificado (excepción explícita de ADR-008, ver esa nota) — nota abierta: el encabezado "¡Nos vamos a casar!" es un outline sin fuente identificable, implementado como imagen SVG exportada, pendiente confirmar con el diseñador si es una fuente a licenciar. WED-58 completa: título/ilustración/ornamentos extraídos de Figma, colores nombrados en texto junto a un swatch (no como texto coloreado, evita el chequeo de contraste por color) — corregido un bug real del archivo de Figma donde el texto "evitar blanco" estaba duplicado por copiar/pegar bajo la sección Hombres (debía decir verde menta/militar); las capas de paleta también están nombradas al revés en Figma (`colores-para-hombre` es la de Mujeres y viceversa), usado el contenido real de cada una, no el nombre de capa. WED-59 completa: título e ilustraciones extraídos de Figma en WebP (no SVG — ver desviación documentada), los tres bloques resultaron ser solo dos con ilustración más el texto de fecha límite, que en el Figma real vive después del marco del formulario (WED-70), no junto a estos. WED-55/56/57 completas: a pedido directo del usuario, las tres reutilizan los bloques planos de Figma que las tenían bloqueadas en vez de esperar assets nuevos. WED-55 (`collage-mejorado`) resultó tener las 5 fotos reales de la pareja ya puestas, no fotos de stock — no dependía de WED-01 después de todo; la frase "caminar juntos" se mantuvo como texto real con tipografía mixta (script para las partes destacadas), dos líneas divisorias y un degradado radial sutil con `--color-accent-coral` detrás del texto, replicando el bloque real del Figma. WED-56 usa `imagen-hotel`/título como imágenes; dirección, badge del hotel y botones de Waze/Google Maps (con `aria-label`, cumple la nota pendiente de WED-33) siguen siendo HTML real — las URLs de mapas son por búsqueda de texto (nombre+dirección), no coordenadas, así que WED-03 (probarlas en un teléfono real) sigue abierto. WED-57 usa `itinerario-completo` completo (título+7 hitos+horarios+iconos en una sola imagen) — resuelve de raíz el bloqueo de los iconos no extraíbles, a costa de perder la lista `<ol>` semántica del AC original (mismo tipo de excepción que WED-54 ya sentó para el calendario); el `alt` de esa imagen lista el itinerario completo en texto para lectores de pantalla. **WED-70/71 (RSVP) completas en código, 2026-09-19** — implementadas a partir de una imagen de referencia nueva en el Figma v2 (nodo suelto `166:30`, fuera del frame principal, a la altura de `#rsvp`): mismo patrón que el resto de E5, una sola imagen flattened sin estructura editable, usada como maqueta pixel-a-pixel. El picker y el botón se construyeron con los primitivos `Select`/`Button` de WED-32 (ya coincidían con el diseño sin cambios); el fondo floral (`marco-flor`, nodo `104:298`) se exportó a WebP igual que el resto de assets del v2. `RsvpForm` usa RHF+Zod con el mismo `rsvpRequestSchema` del servidor (límite dinámico por `guestLimit`); el paso de confirmación es un modal (`RsvpConfirmModal`) sobre el `Modal` de WED-32; tras un 409 `ALREADY_CONFIRMED`/`RSVP_CLOSED` del servidor (invitado que confirma en dos pestañas, o cierre que ocurre entre la carga de la página y el envío) el formulario cambia al estado correspondiente en vez de mostrar un error genérico. El enlace `wa.me` a la novia para el estado "ya confirmado" (R2) **no se agregó al contrato de `GET /api/invitation/[token]`**: se hardcodeó en `src/content/rsvp.ts` con el mismo número que `BRIDE_WHATSAPP`, porque ya es un dato público (aparece en texto plano en este documento, WED-03) y evita ensanchar el contrato de §4 por un enlace de cortesía. **Dos bugs reales de WED-32 encontrados y corregidos al usar sus componentes en un navegador real por primera vez** (ninguno se detectaba con Vitest+jsdom): `Select` no estaba en `React.forwardRef`, así que `register()` de React Hook Form nunca alcanzaba el `<select>` real (mismo defecto que ya se había corregido en `Input`/`Button`/`Dialog` del admin en WED-80/82, predicho explícitamente en la nota de ese ticket); y `Modal` no centraba — Tailwind Preflight resetea `margin: 0` globalmente, pisando el `margin: auto` con el que el navegador centra un `<dialog>` nativo, así que el modal de confirmación aparecía pegado a la esquina superior izquierda en vez de centrado. Corregido con `m-auto` en la clase del `<dialog>`. **Pendiente real, mismo criterio que el resto del backlog:** WED-71 pide probar el flujo completo en un teléfono real (iOS Safari en particular, por el gesto directo que exige abrir `wa.me` sin bloqueo de popup) — no verificable en este entorno. **Hallazgo sin resolver, ya documentado en §5 antes de este ticket:** el botón "Confirmar" usa `Button` variant `primary` (`bg-surface-sage`/`text-on-sage`), la combinación que da 3.42:1 de contraste — no alcanza AA para texto normal, y el botón no es lo bastante grande para calificar como "texto grande". Sigue pendiente de una decisión de diseño (tono más oscuro o botón más grande/bold), no se resolvió unilateralmente en este ticket.

### Abiertos

#### E0 — Descubrimiento

- **WED-01** Activos finales (fotos, texturas, ornamentos, iconos) aprobados por los novios.
- **WED-02** Auditoría de Figma — solo queda pendiente la especificación de la animación de apertura del sobre (no está en el archivo).
- **WED-03** Verificar enlaces de Google Maps/Waze y `wa.me/50376982534` desde un teléfono.
- **WED-04** Pista musical: elegida, aprobada, derechos documentados, MP3 <3MB recortado en bucle, no en la carga inicial.

#### E3 — Design System

- **WED-33** (resto) 7 iconos de itinerario y disco de música en SVG cuando exista fuente vectorial — el itinerario terminó resuelto vía WED-57 usando el bloque plano completo, así que esos 7 iconos ya no bloquean nada; solo queda el disco de música (WED-60/61, todavía lejos en el backlog).
- **WED-34** Contenido desacoplado a `src/content/`: textos, itinerario, dirección, URLs de mapas, fecha, mensajes de error del RSVP (con el texto literal de R2) — claves en inglés, valores en español. Build falla si falta un campo obligatorio.

#### E6 — Animaciones y audio

- **WED-60** Animación de apertura del sobre: según especificación de WED-02, Framer Motion, 1.2–2s, fundido simple bajo `prefers-reduced-motion`, camino de escape si falla el JS, solo `transform`/`opacity`, medido sin caída de frames en Android gama media, sin doble disparo por doble tap.
- **WED-61** `MusicToggle`: disco fijo, gira mientras suena, arranca en el mismo handler del tap del sobre (no en `useEffect`), `<button>` con `aria-label`/`aria-pressed`, `preload="none"`, persiste en `sessionStorage`, bucle sin corte, se oculta con fundido en `#rsvp` sin detener el audio, degrada bien si el navegador bloquea la reproducción, probado en iOS Safari.
- **WED-62** Animaciones de entrada por sección vía IntersectionObserver, visibles y estáticas bajo `prefers-reduced-motion`, contenido visible si falla el JS, solo `transform`/`opacity`.
- **WED-63** Animaciones de detalle (abanico del collage, latido del corazón del calendario, dibujado del timeline, transición de dígitos), desactivadas bajo `prefers-reduced-motion`, Framer Motion ≤50KB gzip o `LazyMotion`+`m`. **Nota:** el corazón del calendario ya no es un elemento del DOM (WED-54 lo dejó horneado en la imagen extraída de Figma) — este ítem necesita revisarse cuando se implemente: superponer un corazón animado aparte sobre la imagen, o soltar esta animación puntual.

#### E9 — Calidad

- **WED-90** Accesibilidad: axe DevTools sin violaciones críticas/serias, sobre alcanzable solo con teclado, modal atrapa foco y cierra con Esc, un solo `h1` por página, `alt` correcto, flujo completo con VoiceOver/TalkBack, contraste AA en el sitio real.
- **WED-91** Rendimiento: Lighthouse móvil ≥90/95/95, LCP<2.5s/CLS<0.1/INP<200ms, imágenes AVIF/WebP con dimensiones, primera carga <700KB, mp3 no descarga hasta el tap, bundle analizado, sobre visible en <3s en 4G simulada.
- **WED-92** Metadatos: `title`/`meta description`, favicon/`apple-touch-icon`, `manifest.json`, Open Graph genérico (sin nombre de invitado, 1200×630 <300KB).
- **WED-93** Matriz cross-browser: iOS Safari, Android Chrome, Chrome/Safari/Firefox desktop, navegador interno de WhatsApp (animación+audio probados ahí específicamente), 320/360/432/1920px, landscape, fuente al 200%, bugs registrados con severidad.

> ~~WED-94~~ eliminado — ver ADR-011.

#### E10 — Lanzamiento

- **WED-100** Contenido final: cero placeholders, revisión ortográfica por segunda persona, corregir `-Recuarda-`→`-Recuerda-` y el espacio faltante en "caminarjuntos", fecha/hora/dirección aprobadas por escrito.
- **WED-101** Carga de la lista real: importada, conteo validado, cero duplicados, cada `titleLabel` revisado uno por uno, suma de `guestLimit` contra el aforo del Hotel Álamo, todos los `phone` en E.164, 5 enlaces de muestra verificados.
- **WED-102** Ensayo general: 3 personas ajenas recorren el flujo completo desde su celular, respuestas visibles en consola, `wa.me` llega a la novia con el texto correcto, se observa si el sobre es intuitivo sin explicación y si el modal comunica bien la irreversibilidad, fricciones registradas, datos de prueba eliminados antes del envío real.
- **WED-103** Go-live: `robots.txt`/`noindex` retirados de páginas públicas (mantenidos en `/i/*` y `/admin`), Vercel Analytics activo, monitoreo de errores con alerta, export manual de Firestore como respaldo, tag de release, envío por lotes (10 primero, luego el resto).

#### E11 — Post-lanzamiento

- **WED-110** Seguimiento: filtro de pendientes con reenvío por `wa.me`, distinción entre "abrió sin confirmar" y "nunca abrió", plantilla de recordatorio.
- **WED-111** Cierre: pasado el 25/oct el formulario muestra cierre y `/api/rsvp` da 409 `RSVP_CLOSED`, export final entregado, documentado cuándo se apaga el sitio y se borran datos personales.

---

## 7. Qué se recorta si algo se atrasa

En orden: WED-63 (animaciones de detalle), WED-61 (música), WED-110. El sitio funciona sin las tres.

## 8. Riesgos activos

| Riesgo                                                                           | Prob.    | Impacto     | Mitigación                                                                                                  |
| -------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------- |
| Los invitados no entienden que hay que tocar el sobre                            | Media    | **Crítico** | Affordance en WED-52, observación en WED-102                                                                |
| Confirmaciones erróneas por mis-tap, irreversibles para el invitado              | **Alta** | Medio       | Modal en WED-70; enlace `wa.me` en el mensaje de R2; ambas vías de corrección en WED-82 (ya implementado)   |
| Sin ambiente de pruebas (ADR-011), un preview o prueba manual quema datos reales | Media    | Alto        | Nunca probar con tokens reales; invitados de prueba marcados en `titleLabel`, borrados antes de WED-101/103 |
| Los ornamentos importados inflan el peso de la página                            | Media    | Medio       | ADR-008 → WebP; presupuesto verificado en WED-33/91                                                         |
| La animación de apertura no está especificada                                    | **Alta** | Medio       | Pedirla explícitamente al diseñador antes de WED-60                                                         |
| La animación del sobre va lenta en gama media                                    | Media    | Alto        | Medición obligatoria en WED-60; fallback a fundido simple                                                   |
| Renderizado o audio roto en el navegador interno de WhatsApp                     | Media    | Alto        | WED-93 lo prueba explícitamente; es el canal principal                                                      |
| Pista musical comercial sin licencia                                             | Alta     | Bajo–Medio  | Riesgo asumido en WED-04; sitio se mantiene `noindex`                                                       |
| La música no reproduce (silencio de iOS, políticas del navegador)                | Alta     | Bajo        | Degradación elegante en WED-61, no un fallo                                                                 |
| Un `titleLabel` mal escrito en el sobre                                          | Media    | Medio       | Revisión uno por uno en WED-101                                                                             |
| Secreto filtrado por prefijo `VITE_`                                             | Baja     | **Crítico** | Regla de ESLint + verificación                                                                              |
| Un enlace se comparte y alguien confirma por otro                                | Baja     | Medio       | R2 hace que la primera confirmación sea la única; token rotable (WED-84, ya implementado)                   |
| El invitado no envía o edita el `wa.me`                                          | Alta     | Bajo        | Riesgo aceptado; la consola es la fuente de verdad                                                          |

---

## 9. Convenciones de código

Parte del DoD de todo ticket, verificadas en CI (WED-15).

### Idioma y nomenclatura

Todo el código en inglés (identificadores, archivos, rutas, campos de Firestore, tokens CSS, anclas, env vars, commits, tests, ramas). Contenido visible en español solo en `src/content/`, claves en inglés.

| Elemento                  | Convención                  | Ejemplo                               |
| ------------------------- | --------------------------- | ------------------------------------- |
| Variables y funciones     | camelCase                   | `confirmedCount`, `buildWhatsAppLink` |
| Componentes React y tipos | PascalCase                  | `EnvelopeGate`, `GuestRecord`         |
| Constantes de módulo      | UPPER_SNAKE_CASE            | `MAX_GUEST_LIMIT`                     |
| Hooks                     | `use` + camelCase           | `useInvitation`                       |
| Archivos de componente    | PascalCase.tsx              | `RsvpForm.tsx`                        |
| Otros archivos            | camelCase.ts                | `buildWhatsAppLink.ts`                |
| Booleanos                 | prefijo `is`/`has`/`should` | `isSubmitting`, `hasConfirmed`        |
| Rutas y anclas            | kebab-case                  | `/api/admin/guests`, `#dress-code`    |

### Clean Code exigible

Sin comentarios (excepción: JSDoc en `api/_lib/`). Sin `any`; `@ts-ignore` prohibido, `@ts-expect-error` solo con explicación ≥20 caracteres. Complejidad ciclomática ≤10, función ≤50 líneas, anidamiento ≤3, parámetros ≤4 (más de tres, pasar como objeto). Sin números mágicos. Una responsabilidad por función. Sin abreviaturas salvo universales (`id`, `url`, `api`). Sin código muerto ni imports sin usar. Errores manejados explícitamente, nada de `catch` vacío. Ningún archivo `.js` en el repo, incluida la config de herramientas.

### Supresiones de lint

Solo `eslint-disable-next-line`, reglas nombradas una por una, justificación en la misma línea con `-- motivo` (explicando por qué el código es correcto así, no que la regla molesta). Tope de 10 supresiones en todo el repo, verificado en CI.

```ts
// eslint-disable-next-line complexity -- máquina de estados del sobre; dividirla en dos funciones oscurece la secuencia
```

### Testing

Los tests describen comportamiento, no implementación. El nombre del test es la documentación de la regla (`rejectsCountAboveGuestLimit`, no `test1`). Cobertura mínima en CI: 90% en `api/` y `src/schemas/`, 60% global.
