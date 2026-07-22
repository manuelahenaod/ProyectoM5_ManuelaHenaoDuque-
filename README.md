# GitHub MCP Server (`github-mcp-server`)

Servidor de **Model Context Protocol (MCP)** desarrollado en TypeScript/Node.js que expone herramientas avanzadas de la API REST de GitHub para ser utilizadas por Agentes de Inteligencia Artificial (como Antigravity, Claude, ChatGPT) mediante interacción en lenguaje natural por Entrada/Salida Estándar (stdio).

---

## 💡 ¿Por qué es útil? (Casos de Uso)

Este servidor MCP permite delegar la interacción con GitHub a un Agente de IA de forma autónoma. Algunos casos de uso comunes son:

1. **Creación rápida de issues desde la conversación:** Si el Agente de IA detecta un error o propone una mejora durante el chat, puede abrir un issue en GitHub inmediatamente sin que tengas que salir de tu entorno.
2. **Commit de código sugerido por la IA:** Tras refactorizar o escribir una nueva función, el Agente puede crear o modificar el archivo correspondiente en una rama específica y hacer el commit de forma directa.
3. **Auditoría e inspección de tareas:** El Agente puede listar issues abiertos, comentar en ellos pidiendo o dando detalles, y cerrarlos una vez resueltos.
4. **Automatización de setup de proyectos:** Puedes indicarle al Agente: *"Crea un nuevo repositorio privado llamado `mi-app`, crea etiquetas para prioridad-alta y agrega un README inicial con un commit"*, y el Agente completará toda la secuencia utilizando este servidor de forma encadenada.

---

## 📐 Arquitectura del Sistema

El servidor opera mediante el transporte de **Entrada/Salida Estándar (stdio)**, permitiendo una integración transparente y segura con clientes MCP.

```
┌─────────────────────────────────────────────────────────────┐
│                    Cliente MCP (Host)                       │
│             (ej. Antigravity / Claude Desktop)              │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prompts / Respuestas
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Modelo de Lenguaje (LLM)                 │
│         (Decide qué herramienta usar leyendo descripciones)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mensajes JSON-RPC (stdio)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     GitHub MCP Server                       │
│ ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐ │
│ │  index.ts    │──►│  Tools (Zod) │──►│ GithubClient (TS) │ │
│ └──────────────┘   └──────────────┘   └─────────┬─────────┘ │
└─────────────────────────────────────────────────┼───────────┘
                                                  │ HTTPS (Octokit)
                                                  ▼
                               ┌──────────────────────────────┐
                               │       GitHub REST API        │
                               └──────────────────────────────┘
```

### 🧩 Separación de Capas (Responsabilidad Única)

- **`src/index.ts`**: Entry point del servidor MCP. Inicializa `McpServer`, registra todas las herramientas y establece el transporte `stdio`.
- **`src/tools/github/`**: Definición y handlers de las herramientas MCP. Maneja la interacción entre el servidor y el cliente.
- **`src/schemas/github.ts`**: Esquemas de **Zod** para la validación estricta en runtime de inputs y la inferencia de tipos TypeScript.
- **`src/clients/github/`**: 
  - `client.ts`: Métodos de alto nivel (`listRepositories`, `createRepository`, `createIssue`, `listIssues`, `createFile`, `addCommentToIssue`, `closeIssue`, `createLabel`).
  - `request.ts`: Wrapper para solicitudes HTTP con **exponential backoff** y manejo automático de **Rate Limits**.
  - `errors.ts`: Jerarquía custom de errores (`GitHubAuthError`, `GitHubNotFoundError`, `GitHubRateLimitError`, etc.).
  - `octokit.ts`: Instanciador autenticado de `@octokit/rest`.
- **`src/config/env.ts`**: Carga y validación estricta de variables de entorno al iniciar.

---

## 🛠️ Herramientas Registradas (MCP Tools)

El servidor expone **8 herramientas**:

### 1. `list_repositories`
Lista los repositorios del usuario autenticado en GitHub.
- **Parámetros**:
  - `type` (`"all"` \| `"public"` \| `"private"`, opcional, por defecto: `"all"`): Filtro de visibilidad.
  - `sort` (`"created"` \| `"updated"` \| `"pushed"` \| `"full_name"`, opcional, por defecto: `"updated"`): Criterio de ordenamiento.
  - `per_page` (`number`, opcional, 1-100, por defecto: `30`): Cantidad de resultados por página.
- **Ejemplo de Prompt**:
  > *"Muéstrame mis repositorios públicos más recientemente actualizados."*

