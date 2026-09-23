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

> **Regla permanente — enlaces de WhatsApp siempre por `https://api.whatsapp.com/send/?phone=…&text=…`, nunca por `wa.me` (verificado 2026-09-22, `buildWhatsAppDeepLink` en `src/content/rsvp.ts`, `buildGuestWhatsAppLink` en `buildGuestInviteLink.ts`).** `wa.me` responde con un 301/302 a `api.whatsapp.com/send/` y en ese paso de redirección del lado del servidor de Meta reemplaza cualquier carácter Unicode de categoría "Símbolo" (cualquier emoji) por `�` (U+FFFD) — reproducible con `curl` puro, sin navegador ni código de este repo de por medio. Yendo directo a `api.whatsapp.com/send/` ese salto no ocurre y el emoji llega intacto al enlace real que abre WhatsApp (`web.whatsapp.com/send/?phone=…&text=…`, visible en el HTML de esa página con los bytes del emoji sin tocar). **Confusión real que costó una vuelta de más:** la página de vista previa de `api.whatsapp.com/send/` sí sigue mostrando `�` en la burbuja de muestra que dibuja para sí misma — es un bug cosmético de esa página nada más, no del enlace real, y fue lo que llevó a la conclusión (incorrecta) de que ningún host servía. La fuente fue esta respuesta, la más votada, de Stack Overflow: https://stackoverflow.com/questions/64215662/whatsapp-click-to-chat-with-emojis (respuesta de Panda Sean).

**ADR-004 — Diseño de ancho fijo, no responsive.** La invitación se renderiza en una columna fluida hasta 432 px, con tope a partir de ahí (`width: 100%` + `max-width: 432px`, nunca un px duro). El color base se extiende a los lados en desktop. Aplica solo a la invitación; `/admin` sí es responsive. **Factor de escala del Figma v2:** artboard 885 px → 432 px reales, factor `432/885 ≈ 0.4878` (verificado con el tamaño de fuente del cuerpo). Usar este factor, no 2.5 (ese era del v1, descartado).

**ADR-005 — El sobre es la puerta de entrada.** Es el elemento LCP. El tap es el gesto de usuario legítimo para iniciar el audio (las políticas de autoplay bloquean cualquier otro momento). Debe ser un `<button>` real, no un `div` con listeners — si no es operable por teclado/lector de pantalla, el sitio entero queda inaccesible.

**ADR-006 — La confirmación no es idempotente.** `POST /api/rsvp` rechaza con `409 ALREADY_CONFIRMED` cualquier envío de un invitado con `confirmed === true` (R2). Por eso el formulario exige un paso de confirmación explícito antes del envío, advirtiendo que la acción no se puede deshacer — es la única defensa del usuario contra su propio mis-tap. La única vía de escape es `PATCH /api/admin/guests/[id]`.

**ADR-007 — El "porqué" vive en tests, no en comentarios.** Reglas de comportamiento no evidentes se documentan en el nombre de los tests (ej. `rejectsConcurrentConfirmationsSoOnlyOneSucceeds`). Único comentario permitido: JSDoc `/** … */` sobre declaraciones exportadas de `api/_lib/`.

**ADR-008 — El Figma v2 (recibido 2026-09-16).** `Invitación Responsive` (`fileKey` `3EAiInlH81ry1gAoHABKC4`, nodo raíz `1:62`). Tiene componentes reales con variantes y el sobre ya construido en dos hojas + sello. **La mayoría de los bloques de contenido** (calendario, contador, collage, itinerario, código de vestimenta, recordatorios) están pegados como **una sola imagen PNG plana por bloque**, sin estructura editable — sirven como maqueta de referencia pixel-a-pixel, no como fuente de datos de color/espaciado. Los tickets de E5 que cubren esas secciones se construyen en HTML/CSS real usando la imagen como referencia. Solo texto, colores y componentes de botón que SÍ son nodos nativos se verificaron con exactitud (ver §5). **Excepción explícita — WED-54 (calendario y contador).** El bloque `calendario-con-fecha` no tiene estructura editable que reconstruir (nodo `59:5`, sin hijos) y muestra contenido que no va a cambiar antes del evento, así que a pedido directo del usuario `CalendarCard` renderiza la imagen extraída tal cual en vez de recodificar la grilla en HTML — es la única sección de E5 que rompe la regla general de este ADR, y solo para esa imagen. **Contador — capas mixtas, decisión final.** El nodo `marco-de-contador` (`59:6`) es solo el marco floral decorativo, sin recuadros por dígito — esos números siguen siendo HTML real calculado cada segundo (`useCountdown`), no podrían venir de una imagen estática. La imagen se usa como fondo (`<img>` debajo) y los cuatro recuadros oscuros (`bg-surface-dark`) con los números se superponen encima, posicionados con `inset-x/y` en porcentaje para caer dentro del recuadro que ya trae la imagen. Las etiquetas visibles son una sola letra (`D`/`H`/`M`/`S`, según diseño); el nombre completo (`Días`/`Horas`/`Min.`/`Seg.`) queda disponible para lectores de pantalla vía `sr-only`. **Decisión sobre ornamentos:** WebP con transparencia a 2×, no SVG (son ilustraciones decorativas/fotográficas, un SVG de 80 paths pesa más). Excepción: iconos funcionales (Waze, Google Maps, itinerario, chevron del select) sí van en SVG. **`Vinyl Record` (nodo `191:31`) es otra excepción real, no una ilustración flattened:** a diferencia del resto de bloques de E5, este nodo sí tiene estructura vectorial nativa (dos paths, relleno sólido `#454F42`, ~2 KB de SVG) — se exportó como SVG (`public/assets/music/vinyl-record.svg`), no WebP, siguiendo la misma regla que los iconos funcionales.

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
| `RSVP_DEADLINE`             | Servidor | `2026-10-25T23:59:59-06:00`    |
| `VITE_FIREBASE_API_KEY`     | Cliente  | Solo Auth, solo chunk de admin |
| `VITE_FIREBASE_AUTH_DOMAIN` | Cliente  | Ídem                           |

