# Panel Vercel del Comedero Inteligente

## Setup

1. Crea el proyecto en Vercel y sube esta carpeta como root.
2. Crea un proyecto en https://supabase.com y ejecuta `supabase.sql` en el SQL Editor.
3. Copia `.env.example` a `.env.local` y rellena las claves.
4. En Vercel, añade las mismas variables en *Project Settings → Environment Variables*.
5. Deploy.

La URL resultante es `https://<tu-proyecto>.vercel.app`. Copia esa URL en `include/Config.h` del firmware:

```cpp
constexpr char CLOUD_STATUS_URL[]   = "https://<tu-proyecto>.vercel.app/api/status";
constexpr char CLOUD_COMMANDS_URL[] = "https://<tu-proyecto>.vercel.app/api/commands";