### 2. `create_repository`
Crea un nuevo repositorio en la cuenta de GitHub autenticada.
- **Parámetros**:
  - `name` (`string`, **requerido**, 1-100 caracteres, regex `/^[a-zA-Z0-9_.-]+$/`): Nombre del repositorio.
  - `description` (`string`, opcional): Descripción breve del proyecto.
  - `private` (`boolean`, opcional, por defecto: `false`): Visibilidad del repositorio.
- **Ejemplo de Prompt**:
  > *"Crea un repositorio privado llamado `proyecto-mcp-demo` con la descripción 'Servidor MCP de prueba'."*

### 3. `create_issue`
Abre un nuevo issue en el repositorio especificado.
- **Parámetros**:
  - `owner` (`string`, **requerido**): Dueño del repositorio (usuario o grupo).
  - `repo` (`string`, **requerido**): Nombre del repositorio.
  - `title` (`string`, **requerido**, mín 3 caracteres): Título descriptivo del issue.
  - `body` (`string`, opcional): Detalle o contenido en formato Markdown.
- **Ejemplo de Prompt**:
  > *"Abre un issue en el repo `manuelahenaod/ProyectoM5` con el título 'Fix login bug' y detalle 'El formulario no valida el email'."*

### 4. `list_issues`
Lista los issues abiertos de un repositorio.
- **Parámetros**:
  - `owner` (`string`, **requerido**): Dueño del repositorio.
  - `repo` (`string`, **requerido**): Nombre del repositorio.
- **Ejemplo de Prompt**:
  > *"¿Cuáles son los issues abiertos actualmente en el repositorio `facebook/react`?"*

### 5. `create_file`
Crea o reemplaza un archivo realizando un commit directo a una rama usando la Git Low-Level API (Blob → Tree → Commit → Ref Update).
- **Parámetros**:
  - `owner` (`string`, **requerido**): Usuario u organización dueña.
  - `repo` (`string`, **requerido**): Nombre del repositorio.
  - `path` (`string`, **requerido**): Ruta relativa del archivo (ej. `src/utils/math.ts`).
  - `content` (`string`, **requerido**): Contenido completo del archivo en UTF-8.
  - `message` (`string`, **requerido**): Mensaje descriptivo del commit.
  - `branch` (`string`, opcional, por defecto: `"main"`): Rama destino.
- **Ejemplo de Prompt**:
  > *"Agrega un archivo `README.md` en el repositorio `mi-usuario/demo` con el texto '# Mi Proyecto' y el commit 'docs: add readme'."*

### 6. `add_comment_to_issue`
Agrega un comentario a un issue existente en un repositorio de GitHub.
- **Parámetros**:
  - `owner` (`string`, **requerido**): Dueño del repositorio.
  - `repo` (`string`, **requerido**): Nombre del repositorio.
  - `number` (`number`, **requerido**): Número del issue a comentar.
  - `body` (`string`, **requerido**): Contenido en Markdown del comentario.
- **Ejemplo de Prompt**:
  > *"Comenta en el issue #42 del repositorio `mi-usuario/proyecto-demo` diciendo 'He revisado el bug y ya está solucionado'."*

### 7. `close_issue`
Cierra un issue específico en un repositorio de GitHub.
- **Parámetros**:
  - `owner` (`string`, **requerido**): Dueño del repositorio.
  - `repo` (`string`, **requerido**): Nombre del repositorio.
  - `number` (`number`, **requerido**): Número del issue a cerrar.
- **Ejemplo de Prompt**:
  > *"Cierra el issue #15 en el repositorio `mi-usuario/repo-de-pruebas`."*

### 8. `create_label`
Crea una etiqueta (label) personalizada en un repositorio de GitHub.
- **Parámetros**:
  - `owner` (`string`, **requerido**): Dueño del repositorio.
  - `repo` (`string`, **requerido**): Nombre del repositorio.
  - `name` (`string`, **requerido**): Nombre de la etiqueta.
  - `color` (`string`, **requerido**): Código hexadecimal de 6 caracteres sin '#' (ej: `'ff0000'`).
  - `description` (`string`, opcional): Descripción explicativa del propósito de la etiqueta.
- **Ejemplo de Prompt**:
  > *"Crea una etiqueta llamada `prioridad-alta` con el color `ff3b30` y la descripción 'Tareas urgentes'."*

---

## 📋 Ejemplos de Flujos de Uso Completos

Puedes interactuar con el agente pidiéndole flujos encadenados:

*   **Flujo A: Inicialización y Documentación**
    > *"Crea un repositorio público llamado `mi-libreria-utils`. Luego, agrégale un archivo llamado `index.js` que tenga una función de suma, con el commit 'feat: init index.js'."*