> Toda variable con prefijo `VITE_` queda compilada en el bundle y es **pública**.

> **`BRIDE_WHATSAPP` retirada del servidor (2026-09-22).** El mensaje de aviso a los novios tras confirmar ya no depende de datos del invitado (ver WED-70/71 en Cerrados), así que ambos números viven ahora solo como contenido público en `src/content/rsvp.ts` (mismo patrón que ya usaba el enlace de "ya confirmado" desde antes). Si `BRIDE_WHATSAPP` sigue configurada en Vercel, ya no la lee ningún código — se puede borrar de ahí sin impacto.

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
{ "ok": true }

// 400 { "code": "INVALID_PAYLOAD" | "COUNT_OUT_OF_RANGE" }
// 404 { "code": "TOKEN_NOT_FOUND" }
// 409 { "code": "ALREADY_CONFIRMED" }
// 409 { "code": "RSVP_CLOSED" }
// 429 { "code": "RATE_LIMITED" }
```

Validaciones en servidor: `count` entero, `1 <= count <= guestLimit`; `Date.now() <= RSVP_DEADLINE`; `confirmed === false` (R2). Anti-bot: 429 si `firstOpenedAt` es `null` o pasaron menos de 3s desde esa apertura. Rate limit: >5 envíos por IP/minuto → 429. **Ya no devuelve `waLink` (retirado 2026-09-22, ver WED-70/71 en Cerrados):** el enlace de aviso a los novios se arma enteramente en el cliente, en `src/content/rsvp.ts`, porque el mensaje dejó de depender de datos del invitado.

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

`--bg-base`/`--bg-hero` `#F6D5A9` · `--envelope-text` `#465641` · `--surface-dark` `#48553F` · `--surface-sage` `#97A98F` · `--surface-muted` `#EBC9A0` · `--surface-form` `#F1CA9E` · `--accent-coral` `#E5AB84` · `--accent-terracotta` `#20431E` · `--text-heading` `#4A5A46` · `--text-body` `#454F42` · `--text-on-dark` `#F6D5A9` · `--text-on-sage` `#454F42` · `--text-hero` `#FFFFFF`.

El papel del sobre y el sello no son colores sino imágenes (ADR-008). `--surface-dark`/`--surface-sage`/`--surface-muted`/`--text-heading` siguen aproximados (sus únicas apariciones en el v2 están dentro de bloques flattened); se verifican por muestreo al implementar cada sección de E5. El resto está verificado contra nodos nativos del Figma v2.

**Contraste WCAG AA** (`src/lib/color.ts`, expuesto en `/styleguide`): `--text-body` sobre `--bg-base` da 6.13:1, pasa AA. **`--text-on-sage` sobre `--surface-sage` da 3.42:1 — no alcanza AA para texto normal** (mínimo 4.5:1; sí alcanza el piso de texto grande, 3:1); sigue así donde ese par se usa (el enlace de WhatsApp del estado "ya confirmado" en `RsvpFormCard`), pero ya no en el botón "Confirmar" del RSVP — ver la nota de la variant `dark` de `Button` en el registro de WED-70/71 más abajo, `--text-on-dark` sobre `--surface-dark` da ~6:1.

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

El nombre del invitado aparece solo en el sobre, no en la portada. **Elemento flotante:** `MusicToggle`, disco giratorio en la esquina superior izquierda de la pantalla, `position: fixed`, siempre visible sin importar el scroll (a pedido directo del usuario, 2026-09-22 — reemplaza la posición/comportamiento originales de este documento; no se oculta al entrar `#rsvp`).

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

