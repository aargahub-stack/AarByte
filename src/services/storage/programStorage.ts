import type { Program } from "@/types";
import { STORAGE_KEYS } from "@/config/constants";

export function loadPrograms(): Program[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    if (!raw) return [];
    return JSON.parse(raw) as Program[];
  } catch {
    return [];
  }
}

export function savePrograms(programs: Program[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  } catch {
    /* ignore */
  }
}

export function saveProgram(program: Program): Program[] {
  const programs = loadPrograms();
  const idx = programs.findIndex((p) => p.id === program.id);
  if (idx >= 0) {
    programs[idx] = program;
  } else {
    programs.unshift(program);
  }
  savePrograms(programs);
  return programs;
}

export function deleteProgram(id: string): Program[] {
  const programs = loadPrograms().filter((p) => p.id !== id);
  savePrograms(programs);
  return programs;
}

export function duplicateProgram(id: string): Program[] | null {
  const programs = loadPrograms();
  const original = programs.find((p) => p.id === id);
  if (!original) return null;
  const copy: Program = {
    ...original,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: `${original.name} (copy)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  programs.unshift(copy);
  savePrograms(programs);
  return programs;
}
