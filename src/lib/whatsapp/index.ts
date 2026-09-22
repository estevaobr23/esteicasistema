export type WhatsappContexto = {
  servico?: string;
  veiculo?: string;
  preco?: string;
  horario?: string;
  pacote?: string;
};

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Monta a URL do WhatsApp com mensagem contextual, seguindo o padrão do
 * brief: nunca um botão genérico, sempre com o que o visitante estava vendo.
 */
export function buildWhatsappUrl(numero: string, contexto?: WhatsappContexto): string {
  const digits = onlyDigits(numero);
  const phone = digits.startsWith("55") ? digits : `55${digits}`;

  if (!contexto || Object.values(contexto).every((v) => !v)) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(
      "Olá! Vim pelo catálogo e gostaria de mais informações."
    )}`;
  }

  const linhas = ["Olá! Vim pelo catálogo.", "", "Tenho interesse em:"];

  if (contexto.servico) linhas.push(`Serviço: ${contexto.servico}`);
  if (contexto.pacote) linhas.push(`Pacote: ${contexto.pacote}`);
  if (contexto.veiculo) linhas.push(`Veículo: ${contexto.veiculo}`);
  if (contexto.preco) linhas.push(`Valor exibido: ${contexto.preco}`);
  if (contexto.horario) linhas.push(`Horário de interesse: ${contexto.horario}`);

  linhas.push("", "Gostaria de mais informações.");

  return `https://wa.me/${phone}?text=${encodeURIComponent(linhas.join("\n"))}`;
}