E1 completa (WED-10 a WED-15, salvo la protección de rama de WED-13, no verificable desde el repo). WED-12, WED-14 (parcial: falta `noindex` permanente en `/i/*`/`/admin` una vez existan esas rutas, y el mecanismo que distinga preview de producción lanzada). E2 completa (WED-20 a WED-23). E4 completa (WED-40 a WED-43). E8: WED-79 a WED-84 completas en código, pendiente verificación visual en navegador real con sesión iniciada. WED-50/51 (E5, vía A) completas; el overflow horizontal en viewports angostos que quedaba pendiente de verificar era un bug real (`CoverSection`: `flex-1` sin `min-w-0` en los ornamentos florales, corregido). WED-52 completa en código, pendiente animación (WED-60) y medición de LCP real. WED-53 completa (con corrección: el texto real del Figma dice "Fredy y Fátima", no "Fredy & Fátima"). WED-30/31/32 completas en código; WED-31 pendiente de verificar Great Vibes en iOS Safari real. WED-33 completa: Waze/Google Maps resueltos; los 7 iconos del itinerario se resolvieron vía WED-57 (bloque plano completo) y el disco de música vía WED-61 (nodo vectorial `Vinyl Record` del Figma v2). WED-54 completa: calendario y contador usan las imágenes reales extraídas de Figma en vez de HTML codificado (excepción explícita de ADR-008, ver esa nota) — nota abierta: el encabezado "¡Nos vamos a casar!" es un outline sin fuente identificable, implementado como imagen SVG exportada, pendiente confirmar con el diseñador si es una fuente a licenciar. WED-58 completa: título/ilustración/ornamentos extraídos de Figma, colores nombrados en texto junto a un swatch (no como texto coloreado, evita el chequeo de contraste por color) — corregido un bug real del archivo de Figma donde el texto "evitar blanco" estaba duplicado por copiar/pegar bajo la sección Hombres (debía decir verde menta/militar); las capas de paleta también están nombradas al revés en Figma (`colores-para-hombre` es la de Mujeres y viceversa), usado el contenido real de cada una, no el nombre de capa. WED-59 completa: título e ilustraciones extraídos de Figma en WebP (no SVG — ver desviación documentada), los tres bloques resultaron ser solo dos con ilustración más el texto de fecha límite, que en el Figma real vive después del marco del formulario (WED-70), no junto a estos. WED-55/56/57 completas: a pedido directo del usuario, las tres reutilizan los bloques planos de Figma que las tenían bloqueadas en vez de esperar assets nuevos. WED-55 (`collage-mejorado`) resultó tener las 5 fotos reales de la pareja ya puestas, no fotos de stock — no dependía de WED-01 después de todo; la frase "caminar juntos" se mantuvo como texto real con tipografía mixta (script para las partes destacadas), dos líneas divisorias y un degradado radial sutil con `--color-accent-coral` detrás del texto, replicando el bloque real del Figma. WED-56 usa `imagen-hotel`/título como imágenes; dirección, badge del hotel y botones de Waze/Google Maps (con `aria-label`, cumple la nota pendiente de WED-33) siguen siendo HTML real — las URLs de mapas son por búsqueda de texto (nombre+dirección), no coordenadas, así que WED-03 (probarlas en un teléfono real) sigue abierto. WED-57 usa `itinerario-completo` completo (título+7 hitos+horarios+iconos en una sola imagen) — resuelve de raíz el bloqueo de los iconos no extraíbles, a costa de perder la lista `<ol>` semántica del AC original (mismo tipo de excepción que WED-54 ya sentó para el calendario); el `alt` de esa imagen lista el itinerario completo en texto para lectores de pantalla. **WED-70/71 (RSVP) completas en código, 2026-09-19** — implementadas a partir de una imagen de referencia nueva en el Figma v2 (nodo suelto `166:30`, fuera del frame principal, a la altura de `#rsvp`): mismo patrón que el resto de E5, una sola imagen flattened sin estructura editable, usada como maqueta pixel-a-pixel. El picker y el botón se construyeron con los primitivos `Select`/`Button` de WED-32 (ya coincidían con el diseño sin cambios); el fondo floral (`marco-flor`, nodo `104:298`) se exportó a WebP igual que el resto de assets del v2. `RsvpForm` usa RHF+Zod con el mismo `rsvpRequestSchema` del servidor (límite dinámico por `guestLimit`); el paso de confirmación es un modal (`RsvpConfirmModal`) sobre el `Modal` de WED-32; tras un 409 `ALREADY_CONFIRMED`/`RSVP_CLOSED` del servidor (invitado que confirma en dos pestañas, o cierre que ocurre entre la carga de la página y el envío) el formulario cambia al estado correspondiente en vez de mostrar un error genérico. El enlace `wa.me` a la novia para el estado "ya confirmado" (R2) **no se agregó al contrato de `GET /api/invitation/[token]`**: se hardcodeó en `src/content/rsvp.ts` con el mismo número que `BRIDE_WHATSAPP`, porque ya es un dato público (aparece en texto plano en este documento, WED-03) y evita ensanchar el contrato de §4 por un enlace de cortesía. **Dos bugs reales de WED-32 encontrados y corregidos al usar sus componentes en un navegador real por primera vez** (ninguno se detectaba con Vitest+jsdom): `Select` no estaba en `React.forwardRef`, así que `register()` de React Hook Form nunca alcanzaba el `<select>` real (mismo defecto que ya se había corregido en `Input`/`Button`/`Dialog` del admin en WED-80/82, predicho explícitamente en la nota de ese ticket); y `Modal` no centraba — Tailwind Preflight resetea `margin: 0` globalmente, pisando el `margin: auto` con el que el navegador centra un `<dialog>` nativo, así que el modal de confirmación aparecía pegado a la esquina superior izquierda en vez de centrado. Corregido con `m-auto` en la clase del `<dialog>`. **Pendiente real, mismo criterio que el resto del backlog:** WED-71 pide probar el flujo completo en un teléfono real (iOS Safari en particular, por el gesto directo que exige abrir `wa.me` sin bloqueo de popup) — no verificable en este entorno. **Hallazgo documentado en §5 antes de este ticket, resuelto en un ticket de correcciones visuales posterior (2026-09-21):** el botón "Confirmar" usaba `Button` variant `primary` (`bg-surface-sage`/`text-on-sage`), la combinación que daba 3.42:1 de contraste — no alcanzaba AA para texto normal, y el botón no era lo bastante grande para calificar como "texto grande". Se agregó la variant `dark` a `Button` (`bg-surface-dark`/`text-on-dark`, ~6:1, ya usada por `Select`) y el botón "Confirmar" de `RsvpForm` pasó a usarla — mismo tono más oscuro que ya traía el picker de cantidad, ahora consistentes entre sí y con AA cubierto. El enlace de contacto por WhatsApp del estado "ya confirmado" (`RsvpFormCard`) sigue en `bg-surface-sage`/`text-on-sage` sin tocar, fuera del alcance de ese ticket. **Bug real encontrado el mismo día, mismo patrón en dos lugares:** las imágenes que necesitan sangrar hasta el borde real de la columna de 432px (no solo hasta el borde del padding de `Section`) usan la clase `-mx-6 w-[calc(100%+3rem)]`, pero Tailwind Preflight aplica `img, video { max-width: 100% }`, que recorta ese ancho de vuelta al 100% del contenedor con padding — anulando la sangría en silencio, sin error visual obvio salvo que el elemento queda pegado a un lado en vez de centrado. `ReminderIllustration` (`RsvpSection.tsx`) ya traía el `max-w-none` que neutraliza esa regla; el collage de `AboutUsSection` no lo tenía (por eso se veía descentrado, pegado a la izquierda con un hueco a la derecha) y se corrigió agregándolo. Los encabezados "Mujeres"/"Hombres" de `DressCodeSection` tenían el mismo síntoma pero por otra causa: las flores de esquina (`absolute left-0`/`right-0`) vivían dentro de un contenedor sin sangrar, así que quedaban pegadas al borde del padding (24px adentro del borde real) en vez de al borde real de la columna — se corrigió sangrando ese contenedor con el mismo patrón `-mx-6 w-[calc(100%+3rem)]` (sin necesitar `max-w-none`, porque ahí el ancho de las flores es un porcentaje del contenedor, no un intento de excederlo). **Fondo del formulario, 2026-09-21 — pedido explícito del usuario con el hex exacto:** el `<form>` de `RsvpFormFields` (label + `Select` + botón "Confirmar") pasó a llevar su propio panel — `rounded-invitation-sm bg-surface-form px-6 py-6` — para separarse visualmente del marco floral de fondo. Nuevo token `--color-surface-form: #F1CA9E` en `tokens.css` (y su reafirmación bajo `prefers-color-scheme: dark`, como el resto de la paleta); es un tono aparte de `--surface-muted` (`#EBC9A0`, muy cercano pero no idéntico), no una sustitución de ese token en otros usos. `--text-body` sobre `--surface-form` da ~5.6:1, pasa AA sin ajustes adicionales. **WED-62 (animaciones de entrada por sección) completa en código, 2026-09-19** — primera integración real de Framer Motion en el repo (`framer-motion@11.15.0` era dependencia desde antes pero no se usaba en ningún lado). Se activó el primitivo `Section` (`src/components/ui/Section.tsx`), que existía sin uso desde antes y ya replicaba exactamente la clase compartida (`w-full px-6 py-10 [...]`) que `DateSection`/`AboutUsSection`/`VenueSection`/`TimelineSection`/`DressCodeSection`/`RsvpSection` traían duplicada inline — en vez de crear un wrapper nuevo, se le agregó la animación ahí y esas seis secciones pasaron a usarlo. Usa los hooks propios de Framer Motion (`useInView`, `useReducedMotion`) en vez de reimplementar `IntersectionObserver`/`matchMedia` a mano; `LazyMotion`+`m` (mandado por la tabla de arquitectura) envuelve el `<main>` en `InvitationPage` y en `devPreview.tsx`, no la app entera, para no meter el bundle de animación en el chunk de `/admin`. **`CoverSection` queda deliberadamente afuera de la animación**: contiene la imagen LCP (`loading="eager"`) y es lo primero visible al abrir el sobre — animarla con opacity inicial en 0 arriesgaba la medición de LCP que WED-52 ya dejó pendiente. **Bajo `prefers-reduced-motion` no hay una rama de código separada**: la variante "hidden" pasa a tener los mismos valores que "visible" (`opacity:1`, sin offset), así que no hay nada perceptible que animar, en vez de condicionar el árbol de componentes. **Hallazgo real de testing, no de producto:** `useReducedMotion()` de Framer Motion lee `matchMedia` una sola vez por proceso de módulo (guardado en un singleton interno de la librería, no reactivo pese a lo que dice su propio docstring) — stubear `matchMedia` en un test que corre después de que cualquier otro `Section` ya se montó en el mismo archivo no tiene efecto. Por eso el caso de `prefers-reduced-motion` vive en su propio archivo (`Section.reducedMotion.test.tsx`), no junto a los demás casos de `Section.test.tsx`. También se agregó un mock mínimo de `IntersectionObserver` a `src/testSetup.ts` (jsdom no trae uno) que por defecto marca todo como ya intersectado, para no romper en cascada los tests existentes de las seis secciones que nunca lo necesitaron. **Pendiente real, mismo criterio que el resto del backlog:** fluidez/jank en Android gama media e iOS Safari reales no es verificable en este entorno. **WED-60 (animación de apertura del sobre) completa, 2026-09-19, y WED-63 (transición de dígitos) parcial completa el mismo día — a pedido directo del usuario, que descartó explícitamente el resto de WED-63 (abanico del collage, latido del corazón del calendario, dibujado del timeline) por tratarse ya de imágenes estáticas planas (WED-54/55/57), sin especificación de animación pendiente ni ambigüedad que resolver.** WED-60 no tenía la especificación de animación que pedía ADR-009 (seguía sin existir en Figma); el usuario delegó la decisión creativa completa en vez de esperar al diseñador. Secuencia elegida (`src/hooks/useEnvelopeOpenAnimation.ts`, ~1.4 s, dentro de la banda 1.2–2 s del AC): el sello se encoge-rota-desvanece primero (0–0.4 s, "se rompe"), las dos hojas existentes (`Capa 1`/`Group 2` de ADR-009, ya construidas como dos `<span>` con la misma textura) giran hacia afuera en `rotateY` con `perspective`/`backface-visibility:hidden` como puertas francesas (0.15–1.15 s), y el sobre completo se desvanece con un leve `scale` al final (1–1.4 s) — solo `transform`/`opacity` en los tres, como exige el AC. `onOpen` (que desmonta el sobre y le da foco al contenido) se dispara recién cuando termina toda la secuencia, no al tocar — nuevo, con guarda contra doble tap (`disabled`/`aria-busy` mientras `isOpening`). Bajo `prefers-reduced-motion` colapsa a un fundido simple de 0.3 s, tal como pide el AC literalmente. **Verificado visualmente de verdad, no solo con tests**: como el navegador no expone forma de pausar un `setTimeout` en JS (solo animaciones CSS/WAAPI vía `document.getAnimations()`), y parchear `window.setTimeout` globalmente para congelarlo rompió el cliente de Vite (HMR entró en un ciclo de reconexión), la única forma limpia de observar la secuencia completa fue multiplicar las constantes de duración ×8 temporalmente, mirarla fotograma a fotograma en el navegador real, y revertir el cambio antes de commitear — el efecto de "puertas francesas" con profundidad 3D real fue confirmado así. La transición de dígitos del contador (`CountdownCard.tsx`) usa `AnimatePresence`+`m.p` con `key` por valor formateado (todo el número de 2 dígitos como una unidad, no dígito por dígito): el anterior sube y se desvanece mientras el nuevo entra desde abajo, 0.35 s, también apagado bajo `prefers-reduced-motion`. Mismo hallazgo del singleton de `useReducedMotion` que en WED-62: los tests de "reduced motion" de `EnvelopeGate` y `CountdownCard` viven cada uno en su propio archivo (`*.reducedMotion.test.tsx`). **Entrada suave del contenido tras abrir el sobre, 2026-09-20 — pedido explícito del usuario, sin tocar nada de `EnvelopeGate.tsx`/`useEnvelopeOpenAnimation.ts`.** `InvitationPage.tsx` (`InvitationContent`) envuelve `<main>` en `m.main` con un leve `translateY`(20px→0)+`scale`(0.985→1) en 0.7 s al pasar `isOpen` a `true` — sin animar `opacity`, a propósito, para no alterar el crossfade que ya se ve detrás del sobre mientras este se desvanece (esa opacidad la sigue manejando por completo `EnvelopeGate`). **Hallazgo real de Framer Motion, costó una sesión de debugging aislarlo:** pasar un objetivo crudo a `animate` (`animate={{ y: isOpen ? 0 : 20, ... }}`) sin `initial`, o con un `initial` que sea un objeto nuevo en cada render, dejaba la transición completamente inerte pese a que el prop cambiaba correctamente (confirmado con `useState` + indicador visible, sin ninguna duda) — la única combinación que funciona es la que ya usa `Section.tsx`: un objeto `variants` con las claves `hidden`/`visible` y `initial`/`animate` como los STRINGS `"hidden"`/`"visible"` (no objetos). **Segundo hallazgo, esta vez del entorno de prueba, no del código:** gran parte de esta sesión de debugging se gastó persiguiendo un fantasma — con la pestaña de Chrome en segundo plano (`document.visibilityState === "hidden"`), Chrome deja de disparar `requestAnimationFrame`, así que cualquier verificación hecha solo con `javascript_exec` (sin una captura de pantalla real de por medio, que fuerza un render) ve la animación "congelada" para siempre aunque el código esté perfecto — confirmado forzando un screenshot a mitad de prueba y viendo el valor de `transform` avanzar. La lección: para verificar visualmente una transición JS real en este entorno, hay que intercalar capturas de pantalla reales (como ya se hacía para el sobre), nunca confiar en un `getAttribute('style')` leído solo por `javascript_exec` para juzgar si algo "no anima". **WED-61 (`MusicToggle` y pista musical) completo, 2026-09-22 — interacción especificada a pedido directo del usuario, sin ambigüedad delegada.** Pista real: `Can_t_Help_Falling_In_Love.mp3` (4.27 MB, provista por el usuario), copiada tal cual a `public/audio/background-music.mp3` — **excede el presupuesto de <3 MB de WED-04/WED-91**; no hay herramienta de recorte/reencode de audio disponible en este entorno (no hay `ffmpeg` instalado), así que el recorte a bucle y la compresión de peso quedan pendientes como parte de WED-04/WED-91, no de este ticket. El disco es el nodo `Vinyl Record` (`191:31`) del Figma v2 (ver ADR-008), exportado como SVG. **Interacción implementada, más simple que la redacción original de este documento (reemplazada a pedido explícito del usuario):** al tocar el sobre, `EnvelopeGate` llama a `onTap` de forma síncrona dentro del propio handler de click (antes de `animation.handleClick()`, no en un `useEffect`) — ese `onTap` es `play()` de `useBackgroundMusic`, así que `audio.play()` se invoca en el mismo gesto de usuario que abre el sobre, igual que exigía la redacción anterior de WED-61. `MusicToggle` en sí (el `<button>` visible, con el disco) solo se monta cuando `isOpen` es `true` — el elemento `<audio>` vive montado desde antes (siempre), así que el audio ya suena cuando el disco aparece, ya girando. Un solo click alterna `play()`/`pause()`; como el audio nativo conserva `currentTime` al pausar, reanuda exactamente donde se dejó sin código adicional — no se implementó `sessionStorage` (la redacción original lo pedía; el usuario no lo pidió y no hay recarga de página que lo justifique en este flujo). El volumen no se toca en código (ni un slider ni `audio.volume`): lo controla el dispositivo, tal como pidió el usuario. Gira con una animación CSS propia (`--animate-spin-slow: spin 4s linear infinite` en `tokens.css`, no el `animate-spin` por defecto de Tailwind, mucho más rápido) aplicada condicionalmente con la variante `motion-safe:`, así que respeta `prefers-reduced-motion` sin JS adicional. Posición `fixed top-4 left-4 z-40` — encima del contenido pero debajo del sobre (`z-50`), así que durante la animación de apertura el disco existe en el DOM pero permanece oculto detrás del sobre hasta que este se desvanece, sin quedar como un elemento enfocable-mientras-oculto (el botón del sobre se `disabled` durante la apertura, pero `MusicToggle` todavía no está montado en ese momento). **Hallazgo real de testing:** jsdom no implementa `HTMLMediaElement.play()`/`pause()` (lanzan "not implemented"); se añadió un mock mínimo a `src/testSetup.ts` (`play` resuelve una promesa, `pause` no hace nada), mismo patrón que el mock de `IntersectionObserver` ya existente ahí. **Pendiente real, mismo criterio que el resto del backlog:** probar en el navegador interno de WhatsApp y en iOS Safari real (política de autoplay) no es verificable en este entorno — verificado en cambio con Chrome real vía automatización de navegador (tap abre el sobre y reproduce, un click pausa conservando la posición, un segundo click reanuda exactamente ahí, el disco permanece fijo en la esquina superior izquierda al hacer scroll). **Corrección real de WED-61, 2026-09-22, mismo día — pedido explícito del usuario.** El giro del disco (`MusicToggle.tsx`) tenía un bug real: la clase `motion-safe:animate-spin-slow` se agregaba y quitaba según `isPlaying`, así que al pausar la animación CSS se removía por completo y el navegador repintaba el `<img>` en su ángulo de reposo (0°) en vez de congelarlo donde iba — al reanudar, el giro arrancaba de cero, no desde donde se había dejado. Corregido dejando la clase de animación aplicada siempre y alternando solo `style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}`: `animation-play-state: paused` congela el `transform` calculado en ese instante en vez de resetearlo. Se agregó además un drop-shadow permanente al ícono (no condicionado a hover/estado) para reforzar que es interactuable, a pedido del usuario — **segundo bug real encontrado al verificar en el navegador con el sistema en modo oscuro:** la utilidad `drop-shadow-sm` de Tailwind vive en `@layer utilities`, y `tokens.css` ya tenía una regla sin capa (`img { filter: none; }`, ver la Nota permanente de UI de §5) que reafirma bajo `prefers-color-scheme: dark` para evitar que Android/Samsung Internet recoloreen imágenes — por spec de CSS Cascade Layers, cualquier regla sin `@layer` gana siempre sobre una regla dentro de una capa, sin importar especificidad ni orden, así que esa reafirmación anulaba en silencio el `filter: drop-shadow(...)` de la clase de Tailwind en cualquier dispositivo con modo oscuro activo a nivel de SO (no hacía falta que la app tuviera modo oscuro propio para que el bug apareciera). Corregido aplicando el drop-shadow como `style` inline en vez de clase: un estilo en el atributo `style` gana sobre cualquier regla de hoja de estilos, esté o no en una capa. Verificado apagando y encendiendo el bug a propósito con el sistema en modo oscuro real (no simulado). **WED-70/71, mensaje de confirmación reescrito por completo, 2026-09-22 — pedido explícito del usuario con el texto exacto (plantilla con emojis, sin nombre ni cantidad del invitado).** El mensaje ya no se arma en el servidor: como el nuevo texto es genérico (mismo saludo para cualquier invitado, sin `firstName`/`lastName`/`count`), se retiró `waLink` del contrato de `POST /api/rsvp` (ver §4) junto con todo el código que solo existía para construirlo — `api/_lib/whatsapp.ts` y `src/content/whatsapp.ts` (con sus tests) se eliminaron por completo, y `BRIDE_WHATSAPP` se retiró de §3 (ver esa nota). En su lugar, `RsvpSuccessModal` ahora ofrece **dos** botones de WhatsApp construidos enteramente en el cliente (`src/content/rsvp.ts`: `groomConfirmationWhatsAppLink`/`brideConfirmationWhatsAppLink`), uno por cada novio, mismo patrón ya sentado por el enlace de "ya confirmado" y el de la pregunta pre-confirmación — cada uno saluda por nombre completo (`Fredy Molina` / `Fatima Peña`, tal como los dictó el usuario, sin la tilde de "Fátima" que sí usa el resto de este documento; se mantuvo literal a pedido) según el botón que el invitado toque. **WED-34, plantilla de invitación por WhatsApp reescrita, 2026-09-22 — mismo pedido, texto exacto con `{Nombre} y {Apellido}`, saltos de línea y emojis dados por el usuario.** `buildGuestInviteMessage` (`src/content/adminGuestInvite.ts`) ahora recibe también `lastName` y `guestLimit` (antes solo `firstName`+enlace) y arma el mensaje multilínea completo, con pluralización real ("lugar reservado" / "lugares reservados", mismo patrón que `formatPeopleLabel` de `rsvp.ts`) y degradación a solo `firstName!` cuando no hay apellido. **Una corrección de contenido, no de código:** el texto dictado decía "lugar/lugares reservado/reservador" — "reservador" es un sustantivo distinto ("el que reserva"), no el plural de "reservado"; se implementó como "reservados" (concordancia correcta) en vez de tomarlo literal, a diferencia del resto de la plantilla que sí se copió tal cual (incluyendo "Sera" sin tilde). **Bug real de raíz encontrado el mismo día, 2026-09-22, tras dos intentos fallidos.** El usuario reportó que los emoji de ambos mensajes de WhatsApp llegaban como un rombo con signo de interrogación. Un primer intento (cambiar 🤩/🥳/🤍/🫶🏻 por emoji "más viejos" asumiendo un problema de fuente/versión de Unicode) no lo arregló — el usuario lo confirmó probando de nuevo. Diagnóstico correcto en el segundo intento, con el usuario pasando el texto roto tal cual le llegó: **el rombo con "?" es el carácter de reemplazo Unicode (U+FFFD, `�`), la señal de una decodificación fallida, no de una fuente sin ese glifo** (eso se ve distinto — un cuadro vacío o con el código en hex adentro). Aislado con `curl` puro, sin navegador ni código del proyecto de por medio: `wa.me` (y también `api.whatsapp.com/send` directo, sin pasar por `wa.me`) reemplazan cualquier carácter Unicode de categoría "Símbolo" — o sea, cualquier emoji, sin importar cuál ni qué tan antiguo (se probó ✨☺️ del set original de 2010 y falla igual que 🫶🏻 de 2022) — por `%EF%BF%BD` en el `Location` de la redirección, mientras que letras, acentos, ñ, ¡¿ y puntuación normal (probado con cirílico y guion largo "—") pasan intactos. Es un filtro del lado de servidor de Meta, no relacionado con codificación, fuentes, ni con nada de este código — ver la nota permanente agregada junto a ADR-003. Con eso confirmado, la única corrección real posible era quitar los emoji de ambos mensajes (`buildConfirmationMessage` en `rsvp.ts`, `buildGuestInviteMessage` en `adminGuestInvite.ts`), ajustando la puntuación donde el emoji cerraba la oración. Verificado de nuevo con `curl` contra el `wa.me` real tras el cambio: el mensaje de confirmación ya sobrevive la redirección byte por byte, sin ningún `%EF%BF%BD`. **Ajustes de UX de botones en modales, 2026-09-22, mismo día — pedido explícito del usuario.** `RsvpSuccessModal` ya tenía los tres botones (Fredy/Fátima/Cerrar) desde el cambio anterior; lo que faltaba era el ancho: el contenedor usaba `items-center` en un `flex-col`, así que cada botón se encogía a su propio contenido (el de "Fátima" quedaba visiblemente más angosto que el de "Fredy" por tener menos texto). Quitar `items-center` basta — el `stretch` por defecto de `align-items` hace que los tres ocupen el 100% del ancho del diálogo sin necesitar clases adicionales. `RsvpConfirmModal` (Cancelar/Confirmar, en fila) tenía el problema inverso: `justify-end` los pegaba a la derecha en vez de centrarlos, y no había nada igualando su ancho. Cambiado a `justify-center` + `flex-1` en ambos botones, mismo resultado (ancho igual) pero en el eje horizontal en vez del vertical. Se replicó el mismo patrón (`flex-1`/`justify-center`) en el modal de ejemplo de `/styleguide` para que la documentación del componente `Modal` no quede desactualizada respecto al uso real. **Verificación del disco (`vinyl-record.svg`), a pedido del usuario ("¿PNG o SVG para mantener la transparencia?"):** se confirmó con un canvas offscreen (`drawImage`+`getImageData`) que las cuatro esquinas del icono dan alpha `0` y el centro alpha `255` — la transparencia es correcta, y SVG sigue siendo la opción correcta (no PNG): es vectorial, no pixela ni se difumina al girar o escalar a distintos DPI, y pesa ~1.3 KB contra los ~14 KB del PNG exportado a 2×. Verificado también visualmente montado sobre el fondo oscuro del calendario (`marco-de-contador`/`calendario-con-fecha`) para descartar un halo o caja cuadrada alrededor del círculo — no aparece ninguno. **El enlace "Escribir al novio por WhatsApp" se retiró de `RsvpConfirmModal`, 2026-09-22, mismo día — pedido explícito del usuario ("no debe ir bajo ningún motivo" en esa alerta).** Vivía ahí desde el primer pedido de este mismo día (antes de que `RsvpSuccessModal` tuviera sus propios botones de Fredy/Fátima); una vez ese modal quedó cubierto, el enlace en `RsvpConfirmModal` quedó duplicado y en el lugar equivocado — el usuario pidió moverlo, pero como el destino correcto (`RsvpSuccessModal`) ya lo tenía desde el cambio de WED-70/71 de este mismo día, la acción real fue solo eliminarlo de `RsvpConfirmModal` (`groomWhatsAppLink`, `RSVP_QUESTION_MESSAGE` y `contactGroomLabel` en `src/content/rsvp.ts`, código muerto tras el retiro, eliminados también). **Migración de tests a `tests/`, 2026-09-22, mismo día — pedido explícito del usuario (no le gusta que los tests convivan con el código fuente).** Los 100 archivos `*.test.ts(x)` que vivían junto a sus fuentes se movieron a `tests/`, replicando el mismo path relativo (`src/…` → `tests/src/…`, `api/…` → `tests/api/…`, `scripts/…` → `tests/scripts/…`); `src/testSetup.ts` pasó a `tests/setup.ts`. La mayoría de los tests de `src/` no necesitó tocar imports (usan el alias `@/`, que resuelve por `baseUrl`/`paths` de `tsconfig`, no por la ubicación física del archivo que importa). Los de `api/`+`scripts/` sí usan imports relativos (`./_lib/guests`, `./rsvp`, etc., sin alias en esas carpetas) — se recalcularon con un script puntual (no versionado) que resuelve cada especificador contra el directorio original y lo reescribe relativo a la nueva ubicación; 3 tests de `src/` (`content/adminGuestInvite`, `lib/normalizeForSearch`, `schemas/guest`) tenían un import relativo a su propio archivo hermano y se pasaron a `@/…` en vez de arrastrar una ruta relativa larga, por consistencia con el resto. **Piezas de configuración que hubo que mover junto con los archivos, no solo los tests:** `vitest.config.ts` (`setupFiles` apunta a `tests/setup.ts`; se quitó `src/testSetup.ts` del `exclude` de cobertura, que ya no existe ahí), `tsconfig.app.json` (se agregó `"tests"` a `include`, si no `tsc -b` deja de tipar los tests en silencio), y `scripts/countEslintDisables.ts` (se agregaron los globs `tests/**/*.ts(x)` para que el presupuesto de supresiones siga contando lo que haya ahí). **El hallazgo real, no obvio de antemano:** varios bloques de `eslint.config.ts` restringen reglas por `files: ['src/**/*.{ts,tsx}']` (o subrutas más específicas como `src/components/ui/**`/`src/components/admin/**`) — entre ellas las reglas de `no-restricted-imports` que hacen cumplir ADR-001 (nada de `firebase/firestore` fuera de `api/`) y ADR-010 (la invitación y el admin no comparten componentes). Como esos globs apuntan a `src/**`, un test movido a `tests/src/**` deja de coincidir y esas reglas simplemente no se aplican ahí — un test podría importar `firebase-admin` o cruzar la frontera invitación/admin sin que lint lo marque, silenciosamente. Se corrigió agregando el glob espejo `tests/src/**/*.{ts,tsx}` (con sus `ignores` y sub-bloques de `ui`/`admin`/`admin/primitives`) a cada bloque afectado, y `tests/scripts/**/*.ts` al bloque de relajaciones de `scripts/`. **Verificado con la suite completa, no solo con el bloque de tests movidos:** `tsc -b --noEmit`, `eslint . --max-warnings 0`, `vitest run` (481/481) y `vitest run --coverage` (mismos porcentajes que antes de mover nada, ver §9) — una falla puntual de un test de animación bajo `--coverage` en dos corridas distintas (primero `EnvelopeGate.reducedMotion`, luego `Section`) resultó ser un timeout por carga de CPU de la instrumentación de cobertura, no una regresión de la migración: una tercera corrida sin cambios pasó completa. **Bug real reportado por el usuario, 2026-09-22, mismo día — "los emojis no se ven al mandar por WhatsApp".** Descartado un bug de codificación: la URL de `wa.me` viaja con los emojis intactos (verificado el round-trip `encodeURIComponent`/`decodeURIComponent` byte a byte) y todos renderizan bien en un Chrome cualquiera. El usuario confirmó el síntoma real — un cuadro/signo de interrogación (el "tofu" clásico de una fuente sin ese glifo) — probando desde WhatsApp Web/Desktop, en ambos mensajes (invitación y confirmación). Causa real: varios de los emoji elegidos eran relativamente recientes en el estándar Unicode (🤩 Star-Struck y 🥳 Partying Face, Unicode 11.0/2018; 🤍 White Heart, Unicode 12.0/2019; 🫶🏻 Heart Hands, Unicode 14.0/2022) o compuestos con modificador de tono de piel (👋🏼, 🫶🏻) — WhatsApp Web/Desktop usa su propio set de arte de emoji, más lento en actualizarse que el emoji del sistema operativo, así que un glifo puede faltar ahí aunque el mismo emoji se vea perfecto en un navegador normal. Reemplazados por el set "clásico" de emoji (todos Unicode 6.0/2010 o anteriores, ninguno con modificador de tono): en `src/content/rsvp.ts` (`buildConfirmationMessage`) 👋🏼→👋, 🤩→😍, 🫶🏻→💕, 🥳→🎉 (☺️ se mantuvo, es de 1993); en `src/content/adminGuestInvite.ts` (`buildGuestInviteMessage`) 🤍→❤️ en sus dos apariciones (✨ se mantuvo, también es del set original). El contenido/estructura del mensaje no cambió, solo esos glifos puntuales — verificado que el nuevo set son justamente los primeros emoji que existieron, con soporte universal garantizado en cualquier versión de cualquier app. **Fix real y definitivo, mismo día, 2026-09-22 — el usuario aportó la fuente correcta (una respuesta de Stack Overflow) tras dos intentos fallidos previos de este documento (cambiar de emoji, y luego quitarlos).** La respuesta más votada de https://stackoverflow.com/questions/64215662/whatsapp-click-to-chat-with-emojis (Panda Sean, 16 votos, con un comentario confirmando que funciona) señala exactamente la causa: no es que Meta bloquee los emoji en general, es que **`wa.me` específicamente los corrompe al redirigir a `api.whatsapp.com/send/`** — yendo directo a `api.whatsapp.com/send/?phone=…&text=…` sin pasar por `wa.me`, ese salto de redirección nunca ocurre y el emoji llega intacto. **Verificado end-to-end, no solo tomando la palabra de la respuesta:** con `curl` puro, `api.whatsapp.com/send/` directo no emite ningún redirect (200 OK inmediato); inspeccionando el HTML de esa respuesta, el enlace real `https://web.whatsapp.com/send/?phone=…&text=…` — el que efectivamente abre WhatsApp Web al hacer clic en "Continuar en WhatsApp Web" — trae los bytes del emoji sin tocar (`%F0%9F%91%8B%F0%9F%8F%BC` tal cual, no `%EF%BF%BD`). La corrupción que se veía en las dos vueltas anteriores era real, pero de un lugar equivocado: la burbuja de vista previa que la propia página de `api.whatsapp.com/send/` dibuja para sí misma (decorativa, server-rendered) sigue mostrando `�` — es un bug cosmético de esa vista previa nada más, no del enlace que efectivamente recibe WhatsApp; confundir esa vista previa con el resultado real fue lo que llevó a la conclusión (incorrecta) de la vuelta anterior de que ningún emoji sobrevivía por ningún camino. **Corregido:** nuevo helper `buildWhatsAppDeepLink(phone, message)` en `src/content/rsvp.ts` (usado por `brideWhatsAppLink`, `groomConfirmationWhatsAppLink`, `brideConfirmationWhatsAppLink`) y `buildGuestWhatsAppLink` en `buildGuestInviteLink.ts`, ambos ahora arman `https://api.whatsapp.com/send/?phone=…&text=…` en vez de `https://wa.me/…?text=…`. Los emoji originales que el usuario dictó la primera vez (👋🏼 ☺️ 🤩 🫶🏻 🥳 en la confirmación; ✨☺️ 🤍 🤍 ✨ en la invitación) quedaron restaurados tal cual — ninguno de los dos intentos anteriores de cambiarlos o quitarlos era necesario. Ver la nota permanente junto a ADR-003, corregida para reflejar esto (ya no dice que ningún host evita el problema).

