import React, { useState, useRef, useEffect } from "react";
import { Sun, X, Send, RotateCcw } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabase";

interface SolChatProps {
  onNavigate?: (page: string) => void;
}

const SOL_SYSTEM_PROMPT = `Eres Sol, asesora virtual de Fortisol Perú. Escribes como una persona real en WhatsApp: con emoción, emojis expresivos y mensajes CORTOS separados por el símbolo |||.

REGLA CLAVE — SEPARADOR DE MENSAJES:
Usa ||| para separar cada mensaje. Cada segmento se enviará como burbuja independiente con una pequeña pausa, simulando escritura humana real.

REGLAS DE ESTILO:
- Usa emojis expresivos y variados 🌿✨💚🙌😊💪🔥❤️ etc.
- Máximo 2-3 oraciones por burbuja.
- Sé cálida, cercana, como una amiga que te recomienda algo.
- Usa negritas (**Texto**) para nombres de productos y precios.
- NUNCA muestres todo en un solo mensaje largo.

CATÁLOGO:
1. Dolor articular / Rodillas → Individual **Flexanil Ultra Forte** (S/. 80) | Pack **2 Flexanil** (S/. 150)
2. Dolor muscular / Espalda → Individual **Fortisol Ultra** (S/. 80) | Pack **2 Fortisol Ultra** (S/. 150)
3. Huesos / Artrosis → Individual **Colágeno Multimarino** (S/. 55) | Pack **2 Colágenos + Bálsamo** (S/. 200)
4. Problemas de estómago → Individual **Gastryn Herbal + Copaiba** (S/. 80) | Pack **2 Gastryn** (S/. 150)
5. Hígado / Digestión / Colesterol → Individual **Alcachofa Extracto** (S/. 55) | Pack **2 Frascos** (S/. 100)
6. Cansancio / Falta de energía → Individual **Fith** (S/. 80) | Pack **Fith x2** (S/. 150)
7. Salud masculina / Próstata → Individual **Bio Prots** (S/. 85) | Pack **Bio Prots + Mero Macho** (S/. 100)
8. Otro → Escucha y recomienda el producto más adecuado.

CONTENIDO DETALLADO:
- FLEXANIL ULTRA FORTE: Colágeno antiinflamatorio con cúrcuma y vitaminas B1, B6, B12. 
  *Modo de uso:* Disolver 1 sobre en un vaso con agua. Tomar 1 vez al día para prevención o 2 veces al día (mañana y noche) si hay dolor intenso.
- FORTISOL ULTRA: Cápsulas antiinflamatorias naturales.
  *Modo de uso:* Tomar 1 cápsula al día, de preferencia después del desayuno con abundante agua.
- COLÁGENO MULTIMARINO TIPO II: Cartílago de tiburón, calostro bovino, vitaminas B1/B6/B12.
  *Modo de uso:* Disolver 1 sobre en agua o jugo. Tomar 2 veces al día para regenerar cartílagos.
- BÁLSAMO FORTISOL: Alivio tópico inmediato.
  *Modo de uso:* Aplicar una pequeña cantidad en la zona del dolor (rodillas, espalda, etc.) con masajes circulares hasta que se absorba. Usar 2-3 veces al día.
- GASTRYN HERBAL + COPAIBA: Gastritis, úlceras, H. pylori.
  *Modo de uso:* Disolver 1 sobre de Gastryn y añadir 3 gotas de Copaiba en un vaso de agua tibia. Tomar 30 min antes del desayuno. Tratamiento mínimo de 2 meses.
- ALCACHOFA EXTRACTO: Desintoxica hígado, previene hígado graso.
  *Modo de uso:* Tomar 1 copita (medida) diluida en un poco de agua tibia después de cada comida principal.
- BIO PROTS + MERO MACHO: Salud de la próstata y vigor masculino.
  *Modo de uso:* Tomar 1 servicio al día para mantener la salud prostática y energía.
- FITH: Energía y vitalidad natural.
  *Modo de uso:* Disolver 1 sobre en agua por las mañanas para tener energía todo el día.

FLUJO OBLIGATORIO — usa siempre este formato con |||:

PASO 2 (cuando el cliente elige una categoría):
[Mensaje 1: Reacción emocional y empática, 1 oración + emojis]
|||
[Mensaje 2: Nombre del producto, 2-3 beneficios clave con emojis Y el **Modo de Aplicación/Uso** resaltado. Usa \\n para saltos de línea dentro del mensaje]
|||
OPCIONES:Individual|[emoji] Individual – 1 frasco|Precio: S/. XX|Ideal para probar||Pack|[emoji] Pack – X frascos|Precio: S/. XX|¡Mejor precio por frasco!
|||
[Mensaje 4: Pregunta final amigable, corta]

PASO 3 (cuando elige Individual o Pack):
[Mensaje 1: Confirmación emocionada del producto elegido con emoji]
|||
[Mensaje 2: Recordatorio rápido del **Modo de Uso** para que no lo olvide]
|||
COMPRAR:[nombre del producto]|[precio]
|||
[Mensaje 4: Mensaje corto y cálido de cierre, que cualquier duda estás aquí]

EJEMPLO REAL para Hígado / Digestión:
¡Excelente elección! 🌿 Cuidar el hígado es clave para sentirte bien por dentro ✨
|||
Para ti tenemos la **Alcachofa Extracto** 💚\\n🌿 Limpia y protege el hígado\\n🚫 Previene el hígado graso\\n💧 Apoya la digestión\\n\\n📝 **Modo de uso:** Toma 1 copita diluida en agua tibia después de tus comidas. ¡Sentirás la ligereza de inmediato! 🙌
|||
OPCIONES:Individual|🧴 Individual – 1 frasco|Precio: S/. 55|Ideal para empezar||Pack|📦 Pack – 2 frascos|Precio: S/. 100|¡Mejor precio por frasco!
|||
¿Cuál te llama más? 😊 ¿El **Individual** para comenzar o el **Pack** para mejor precio? 🙌

REGLA ANTI-INTERRUPCIÓN: Si el cliente pregunta algo, respóndele con ||| entre burbujas y retoma el flujo.`;

