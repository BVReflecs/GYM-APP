# 🏋️ GymForge

App móvil para **crear rutinas de gimnasio personalizadas**, aprender la técnica correcta de cada ejercicio en video, y **llevar registro de tus marcas para superarlas cada semana**.

Construida con **React Native + Expo (Expo Router)** y **TypeScript**. Todos los datos se guardan **localmente en el teléfono** (AsyncStorage): funciona sin internet, sin cuentas ni servidor.

---

## ✨ Funciones

- **Personalización por objetivo** — Bajar de peso, ganar músculo (bulk), fuerza, condición física o mantenerte en forma. Cada objetivo ajusta los rangos de repeticiones y descanso sugeridos.
- **Biblioteca de +35 ejercicios** con búsqueda y filtro por grupo muscular. Cada ejercicio incluye:
  - 🎥 **Video tutorial** de cómo hacerlo correctamente.
  - 💪 **Músculo trabajado** (principales y secundarios).
  - 📋 **Instrucciones paso a paso** y consejos clave.
  - 🔀 **Variaciones** del mismo ejercicio.
- **Crear rutinas** eligiendo ejercicios y definiendo series y repeticiones.
- **Entrenamiento en vivo** — Registra peso, repeticiones y series completadas set por set.
- **Seguimiento de metas** — Si esta semana hiciste *135 lb en press de banca por 3×12*, la app lo guarda y te muestra esa marca como **objetivo a superar** la próxima vez.
- **Progreso y récords personales** — Historial de entrenamientos, volumen total y tus mejores marcas por ejercicio.
- **Interfaz moderna** en modo oscuro, pensada para usarse fácil en el gym.

---

## 🚀 Cómo correr la app

Necesitas [Node.js](https://nodejs.org) 18+ y la app **Expo Go** en tu teléfono (App Store / Google Play).

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm start
```

Luego **escanea el código QR** que aparece en la terminal con:
- **Android:** la app Expo Go.
- **iOS:** la cámara del iPhone (abre Expo Go).

También puedes correr en un emulador:

```bash
npm run android   # Emulador de Android
npm run ios       # Simulador de iOS (solo en Mac)
```

Verificar tipos de TypeScript:

```bash
npm run lint
```

---

## 📁 Estructura del proyecto

```
app/                      # Pantallas (Expo Router, navegación por archivos)
├── _layout.tsx           # Layout raíz + proveedores (estado, tema)
├── index.tsx             # Punto de entrada (onboarding o app)
├── onboarding.tsx        # Bienvenida: nombre, objetivo y unidad
├── settings.tsx          # Editar perfil / objetivo
├── (tabs)/               # Navegación por pestañas
│   ├── index.tsx         #   Inicio / Panel
│   ├── routines.tsx      #   Mis rutinas
│   ├── library.tsx       #   Biblioteca de ejercicios
│   └── progress.tsx      #   Progreso y récords
├── exercise/[id].tsx     # Detalle del ejercicio (video, músculos, variaciones)
├── routine/new.tsx       # Crear rutina
├── routine/[id].tsx      # Detalle de rutina
└── workout/[id].tsx      # Entrenamiento en vivo (registrar series)

src/
├── theme.ts              # Sistema de diseño (colores, espaciado, tipografía)
├── types.ts              # Modelos de datos (TypeScript)
├── data/
│   ├── exercises.ts      # Base de datos de ejercicios
│   └── goals.ts          # Objetivos de entrenamiento
├── storage/store.tsx     # Estado global + persistencia local + cálculo de récords
└── components/ui.tsx      # Componentes de interfaz reutilizables
```

---

## 🗺️ Ideas para siguientes versiones

- Reproducir el video tutorial **embebido** dentro de la app.
- Temporizador de descanso automático entre series.
- Gráficas de progreso por ejercicio a lo largo del tiempo.
- Diagrama del cuerpo resaltando el músculo trabajado.
- Cuentas y sincronización en la nube para respaldar tus datos.
- Rutinas predefinidas por objetivo listas para empezar.

---

> Nota: los videos tutoriales se abren como una búsqueda en YouTube con el nombre del ejercicio, para siempre mostrar contenido relevante y actualizado sin depender de enlaces que puedan caducar.
