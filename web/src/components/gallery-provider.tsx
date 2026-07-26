import { useCallback, useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

/** A single uploaded vanity media item (image or video). */
export type MediaItem = {
  id: string;
  type: "image" | "video";
  /** Object URL for the in-memory blob (session-scoped, fast to render). */
  url: string;
  /** Persisted data URL so the gallery survives reloads. */
  dataUrl: string;
  name: string;
  addedAt: number;
};

const STORAGE_KEY = "ff-gallery";
const SLOTS_STORAGE_KEY = "ff-gallery-slots";
/** Cap persisted items so we stay well under the localStorage quota. */
const MAX_ITEMS = 12;

type StoredItem = Pick<MediaItem, "id" | "type" | "dataUrl" | "name" | "addedAt">;

/** A fixed-dimension frame that holds at most one piece of media. */
export type MediaSlot = {
  id: string;
  label: string;
  /** CSS aspect-ratio value, e.g. "16 / 9". */
  ratio: string;
  /** Human-friendly dimension hint shown in the empty state. */
  hint: string;
  media: MediaItem | null;
};

/** Predefined empty spaces with set dimensions for visitors to fill. */
export const DEFAULT_SLOTS: Omit<MediaSlot, "media">[] = [
  { id: "banner", label: "Wide banner", ratio: "16 / 9", hint: "1920 × 1080" },
  { id: "portrait", label: "Portrait", ratio: "3 / 4", hint: "1080 × 1440" },
  { id: "square-a", label: "Square", ratio: "1 / 1", hint: "1080 × 1080" },
  { id: "square-b", label: "Square", ratio: "1 / 1", hint: "1080 × 1080" },
  { id: "story", label: "Story / reel", ratio: "9 / 16", hint: "1080 × 1920" },
  { id: "landscape", label: "Landscape", ratio: "4 / 3", hint: "1600 × 1200" },
];

type StoredSlots = Record<string, StoredItem>;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * GalleryProvider — holds visitor-uploaded vanity media (images + videos) for
 * the showcase carousel. Persists to localStorage as data URLs so the gallery
 * survives reloads, while rendering from fast object URLs during the session.
 */
const [GalleryProviderHook, useGallery] = createContextHook(() => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [slots, setSlots] = useState<MediaSlot[]>(
    DEFAULT_SLOTS.map((s) => ({ ...s, media: null }))
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored: StoredItem[] = JSON.parse(raw);
      const restored: MediaItem[] = stored.map((s) => ({
        ...s,
        url: s.dataUrl,
      }));
      setItems(restored);
    } catch {
      // Corrupt storage — start clean.
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SLOTS_STORAGE_KEY);
      if (!raw) return;
      const stored: StoredSlots = JSON.parse(raw);
      setSlots((prev) =>
        prev.map((slot) => {
          const saved = stored[slot.id];
          return saved
            ? { ...slot, media: { ...saved, url: saved.dataUrl } }
            : slot;
        })
      );
    } catch {
      // Corrupt storage — keep empty slots.
    }
  }, []);

  const persistSlots = useCallback((next: MediaSlot[]) => {
    try {
      const stored: StoredSlots = {};
      next.forEach((slot) => {
        if (slot.media) {
          const { id, type, dataUrl, name, addedAt } = slot.media;
          stored[slot.id] = { id, type, dataUrl, name, addedAt };
        }
      });
      localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      setError("Couldn't save — storage may be full. Remove a few items.");
    }
  }, []);

  /** Upload a single file into a specific fixed-dimension slot. */
  const setSlotFile = useCallback(
    async (slotId: string, file: File) => {
      setError(null);
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setError("Please choose an image or video file.");
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setError("That file is too large (max 12MB).");
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const blobUrl = URL.createObjectURL(file);
        const media: MediaItem = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: file.type.startsWith("video/") ? "video" : "image",
          url: blobUrl,
          dataUrl,
          name: file.name,
          addedAt: Date.now(),
        };
        setSlots((prev) => {
          const next = prev.map((slot) => {
            if (slot.id !== slotId) return slot;
            if (slot.media && slot.media.url.startsWith("blob:")) {
              URL.revokeObjectURL(slot.media.url);
            }
            return { ...slot, media };
          });
          persistSlots(next);
          return next;
        });
      } catch {
        setError("That file couldn't be read.");
      }
    },
    [persistSlots]
  );

  /** Empty a specific slot back to its placeholder state. */
  const clearSlot = useCallback(
    (slotId: string) => {
      setSlots((prev) => {
        const next = prev.map((slot) => {
          if (slot.id !== slotId) return slot;
          if (slot.media && slot.media.url.startsWith("blob:")) {
            URL.revokeObjectURL(slot.media.url);
          }
          return { ...slot, media: null };
        });
        persistSlots(next);
        return next;
      });
    },
    [persistSlots]
  );

  const persist = useCallback((next: MediaItem[]) => {
    try {
      const stored: StoredItem[] = next.map(
        ({ id, type, dataUrl, name, addedAt }) => ({
          id,
          type,
          dataUrl,
          name,
          addedAt,
        })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      setError("Couldn't save — the gallery may be full. Remove a few items.");
    }
  }, []);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const list = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type.startsWith("video/")
      );
      if (list.length === 0) {
        setError("Please choose image or video files.");
        return;
      }

      const created: MediaItem[] = [];
      for (const file of list) {
        // Guard large files so we don't blow the storage quota.
        if (file.size > 12 * 1024 * 1024) {
          setError("Some files were skipped (max 12MB each).");
          continue;
        }
        try {
          const dataUrl = await readFileAsDataUrl(file);
          const blobUrl = URL.createObjectURL(file);
          created.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            type: file.type.startsWith("video/") ? "video" : "image",
            url: blobUrl,
            dataUrl,
            name: file.name,
            addedAt: Date.now(),
          });
        } catch {
          setError("One or more files couldn't be read.");
        }
      }

      if (created.length === 0) return;

      setItems((prev) => {
        const next = [...created, ...prev].slice(0, MAX_ITEMS);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => {
        const target = prev.find((i) => i.id === id);
        if (target && target.url.startsWith("blob:")) {
          URL.revokeObjectURL(target.url);
        }
        const next = prev.filter((i) => i.id !== id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((i) => {
        if (i.url.startsWith("blob:")) URL.revokeObjectURL(i.url);
      });
      return [];
    });
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    items,
    slots,
    error,
    addFiles,
    removeItem,
    clearAll,
    setSlotFile,
    clearSlot,
  };
});

export const GalleryProvider = GalleryProviderHook;
export { useGallery };