const MENU_OPTIONS = [
  { id: 1, emoji: "🦵", label: "Dolor articular", sub: "Rodillas / Articulaciones" },
  { id: 2, emoji: "💪", label: "Dolor muscular", sub: "Espalda / Músculos" },
  { id: 3, emoji: "🦴", label: "Huesos / Artrosis", sub: "Osteoporosis" },
  { id: 4, emoji: "🫁", label: "Estómago", sub: "Gastritis / Úlceras" },
  { id: 5, emoji: "🫀", label: "Hígado / Digestión", sub: "Colesterol" },
  { id: 6, emoji: "⚡", label: "Energía", sub: "Cansancio / Vitalidad" },
  { id: 7, emoji: "👨", label: "Salud masculina", sub: "Próstata" },
  { id: 8, emoji: "💬", label: "Otro", sub: "Cuéntame tu caso" },
];

interface Message {
  role: "user" | "assistant";
  text: string;
  isOptions?: boolean;
  optionsData?: OptionCard[];
  isBuy?: boolean;
  buyData?: { name: string; price: string };
}

interface OptionCard {
  id: string;
  title: string;
  price: string;
  badge: string;
  featured?: boolean;
}

function parseOptions(raw: string): OptionCard[] | null {
  if (!raw.startsWith("OPCIONES:")) return null;
  const body = raw.replace("OPCIONES:", "");
  const cards = body.split("||");
  return cards.map((card, i) => {
    const parts = card.split("|");
    return {
      id: parts[0]?.trim() || "",
      title: parts[1]?.trim() || "",
      price: parts[2]?.trim() || "",
      badge: parts[3]?.trim() || "",
      featured: i === 1,
    };
  });
}

function formatText(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/\\n/g, "<br/>")
    .replace(/\n/g, "<br/>");
}

function parseBuy(raw: string): { name: string; price: string } | null {
  if (!raw.startsWith("COMPRAR:")) return null;
  const body = raw.replace("COMPRAR:", "");
  const [name, price] = body.split("|");
  return { name: name?.trim() || "", price: price?.trim() || "" };
}

