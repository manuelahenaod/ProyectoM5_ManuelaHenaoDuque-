# 🚀 GitHub MCP Server (`github-mcp-server`)

Servidor de **Model Context Protocol (MCP)** desarrollado en TypeScript/Node.js que expone herramientas avanzadas de la API REST de GitHub para ser utilizadas por Agentes de Inteligencia Artificial (como Antigravity, Claude, ChatGPT) mediante interacción en lenguaje natural.

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
- **`src/tools/github/`**: Definición y handlers de las 5 herramientas MCP. Maneja la interacción entre el servidor y el cliente.
- **`src/schemas/github.ts`**: Esquemas de **Zod** para la validación estricta en runtime de inputs y la inferencia de tipos TypeScript.
- **`src/clients/github/`**: 
  - `client.ts`: Métodos de alto nivel (`listRepositories`, `createRepository`, `createIssue`, `listIssues`, `createFile`).
  - `request.ts`: Wrapper para solicitudes HTTP con **exponential backoff** y manejo automático de **Rate Limits**.
  - `errors.ts`: Jerarquía custom de errores (`GitHubAuthError`, `GitHubNotFoundError`, `GitHubRateLimitError`, etc.).
  - `octokit.ts`: Instanciador autenticado de `@octokit/rest`.
- **`src/config/env.ts`**: Carga y validación estricta de variables de entorno al iniciar.

---

## 🛠️ Herramientas Registradas (MCP Tools)

El servidor expone **5 herramientas principales**:

### 1. `list_repositories`
Lista los repositorios del usuario autenticado en GitHub.
- **Parámetros**:
  - `type` (`"all"` | `"public"` | `"private"`, por defecto: `"all"`): Filtro de visibilidad.
  - `sort` (`"created"` | `"updated"` | `"pushed"` | `"full_name"`, por defecto: `"updated"`): Criterio de ordenamiento.
  - `per_page` (`number`, 1-100, por defecto: `30`): Cantidad de resultados por página.
- **Ejemplo de Prompt**:
  > *"Muéstrame mis repositorios públicos más recientemente actualizados."*

### 2. `create_repository`
Crea un nuevo repositorio en la cuenta de GitHub autenticada.
- **Parámetros**:
  - `name` (`string`, requerido, 1-100 caracteres, regex `/^[a-zA-Z0-9_.-]+$/`): Nombre del repositorio.
  - `description` (`string`, opcional): Descripción breve del proyecto.
  - `private` (`boolean`, por defecto: `false`): Visibilidad del repositorio.
- **Ejemplo de Prompt**:
  > *"Crea un repositorio privado llamado `proyecto-mcp-demo` con la descripción 'Servidor MCP de prueba'."*

### 3. `create_issue`
Abre un nuevo issue en el repositorio especificado.
- **Parámetros**:
  - `owner` (`string`, requerido): Dueño del repositorio (usuario o grupo).
  - `repo` (`string`, requerido): Nombre del repositorio.
  - `title` (`string`, requerido, mín 3 caracteres): Título descriptivo del issue.
  - `body` (`string`, opcional): Detalle o contenido en formato Markdown.
- **Ejemplo de Prompt**:
  > *"Abre un issue en el repo `manuelahenaod/ProyectoM5` con el título 'Fix login bug' y detalle 'El formulario no valida el email'."*

### 4. `list_issues`
Lista los issues abiertos de un repositorio.
- **Parámetros**:
  - `owner` (`string`, requerido): Dueño del repositorio.
  - `repo` (`string`, requerido): Nombre del repositorio.
- **Ejemplo de Prompt**:
  > *"¿Cuáles son los issues abiertos actualmente en el repositorio `facebook/react`?"*

### 5. `create_file`
Crea o reemplaza un archivo realizando un commit directo a una rama usando la Git Low-Level API (Blob → Tree → Commit → Ref Update).
- **Parámetros**:
  - `owner` (`string`, requerido): Usuario u organización dueña.
  - `repo` (`string`, requerido): Nombre del repositorio.
  - `path` (`string`, requerido): Ruta relativa del archivo (ej. `src/utils/math.ts`).
  - `content` (`string`, requerido): Contenido completo del archivo en UTF-8.
  - `message` (`string`, requerido): Mensaje descriptivo del commit.
  - `branch` (`string`, por defecto: `"main"`): Rama destino.
- **Ejemplo de Prompt**:
  > *"Agrega un archivo `README.md` en el repositorio `mi-usuario/demo` con el texto '# Mi Proyecto' y el commit 'docs: add initial readme'."*

---

## 🚀 Requisitos e Instalación

### Requisitos Previos
- **Node.js** v18.0.0 o superior.
- **npm** v9.0.0 o superior.
- Un **Personal Access Token (PAT)** de GitHub con los scopes:
  - `repo` (Acceso completo a repositorios públicos y privados, lectura y escritura de código e issues).
  - `user` (Lectura de perfil de usuario).

### Pasos de Instalación

1. **Clonar e instalar dependencias:**
   ```bash
   git clone <URL_DE_TU_REPOSITY>
   cd ProyectoM5
   npm install
   ```

2. **Configurar Variables de Entorno:**
   Copia el archivo de ejemplo y agrega tu token de GitHub:
   ```bash
   cp .env.example .env
   ```
   Edita `.env`:
   ```env
   GITHUB_TOKEN=ghp_TuTokenPersonalDeGitHubAqui
   GITHUB_USERNAME=TuUsuarioDeGitHub
   GITHUB_TEST_REPO=TuRepoDePrueba
   ```

3. **Compilar el proyecto:**
   ```bash
   npm run build
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
        "GITHUB_TOKEN": "ghp_TuTokenPersonalDeGitHubAqui"
      }
    }
  }
}
```

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con **15 tests unitarios e integrados** creados con **Vitest** que verifican el manejo de errores, la lógica de retry y las operaciones sin realizar llamadas reales a la API de GitHub (usando mocks).

Para ejecutar los tests:
```bash
npm test
```

### Cobertura de Pruebas:
- `tests/errors.test.ts`: Validación del mapeo de códigos HTTP (401, 403, 404, 422, 500) a clases de error custom.
- `tests/github-request.test.ts`: Verificación de la estrategia de reintentos (exponential backoff y pausa por Rate Limit).
- `tests/operations.test.ts`: Verificación del formateo y retorno estructurado de respuestas de la API.

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
Este proyecto fue desarrollado como parte del Proyecto Integrador 5 (Backend Specialization). Licencia ISC.