*   **Flujo B: Gestión de Bugs y Triage**
    > *"Lista todos los issues abiertos en mi repositorio `mi-libreria-utils`. Busca si hay alguno relacionado con login. Si no hay ninguno, crea uno nuevo con el título 'Error de login con OAuth'. Si ya hay uno, coméntale diciendo 'Investigando el caso'."*
*   **Flujo C: Mantenimiento y Organización**
    > *"Crea una etiqueta llamada `bug-urgente` de color `ff0000` en mi repositorio `mi-libreria-utils` y aplícasela al issue número 1."*

---

## 🚀 Requisitos del Sistema

- **Node.js**: v18.0.0 o superior (Recomendado v20+ / v22+).
- **npm**: v9.0.0 o superior.
- **TypeScript**: v5.0.0 o superior.
- Conexión activa a Internet.

---

## ⚙️ Pasos de Instalación

1. **Clonar e instalar dependencias:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd ProyectoM5
   npm install
   ```

2. **Compilar el código TypeScript:**
   ```bash
   npm run build
   ```

---

## 🔧 Configuración del Token de GitHub

Este servidor requiere un **GitHub Personal Access Token (PAT)** para autenticarse en tu cuenta.

### Cómo obtener tu Token (PAT):
1. Inicia sesión en tu cuenta de GitHub.
2. Haz clic en tu foto de perfil en la esquina superior derecha y selecciona **Settings** (Configuración).
3. En el menú de la izquierda, desplázate hasta el final y haz clic en **Developer settings** (Configuración de desarrollador).
4. Selecciona **Personal access tokens** ➔ **Tokens (classic)**.
5. Haz clic en **Generate new token** ➔ **Generate new token (classic)**.
6. Asígnale una descripción (ej: `github-mcp-server`) y selecciona una fecha de expiración.
7. **Scopes obligatorios a marcar:**
   - **`repo`**: Acceso total a repositorios públicos y privados (creación, edición de código, issues y comentarios).
   - **`user`**: Lectura del perfil del usuario (necesario para verificar la autenticación del token).
8. Haz clic en **Generate token** en el final de la página.
9. **IMPORTANTE:** Copia el token generado y guárdalo en un lugar seguro. No podrás volver a verlo una vez cierres la pestaña.

### Configurar el archivo `.env`:
Copia el archivo `.env.example` como `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```
Edita `.env` y pega tu token:
```env
GITHUB_TOKEN=ghp_tuTokenGeneradoAqui
GITHUB_USERNAME=tuUsuarioDeGitHub
GITHUB_TEST_REPO=unRepositorioDePrueba
```

---

## 💻 Configuración en Antigravity / Claude Desktop

Para integrar este servidor MCP en **Antigravity** o **Claude Desktop**, agrega la siguiente sección a tu archivo de configuración de cliente MCP (`.mcp.json` o `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "github-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "C:\\Ruta\\Absoluta\\A\\ProyectoM5",
      "env": {
        "GITHUB_TOKEN": "ghp_tuTokenGeneradoAqui"
      }
    }
  }
}
```

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con **18 tests unitarios e integrados** creados con **Vitest** que verifican el manejo de errores, la lógica de retry y las operaciones sin realizar llamadas reales a la API de GitHub (usando mocks).

Para ejecutar los tests en modo de ejecución única:
```bash
npm test
```

Para ejecutarlos en modo watch (durante desarrollo):
```bash
npx vitest
```

---

## ❓ Solución de Problemas (Troubleshooting)

| Error / Síntoma | Causa Posible | Solución |
|---|---|---|
| `GitHubAuthError (401)` | El `GITHUB_TOKEN` falta, es inválido o expiró. | Verifica tu archivo `.env` y confirma que el token sea correcto. |
| `GitHubForbiddenError (403)` | El token no tiene los permisos necesarios (*scopes*). | Genera un nuevo PAT en GitHub asegurándote de marcar la casilla `repo`. |
| `GitHubNotFoundError (404)` | El repositorio u owner no existe, o el token no tiene acceso a repos privados. | Revisa el nombre del usuario/repo y confirma los permisos del token. |
| `GitHubRateLimitError` | Se excedió el límite de peticiones de la API de GitHub (5000/hora). | El servidor esperará automáticamente hasta el reset. Puedes verificar tu cuota en GitHub. |
| Error de comunicación en `stdio` | Se utilizó `console.log()` en el código del servidor. | Los MCP Servers que usan `stdio` deben usar **`console.error()`** para logs, ya que `stdout` está reservado exclusivamente para los mensajes del protocolo JSON-RPC. |

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo `package.json` para más detalles.
