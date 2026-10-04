import fs from "fs";
import path from "path";
import { CURRICULUM_MODULES } from "./curriculum_data.mjs";

const dsaModules = CURRICULUM_MODULES.map((m) => {
  let tOrder = 1;
  const tasks = [];

  for (const mcq of m.mcqs || []) {
    tasks.push({
      id: "task-" + mcq.slug,
      module_id: "mod-dsa-" + m.order_index,
      title: mcq.title,
      slug: mcq.slug,
      description: mcq.description,
      task_type: "algorithm",
      language: "python",
      difficulty: "easy",
      is_pro_only: m.is_pro_only,
      starter_code: `# [MCQ Concept Check]\nANSWER = "${mcq.answer}"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == "${mcq.answer}":\n    print("Correct")\nelse:\n    print("Incorrect")\n`,
      solution_code: `print("Correct")\n`,
      hints: [
        "MCQ",
        JSON.stringify({
          options: mcq.options,
          answer: mcq.answer,
          explanation: mcq.explanation,
        }),
      ],
      points: mcq.points || 5,
      order_index: tOrder++,
    });
  }

  for (const code of m.codings || []) {
    tasks.push({
      id: "task-" + code.slug,
      module_id: "mod-dsa-" + m.order_index,
      title: code.title,
      slug: code.slug,
      description: code.description,
      task_type: "algorithm",
      language: "python",
      difficulty: code.difficulty,
      is_pro_only: m.is_pro_only,
      starter_code: code.starter_code,
      solution_code: code.solution_code,
      hints: [
        `Difficulty: ${code.difficulty}`,
        m.is_pro_only ? "Pro: true" : "Pro: false",
      ],
      points: code.points || 10,
      order_index: tOrder++,
    });
  }

  return {
    id: "mod-dsa-" + m.order_index,
    course_id: "course-basics-to-advanced-dsa",
    title: m.title,
    order_index: m.order_index,
    is_pro_only: m.is_pro_only,
    reading_time_mins: m.reading_time_mins,
    youtube_url: m.youtube_url,
    youtube_title: m.youtube_title,
    about_content: m.about_content,
    key_takeaways: m.key_takeaways,
    code_examples: m.code_examples,
    tasks,
  };
});

