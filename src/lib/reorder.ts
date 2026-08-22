/**
 * Pemindahan posisi item dalam daftar terurut.
 *
 * Dipakai admin panel untuk menyusun ulang kartu lewat drag and drop. Logikanya
 * sengaja dipisah dari komponen supaya bisa diuji tanpa DOM: satu kesalahan
 * indeks di sini berarti anggota tim tampil di urutan yang salah pada halaman
 * publik, dan itu tidak akan terlihat oleh tes komponen mana pun.
 */

/**
 * Mengembalikan salinan `list` dengan item pada indeks `from` dipindahkan ke
 * indeks `to`. Indeks di luar jangkauan atau pemindahan ke tempat yang sama
 * mengembalikan salinan apa adanya — bukan melempar error — karena pemanggilnya
 * adalah event pointer yang bisa saja menunjuk kartu yang sudah tidak ada.
 */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list]
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= next.length ||
    to >= next.length ||
    from === to
  ) {
    return next
  }

  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Apakah dua daftar id punya isi dan urutan yang persis sama. */
export function sameOrder(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index])
}