function BuyCard({ name, price, onNavigate, onClose }: { name: string; price: string; onNavigate?: (page: string) => void; onClose: () => void }) {
  return (
    <div className="bg-white border-2 border-yellow-400 rounded-2xl p-4 w-full shadow-sm font-sans">
      <div className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
        Tu selección 🛒
      </div>
      <div className="text-sm font-bold text-gray-800 mb-0.5">{name}</div>
      <div className="text-lg font-black text-black mb-3 tracking-tight">{price}</div>
      <button
        onClick={() => {
          if (onNavigate) onNavigate('shop');
          onClose();
        }}
        className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
      >
        🛍️ Ir a la tienda
      </button>
    </div>
  );
}

function OptionCards({
  options,
  onSelect,
}: {
  options: OptionCard[];
  onSelect: (opt: OptionCard) => void;
}) {
  return (
    <div className="flex flex-col gap-2 w-full font-sans">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt)}
          className={`p-3 border rounded-xl text-left transition-all relative w-full ${
            opt.featured
              ? "bg-white border-yellow-400 shadow-sm"
              : "bg-white border-gray-200 hover:border-yellow-400"
          }`}
        >
          {opt.featured && (
            <span className="absolute -top-2 right-3 bg-yellow-400 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
              ⭐ MEJOR PRECIO
            </span>
          )}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-bold text-gray-800 mb-0.5">
                {opt.title}
              </div>
              <div className="text-[10px] text-gray-500">{opt.badge}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-black tracking-tight ${opt.featured ? "text-black" : "text-gray-700"}`}>
                {opt.price}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function SolChat({ onNavigate }: SolChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("51944894541");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number')
        .eq('id', 1)
        .single();
      if (data?.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) initChat();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  function initChat() {
    setMessages([
      {
        role: "assistant",
        text: "¡Hola! Soy Sol, tu asesora de Fortisol Perú 😊\n\n¿Con qué te puedo ayudar hoy? Elige una opción:",
      },
    ]);
    setMenuVisible(true);
    setInput("");
  }

  async function addSequentialMessages(parts: string[]) {
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      const delay = Math.min(500 + part.length * 10, 1500);
      await new Promise((r) => setTimeout(r, delay));

      const optionsData = parseOptions(part);
      const buyData = !optionsData ? parseBuy(part) : null;

      setMessages((prev) => {
        const withoutTyping = prev.filter((m) => m.text !== "__typing__");
        const newMsg: Message = optionsData
          ? { role: "assistant", text: part, isOptions: true, optionsData }
          : buyData
          ? { role: "assistant", text: part, isBuy: true, buyData }
          : { role: "assistant", text: part };

        const nextTyping: Message[] =
          i < parts.length - 1 ? [{ role: "assistant", text: "__typing__" }] : [];

        return [...withoutTyping, newMsg, ...nextTyping];
      });
    }
  }

  const sendToGemini = async (userText: string, displayText?: string) => {
    const userMessage: Message = { role: "user", text: displayText || userText };
    const cleanMessages = messages.filter((m) => m.text !== "__typing__");
    const updatedMessages: Message[] = [...cleanMessages, userMessage];

    setMessages([...updatedMessages, { role: "assistant", text: "__typing__" }]);
    setMenuVisible(false);
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: SOL_SYSTEM_PROMPT,
        },
      });

      const response = await chat.sendMessage({ message: userText });
      const reply = response.text || "Lo siento, hubo un problema. Intenta de nuevo. 😊";

      setLoading(false);
      setMessages((prev) => prev.filter((m) => m.text !== "__typing__"));
      const parts = reply.split("|||");
      await addSequentialMessages(parts);
    } catch (error: any) {
      console.error("Gemini Error Details:", error);
      setLoading(false);
      
      let errorMessage = "Hubo un error de conexión. Intenta de nuevo. 😊";
      
      if (error.message?.includes("GEMINI_API_KEY")) {
        errorMessage = "⚠️ Error de configuración: Falta la clave de API de Gemini. Por favor, asegúrate de configurarla en las variables de entorno de Vercel/GitHub.";
      } else if (error.message?.includes("API key not valid")) {
        errorMessage = "⚠️ La clave de API de Gemini no es válida. Por favor, revísala en tu configuración.";
      } else if (error.message) {
        errorMessage = `Hubo un problema con la conexión: ${error.message.substring(0, 100)}... 😊`;
      }

      setMessages((prev) => [
        ...prev.filter((m) => m.text !== "__typing__"),
        { role: "assistant", text: errorMessage },
      ]);
    }
  };

  const handleMenuClick = (opt: (typeof MENU_OPTIONS)[0]) => {
    const text =
      opt.id === 8
        ? "Tengo una consulta diferente, ¿cómo me puedes ayudar?"
        : `Me interesa: ${opt.label} - ${opt.sub}`;
    sendToGemini(text, `${opt.emoji} ${opt.label}`);
  };

  const handleOptionSelect = (opt: OptionCard) => {
    sendToGemini(
      `Quiero el ${opt.id}: ${opt.title} al precio ${opt.price}`,
      `${opt.title} – ${opt.price}`
    );
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendToGemini(text);
  };

  const resetChat = () => {
    setMessages([]);
    setLoading(false);
    setTimeout(initChat, 50);
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-[9999] transition-all duration-300 hover:scale-110 border-2 font-sans ${
          open ? 'bg-black border-yellow-400 rotate-90' : 'bg-yellow-400 border-black hover:bg-yellow-500'
        }`}
        aria-label="Chat con Sol"
      >
        {open ? (
          <X className="w-6 h-6 text-yellow-400" />
        ) : (
          <Sun className="w-7 h-7 text-black" />
        )}
      </button>

      {/* Tooltip */}
      {!open && (
        <div
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-6 bg-white border-2 border-yellow-400 rounded-xl px-4 py-2.5 text-xs text-gray-700 shadow-xl z-[9998] cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-500 font-sans"
        >
          👋 ¿En qué te puedo ayudar?
          <div className="absolute bottom-[-8px] right-7 w-3 h-3 bg-white border-r-2 border-b-2 border-yellow-400 rotate-45" />
        </div>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[360px] h-[580px] max-h-[80vh] rounded-2xl bg-white border-2 border-yellow-400 shadow-2xl flex flex-col z-[9998] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 font-sans">
          {/* Header */}
          <div className="bg-black p-4 flex items-center gap-3 border-b border-yellow-400">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black border-2 border-white/30">
              S
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white tracking-tight">Sol · Fortisol Perú</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <p className="text-[10px] text-white/90">Asesora virtual · En línea</p>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Nueva conversación"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50">
            {messages.map((m, i) => {
              if (m.text === "__typing__") {
                return (
                  <div key={i} className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-yellow-400 flex-shrink-0 border border-yellow-400">
                      S
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-3 flex gap-1 items-center">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                );
              }

              if (m.isBuy && m.buyData) {
                return (
                  <div key={i} className="flex items-start gap-2 animate-in fade-in duration-300">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-yellow-400 flex-shrink-0 mt-1 border border-yellow-400">
                      S
                    </div>
                    <div className="flex-1">
                      <BuyCard name={m.buyData.name} price={m.buyData.price} onNavigate={onNavigate} onClose={() => setOpen(false)} />
                    </div>
                  </div>
                );
              }

              if (m.isOptions && m.optionsData) {
                return (
                  <div key={i} className="flex items-start gap-2 animate-in fade-in duration-300">
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-yellow-400 flex-shrink-0 mt-1 border border-yellow-400">
                      S
                    </div>
                    <div className="flex-1">
                      <OptionCards options={m.optionsData} onSelect={handleOptionSelect} />
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-yellow-400 flex-shrink-0 border border-yellow-400">
                      S
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 text-xs leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-black text-white rounded-2xl rounded-br-none border border-yellow-400"
                        : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-none"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
                  />
                </div>
              );
            })}

            {menuVisible && !loading && (
              <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleMenuClick(opt)}
                    className="bg-white border border-gray-200 rounded-xl p-3 text-left transition-all hover:border-yellow-400 hover:bg-yellow-50 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="text-xl mb-1">{opt.emoji}</div>
                    <div className="text-[11px] font-bold text-gray-800 leading-tight">
                      {opt.label}
                    </div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      {opt.sub}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu consulta..."
              disabled={loading}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-xs outline-none focus:border-yellow-400 transition-colors disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                input.trim() && !loading ? "bg-black text-yellow-400 border border-yellow-400" : "bg-gray-100 text-gray-300"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer */}
          <div className="px-4 pb-3 text-center">
            <p className="text-[9px] text-gray-400">
              Fortisol Perú ·{" "}
              <button 
                onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
                className="text-black font-bold hover:underline"
              >
                WhatsApp
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