const DEMO_COURSES = [
  {
    id: "course-basics-to-advanced-dsa",
    title: "Basics of Programming to Advanced DSA",
    slug: "basics-to-advanced-dsa",
    description:
      "The complete engineering curriculum from day 1 variables and control flow to advanced dynamic programming, binary trees, and complex algorithmic patterns.",
    icon: "code",
    is_published: true,
    category: "Algorithms & DSA",
    difficulty: "Beginner",
    enrollment_status: "open",
    modules: dsaModules,
  },
  {
    id: "course-java-core-oop",
    title: "Java Core & Advanced OOP",
    slug: "java-core-oop",
    description:
      "Deep dive into Java 21, JVM memory internals, OOP paradigms, multithreading, and enterprise collections.",
    icon: "terminal",
    is_published: true,
    category: "Core Computer Science",
    difficulty: "Intermediate",
    enrollment_status: "open",
    modules: [
      {
        id: "mod-java-1",
        course_id: "course-java-core-oop",
        title: "Module 1: Java Memory Architecture & Strings",
        order_index: 1,
        is_pro_only: false,
        reading_time_mins: 5,
        youtube_url: "https://www.youtube.com/watch?v=eIrMbAQSU34",
        youtube_title: "Java Memory Management: Stack vs Heap Deep Dive",
        about_content:
          "JVM memory is segregated into Heap, Stack, Metaspace, and Native Memory. Understanding string constant pool allocation prevents common memory leaks.",
        key_takeaways: [
          "JVM Stack stores method frames and local primitive references.",
          "Heap stores all allocated objects and array instances.",
          "String literals are interned automatically in the String Constant Pool.",
        ],
        tasks: [
          {
            id: "task-java-anagram",
            module_id: "mod-java-1",
            title: "Valid Anagram in Java",
            slug: "valid-anagram-java",
            description:
              "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
            task_type: "algorithm",
            language: "java",
            difficulty: "easy",
            is_pro_only: false,
            starter_code: `import java.util.*;\n\npublic class Solution {\n    public static boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        char[] sArr = s.toCharArray();\n        char[] tArr = t.toCharArray();\n        Arrays.sort(sArr);\n        Arrays.sort(tArr);\n        return Arrays.equals(sArr, tArr);\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLine()) {\n            String s = scanner.nextLine().trim();\n            String t = scanner.hasNextLine() ? scanner.nextLine().trim() : "";\n            System.out.println(isAnagram(s, t));\n        }\n        scanner.close();\n    }\n}\n`,
            solution_code: null,
            hints: ["Sort both strings or use a frequency array."],
            points: 15,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "course-zoho-tcs-assessment",
    title: "Zoho & TCS Technical Assessment Track",
    slug: "zoho-tcs-assessment",
    description:
      "Curated pattern-matching problems, matrix manipulation, bitwise tricks, and real assessment questions from Zoho, TCS Digital, and product companies.",
    icon: "award",
    is_published: true,
    category: "Interview Preparation",
    difficulty: "Advanced",
    enrollment_status: "open",
    modules: [
      {
        id: "mod-zoho-1",
        course_id: "course-zoho-tcs-assessment",
        title: "Module 1: Zoho Round 2 Machine Coding Foundations",
        order_index: 1,
        is_pro_only: true,
        reading_time_mins: 6,
        about_content:
          "High-frequency algorithmic challenges tested in Zoho, TCS Digital, and product companies.",
        key_takeaways: [
          "Focus on zero-library standard algorithmic implementations.",
          "Write clean modular code with descriptive variable naming.",
        ],
        tasks: [
          {
            id: "task-zoho-spiral",
            module_id: "mod-zoho-1",
            title: "Spiral Matrix Traversal",
            slug: "spiral-matrix-traversal",
            description:
              "Given an R x C matrix, return all elements in spiral clockwise order.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            is_pro_only: true,
            starter_code: `import sys\n# Return spiral traversal space-separated\nprint("1 2 3 6 9 8 7 4 5")\n`,
            solution_code: null,
            hints: ["Maintain 4 boundary pointers: top, bottom, left, right."],
            points: 25,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-cpp",
    title: "C++ Competitive Programming Core",
    slug: "cpp-competitive-core",
    description:
      "High-performance problem solving techniques using modern C++20 and STL containers.",
    icon: "terminal",
    is_published: true,
    category: "Competitive Programming",
    difficulty: "Intermediate",
    enrollment_status: "open",
    modules: [
      {
        id: "mod-cpp-1",
        course_id: "demo-cpp",
        title: "Module 1: Fast I/O & STL Vectors",
        order_index: 1,
        is_pro_only: false,
        tasks: [
          {
            id: "task-cpp-reversal",
            module_id: "mod-cpp-1",
            title: "Array Reversal in Place",
            slug: "array-reversal",
            description:
              "Reverse an array of N integers in place without allocating extra memory.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            is_pro_only: false,
            starter_code: `#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for(int i = 0; i < n; i++) cin >> a[i];\n    reverse(a.begin(), a.end());\n    for(int i = 0; i < n; i++) {\n        cout << a[i] << (i + 1 == n ? "" : " ");\n    }\n    cout << endl;\n    return 0;\n}\n`,
            solution_code: null,
            hints: ["Use std::reverse or two pointers swap."],
            points: 10,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-lld",
    title: "Practice LLD - Low-Level Design & Architecture",
    slug: "practice-lld",
    description:
      "Strengthen your Low-Level Design skills through interactive design patterns, UML, Clean Code, SOLID principles, and hands-on coding projects.",
    icon: "layers",
    is_published: true,
    category: "System Design",
    difficulty: "Advanced",
    enrollment_status: "coming_soon",
    modules: [
      {
        id: "mod-lld-1",
        course_id: "demo-lld",
        title: "Module 1: SOLID Principles & Clean Architecture",
        order_index: 1,
        is_pro_only: true,
        tasks: [
          {
            id: "task-lld-solid",
            module_id: "mod-lld-1",
            title: "Design a Notification Service (Open/Closed Principle)",
            slug: "notification-service-ocp",
            description:
              "Design an extensible Notification Service supporting Email, SMS, and Push notifications following the Open/Closed Principle.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            is_pro_only: true,
            starter_code: `class NotificationSender:\n    def send(self, message: str, recipient: str):\n        pass\n`,
            solution_code: null,
            hints: ["Use polymorphism to add new notification channels."],
            points: 25,
            order_index: 1,
          },
        ],
      },
    ],
  },
];

const fileContent = `import type { CourseWithModules } from "@/types/database.types";

export const DEMO_COURSES: CourseWithModules[] = ${JSON.stringify(DEMO_COURSES, null, 2)};
`;

fs.writeFileSync(path.join("src", "data", "demoCourses.ts"), fileContent, "utf-8");
console.log("✓ Successfully wrote updated src/data/demoCourses.ts with 9 curriculum modules and 105 tasks!");
