import type { LanguageConfig } from "@/types";

export const LANGUAGES: LanguageConfig[] = [
  {
    id: "python",
    name: "Python",
    extension: "py",
    monacoLanguage: "python",
    starterCode: `def main():
    print("Hello, AarByte!")

main()
`,
    enabled: true,
  },
  {
    id: "javascript",
    name: "JavaScript",
    extension: "js",
    monacoLanguage: "javascript",
    starterCode: `function main() {
  console.log("Hello, AarByte!");
}

main();
`,
    enabled: true,
  },
  {
    id: "typescript",
    name: "TypeScript",
    extension: "ts",
    monacoLanguage: "typescript",
    starterCode: `function main(): void {
  console.log("Hello, AarByte!");
}

main();
`,
    enabled: true,
  },
  {
    id: "java",
    name: "Java",
    extension: "java",
    monacoLanguage: "java",
    starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, AarByte!");
    }
}
`,
    enabled: true,
  },
  {
    id: "c",
    name: "C",
    extension: "c",
    monacoLanguage: "c",
    starterCode: `#include <stdio.h>

int main() {
    printf("Hello, AarByte!\\n");
    return 0;
}
`,
    enabled: true,
  },
  {
    id: "cpp",
    name: "C++",
    extension: "cpp",
    monacoLanguage: "cpp",
    starterCode: `#include <iostream>

int main() {
    std::cout << "Hello, AarByte!" << std::endl;
    return 0;
}
`,
    enabled: true,
  },
  {
    id: "go",
    name: "Go",
    extension: "go",
    monacoLanguage: "go",
    starterCode: `package main

import "fmt"

func main() {
    fmt.Println("Hello, AarByte!")
}
`,
    enabled: true,
  },
  {
    id: "rust",
    name: "Rust",
    extension: "rs",
    monacoLanguage: "rust",
    starterCode: `fn main() {
    println!("Hello, AarByte!");
}
`,
    enabled: true,
  },
  {
    id: "php",
    name: "PHP",
    extension: "php",
    monacoLanguage: "php",
    starterCode: `<?php

function main() {
    echo "Hello, AarByte!\\n";
}

main();
`,
    enabled: true,
  },
];

export function getLanguageById(id: string): LanguageConfig | undefined {
  return LANGUAGES.find((lang) => lang.id === id);
}

export function getLanguageByExtension(extension: string): LanguageConfig | undefined {
  return LANGUAGES.find((lang) => lang.extension === extension);
}
