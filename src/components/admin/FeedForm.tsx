import { useState, type FormEvent } from "react";
import type { FeedKind, FeedScope } from "../../types";
import { compressFieldPhoto } from "../../lib/compressImage";
import { blobToDataUrl, supabase, uploadFotoCampo } from "../../lib/uploadFoto";
import { useField } from "../../state/FieldContext";
import { Field, Status, SubmitButton, controlClass } from "./fields";

const cultures: FeedScope[] = ["soja", "milho", "soja e milho"];

const kinds: FeedKind[] = [
  "Vistoria de rotina",
  "Manejo fitossanitário",
  "Organização de evento",
  "Aplicação de fertilizantes",
  "Plantio",
];

function normalizeTags(raw: string, scope: FeedScope) {
  const tags = raw
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  if (tags.length > 0) return tags;
  if (scope === "soja e milho") return ["#Soja", "#Milho"];
  return [scope === "soja" ? "#Soja" : "#Milho"];
}

function formatKiloBytes(bytes: number) {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function FeedForm() {
  const { addFeedPost } = useField();
  const [kind, setKind] = useState<FeedKind>("Vistoria de rotina");
  const [culture, setCulture] = useState<FeedScope>("soja");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [tags, setTags] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | undefined) {
    setError("");
    setSaved(false);
    if (!file) {
      setFileName("");
      setPhotoBlob(null);
      return;
    }
    setOptimizing(true);
    setFileName("");
    setPhotoBlob(null);
    try {
      const compressed = await compressFieldPhoto(file);
      const base = file.name.replace(/\.[^.]+$/, "") || "foto-campo";
      setPhotoBlob(compressed.blob);
      setFileName(`${base}.jpg · ${formatKiloBytes(compressed.blob.size)}`);
    } catch (caught) {
      setPhotoBlob(null);
      setFileName("");
      setError(caught instanceof Error ? caught.message : "Não foi possível otimizar a imagem.");
    } finally {
      setOptimizing(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (optimizing || uploading) return;
    const link = imageUrl.trim();
    if (!photoBlob && !link) {
      setError("Informe um link de foto ou escolha um arquivo.");
      setSaved(false);
      return;
    }
    if (!photoBlob && !/^https?:\/\//.test(link)) {
      setError("O link da foto precisa começar com http:// ou https://.");
      setSaved(false);
      return;
    }
    if (text.trim().length < 10) {
      setError("Descreva o card com ao menos 10 caracteres.");
      setSaved(false);
      return;
    }

    let image = link;
    if (photoBlob) {
      setUploading(true);
      try {
        image = supabase ? await uploadFotoCampo(photoBlob) : await blobToDataUrl(photoBlob);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Não foi possível enviar a foto.");
        setSaved(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    addFeedPost({
      kind,
      culture,
      image,
      text,
      tags: normalizeTags(tags, culture),
    });
    setText("");
    setTags("");
    setImageUrl("");
    setPhotoBlob(null);
    setFileName("");
    setFileKey((key) => key + 1);
    setError("");
    setSaved(true);
  }

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <Field label="Categoria da nova atividade" htmlFor="feed-kind">
        <select id="feed-kind" className={controlClass} value={kind} onChange={(event) => setKind(event.target.value as FeedKind)}>
          {kinds.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Parcela" htmlFor="feed-plot">
        <select
          id="feed-plot"
          className={controlClass}
          value={culture}
          onChange={(event) => setCulture(event.target.value as FeedScope)}
        >
          {cultures.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Link da foto" htmlFor="feed-image" hint="Ou envie um arquivo abaixo. O card entra no feed e na galeria.">
        <input
          id="feed-image"
          className={controlClass}
          value={imageUrl}
          onChange={(event) => {
            setImageUrl(event.target.value);
            setSaved(false);
          }}
          placeholder="https://..."
          inputMode="url"
        />
      </Field>
      <Field label="Arquivo da foto" htmlFor="feed-file" hint="A foto é reduzida para até 1080 px e JPEG 80% antes do envio.">
        <input
          id="feed-file"
          key={fileKey}
          className={`${controlClass} py-2`}
          type="file"
          accept="image/*"
          disabled={optimizing || uploading}
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
        {optimizing ? (
          <p className="mt-1 text-xs font-extrabold text-leaf-700" role="status">
            Otimizando imagem...
          </p>
        ) : null}
        {fileName && !optimizing ? <p className="mt-1 text-xs font-semibold text-leaf-700">{fileName}</p> : null}
      </Field>
      <Field label="Tags" htmlFor="feed-tags" hint="Separe por vírgula. Se ficar vazio, usamos a cultura.">
        <input
          id="feed-tags"
          className={controlClass}
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="#Soja, #R3, #Percevejo"
        />
      </Field>
      <Field label="Descrição técnica" htmlFor="feed-text">
        <textarea
          id="feed-text"
          className={`${controlClass} min-h-28 py-3`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          required
          minLength={10}
        />
      </Field>
      {error ? <p className="text-sm font-semibold text-orange-700">{error}</p> : null}
      {saved ? <Status>Card publicado. Ele já aparece na área do produtor.</Status> : null}
      <SubmitButton disabled={optimizing || uploading}>{uploading ? "Enviando foto..." : "Publicar no feed"}</SubmitButton>
    </form>
  );
}
