import { createClient } from "@/lib/supabase/client";

const BUCKET = "business-media";

/**
 * Faz upload de um arquivo para a pasta do negócio no bucket público.
 * Convenção de path: {businessId}/{pasta}/{timestamp}-{nome}.
 * Retorna a URL pública, pronta para gravar no banco.
 */
export async function uploadBusinessMedia(
  businessId: string,
  pasta: "logo" | "capa" | "servicos" | "portfolio" | "pacotes",
  file: File
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${businessId}/${pasta}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
