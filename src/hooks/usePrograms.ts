import { useCallback, useEffect, useState } from "react";
import type { Program } from "@/types";
import {
  deleteProgram,
  duplicateProgram,
  loadPrograms,
  saveProgram,
} from "@/services/storage/programStorage";
import { generateId } from "@/utils/id";

export function usePrograms() {
  const [programs, setPrograms] = useState<Program[]>(() => loadPrograms());

  useEffect(() => {
    const handler = () => setPrograms(loadPrograms());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const createProgram = useCallback(
    (name: string, language: string, sourceCode: string, stdin = ""): Program => {
      const now = Date.now();
      const program: Program = {
        id: generateId(),
        name,
        language,
        sourceCode,
        stdin,
        createdAt: now,
        updatedAt: now,
      };
      const updated = saveProgram(program);
      setPrograms(updated);
      return program;
    },
    []
  );

  const updateProgram = useCallback((program: Program) => {
    const updated = saveProgram({ ...program, updatedAt: Date.now() });
    setPrograms(updated);
  }, []);

  const removeProgram = useCallback((id: string) => {
    const updated = deleteProgram(id);
    setPrograms(updated);
  }, []);

  const copyProgram = useCallback((id: string) => {
    const updated = duplicateProgram(id);
    if (updated) setPrograms(updated);
  }, []);

  return { programs, createProgram, updateProgram, removeProgram, copyProgram };
}
