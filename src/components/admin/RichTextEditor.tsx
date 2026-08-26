"use client";
/* eslint-disable jsx-a11y/alt-text */

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
// BubbleMenu tinggal di subpath /menus sejak TipTap 3, bukan di root.
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { GambarArtikel, type Perataan, type Ukuran } from "@/lib/tiptap-image";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Image, ImagePlus,
  Loader2, Undo, Redo, Trash2, AlignLeft, AlignCenter, AlignRight, Minus, Square, Maximize2,
} from "lucide-react";
import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { periksaUrlGambar } from "@/lib/image-url";
import { uploadFile } from "@/lib/upload-client";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Tulis konten di sini..." }: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-bekon-gold underline hover:opacity-80" },
      }),
      GambarArtikel.configure({
        HTMLAttributes: { class: "h-auto my-4 block" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  /**
   * Jalur yang SELALU berhasil: berkas diunggah ke Cloudinary — satu-satunya
   * penyimpan gambar yang diizinkan CSP situs — lalu alamatnya disisipkan.
   * Gambarnya jadi milik sendiri, tidak bisa hilang kalau situs sumber mati.
   */
  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // supaya berkas yang sama bisa dipilih lagi
      if (!file || !editor) return;

      setUploading(true);
      try {
        const media = await uploadFile(file);
        editor.chain().focus().setImage({ src: media.url }).run();
        toast.success("Gambar berhasil diunggah");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal mengunggah gambar");
      } finally {
        setUploading(false);
      }
    },
    [editor]
  );

  /**
   * Jalur tempel-alamat. Dulu menyisipkan apa pun tanpa diperiksa, sehingga
   * alamat HALAMAN artikel dan sisa gambar WordPress yang sudah mati ikut masuk
   * dan tampil pecah — tanpa satu pun peringatan ke admin.
   */
  const addImage = useCallback(async () => {
    if (!editor) return;

    const masukan = window.prompt(
      'Tempel alamat gambar (harus berakhiran .jpg, .png, atau .webp).\n\nKalau gambarnya ada di komputer, tutup kotak ini lalu pakai tombol "Upload gambar" di sebelah.'
    );
    if (masukan === null) return;

    const hasil = periksaUrlGambar(masukan, window.location.host);
    if (!hasil.ok) {
      toast.error(hasil.alasan, { duration: 8000 });
      return;
    }

    // Pemeriksaan bentuk saja tidak cukup: alamat bisa saja rapi tapi berkasnya
    // sudah terhapus, diblokir hotlink, atau ternyata bukan gambar. Dicoba muat
    // dulu supaya yang masuk ke artikel hanya yang terbukti tampil.
    const bisaDimuat = await new Promise<boolean>((resolve) => {
      const img = new window.Image();
      const selesai = (v: boolean) => { clearTimeout(timer); resolve(v); };
      const timer = setTimeout(() => selesai(false), 10000);
      img.onload = () => selesai(true);
      img.onerror = () => selesai(false);
      img.src = hasil.url;
    });

    if (!bisaDimuat) {
      toast.error(
        "Gambar tidak bisa dimuat dari alamat itu — mungkin sudah dihapus, " +
          "diblokir situs sumbernya, atau alamatnya bukan berkas gambar. " +
          "Paling aman: unduh gambarnya lalu pakai tombol Upload.",
        { duration: 10000 }
      );
      return;
    }

    editor.chain().focus().setImage({ src: hasil.url }).run();
  }, [editor]);

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? "bg-bekon-gold/20 text-bekon-gold" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );

  const gambarAktif = editor.isActive("image");
  const atribut = gambarAktif ? editor.getAttributes("image") : {};

  /** Tombol di toolbar mengambang milik gambar. */
  const TombolGambar = ({
    onClick, aktif, title, children,
  }: { onClick: () => void; aktif?: boolean; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // jangan sampai gambar kehilangan seleksi
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={aktif}
      className={`p-1.5 rounded transition-colors ${
        aktif ? "bg-bekon-gold text-white" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );

  const aturGambar = (attrs: { align?: Perataan; size?: Ukuran }) =>
    editor.chain().focus().updateAttributes("image", attrs).run();

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar gambar: muncul tepat di atas gambar yang sedang dipilih.
          Tanpa ini, menghapus gambar menuntut admin tahu harus menekan Delete,
          dan tidak ada satu pun petunjuk bahwa gambarnya bisa diseret. */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor }: { editor: Editor }) => editor.isActive("image")}
        options={{ placement: "top", offset: 10 }}
        className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
      >
        <TombolGambar onClick={() => aturGambar({ align: "left" })} aktif={atribut.align === "left"} title="Rata kiri">
          <AlignLeft className="w-4 h-4" />
        </TombolGambar>
        <TombolGambar onClick={() => aturGambar({ align: "center" })} aktif={atribut.align === "center"} title="Rata tengah">
          <AlignCenter className="w-4 h-4" />
        </TombolGambar>
        <TombolGambar onClick={() => aturGambar({ align: "right" })} aktif={atribut.align === "right"} title="Rata kanan">
          <AlignRight className="w-4 h-4" />
        </TombolGambar>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <TombolGambar onClick={() => aturGambar({ size: "small" })} aktif={atribut.size === "small"} title="Ukuran kecil">
          <Minus className="w-4 h-4" />
        </TombolGambar>
        <TombolGambar onClick={() => aturGambar({ size: "medium" })} aktif={atribut.size === "medium"} title="Ukuran sedang">
          <Square className="w-4 h-4" />
        </TombolGambar>
        <TombolGambar onClick={() => aturGambar({ size: "full" })} aktif={atribut.size === "full"} title="Lebar penuh">
          <Maximize2 className="w-4 h-4" />
        </TombolGambar>

        <span className="w-px h-5 bg-gray-200 mx-1" />

        <TombolGambar
          onClick={() => editor.chain().focus().deleteSelection().run()}
          title="Hapus gambar"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </TombolGambar>
      </BubbleMenu>

      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link">
          <Link className="w-4 h-4" />
        </ToolbarButton>
        {/* Upload didahulukan: ini jalur yang selalu berhasil, sementara
            tempel-alamat hampir selalu gagal karena CSP situs. */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
        <ToolbarButton
          onClick={() => { if (!uploading) fileRef.current?.click(); }}
          title={uploading ? "Sedang mengunggah..." : "Upload gambar dari komputer"}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-bekon-gold" aria-hidden="true" />
          ) : (
            <ImagePlus className="w-4 h-4" aria-hidden="true" />
          )}
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Sisipkan gambar dari alamat (URL)">
          <Image className="w-4 h-4" aria-hidden="true" />
        </ToolbarButton>

        <span className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[250px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]" />
    </div>
  );
}