### Abiertos

#### E0 — Descubrimiento

- **WED-01** Activos finales (fotos, texturas, ornamentos, iconos) aprobados por los novios.
- **WED-02** Auditoría de Figma — solo queda pendiente la especificación de la animación de apertura del sobre (no está en el archivo).
- **WED-03** Verificar enlaces de Google Maps/Waze y `api.whatsapp.com/send/?phone=50376982534` desde un teléfono.
- **WED-04** Pista musical: elegida, aprobada, derechos documentados, MP3 <3MB recortado en bucle, no en la carga inicial.

#### E3 — Design System

- **WED-34** Contenido desacoplado a `src/content/`: textos, itinerario, dirección, URLs de mapas, fecha, mensajes de error del RSVP (con el texto literal de R2) — claves en inglés, valores en español. Build falla si falta un campo obligatorio.

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

En orden: WED-63 (animaciones de detalle), WED-110. El sitio funciona sin ambas. (WED-61 ya no aplica aquí: quedó implementado — ver Cerrados.)

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

**Los tests viven en `tests/`, nunca junto al código fuente (a pedido explícito del usuario, 2026-09-22).** `tests/` replica la estructura de `src/`, `api/` y `scripts/` con el mismo path relativo (ej. `src/components/ui/Button.tsx` → `tests/src/components/ui/Button.test.tsx`; `api/rsvp.ts` → `tests/api/rsvp.test.ts`). El setup global vive en `tests/setup.ts` (antes `src/testSetup.ts`), referenciado desde `vitest.config.ts`. Un test nuevo para un archivo de `src/`/`api`/`scripts` se crea directamente en su ruta espejo bajo `tests/`, no al lado del archivo que prueba.
