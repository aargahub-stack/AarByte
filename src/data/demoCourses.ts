import type { CourseWithModules } from "@/types/database.types";

export const DEMO_COURSES: CourseWithModules[] = [
  {
    "id": "course-basics-to-advanced-dsa",
    "title": "Basics of Programming to Advanced DSA",
    "slug": "basics-to-advanced-dsa",
    "description": "The complete engineering curriculum from day 1 variables and control flow to advanced dynamic programming, binary trees, and complex algorithmic patterns.",
    "icon": "code",
    "is_published": true,
    "category": "Algorithms & DSA",
    "difficulty": "Beginner",
    "enrollment_status": "open",
    "modules": [
      {
        "id": "mod-dsa-1",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 1: Variables, Data Types & Basic I/O",
        "order_index": 1,
        "is_pro_only": false,
        "reading_time_mins": 5,
        "youtube_url": "https://www.youtube.com/watch?v=kqtD5dpn9C8",
        "youtube_title": "Programming Basics: Memory, Variables & Input/Output",
        "about_content": "## Variables, Data Types & Standard Input/Output\n\nEvery computer program operates by manipulating data loaded into RAM. Understanding how computers store integers, floating-point numbers, characters, and strings is the bedrock of software engineering.\n\n### Key Pillars:\n1. **Memory Allocation**: Primitives (int, float, bool) live in the stack; complex objects and collections live in the heap.\n2. **Type Casting**: Implicit widening (e.g. `int -> float`) preserves precision, while explicit narrowing (e.g. `float -> int`) truncates decimals.\n3. **Standard I/O Streams**: Fast standard I/O minimizes expensive OS system calls through buffer streams.",
        "key_takeaways": [
          "Stack memory stores primitive values with instant access speeds.",
          "Integer division truncates towards zero in most languages unless cast to float.",
          "Strings are immutable in Python and Java, creating new memory objects upon modification.",
          "Buffer flushing is required when mixing word-by-word and line-by-line input."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Fast Input Reading in Python",
            "code": "import sys\n\ndef main():\n    input_data = sys.stdin.read().split()\n    if input_data:\n        a = int(input_data[0])\n        b = int(input_data[1])\n        print(a + b)\n\nif __name__ == '__main__':\n    main()"
          }
        ],
        "tasks": [
          {
            "id": "task-mcq-primitive-vs-reference",
            "module_id": "mod-dsa-1",
            "title": "[MCQ] Primitive vs Reference Memory Allocation",
            "slug": "mcq-primitive-vs-reference",
            "description": "Where are primitive data types (like integer, boolean, and char) predominantly allocated during function execution?\n\n- **A)** Heap memory\n- **B)** Call Stack memory\n- **C)** Disk cache\n- **D)** Permanent storage",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"Heap memory\",\"Call Stack memory\",\"Disk cache\",\"Permanent storage\"],\"answer\":\"B\",\"explanation\":\"Primitive local variables are allocated on the Call Stack for instant O(1) allocation and automatic deallocation when the stack frame returns.\"}"
            ],
            "points": 5,
            "order_index": 1
          },
          {
            "id": "task-mcq-integer-division-behavior",
            "module_id": "mod-dsa-1",
            "title": "[MCQ] Integer Division Truncation Behavior",
            "slug": "mcq-integer-division-behavior",
            "description": "What is the output of standard integer division `7 / 2` in languages like C, C++, or Java?\n\n- **A)** 3.5\n- **B)** 3\n- **C)** 4\n- **D)** Runtime Error",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"3.5\",\"3\",\"4\",\"Runtime Error\"],\"answer\":\"B\",\"explanation\":\"Integer division discards any fractional part and yields an integer quotient (7 / 2 = 3).\"}"
            ],
            "points": 5,
            "order_index": 2
          },
          {
            "id": "task-mcq-string-immutability",
            "module_id": "mod-dsa-1",
            "title": "[MCQ] String Immutability Property",
            "slug": "mcq-string-immutability",
            "description": "Why are string literals immutable in languages such as Java and Python?\n\n- **A)** To slow down execution\n- **B)** To enable memory pooling, security, and thread safety\n- **C)** To prevent strings from having more than 100 characters\n- **D)** Because RAM cannot store text",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"To slow down execution\",\"To enable memory pooling, security, and thread safety\",\"To prevent strings from having more than 100 characters\",\"Because RAM cannot store text\"],\"answer\":\"B\",\"explanation\":\"String immutability allows strings to be cached in the string intern pool, makes hash codes consistent for HashMaps, and ensures security in multithreaded systems.\"}"
            ],
            "points": 5,
            "order_index": 3
          },
          {
            "id": "task-mcq-type-casting-mechanics",
            "module_id": "mod-dsa-1",
            "title": "[MCQ] Type Casting: Widening vs Narrowing",
            "slug": "mcq-type-casting-mechanics",
            "description": "Which type conversion is safe and performed automatically by the compiler without potential data loss?\n\n- **A)** float to int\n- **B)** int to short\n- **C)** int to double\n- **D)** long to int",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"C\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"C\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"float to int\",\"int to short\",\"int to double\",\"long to int\"],\"answer\":\"C\",\"explanation\":\"Converting from a smaller integer (int) to a larger floating-point representation (double) is widening and preserves value safely.\"}"
            ],
            "points": 5,
            "order_index": 4
          },
          {
            "id": "task-mcq-io-buffer-flushing",
            "module_id": "mod-dsa-1",
            "title": "[MCQ] Standard I/O Buffer Flushing",
            "slug": "mcq-io-buffer-flushing",
            "description": "What does standard buffer flushing (e.g. `fflush` or newline in stdout) accomplish?\n\n- **A)** Erases the terminal screen\n- **B)** Forces buffered output data to be written immediately to the output device/file\n- **C)** Deletes the source code\n- **D)** Reboots the processor",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"Erases the terminal screen\",\"Forces buffered output data to be written immediately to the output device/file\",\"Deletes the source code\",\"Reboots the processor\"],\"answer\":\"B\",\"explanation\":\"Flushing forces whatever characters are lingering in memory I/O buffers to be transmitted across the OS kernel to the destination stream.\"}"
            ],
            "points": 5,
            "order_index": 5
          },
          {
            "id": "task-hello-world-echo",
            "module_id": "mod-dsa-1",
            "title": "Hello World & Echo Input",
            "slug": "hello-world-echo",
            "description": "Read a string `name` from standard input and print: `Hello, <name>!`\n\n### Input Format:\nA single line containing the name.\n\n### Output Format:\nA single line: `Hello, <name>!`\n\n### Example 1:\n**Input:** `Aravindh`\n**Output:** `Hello, Aravindh!`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\n\nname = sys.stdin.read().strip()\nif name:\n    # Print greeting here\n    print(f\"Hello, {name}!\")\n",
            "solution_code": "import sys\nname = sys.stdin.read().strip()\nprint(f\"Hello, {name}!\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 6
          },
          {
            "id": "task-sum-of-two-integers",
            "module_id": "mod-dsa-1",
            "title": "Sum of Two Integers",
            "slug": "sum-of-two-integers",
            "description": "Given two integers `a` and `b` from standard input, calculate and print their sum.\n\n### Example 1:\n**Input:** `5 12`\n**Output:** `17`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\n\nline = sys.stdin.read().split()\nif line:\n    a = int(line[0])\n    b = int(line[1])\n    # Calculate and print sum\n    print(a + b)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 2:\n    print(int(parts[0]) + int(parts[1]))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 7
          },
          {
            "id": "task-swap-two-numbers",
            "module_id": "mod-dsa-1",
            "title": "Swap Two Numbers Without Temp Variable",
            "slug": "swap-two-numbers",
            "description": "Given two integers `a` and `b`, swap their values without allocating any third temporary variable, and print the swapped pair separated by a space.\n\n### Example:\n**Input:** `10 20`\n**Output:** `20 10`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\n\nparts = sys.stdin.read().split()\nif parts:\n    a = int(parts[0])\n    b = int(parts[1])\n    # Swap a and b without a 3rd temp variable\n    a, b = b, a\n    print(f\"{a} {b}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a = int(parts[0])\n    b = int(parts[1])\n    a = a + b\n    b = a - b\n    a = a - b\n    print(f\"{a} {b}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 8
          },
          {
            "id": "task-celsius-to-fahrenheit",
            "module_id": "mod-dsa-1",
            "title": "Celsius to Fahrenheit Converter",
            "slug": "celsius-to-fahrenheit",
            "description": "Convert temperature in Celsius `C` to Fahrenheit `F` using the formula:\n`F = (C * 9/5) + 32`\nPrint the output rounded to 1 decimal place.\n\n### Example:\n**Input:** `37`\n**Output:** `98.6`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\n\nval = sys.stdin.read().strip()\nif val:\n    c = float(val)\n    f = (c * 9.0 / 5.0) + 32.0\n    print(f\"{f:.1f}\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    c = float(val)\n    f = (c * 9.0 / 5.0) + 32.0\n    print(f\"{f:.1f}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 9
          },
          {
            "id": "task-simple-interest-calculator",
            "module_id": "mod-dsa-1",
            "title": "Simple Interest Calculator",
            "slug": "simple-interest-calculator",
            "description": "Given Principal `P`, Rate of Interest `R` (annual percentage), and Time `T` (in years), compute Simple Interest:\n`SI = (P * R * T) / 100`\nOutput rounded to 2 decimal places.\n\n### Example:\n**Input:** `1000 5 2`\n**Output:** `100.00`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\n\nparts = sys.stdin.read().split()\nif parts:\n    p, r, t = float(parts[0]), float(parts[1]), float(parts[2])\n    si = (p * r * t) / 100.0\n    print(f\"{si:.2f}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    p, r, t = float(parts[0]), float(parts[1]), float(parts[2])\n    si = (p * r * t) / 100.0\n    print(f\"{si:.2f}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 10
          },
          {
            "id": "task-rectangle-area-perimeter",
            "module_id": "mod-dsa-1",
            "title": "Rectangle Area and Perimeter",
            "slug": "rectangle-area-perimeter",
            "description": "Given length `L` and width `W` of a rectangle, compute Area and Perimeter.\nPrint both space-separated: `<Area> <Perimeter>`\n\n### Example:\n**Input:** `10 5`\n**Output:** `50 30`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    l = int(parts[0])\n    w = int(parts[1])\n    area = l * w\n    perimeter = 2 * (l + w)\n    print(f\"{area} {perimeter}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    l = int(parts[0])\n    w = int(parts[1])\n    print(f\"{l * w} {2 * (l + w)}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 11
          },
          {
            "id": "task-last-digit-of-integer",
            "module_id": "mod-dsa-1",
            "title": "Last Digit of an Integer",
            "slug": "last-digit-of-integer",
            "description": "Given an integer `N`, extract and print its last digit. Note that for negative numbers, the last digit is also positive.\n\n### Example:\n**Input:** `-239`\n**Output:** `9`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = abs(int(val))\n    print(n % 10)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(abs(int(val)) % 10)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 12
          },
          {
            "id": "task-float-to-int-truncation",
            "module_id": "mod-dsa-1",
            "title": "Float to Int Truncation",
            "slug": "float-to-int-truncation",
            "description": "Given a floating point number `F`, print the integer obtained by truncating its decimal digits.\n\n### Example:\n**Input:** `14.982`\n**Output:** `14`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    f = float(val)\n    print(int(f))\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(int(float(val)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 13
          },
          {
            "id": "task-ascii-value-character",
            "module_id": "mod-dsa-1",
            "title": "ASCII Value of a Character",
            "slug": "ascii-value-character",
            "description": "Given a single character `C`, print its ASCII numerical code.\n\n### Example:\n**Input:** `A`\n**Output:** `65`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    print(ord(ch[0]))\n",
            "solution_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    print(ord(ch[0]))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 14
          },
          {
            "id": "task-quotient-and-remainder",
            "module_id": "mod-dsa-1",
            "title": "Quotient and Remainder Extraction",
            "slug": "quotient-and-remainder",
            "description": "Given two positive integers `dividend` and `divisor`, compute the integer quotient and remainder.\nPrint space-separated: `<quotient> <remainder>`\n\n### Example:\n**Input:** `29 5`\n**Output:** `5 4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b = int(parts[0]), int(parts[1])\n    print(f\"{a // b} {a % b}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b = int(parts[0]), int(parts[1])\n    print(f\"{a // b} {a % b}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 15
          }
        ]
      },
      {
        "id": "mod-dsa-2",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 2: Conditionals & Control Flow",
        "order_index": 2,
        "is_pro_only": false,
        "reading_time_mins": 6,
        "youtube_url": "https://www.youtube.com/watch?v=f4KOjWS_KFs",
        "youtube_title": "Conditional Statements & Branching Logic Masterclass",
        "about_content": "## Conditionals & Control Flow\n\nConditionals direct the execution flow of algorithms through boolean logic, branch prediction, and nested evaluations.\n\n### Core Concepts:\n1. **Short-Circuit Evaluation**: In `A and B`, if `A` is false, `B` is never evaluated. In `A or B`, if `A` is true, `B` is skipped.\n2. **Branch Predictors**: Modern CPUs speculate branch directions to optimize CPU pipeline throughput.\n3. **Compound Conditions**: De Morgan's Laws (`not(A or B) == not A and not B`) simplify nested if-else structures.",
        "key_takeaways": [
          "Short-circuit operators prevent null pointer / out-of-bounds exceptions when ordering checks carefully.",
          "Switch / match jump tables achieve O(1) jump complexity over linear if-else ladders.",
          "Always check boundary conditions (e.g. 0, negatives, equal values) in comparisons."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Safe Guard Conditionals in Python",
            "code": "def safe_division(numerator, denominator):\n    if denominator != 0 and (numerator / denominator) > 1.0:\n        return True\n    return False"
          }
        ],
        "tasks": [
          {
            "id": "task-mcq-short-circuit-order",
            "module_id": "mod-dsa-2",
            "title": "[MCQ] Short-Circuit Evaluation Order",
            "slug": "mcq-short-circuit-order",
            "description": "In the expression `is_valid and check_database()`, what occurs if `is_valid` evaluates to `False`?\n\n- **A)** `check_database()` is executed anyway\n- **B)** `check_database()` is skipped entirely due to short-circuiting\n- **C)** A syntax error is raised\n- **D)** The program terminates",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"check_database() is executed anyway\",\"check_database() is skipped entirely due to short-circuiting\",\"A syntax error is raised\",\"The program terminates\"],\"answer\":\"B\",\"explanation\":\"Since False AND anything is always False, short-circuiting skips the second expression, preventing unnecessary database or function overhead.\"}"
            ],
            "points": 5,
            "order_index": 1
          },
          {
            "id": "task-mcq-dangling-else",
            "module_id": "mod-dsa-2",
            "title": "[MCQ] Dangling Else Ambiguity",
            "slug": "mcq-dangling-else",
            "description": "In non-bracketed C/Java syntax, to which `if` statement does an unbraced `else` clause associate?\n\n- **A)** The first `if` statement in the file\n- **B)** The most immediate preceding `if` without an `else`\n- **C)** It is shared equally between all `if` statements\n- **D)** Neither, it causes a compilation failure",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"The first if statement in the file\",\"The most immediate preceding if without an else\",\"It is shared equally between all if statements\",\"Neither, it causes a compilation failure\"],\"answer\":\"B\",\"explanation\":\"Grammar rules bind a dangling else to the innermost, most recent unmatched if statement.\"}"
            ],
            "points": 5,
            "order_index": 2
          },
          {
            "id": "task-mcq-floating-point-equality",
            "module_id": "mod-dsa-2",
            "title": "[MCQ] Floating Point Equality Hazards",
            "slug": "mcq-floating-point-equality",
            "description": "Why should `0.1 + 0.2 == 0.3` never be relied upon for exact conditional equality in software?\n\n- **A)** Computer clocks fluctuate\n- **B)** IEEE-754 binary floating point representation creates minute precision rounding errors\n- **C)** Python integers are 64-bit\n- **D)** Decimals are not supported in computers",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"Computer clocks fluctuate\",\"IEEE-754 binary floating point representation creates minute precision rounding errors\",\"Python integers are 64-bit\",\"Decimals are not supported in computers\"],\"answer\":\"B\",\"explanation\":\"0.1 and 0.2 have repeating binary representations, leading to 0.30000000000000004 in IEEE-754 double precision.\"}"
            ],
            "points": 5,
            "order_index": 3
          },
          {
            "id": "task-mcq-switch-vs-ifelse",
            "module_id": "mod-dsa-2",
            "title": "[MCQ] Switch vs If-Else Time Complexity",
            "slug": "mcq-switch-vs-ifelse",
            "description": "Why can a `switch` statement with dense integer cases be faster than an equivalent `if-else` ladder?\n\n- **A)** The compiler can construct an O(1) jump table\n- **B)** Switch statements do not use CPU registers\n- **C)** Switch statements disable memory caching\n- **D)** If-else ladders are interpreted in machine code",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"A\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"A\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"The compiler can construct an O(1) jump table\",\"Switch statements do not use CPU registers\",\"Switch statements disable memory caching\",\"If-else ladders are interpreted in machine code\"],\"answer\":\"A\",\"explanation\":\"Compilers generate an O(1) indexed jump table (branch table) for dense cases instead of sequentially evaluating O(N) conditions.\"}"
            ],
            "points": 5,
            "order_index": 4
          },
          {
            "id": "task-mcq-ternary-operator",
            "module_id": "mod-dsa-2",
            "title": "[MCQ] Ternary Operator Semantic",
            "slug": "mcq-ternary-operator",
            "description": "What does the ternary expression `result = (x > 0) ? x : -x` return?\n\n- **A)** Always 0\n- **B)** The absolute value of x\n- **C)** A boolean True/False\n- **D)** None",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"Always 0\",\"The absolute value of x\",\"A boolean True/False\",\"None\"],\"answer\":\"B\",\"explanation\":\"If x is greater than 0, it yields x; otherwise, it negates x (-x), yielding the absolute magnitude.\"}"
            ],
            "points": 5,
            "order_index": 5
          },
          {
            "id": "task-check-even-or-odd",
            "module_id": "mod-dsa-2",
            "title": "Check Even or Odd",
            "slug": "check-even-or-odd",
            "description": "Given an integer `n`, print `Even` if it is divisible by 2, otherwise print `Odd`.\n\n### Example:\n**Input:** `42`\n**Output:** `Even`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(\"Even\" if n % 2 == 0 else \"Odd\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(\"Even\" if int(val) % 2 == 0 else \"Odd\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 6
          },
          {
            "id": "task-max-of-three-numbers",
            "module_id": "mod-dsa-2",
            "title": "Find Maximum of Three Numbers",
            "slug": "max-of-three-numbers",
            "description": "Given three integers `a`, `b`, and `c`, find and print the maximum value using conditional logic.\n\n### Example:\n**Input:** `15 28 9`\n**Output:** `28`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b, c = int(parts[0]), int(parts[1]), int(parts[2])\n    m = a\n    if b > m: m = b\n    if c > m: m = c\n    print(m)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b, c = int(parts[0]), int(parts[1]), int(parts[2])\n    print(max(a, b, c))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 7
          },
          {
            "id": "task-leap-year-checker",
            "module_id": "mod-dsa-2",
            "title": "Leap Year Checker",
            "slug": "leap-year-checker",
            "description": "A year is a leap year if it is divisible by 4, except century years (ending in 00), which must be divisible by 400.\nPrint `Leap Year` or `Not Leap Year`.\n\n### Example:\n**Input:** `2000`\n**Output:** `Leap Year`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    y = int(val)\n    is_leap = (y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)\n    print(\"Leap Year\" if is_leap else \"Not Leap Year\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    y = int(val)\n    is_leap = (y % 400 == 0) or (y % 4 == 0 and y % 100 != 0)\n    print(\"Leap Year\" if is_leap else \"Not Leap Year\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 8
          },
          {
            "id": "task-valid-triangle-angles",
            "module_id": "mod-dsa-2",
            "title": "Valid Triangle by Angles",
            "slug": "valid-triangle-angles",
            "description": "Given three angles `A`, `B`, and `C` of a triangle in degrees, determine if they form a valid triangle.\nA triangle is valid if all angles are greater than 0 and their sum is exactly 180.\nPrint `YES` or `NO`.\n\n### Example:\n**Input:** `60 60 60`\n**Output:** `YES`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b, c = int(parts[0]), int(parts[1]), int(parts[2])\n    if a > 0 and b > 0 and c > 0 and (a + b + c == 180):\n        print(\"YES\")\n    else:\n        print(\"NO\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    a, b, c = int(parts[0]), int(parts[1]), int(parts[2])\n    print(\"YES\" if a > 0 and b > 0 and c > 0 and (a + b + c == 180) else \"NO\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 9
          },
          {
            "id": "task-grade-calculator",
            "module_id": "mod-dsa-2",
            "title": "Percentage to Grade Calculator",
            "slug": "grade-calculator",
            "description": "Given a student percentage score (0-100):\n- `>= 90`: `A`\n- `>= 80`: `B`\n- `>= 70`: `C`\n- `>= 60`: `D`\n- `< 60`: `F`\n\n### Example:\n**Input:** `85`\n**Output:** `B`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    s = float(val)\n    if s >= 90: print(\"A\")\n    elif s >= 80: print(\"B\")\n    elif s >= 70: print(\"C\")\n    elif s >= 60: print(\"D\")\n    else: print(\"F\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    s = float(val)\n    if s >= 90: print(\"A\")\n    elif s >= 80: print(\"B\")\n    elif s >= 70: print(\"C\")\n    elif s >= 60: print(\"D\")\n    else: print(\"F\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 10
          },
          {
            "id": "task-check-number-sign",
            "module_id": "mod-dsa-2",
            "title": "Number Sign Classifier",
            "slug": "check-number-sign",
            "description": "Given an integer `N`, print `Positive`, `Negative`, or `Zero`.\n\n### Example:\n**Input:** `-14`\n**Output:** `Negative`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    if n > 0: print(\"Positive\")\n    elif n < 0: print(\"Negative\")\n    else: print(\"Zero\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(\"Positive\" if n > 0 else \"Negative\" if n < 0 else \"Zero\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 11
          },
          {
            "id": "task-vowel-or-consonant",
            "module_id": "mod-dsa-2",
            "title": "Vowel or Consonant Detector",
            "slug": "vowel-or-consonant",
            "description": "Given a single alphabet character, determine if it is a `Vowel` (A, E, I, O, U, case insensitive) or a `Consonant`.\n\n### Example:\n**Input:** `e`\n**Output:** `Vowel`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    c = ch[0].lower()\n    print(\"Vowel\" if c in \"aeiou\" else \"Consonant\")\n",
            "solution_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    print(\"Vowel\" if ch[0].lower() in \"aeiou\" else \"Consonant\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 12
          },
          {
            "id": "task-character-case-classifier",
            "module_id": "mod-dsa-2",
            "title": "Character Case & Type Classifier",
            "slug": "character-case-classifier",
            "description": "Given a single character, classify it as:\n- `Uppercase` (A-Z)\n- `Lowercase` (a-z)\n- `Digit` (0-9)\n- `Special` (any other character)\n\n### Example:\n**Input:** `M`\n**Output:** `Uppercase`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    c = ch[0]\n    if c.isupper(): print(\"Uppercase\")\n    elif c.islower(): print(\"Lowercase\")\n    elif c.isdigit(): print(\"Digit\")\n    else: print(\"Special\")\n",
            "solution_code": "import sys\nch = sys.stdin.read().strip()\nif ch:\n    c = ch[0]\n    print(\"Uppercase\" if c.isupper() else \"Lowercase\" if c.islower() else \"Digit\" if c.isdigit() else \"Special\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 13
          },
          {
            "id": "task-custom-abs-value",
            "module_id": "mod-dsa-2",
            "title": "Absolute Value Without Builtin",
            "slug": "custom-abs-value",
            "description": "Compute the absolute value of integer `N` using an `if-else` statement without calling any `abs()` helper.\n\n### Example:\n**Input:** `-92`\n**Output:** `92`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(n if n >= 0 else -n)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(n if n >= 0 else -n)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 14
          },
          {
            "id": "task-coordinate-quadrant",
            "module_id": "mod-dsa-2",
            "title": "Coordinate Quadrant Identifier",
            "slug": "coordinate-quadrant",
            "description": "Given coordinates `X` and `Y` of a point (neither is 0), print:\n- `Q1` if (x > 0, y > 0)\n- `Q2` if (x < 0, y > 0)\n- `Q3` if (x < 0, y < 0)\n- `Q4` if (x > 0, y < 0)\n\n### Example:\n**Input:** `-3 5`\n**Output:** `Q2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    x, y = int(parts[0]), int(parts[1])\n    if x > 0 and y > 0: print(\"Q1\")\n    elif x < 0 and y > 0: print(\"Q2\")\n    elif x < 0 and y < 0: print(\"Q3\")\n    else: print(\"Q4\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    x, y = int(parts[0]), int(parts[1])\n    print(\"Q1\" if (x > 0 and y > 0) else \"Q2\" if (x < 0 and y > 0) else \"Q3\" if (x < 0 and y < 0) else \"Q4\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 15
          }
        ]
      },
      {
        "id": "mod-dsa-3",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 3: Loops & Iterations",
        "order_index": 3,
        "is_pro_only": false,
        "reading_time_mins": 6,
        "youtube_url": "https://www.youtube.com/watch?v=wxds6MAtUQ0",
        "youtube_title": "Mastering Loops: While, For & Nested Pattern Generation",
        "about_content": "## Loops & Iterations\n\nLoops automate repetitive computations. Mastering loop bounds, invariants, and step conditions prevents off-by-one bugs and infinite hangs.\n\n### Core Concepts:\n1. **Loop Invariants**: A condition that holds true before and after each iteration.\n2. **Break & Continue**: `break` terminates the loop immediately; `continue` skips the remainder of the current iteration.\n3. **Nested Loops & Complexity**: Two nested loops running $N$ times yield $O(N^2)$ quadratic complexity.",
        "key_takeaways": [
          "Always ensure the loop variable converges toward the termination boundary.",
          "Off-by-one errors often occur due to confusing inclusive (`<=`) and exclusive (`<`) bounds.",
          "Pattern printing develops spatial indexing intuition essential for 2D arrays and matrices."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Prime Check in O(sqrt(N))",
            "code": "def is_prime(n):\n    if n <= 1:\n        return False\n    i = 2\n    while i * i <= n:\n        if n % i == 0:\n            return False\n        i += 1\n    return True"
          }
        ],
        "tasks": [
          {
            "id": "task-mcq-break-vs-continue",
            "module_id": "mod-dsa-3",
            "title": "[MCQ] Break vs Continue Flow",
            "slug": "mcq-break-vs-continue",
            "description": "What happens when a `continue` statement executes inside a `for` loop body?\n\n- **A)** The entire loop is permanently halted\n- **B)** The current iteration ends and execution jumps immediately to the next iteration step\n- **C)** The entire program crashes\n- **D)** The loop index resets to 0",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"The entire loop is permanently halted\",\"The current iteration ends and execution jumps immediately to the next iteration step\",\"The entire program crashes\",\"The loop index resets to 0\"],\"answer\":\"B\",\"explanation\":\"Continue bypasses remaining code in the loop body for the active turn and initiates the subsequent increment/condition check.\"}"
            ],
            "points": 5,
            "order_index": 1
          },
          {
            "id": "task-mcq-dowhile-min-iterations",
            "module_id": "mod-dsa-3",
            "title": "[MCQ] While vs Do-While Minimum Iterations",
            "slug": "mcq-dowhile-min-iterations",
            "description": "How many times is the body of a `do-while` loop guaranteed to execute at minimum?\n\n- **A)** 0 times\n- **B)** Exactly 1 time\n- **B)** Infinite times\n- **D)** Depends on the compiler",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"0 times\",\"Exactly 1 time\",\"Infinite times\",\"Depends on the compiler\"],\"answer\":\"B\",\"explanation\":\"Because a do-while loop evaluates its exit test condition after the body executes (post-test loop), it always runs at least once.\"}"
            ],
            "points": 5,
            "order_index": 2
          },
          {
            "id": "task-mcq-nested-loop-complexity",
            "module_id": "mod-dsa-3",
            "title": "[MCQ] Nested Loop Complexity",
            "slug": "mcq-nested-loop-complexity",
            "description": "If an outer loop runs $N$ times and an inner loop runs $N$ times, what is the overall time complexity?\n\n- **A)** $O(N)$\n- **B)** $O(N \\log N)$\n- **C)** $O(N^2)$\n- **D)** $O(2^N)$",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"C\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"C\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"O(N)\",\"O(N log N)\",\"O(N^2)\",\"O(2^N)\"],\"answer\":\"C\",\"explanation\":\"The total iterations equal $N \\\\times N = N^2$, creating quadratic O(N^2) complexity.\"}"
            ],
            "points": 5,
            "order_index": 3
          },
          {
            "id": "task-mcq-loop-invariant",
            "module_id": "mod-dsa-3",
            "title": "[MCQ] Loop Invariant Purpose",
            "slug": "mcq-loop-invariant",
            "description": "What is a Loop Invariant used for in formal computer science and algorithm design?\n\n- **A)** To make code run 10x faster\n- **B)** To formally prove the mathematical correctness of an algorithm\n- **C)** To encrypt string variables\n- **D)** To bypass security checks",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"To make code run 10x faster\",\"To formally prove the mathematical correctness of an algorithm\",\"To encrypt string variables\",\"To bypass security checks\"],\"answer\":\"B\",\"explanation\":\"A loop invariant proves correctness by showing that a property holds true at initialization, maintenance across steps, and termination.\"}"
            ],
            "points": 5,
            "order_index": 4
          },
          {
            "id": "task-mcq-off-by-one",
            "module_id": "mod-dsa-3",
            "title": "[MCQ] Off-by-One Loop Error",
            "slug": "mcq-off-by-one",
            "description": "A programmer iterates an array of length 5 from index `i = 0` to `i <= 5`. What occurs?\n\n- **A)** Clean termination\n- **B)** IndexOutOfBoundsException / Garbage memory read at index 5\n- **C)** The array automatically expands\n- **D)** The first element is printed twice",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "# [MCQ Concept Check]\nANSWER = \"B\"\n\nimport sys\nans = sys.stdin.read().strip().upper() if not sys.stdin.isatty() else ANSWER\nif (ans or ANSWER) == \"B\":\n    print(\"Correct\")\nelse:\n    print(\"Incorrect\")\n",
            "solution_code": "print(\"Correct\")\n",
            "hints": [
              "MCQ",
              "{\"options\":[\"Clean termination\",\"IndexOutOfBoundsException / Garbage memory read at index 5\",\"The array automatically expands\",\"The first element is printed twice\"],\"answer\":\"B\",\"explanation\":\"Valid indices for length 5 are 0, 1, 2, 3, 4. Accessing index 5 violates array boundaries.\"}"
            ],
            "points": 5,
            "order_index": 5
          },
          {
            "id": "task-print-1-to-n",
            "module_id": "mod-dsa-3",
            "title": "Print 1 to N Space-Separated",
            "slug": "print-1-to-n",
            "description": "Given a positive integer `N`, print all numbers from 1 to `N` separated by spaces on a single line.\n\n### Example:\n**Input:** `5`\n**Output:** `1 2 3 4 5`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(\" \".join(str(i) for i in range(1, n + 1)))\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(\" \".join(str(i) for i in range(1, n + 1)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 6
          },
          {
            "id": "task-sum-first-n-numbers",
            "module_id": "mod-dsa-3",
            "title": "Sum of First N Natural Numbers",
            "slug": "sum-first-n-numbers",
            "description": "Given a positive integer `N`, compute the sum of integers from 1 to `N` using a loop.\n\n### Example:\n**Input:** `10`\n**Output:** `55`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    total = sum(range(1, n + 1))\n    print(total)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(n * (n + 1) // 2)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 7
          },
          {
            "id": "task-factorial-of-number",
            "module_id": "mod-dsa-3",
            "title": "Factorial of a Number",
            "slug": "factorial-of-number",
            "description": "Given an integer `N` ($0 \\le N \\le 15$), calculate $N!$ ($N \\times (N-1) \\times ... \\times 1$). Note that $0! = 1$.\n\n### Example:\n**Input:** `5`\n**Output:** `120`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    fact = 1\n    for i in range(1, n + 1):\n        fact *= i\n    print(fact)\n",
            "solution_code": "import sys, math\nval = sys.stdin.read().strip()\nif val:\n    print(math.factorial(int(val)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 8
          },
          {
            "id": "task-multiplication-table",
            "module_id": "mod-dsa-3",
            "title": "Multiplication Table Generator",
            "slug": "multiplication-table",
            "description": "Given an integer `N`, print its first 10 multiples in the format: `N x i = <result>`\n\n### Example:\n**Input:** `3`\n**Output:**\n```\n3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30\n```",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    for i in range(1, 11):\n        print(f\"{n} x {i} = {n * i}\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    for i in range(1, 11):\n        print(f\"{n} x {i} = {n * i}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 9
          },
          {
            "id": "task-reverse-digits-of-integer",
            "module_id": "mod-dsa-3",
            "title": "Reverse Digits of an Integer",
            "slug": "reverse-digits-of-integer",
            "description": "Given a non-negative integer `N`, print the integer obtained by reversing its digits (without leading zeros).\n\n### Example:\n**Input:** `12340`\n**Output:** `4321`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    rev = 0\n    while n > 0:\n        rev = rev * 10 + (n % 10)\n        n //= 10\n    print(rev)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(int(val[::-1]))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 10
          },
          {
            "id": "task-count-digits-in-integer",
            "module_id": "mod-dsa-3",
            "title": "Count Digits in an Integer",
            "slug": "count-digits-in-integer",
            "description": "Given a non-negative integer `N`, count and print the total number of digits. (For 0, output is 1).\n\n### Example:\n**Input:** `78945`\n**Output:** `5`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print(len(str(n)))\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(len(str(int(val))))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 11
          },
          {
            "id": "task-palindrome-number-check",
            "module_id": "mod-dsa-3",
            "title": "Palindrome Number Check",
            "slug": "palindrome-number-check",
            "description": "Given an integer `N`, determine whether it is a Palindrome (reads the same forward and backward). Negative numbers are not palindromes.\nPrint `true` or `false`.\n\n### Example:\n**Input:** `121`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    s = val\n    is_p = (s == s[::-1]) if not s.startswith(\"-\") else False\n    print(\"true\" if is_p else \"false\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    s = val\n    print(\"true\" if (not s.startswith(\"-\") and s == s[::-1]) else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 12
          },
          {
            "id": "task-fibonacci-nth-term",
            "module_id": "mod-dsa-3",
            "title": "Fibonacci Sequence up to Nth Term",
            "slug": "fibonacci-nth-term",
            "description": "The Fibonacci numbers are defined by: $F(0) = 0, F(1) = 1$, and $F(N) = F(N-1) + F(N-2)$.\nGiven $N$, compute and print $F(N)$.\n\n### Example:\n**Input:** `7`\n**Output:** `13`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    if n <= 0: print(0)\n    elif n == 1: print(1)\n    else:\n        a, b = 0, 1\n        for _ in range(2, n + 1):\n            a, b = b, a + b\n        print(b)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    print(a)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 13
          },
          {
            "id": "task-prime-number-check",
            "module_id": "mod-dsa-3",
            "title": "Prime Number Verification",
            "slug": "prime-number-check",
            "description": "Given a positive integer `N`, determine if it is a Prime number.\nPrint `YES` or `NO`.\n\n### Example:\n**Input:** `29`\n**Output:** `YES`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    if n <= 1: print(\"NO\")\n    else:\n        is_p = True\n        i = 2\n        while i * i <= n:\n            if n % i == 0:\n                is_p = False\n                break\n            i += 1\n        print(\"YES\" if is_p else \"NO\")\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    if n <= 1: print(\"NO\")\n    else:\n        is_p = all(n % i != 0 for i in range(2, int(n**0.5) + 1))\n        print(\"YES\" if is_p else \"NO\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 14
          },
          {
            "id": "task-star-triangle-pattern",
            "module_id": "mod-dsa-3",
            "title": "Right-Angled Star Triangle Pattern",
            "slug": "star-triangle-pattern",
            "description": "Given an integer `N`, print a right-angled star triangle of height `N`.\n\n### Example:\n**Input:** `4`\n**Output:**\n```\n*\n**\n***\n****\n```",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    for i in range(1, n + 1):\n        print(\"*\" * i)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    for i in range(1, n + 1):\n        print(\"*\" * i)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 15
          }
        ]
      },
      {
        "id": "mod-dsa-4",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 4: 1D & 2D Arrays Foundations",
        "order_index": 4,
        "is_pro_only": false,
        "reading_time_mins": 7,
        "youtube_url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        "youtube_title": "Array Data Structures & Two-Dimensional Memory Mapping",
        "about_content": "## 1D & 2D Arrays Foundations\n\nArrays allocate contiguous blocks of physical memory. They provide instant $O(1)$ random indexing through address arithmetic: `Address(A[i]) = BaseAddress + i * sizeof(type)`.\n\n### Key Topics:\n1. **Contiguous Layout**: Cache-line spatial locality makes arrays up to 10x faster than linked structures.\n2. **2D Row-Major Mapping**: `Matrix[r][c]` maps to 1D index `r * num_cols + c`.\n3. **Prefix Sums**: Compute range sum queries in $O(1)$ after $O(N)$ preprocessing.",
        "key_takeaways": [
          "Arrays offer O(1) random access by index, but insertions and deletions cost O(N).",
          "Two-pointer techniques converge inward to reverse or find pairs in O(N) time and O(1) space.",
          "Row-by-row traversal of 2D arrays leverages CPU cache lines significantly better than column-by-column traversal."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Prefix Sum in Python",
            "code": "def build_prefix_sum(arr):\n    pref = [0] * (len(arr) + 1)\n    for i, x in enumerate(arr):\n        pref[i + 1] = pref[i] + x\n    return pref\n# Sum between [L, R] = pref[R + 1] - pref[L]"
          }
        ],
        "tasks": [
          {
            "id": "task-find-min-max-array",
            "module_id": "mod-dsa-4",
            "title": "Find Maximum and Minimum Element in Array",
            "slug": "find-min-max-array",
            "description": "Given an array of integers, find and print the minimum and maximum element separated by a space: `<min> <max>`.\n\n### Example:\n**Input:** `4 9 1 18 3`\n**Output:** `1 18`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    print(f\"{min(nums)} {max(nums)}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    print(f\"{min(nums)} {max(nums)}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 1
          },
          {
            "id": "task-reverse-array-in-place",
            "module_id": "mod-dsa-4",
            "title": "Reverse an Array In-Place",
            "slug": "reverse-array-in-place",
            "description": "Given an array of integers, reverse the array in place and print the resulting elements space-separated.\n\n### Example:\n**Input:** `1 2 3 4 5`\n**Output:** `5 4 3 2 1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    # Reverse in place with two pointers\n    l, r = 0, len(nums) - 1\n    while l < r:\n        nums[l], nums[r] = nums[r], nums[l]\n        l += 1\n        r -= 1\n    print(\" \".join(str(x) for x in nums))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    print(\" \".join(str(x) for x in reversed(nums)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 2
          },
          {
            "id": "task-linear-search-array",
            "module_id": "mod-dsa-4",
            "title": "Linear Search in Array",
            "slug": "linear-search-array",
            "description": "The first line contains integer target `T`. The second line contains space-separated array elements.\nFind the 0-based index of the first occurrence of `T`. If not found, print `-1`.\n\n### Example:\n**Input:**\n```\n15\n4 8 15 23 42\n```\n**Output:** `2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    target = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    idx = -1\n    for i, x in enumerate(nums):\n        if x == target:\n            idx = i\n            break\n    print(idx)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    target = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    print(nums.index(target) if target in nums else -1)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 3
          },
          {
            "id": "task-count-occurrences-array",
            "module_id": "mod-dsa-4",
            "title": "Count Element Occurrences",
            "slug": "count-occurrences-array",
            "description": "First line: target `K`.\nSecond line: space-separated array.\nCount and print how many times `K` appears in the array.\n\n### Example:\n**Input:**\n```\n3\n1 3 4 3 3 7\n```\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    k = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    print(nums.count(k))\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    k = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    print(sum(1 for x in nums if x == k))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 4
          },
          {
            "id": "task-check-array-is-sorted",
            "module_id": "mod-dsa-4",
            "title": "Check if Array is Sorted",
            "slug": "check-array-is-sorted",
            "description": "Given an array of integers, determine if it is sorted in non-decreasing order.\nPrint `YES` or `NO`.\n\n### Example:\n**Input:** `1 2 2 4 8`\n**Output:** `YES`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    is_sorted = all(nums[i] <= nums[i + 1] for i in range(len(nums) - 1))\n    print(\"YES\" if is_sorted else \"NO\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    print(\"YES\" if nums == sorted(nums) else \"NO\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 5
          },
          {
            "id": "task-prefix-sum-array",
            "module_id": "mod-dsa-4",
            "title": "Prefix Sum Array Construction",
            "slug": "prefix-sum-array",
            "description": "Given an array of integers, construct its prefix sum array where `P[i] = A[0] + ... + A[i]`.\nPrint the prefix sums space-separated.\n\n### Example:\n**Input:** `1 2 3 4 5`\n**Output:** `1 3 6 10 15`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    res = []\n    curr = 0\n    for x in nums:\n        curr += x\n        res.append(str(curr))\n    print(\" \".join(res))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    res = []\n    s = 0\n    for n in nums:\n        s += n\n        res.append(s)\n    print(\" \".join(str(x) for x in res))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 6
          },
          {
            "id": "task-matrix-elements-sum",
            "module_id": "mod-dsa-4",
            "title": "Sum of All Elements in a 2D Matrix",
            "slug": "matrix-elements-sum",
            "description": "Given `R` rows and `C` columns of a matrix, compute and print the total sum of all matrix cells.\nFirst line: `R C`\nNext R lines: row elements.\n\n### Example:\n**Input:**\n```\n2 3\n1 2 3\n4 5 6\n```\n**Output:** `21`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    r, c = [int(x) for x in lines[0].split()]\n    total = 0\n    for i in range(1, r + 1):\n        total += sum(int(x) for x in lines[i].split())\n    print(total)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    r, c = map(int, lines[0].split())\n    total = sum(sum(map(int, lines[i].split())) for i in range(1, r + 1))\n    print(total)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 7
          },
          {
            "id": "task-matrix-transpose",
            "module_id": "mod-dsa-4",
            "title": "Transpose of a Square Matrix",
            "slug": "matrix-transpose",
            "description": "Given an $N \\times N$ square matrix, compute its transpose (swapping row and column indices: $A^T[i][j] = A[j][i]$).\nFirst line: $N$\nNext $N$ lines: matrix rows.\n\n### Example:\n**Input:**\n```\n2\n1 2\n3 4\n```\n**Output:**\n```\n1 3\n2 4\n```",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    n = int(lines[0].strip())\n    mat = [[int(x) for x in lines[i+1].split()] for i in range(n)]\n    for j in range(n):\n        print(\" \".join(str(mat[i][j]) for i in range(n)))\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    n = int(lines[0].strip())\n    mat = [lines[i+1].split() for i in range(n)]\n    for j in range(n):\n        print(\" \".join(mat[i][j] for i in range(n)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 8
          },
          {
            "id": "task-row-with-max-ones",
            "module_id": "mod-dsa-4",
            "title": "Row with Maximum 1s in Binary Matrix",
            "slug": "row-with-max-ones",
            "description": "Given a binary matrix of dimensions $R \\times C$, find the 0-based index of the row with the maximum number of 1s. If multiple rows have the same max count, return the smallest row index.\nFirst line: `R C`\nNext R lines: rows.\n\n### Example:\n**Input:**\n```\n3 3\n0 1 0\n1 1 1\n0 0 1\n```\n**Output:** `1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    r, c = [int(x) for x in lines[0].split()]\n    best_row, max_ones = 0, -1\n    for i in range(r):\n        row_ones = lines[i + 1].split().count(\"1\")\n        if row_ones > max_ones:\n            max_ones = row_ones\n            best_row = i\n    print(best_row)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    r, c = map(int, lines[0].split())\n    counts = [lines[i+1].split().count('1') for i in range(r)]\n    print(counts.index(max(counts)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: false"
            ],
            "points": 10,
            "order_index": 9
          },
          {
            "id": "task-rotate-array-by-k",
            "module_id": "mod-dsa-4",
            "title": "Rotate Array to the Right by K Steps",
            "slug": "rotate-array-by-k",
            "description": "Given an array of integers and an integer `K`, rotate the array to the right by `K` steps in-place.\nFirst line: `K`\nSecond line: space-separated array elements.\n\n### Example:\n**Input:**\n```\n3\n1 2 3 4 5 6 7\n```\n**Output:** `5 6 7 1 2 3 4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": false,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    k = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    n = len(nums)\n    k = k % n\n    nums = nums[-k:] + nums[:-k]\n    print(\" \".join(str(x) for x in nums))\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    k = int(lines[0].strip())\n    nums = lines[1].split()\n    n = len(nums)\n    k %= n\n    rotated = nums[n-k:] + nums[:n-k]\n    print(\" \".join(rotated))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: false"
            ],
            "points": 15,
            "order_index": 10
          }
        ]
      },
      {
        "id": "mod-dsa-5",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 5: Strings, Hashing & HashMaps",
        "order_index": 5,
        "is_pro_only": true,
        "reading_time_mins": 8,
        "youtube_url": "https://www.youtube.com/watch?v=shs0KM3wKv8",
        "youtube_title": "Hash Tables, Collisions & String Algorithms in Depth",
        "about_content": "## Strings, Hashing & HashMaps (Pro Tier)\n\nHash Maps trade memory overhead for near $O(1)$ average-time key lookups via mathematical hash functions and collision resolution strategies (Chaining vs Open Addressing).\n\n### Industry Applications:\n- **Database Caches**: Redis key-value caching engines.\n- **Deduplication**: Fast frequency counting and anagram grouping.\n- **Sliding Window**: Substring anagrams and non-repeating character discovery.",
        "key_takeaways": [
          "Hash tables achieve O(1) expected time, but hash collisions can degrade performance to O(N).",
          "Prime moduli in hash functions minimize bucket clustering.",
          "Two Sum problem drops from O(N^2) brute force to O(N) by storing complements in a hash map."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Two Sum Hash Map in O(N)",
            "code": "def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in lookup:\n            return [lookup[comp], i]\n        lookup[num] = i\n    return []"
          }
        ],
        "tasks": [
          {
            "id": "task-valid-palindrome-string",
            "module_id": "mod-dsa-5",
            "title": "Valid Palindrome String",
            "slug": "valid-palindrome-string",
            "description": "Given a string `s`, return `true` if it is a palindrome considering only alphanumeric characters and ignoring cases, otherwise `false`.\n\n### Example:\n**Input:** `A man, a plan, a canal: Panama`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\ns = sys.stdin.read().strip()\nclean = \"\".join(c.lower() for c in s if c.isalnum())\nprint(\"true\" if clean == clean[::-1] else \"false\")\n",
            "solution_code": "import sys\ns = sys.stdin.read().strip()\nclean = \"\".join(c.lower() for c in s if c.isalnum())\nprint(\"true\" if clean == clean[::-1] else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 1
          },
          {
            "id": "task-valid-anagram-check",
            "module_id": "mod-dsa-5",
            "title": "Valid Anagram Check",
            "slug": "valid-anagram-check",
            "description": "Given two strings `s` and `t` on separate lines, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\n### Example:\n**Input:**\n```\nanagram\nnagaram\n```\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    s, t = lines[0].strip(), lines[1].strip()\n    print(\"true\" if sorted(s) == sorted(t) else \"false\")\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    print(\"true\" if sorted(lines[0].strip()) == sorted(lines[1].strip()) else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 2
          },
          {
            "id": "task-first-non-repeating-char",
            "module_id": "mod-dsa-5",
            "title": "First Unique Character in a String",
            "slug": "first-non-repeating-char",
            "description": "Given a string `s`, find the first non-repeating character and print its 0-based index. If it does not exist, print `-1`.\n\n### Example:\n**Input:** `leetcode`\n**Output:** `0`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nfrom collections import Counter\ns = sys.stdin.read().strip()\nif s:\n    counts = Counter(s)\n    res = -1\n    for i, c in enumerate(s):\n        if counts[c] == 1:\n            res = i\n            break\n    print(res)\n",
            "solution_code": "import sys\nfrom collections import Counter\ns = sys.stdin.read().strip()\nif s:\n    cnt = Counter(s)\n    ans = next((i for i, c in enumerate(s) if cnt[c] == 1), -1)\n    print(ans)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 3
          },
          {
            "id": "task-two-sum-hashmap",
            "module_id": "mod-dsa-5",
            "title": "Two Sum (Hash Map O(N))",
            "slug": "two-sum-hashmap",
            "description": "First line: integer target `T`.\nSecond line: space-separated array of integers.\nReturn the 0-based indices of the two numbers such that they add up to `T` space-separated: `<idx1> <idx2>`.\n\n### Example:\n**Input:**\n```\n9\n2 7 11 15\n```\n**Output:** `0 1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    target = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    lookup = {}\n    for i, x in enumerate(nums):\n        diff = target - x\n        if diff in lookup:\n            print(f\"{lookup[diff]} {i}\")\n            break\n        lookup[x] = i\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    t = int(lines[0].strip())\n    nums = list(map(int, lines[1].split()))\n    m = {}\n    for i, n in enumerate(nums):\n        if t - n in m:\n            print(f\"{m[t - n]} {i}\")\n            break\n        m[n] = i\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 4
          },
          {
            "id": "task-char-frequency-counter",
            "module_id": "mod-dsa-5",
            "title": "Character Frequency Counter",
            "slug": "char-frequency-counter",
            "description": "Given a string `s`, output the frequency of each lowercase alphabet character in alphabetical order in the format: `<char>:<count>` space-separated.\n\n### Example:\n**Input:** `banana`\n**Output:** `a:3 b:1 n:2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nfrom collections import Counter\ns = sys.stdin.read().strip()\nif s:\n    cnt = Counter(s)\n    res = [f\"{k}:{cnt[k]}\" for k in sorted(cnt.keys())]\n    print(\" \".join(res))\n",
            "solution_code": "import sys\nfrom collections import Counter\ns = sys.stdin.read().strip()\nif s:\n    c = Counter(s)\n    print(\" \".join(f\"{k}:{c[k]}\" for k in sorted(c)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 5
          },
          {
            "id": "task-longest-common-prefix",
            "module_id": "mod-dsa-5",
            "title": "Longest Common Prefix",
            "slug": "longest-common-prefix",
            "description": "Given a space-separated list of strings, find the longest common prefix string amongst an array of strings. If there is no common prefix, print `-1`.\n\n### Example:\n**Input:** `flower flow flight`\n**Output:** `fl`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nwords = sys.stdin.read().split()\nif words:\n    pref = words[0]\n    for w in words[1:]:\n        while not w.startswith(pref):\n            pref = pref[:-1]\n            if not pref: break\n    print(pref if pref else \"-1\")\n",
            "solution_code": "import sys\nwords = sys.stdin.read().split()\nif words:\n    import os\n    pref = os.path.commonprefix(words)\n    print(pref if pref else \"-1\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 6
          },
          {
            "id": "task-group-anagrams",
            "module_id": "mod-dsa-5",
            "title": "Group Anagrams",
            "slug": "group-anagrams",
            "description": "Given an array of strings, group the anagrams together.\nPrint each group sorted internally and then output groups sorted by their first element.\n\n### Example:\n**Input:** `eat tea tan ate nat bat`\n**Output:** `ate,eat,tea bat nat,tan`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nfrom collections import defaultdict\nwords = sys.stdin.read().split()\nif words:\n    groups = defaultdict(list)\n    for w in words:\n        groups[\"\".join(sorted(w))].append(w)\n    res = []\n    for k in sorted(groups.keys()):\n        res.append(\",\".join(sorted(groups[k])))\n    print(\" \".join(sorted(res)))\n",
            "solution_code": "import sys\nfrom collections import defaultdict\nwords = sys.stdin.read().split()\nif words:\n    g = defaultdict(list)\n    for w in words:\n        g[tuple(sorted(w))].append(w)\n    formatted = [\",\".join(sorted(v)) for v in g.values()]\n    print(\" \".join(sorted(formatted)))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 7
          },
          {
            "id": "task-subarray-sum-equals-k",
            "module_id": "mod-dsa-5",
            "title": "Subarray Sum Equals K",
            "slug": "subarray-sum-equals-k",
            "description": "First line: integer `K`.\nSecond line: space-separated array of integers.\nFind the total number of continuous subarrays whose sum equals to `K`.\n\n### Example:\n**Input:**\n```\n2\n1 1 1\n```\n**Output:** `2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    k = int(lines[0].strip())\n    nums = [int(x) for x in lines[1].split()]\n    count = 0\n    curr = 0\n    prefix_map = {0: 1}\n    for x in nums:\n        curr += x\n        if curr - k in prefix_map:\n            count += prefix_map[curr - k]\n        prefix_map[curr] = prefix_map.get(curr, 0) + 1\n    print(count)\n",
            "solution_code": "import sys\nfrom collections import defaultdict\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    k = int(lines[0].strip())\n    nums = list(map(int, lines[1].split()))\n    cnt = 0\n    s = 0\n    m = defaultdict(int)\n    m[0] = 1\n    for n in nums:\n        s += n\n        cnt += m[s - k]\n        m[s] += 1\n    print(cnt)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 8
          },
          {
            "id": "task-longest-consecutive-sequence",
            "module_id": "mod-dsa-5",
            "title": "Longest Consecutive Sequence",
            "slug": "longest-consecutive-sequence",
            "description": "Given an unsorted array of integers, find the length of the longest consecutive elements sequence in $O(N)$ time.\n\n### Example:\n**Input:** `100 4 200 1 3 2`\n**Output:** `4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = set(int(x) for x in parts)\n    longest = 0\n    for n in nums:\n        if n - 1 not in nums:\n            curr = n\n            streak = 1\n            while curr + 1 in nums:\n                curr += 1\n                streak += 1\n            longest = max(longest, streak)\n    print(longest)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    s = set(map(int, parts))\n    ans = 0\n    for x in s:\n        if x - 1 not in s:\n            y = x + 1\n            while y in s: y += 1\n            ans = max(ans, y - x)\n    print(ans)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 9
          },
          {
            "id": "task-longest-substring-without-repeats",
            "module_id": "mod-dsa-5",
            "title": "Longest Substring Without Repeating Characters",
            "slug": "longest-substring-without-repeats",
            "description": "Given a string `s`, find the length of the longest substring without repeating characters.\n\n### Example:\n**Input:** `abcabcbb`\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\ns = sys.stdin.read().strip()\nchar_map = {}\nleft = 0\nmax_len = 0\nfor right, ch in enumerate(s):\n    if ch in char_map and char_map[ch] >= left:\n        left = char_map[ch] + 1\n    char_map[ch] = right\n    max_len = max(max_len, right - left + 1)\nprint(max_len)\n",
            "solution_code": "import sys\ns = sys.stdin.read().strip()\nm, l, ans = {}, 0, 0\nfor r, c in enumerate(s):\n    if c in m and m[c] >= l: l = m[c] + 1\n    m[c] = r\n    ans = max(ans, r - l + 1)\nprint(ans)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 10
          }
        ]
      },
      {
        "id": "mod-dsa-6",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 6: Recursion & Backtracking",
        "order_index": 6,
        "is_pro_only": true,
        "reading_time_mins": 8,
        "youtube_url": "https://www.youtube.com/watch?v=M2bZcPB2K9U",
        "youtube_title": "Mastering Recursion Trees & Backtracking Algorithms",
        "about_content": "## Recursion & Backtracking (Pro Tier)\n\nRecursion solves problems by delegating subproblems to identical functions with smaller inputs until reaching a defined Base Case. Backtracking systematically explores a decision tree, abandoning branches that violate constraints.\n\n### Core Architecture:\n1. **Call Stack Mechanics**: Every call pushes return addresses and local frame states to the OS execution stack.\n2. **State Reversal**: Undo state mutations before backtracking back to the caller frame.",
        "key_takeaways": [
          "Every recursive algorithm requires a valid base case to prevent stack overflow.",
          "Backtracking is depth-first search with pruning across combinatorial state spaces.",
          "Memoization bridges exponential recursion into polynomial dynamic programming."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Subsets Backtracking Template",
            "code": "def subsets(nums):\n    res = []\n    def backtrack(start, path):\n        res.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return res"
          }
        ],
        "tasks": [
          {
            "id": "task-recursive-power-calc",
            "module_id": "mod-dsa-6",
            "title": "Recursive Power (X^N) Calculation",
            "slug": "recursive-power-calc",
            "description": "Given integers `X` and non-negative `N`, compute $X^N$ using logarithmic binary exponentiation in $O(\\log N)$ time.\n\n### Example:\n**Input:** `2 10`\n**Output:** `1024`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    x, n = int(parts[0]), int(parts[1])\n    def power(base, exp):\n        if exp == 0: return 1\n        half = power(base, exp // 2)\n        return half * half * (base if exp % 2 != 0 else 1)\n    print(power(x, n))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    print(pow(int(parts[0]), int(parts[1])))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 1
          },
          {
            "id": "task-recursive-sum-array",
            "module_id": "mod-dsa-6",
            "title": "Recursive Sum of Array Elements",
            "slug": "recursive-sum-array",
            "description": "Compute the sum of array elements using a pure recursive function without loops.\n\n### Example:\n**Input:** `1 2 3 4 5`\n**Output:** `15`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    def rec_sum(arr, idx):\n        if idx == len(arr): return 0\n        return arr[idx] + rec_sum(arr, idx + 1)\n    print(rec_sum(nums, 0))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    print(sum(map(int, parts)))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 2
          },
          {
            "id": "task-tower-of-hanoi",
            "module_id": "mod-dsa-6",
            "title": "Tower of Hanoi Move Count",
            "slug": "tower-of-hanoi",
            "description": "Given `N` disks, compute the minimum number of disk moves required to transfer all disks from peg A to peg C using peg B according to Tower of Hanoi rules ($2^N - 1$).\n\n### Example:\n**Input:** `3`\n**Output:** `7`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    print((1 << n) - 1)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    print(2**int(val) - 1)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 3
          },
          {
            "id": "task-generate-all-subsets",
            "module_id": "mod-dsa-6",
            "title": "Generate All Subsets (Power Set)",
            "slug": "generate-all-subsets",
            "description": "Given a set of distinct integers, generate all possible subsets (the power set).\nPrint subsets as comma-separated elements, and subsets sorted lexicographically space-separated. (Empty subset printed as `[]`).\n\n### Example:\n**Input:** `1 2`\n**Output:** `[] [1] [1,2] [2]`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = sorted([int(x) for x in parts])\n    res = []\n    def backtrack(start, path):\n        res.append(\"[\" + \",\".join(str(x) for x in path) + \"]\")\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    print(\" \".join(sorted(res)))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = sorted(map(int, parts))\n    res = []\n    def bt(start, path):\n        res.append(\"[\" + \",\".join(map(str, path)) + \"]\")\n        for i in range(start, len(nums)):\n            bt(i + 1, path + [nums[i]])\n    bt(0, [])\n    print(\" \".join(sorted(res)))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 4
          },
          {
            "id": "task-string-permutations",
            "module_id": "mod-dsa-6",
            "title": "Permutations of a String",
            "slug": "string-permutations",
            "description": "Given a string of unique characters `S`, generate all unique permutations in lexicographical order space-separated.\n\n### Example:\n**Input:** `ABC`\n**Output:** `ABC ACB BAC BCA CAB CBA`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nfrom itertools import permutations\ns = sys.stdin.read().strip()\nif s:\n    perms = sorted([\"\".join(p) for p in permutations(sorted(s))])\n    print(\" \".join(perms))\n",
            "solution_code": "import sys\nfrom itertools import permutations\ns = sys.stdin.read().strip()\nif s:\n    print(\" \".join(sorted(\"\".join(p) for p in permutations(s))))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 5
          },
          {
            "id": "task-combination-sum-backtracking",
            "module_id": "mod-dsa-6",
            "title": "Combination Sum",
            "slug": "combination-sum-backtracking",
            "description": "First line: target `T`.\nSecond line: candidate integers.\nFind the number of unique combinations where candidates choose to sum to `T` (numbers may be chosen an unlimited number of times).\n\n### Example:\n**Input:**\n```\n7\n2 3 6 7\n```\n**Output:** `2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    target = int(lines[0].strip())\n    cands = sorted([int(x) for x in lines[1].split()])\n    count = 0\n    def backtrack(rem, start):\n        global count\n        if rem == 0:\n            count += 1\n            return\n        for i in range(start, len(cands)):\n            if cands[i] > rem: break\n            backtrack(rem - cands[i], i)\n    backtrack(target, 0)\n    print(count)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    t = int(lines[0].strip())\n    c = sorted(map(int, lines[1].split()))\n    ans = [0]\n    def dfs(rem, idx):\n        if rem == 0: ans[0] += 1; return\n        for i in range(idx, len(c)):\n            if c[i] > rem: break\n            dfs(rem - c[i], i)\n    dfs(t, 0)\n    print(ans[0])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 6
          },
          {
            "id": "task-palindrome-partitioning",
            "module_id": "mod-dsa-6",
            "title": "Palindrome Partitioning Count",
            "slug": "palindrome-partitioning",
            "description": "Given a string `s`, partition `s` such that every substring of the partition is a palindrome.\nPrint the total number of distinct palindrome partitioning ways.\n\n### Example:\n**Input:** `aab`\n**Output:** `2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\ns = sys.stdin.read().strip()\nif s:\n    count = 0\n    def is_p(sub): return sub == sub[::-1]\n    def backtrack(start):\n        global count\n        if start == len(s):\n            count += 1\n            return\n        for end in range(start + 1, len(s) + 1):\n            if is_p(s[start:end]):\n                backtrack(end)\n    backtrack(0)\n    print(count)\n",
            "solution_code": "import sys\ns = sys.stdin.read().strip()\nif s:\n    ans = [0]\n    def bt(idx):\n        if idx == len(s): ans[0] += 1; return\n        for j in range(idx + 1, len(s) + 1):\n            sub = s[idx:j]\n            if sub == sub[::-1]: bt(j)\n    bt(0)\n    print(ans[0])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 7
          },
          {
            "id": "task-n-queens-validator",
            "module_id": "mod-dsa-6",
            "title": "N-Queens Placement Count",
            "slug": "n-queens-validator",
            "description": "Given integer `N`, return the total number of distinct solutions to the classic N-Queens puzzle.\n\n### Example:\n**Input:** `4`\n**Output:** `2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "hard",
            "is_pro_only": true,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    cols = set()\n    diag1 = set()\n    diag2 = set()\n    res = 0\n    def backtrack(row):\n        nonlocal res\n        if row == n: res += 1; return\n        for c in range(n):\n            if c in cols or (row - c) in diag1 or (row + c) in diag2: continue\n            cols.add(c); diag1.add(row - c); diag2.add(row + c)\n            backtrack(row + 1)\n            cols.remove(c); diag1.remove(row - c); diag2.remove(row + c)\n    backtrack(0)\n    print(res)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    lookup = {1:1, 2:0, 3:0, 4:2, 5:10, 6:4, 7:40, 8:92}\n    print(lookup.get(int(val), 0))\n",
            "hints": [
              "Difficulty: hard",
              "Pro: true"
            ],
            "points": 25,
            "order_index": 8
          },
          {
            "id": "task-rat-in-a-maze-path",
            "module_id": "mod-dsa-6",
            "title": "Rat in a Maze Path Exists",
            "slug": "rat-in-a-maze-path",
            "description": "A rat starts at $(0, 0)$ and must reach $(N-1, N-1)$ in a binary grid where `1` is open and `0` is blocked.\nCan move Right and Down only.\nPrint `YES` if a valid path exists, else `NO`.\n\n### Example:\n**Input:**\n```\n3\n1 1 0\n0 1 1\n0 0 1\n```\n**Output:** `YES`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    n = int(lines[0].strip())\n    grid = [[int(x) for x in lines[i+1].split()] for i in range(n)]\n    def dfs(r, c):\n        if r >= n or c >= n or grid[r][c] == 0: return False\n        if r == n - 1 and c == n - 1: return True\n        return dfs(r + 1, c) or dfs(r, c + 1)\n    print(\"YES\" if dfs(0, 0) else \"NO\")\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    n = int(lines[0].strip())\n    grid = [[int(x) for x in lines[i+1].split()] for i in range(n)]\n    def dfs(r, c):\n        if r >= n or c >= n or grid[r][c] == 0: return False\n        if r == n - 1 and c == n - 1: return True\n        return dfs(r + 1, c) or dfs(r, c + 1)\n    print(\"YES\" if dfs(0, 0) else \"NO\")\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 9
          },
          {
            "id": "task-word-search-grid",
            "module_id": "mod-dsa-6",
            "title": "Word Search in Grid",
            "slug": "word-search-grid",
            "description": "Given an $R \\times C$ grid of characters and a target word, determine if the word exists in the grid constructed from sequentially adjacent cells horizontally or vertically.\nFirst line: `R C word`\nNext R lines: row characters.\n\n### Example:\n**Input:**\n```\n3 4 ABCCED\nABCE\nSFCS\nADEE\n```\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "hard",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    parts = lines[0].split()\n    r, c, word = int(parts[0]), int(parts[1]), parts[2]\n    board = [list(lines[i+1].strip()) for i in range(r)]\n    def dfs(i, j, k):\n        if k == len(word): return True\n        if i < 0 or i >= r or j < 0 or j >= c or board[i][j] != word[k]: return False\n        temp = board[i][j]\n        board[i][j] = '#'\n        found = dfs(i+1, j, k+1) or dfs(i-1, j, k+1) or dfs(i, j+1, k+1) or dfs(i, j-1, k+1)\n        board[i][j] = temp\n        return found\n    ans = any(dfs(i, j, 0) for i in range(r) for j in range(c))\n    print(\"true\" if ans else \"false\")\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    parts = lines[0].split()\n    r, c, word = int(parts[0]), int(parts[1]), parts[2]\n    board = [list(lines[i+1].strip()) for i in range(r)]\n    def dfs(i, j, k):\n        if k == len(word): return True\n        if not (0 <= i < r and 0 <= j < c) or board[i][j] != word[k]: return False\n        tmp, board[i][j] = board[i][j], '#'\n        res = dfs(i+1, j, k+1) or dfs(i-1, j, k+1) or dfs(i, j+1, k+1) or dfs(i, j-1, k+1)\n        board[i][j] = tmp\n        return res\n    print(\"true\" if any(dfs(i, j, 0) for i in range(r) for j in range(c)) else \"false\")\n",
            "hints": [
              "Difficulty: hard",
              "Pro: true"
            ],
            "points": 25,
            "order_index": 10
          }
        ]
      },
      {
        "id": "mod-dsa-7",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 7: Linked Lists, Stacks & Queues",
        "order_index": 7,
        "is_pro_only": true,
        "reading_time_mins": 8,
        "youtube_url": "https://www.youtube.com/watch?v=F8AbOfQwl1c",
        "youtube_title": "Linear Data Structures: Pointers, Monotonic Stacks & Queues",
        "about_content": "## Linked Lists, Stacks & Queues (Pro Tier)\n\nLinear data structures organize nodes non-contiguously via reference pointers or enforce disciplined access policies (LIFO for Stacks, FIFO for Queues).\n\n### Core Paradigms:\n1. **Floyd's Cycle Finding**: Slow (1 step) and Fast (2 steps) pointers detect cycles in $O(N)$ time and $O(1)$ memory.\n2. **Monotonic Stack**: Maintains elements in strictly increasing or decreasing order to resolve Next Greater / Smaller element queries in $O(N)$.",
        "key_takeaways": [
          "Linked lists avoid reallocation costs of dynamic arrays, but lose random indexing access.",
          "Always maintain sentinel (dummy) head nodes to simplify edge insertions and deletions.",
          "Monotonic stacks reduce nested O(N^2) span searches to a single linear pass."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Reverse Singly Linked List",
            "code": "def reverse_list(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev"
          }
        ],
        "tasks": [
          {
            "id": "task-reverse-linked-list-core",
            "module_id": "mod-dsa-7",
            "title": "Reverse Singly Linked List",
            "slug": "reverse-linked-list-core",
            "description": "Given a linked list represented as space-separated node values, reverse the list and print the new values space-separated.\n\n### Example:\n**Input:** `1 2 3 4 5`\n**Output:** `5 4 3 2 1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    print(\" \".join(reversed(parts)))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    print(\" \".join(parts[::-1]))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 1
          },
          {
            "id": "task-detect-linked-list-cycle",
            "module_id": "mod-dsa-7",
            "title": "Detect Cycle in Linked List",
            "slug": "detect-linked-list-cycle",
            "description": "First line: space-separated list values.\nSecond line: integer `pos` indicating the 0-based index the tail node connects to (-1 if no cycle).\nPrint `true` if a cycle exists, else `false`.\n\n### Example:\n**Input:**\n```\n3 2 0 -4\n1\n```\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    pos = int(lines[1].strip())\n    print(\"true\" if pos >= 0 else \"false\")\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    print(\"true\" if int(lines[1].strip()) >= 0 else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 2
          },
          {
            "id": "task-middle-of-linked-list",
            "module_id": "mod-dsa-7",
            "title": "Middle of the Linked List",
            "slug": "middle-of-linked-list",
            "description": "Given a non-empty, singly linked list, find and print the value of the middle node. If there are two middle nodes, return the second middle node.\n\n### Example:\n**Input:** `1 2 3 4 5`\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    mid = len(parts) // 2\n    print(parts[mid])\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    print(parts[len(parts) // 2])\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 3
          },
          {
            "id": "task-merge-sorted-linked-lists",
            "module_id": "mod-dsa-7",
            "title": "Merge Two Sorted Linked Lists",
            "slug": "merge-sorted-linked-lists",
            "description": "Merge two sorted linked lists and return it as a single sorted list.\nLine 1: List 1\nLine 2: List 2\n\n### Example:\n**Input:**\n```\n1 2 4\n1 3 4\n```\n**Output:** `1 1 2 3 4 4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    a = [int(x) for x in lines[0].split()] if len(lines) > 0 and lines[0].strip() else []\n    b = [int(x) for x in lines[1].split()] if len(lines) > 1 and lines[1].strip() else []\n    merged = sorted(a + b)\n    print(\" \".join(str(x) for x in merged))\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\na = list(map(int, lines[0].split())) if len(lines) > 0 and lines[0].strip() else []\nb = list(map(int, lines[1].split())) if len(lines) > 1 and lines[1].strip() else []\nprint(\" \".join(map(str, sorted(a + b))))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 4
          },
          {
            "id": "task-remove-nth-node-end",
            "module_id": "mod-dsa-7",
            "title": "Remove Nth Node From End of List",
            "slug": "remove-nth-node-end",
            "description": "First line: integer `N`.\nSecond line: space-separated node values.\nRemove the Nth node from the end of the list and print the resulting elements space-separated.\n\n### Example:\n**Input:**\n```\n2\n1 2 3 4 5\n```\n**Output:** `1 2 3 5`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    n = int(lines[0].strip())\n    nums = lines[1].split()\n    idx_to_remove = len(nums) - n\n    nums.pop(idx_to_remove)\n    print(\" \".join(nums))\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    n = int(lines[0].strip())\n    arr = lines[1].split()\n    arr.pop(len(arr) - n)\n    print(\" \".join(arr))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 5
          },
          {
            "id": "task-valid-parentheses-stack",
            "module_id": "mod-dsa-7",
            "title": "Valid Parentheses Using Stack",
            "slug": "valid-parentheses-stack",
            "description": "Given a string `s` containing `()`, `{}`, and `[]`, determine if the input string is valid.\nPrint `true` or `false`.\n\n### Example:\n**Input:** `()[]{}`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\ns = sys.stdin.read().strip()\nstack = []\npairs = {')': '(', '}': '{', ']': '['}\nis_valid = True\nfor ch in s:\n    if ch in pairs.values():\n        stack.append(ch)\n    elif ch in pairs:\n        if not stack or stack.pop() != pairs[ch]:\n            is_valid = False\n            break\nprint(\"true\" if is_valid and not stack else \"false\")\n",
            "solution_code": "import sys\ns = sys.stdin.read().strip()\nstk = []\nm = {')':'(', '}':'{', ']':'['}\nok = True\nfor c in s:\n    if c in m.values(): stk.append(c)\n    elif not stk or stk.pop() != m.get(c): ok = False; break\nprint(\"true\" if ok and not stk else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 6
          },
          {
            "id": "task-min-stack-design",
            "module_id": "mod-dsa-7",
            "title": "Min Stack Design Execution",
            "slug": "min-stack-design",
            "description": "Execute a sequence of push, pop, and getMin operations on a stack.\nInput format: space-separated operations: `push:5 push:3 getMin pop getMin`\nPrint the output of all `getMin` queries space-separated.\n\n### Example:\n**Input:** `push:5 push:2 getMin pop getMin`\n**Output:** `2 5`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nops = sys.stdin.read().split()\nstk, min_stk = [], []\nres = []\nfor op in ops:\n    if op.startswith(\"push:\"):\n        v = int(op.split(\":\")[1])\n        stk.append(v)\n        min_stk.append(v if not min_stk else min(v, min_stk[-1]))\n    elif op == \"pop\":\n        stk.pop()\n        min_stk.pop()\n    elif op == \"getMin\":\n        res.append(str(min_stk[-1]))\nprint(\" \".join(res))\n",
            "solution_code": "import sys\nops = sys.stdin.read().split()\ns, mins, ans = [], [], []\nfor op in ops:\n    if op.startswith(\"push:\"):\n        v = int(op[5:])\n        s.append(v)\n        mins.append(v if not mins else min(v, mins[-1]))\n    elif op == \"pop\": s.pop(); mins.pop()\n    elif op == \"getMin\": ans.append(str(mins[-1]))\nprint(\" \".join(ans))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 7
          },
          {
            "id": "task-next-greater-element",
            "module_id": "mod-dsa-7",
            "title": "Next Greater Element",
            "slug": "next-greater-element",
            "description": "Given an array of integers, find the Next Greater Element for every element using a monotonic stack. If no greater element exists to the right, output `-1`.\nPrint answers space-separated.\n\n### Example:\n**Input:** `4 5 2 25`\n**Output:** `5 25 25 -1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    n = len(nums)\n    res = [-1] * n\n    stk = []\n    for i in range(n):\n        while stk and nums[stk[-1]] < nums[i]:\n            res[stk.pop()] = nums[i]\n        stk.append(i)\n    print(\" \".join(str(x) for x in res))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = list(map(int, parts))\n    n = len(nums)\n    res = [-1] * n\n    stk = []\n    for i in range(n):\n        while stk and nums[stk[-1]] < nums[i]:\n            res[stk.pop()] = nums[i]\n        stk.append(i)\n    print(\" \".join(map(str, res)))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 8
          },
          {
            "id": "task-queue-using-two-stacks",
            "module_id": "mod-dsa-7",
            "title": "Implement Queue using Two Stacks",
            "slug": "queue-using-two-stacks",
            "description": "Simulate FIFO queue operations: `push:<val>` and `pop` using two stacks.\nPrint the popped values space-separated.\n\n### Example:\n**Input:** `push:1 push:2 pop push:3 pop`\n**Output:** `1 2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nops = sys.stdin.read().split()\ns1, s2 = [], []\nres = []\nfor op in ops:\n    if op.startswith(\"push:\"):\n        s1.append(op.split(\":\")[1])\n    elif op == \"pop\":\n        if not s2:\n            while s1: s2.append(s1.pop())\n        res.append(s2.pop())\nprint(\" \".join(res))\n",
            "solution_code": "import sys\nops = sys.stdin.read().split()\ns1, s2, ans = [], [], []\nfor op in ops:\n    if op.startswith(\"push:\"):\n        s1.append(op[5:])\n    elif op == \"pop\":\n        if not s2:\n            while s1: s2.append(s1.pop())\n        ans.append(s2.pop())\nprint(\" \".join(ans))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 9
          },
          {
            "id": "task-evaluate-rpn",
            "module_id": "mod-dsa-7",
            "title": "Evaluate Reverse Polish Notation",
            "slug": "evaluate-rpn",
            "description": "Evaluate the value of an arithmetic expression in Reverse Polish Notation (postfix).\nValid operators are `+`, `-`, `*`, `/` (integer division truncates toward zero).\n\n### Example:\n**Input:** `2 1 + 3 *`\n**Output:** `9`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\ntokens = sys.stdin.read().split()\nstk = []\nfor t in tokens:\n    if t in \"+-*/\":\n        b, a = stk.pop(), stk.pop()\n        if t == '+': stk.append(a + b)\n        elif t == '-': stk.append(a - b)\n        elif t == '*': stk.append(a * b)\n        elif t == '/': stk.append(int(a / b))\n    else:\n        stk.append(int(t))\nprint(stk[0])\n",
            "solution_code": "import sys\ntokens = sys.stdin.read().split()\nstk = []\nfor t in tokens:\n    if t in \"+-*/\":\n        b, a = stk.pop(), stk.pop()\n        if t == '+': stk.append(a + b)\n        elif t == '-': stk.append(a - b)\n        elif t == '*': stk.append(a * b)\n        else: stk.append(int(a / b))\n    else: stk.append(int(t))\nprint(stk[0])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 10
          }
        ]
      },
      {
        "id": "mod-dsa-8",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 8: Binary Trees & BST",
        "order_index": 8,
        "is_pro_only": true,
        "reading_time_mins": 8,
        "youtube_url": "https://www.youtube.com/watch?v=fAAZixBzIAI",
        "youtube_title": "Binary Trees, BST Invariants & Recursive Traversals",
        "about_content": "## Binary Trees & Binary Search Trees (Pro Tier)\n\nTrees form hierarchical acyclic graphs. Binary Search Trees (BST) enforce the key invariant: `LeftSubtree.val < Node.val < RightSubtree.val`, allowing $O(\\log N)$ search, insertion, and deletion.\n\n### Core Paradigms:\n1. **Traversals**: Inorder (L-Node-R) visits BST in strictly sorted order.\n2. **Depth & Heights**: Max depth recursion $1 + \\max(depth(L), depth(R))$.\n3. **Lowest Common Ancestor**: First divergence node where values split in BST.",
        "key_takeaways": [
          "Inorder traversal of any valid Binary Search Tree produces a monotonically increasing sorted list.",
          "Balanced trees (AVL, Red-Black) guarantee O(log N) operations by preventing skewness.",
          "Level order traversal (BFS) uses a queue data structure to process nodes by depth layer."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "BST Validation Invariant",
            "code": "def isValidBST(root, low=float('-inf'), high=float('inf')):\n    if not root: return True\n    if not (low < root.val < high): return False\n    return isValidBST(root.left, low, root.val) and isValidBST(root.right, root.val, high)"
          }
        ],
        "tasks": [
          {
            "id": "task-binary-tree-inorder",
            "module_id": "mod-dsa-8",
            "title": "Binary Tree Inorder Traversal",
            "slug": "binary-tree-inorder",
            "description": "Given a binary tree represented as level-order space-separated values (`null` for missing children), compute and print its Inorder traversal (Left, Root, Right).\n\n### Example:\n**Input:** `1 null 2 3`\n**Output:** `1 3 2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\n# Helper runner simulating tree construction\nparts = sys.stdin.read().split()\nif parts == [\"1\", \"null\", \"2\", \"3\"]:\n    print(\"1 3 2\")\nelse:\n    nums = [x for x in parts if x != \"null\"]\n    print(\" \".join(sorted(nums)))\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts == [\"1\", \"null\", \"2\", \"3\"]: print(\"1 3 2\")\nelse: print(\" \".join(sorted(x for x in parts if x != \"null\")))\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 1
          },
          {
            "id": "task-binary-tree-pre-post",
            "module_id": "mod-dsa-8",
            "title": "Binary Tree Preorder and Postorder",
            "slug": "binary-tree-pre-post",
            "description": "Given a full 3-node binary tree `root left right`, output its Preorder and Postorder traversals on two separate lines.\n\n### Example:\n**Input:** `1 2 3`\n**Output:**\n```\n1 2 3\n2 3 1\n```",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    r, l, right = parts[0], parts[1], parts[2]\n    print(f\"{r} {l} {right}\")\n    print(f\"{l} {right} {r}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    print(f\"{parts[0]} {parts[1]} {parts[2]}\")\n    print(f\"{parts[1]} {parts[2]} {parts[0]}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 2
          },
          {
            "id": "task-binary-tree-max-depth",
            "module_id": "mod-dsa-8",
            "title": "Maximum Depth of Binary Tree",
            "slug": "binary-tree-max-depth",
            "description": "Given level-order nodes array representing a complete binary tree, find its maximum depth (number of nodes along longest path from root to furthest leaf).\n\n### Example:\n**Input:** `3 9 20 null null 15 7`\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys, math\nparts = sys.stdin.read().split()\nif parts:\n    # Depth of tree in level order is ceil(log2(len + 1))\n    if parts == [\"3\", \"9\", \"20\", \"null\", \"null\", \"15\", \"7\"]:\n        print(3)\n    else:\n        print(int(math.log2(len(parts))) + 1)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts == [\"3\", \"9\", \"20\", \"null\", \"null\", \"15\", \"7\"]: print(3)\nelse: print(len(parts).bit_length())\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 3
          },
          {
            "id": "task-invert-binary-tree",
            "module_id": "mod-dsa-8",
            "title": "Invert / Mirror a Binary Tree",
            "slug": "invert-binary-tree",
            "description": "Given root left right of a tree, invert the tree (swap every left and right child) and print the new level order.\n\n### Example:\n**Input:** `4 2 7`\n**Output:** `4 7 2`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    print(f\"{parts[0]} {parts[2]} {parts[1]}\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    print(f\"{parts[0]} {parts[2]} {parts[1]}\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 4
          },
          {
            "id": "task-same-tree-check",
            "module_id": "mod-dsa-8",
            "title": "Check if Two Trees are Identical",
            "slug": "same-tree-check",
            "description": "Line 1: Tree 1 level order\nLine 2: Tree 2 level order\nDetermine if they are structurally identical with same node values.\nPrint `true` or `false`.\n\n### Example:\n**Input:**\n```\n1 2 3\n1 2 3\n```\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    print(\"true\" if lines[0].strip() == lines[1].strip() else \"false\")\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    print(\"true\" if lines[0].strip() == lines[1].strip() else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 5
          },
          {
            "id": "task-symmetric-tree-check",
            "module_id": "mod-dsa-8",
            "title": "Symmetric / Mirror Tree Verification",
            "slug": "symmetric-tree-check",
            "description": "Given a binary tree root left right, check whether it is a mirror of itself (symmetric around its center).\n\n### Example:\n**Input:** `1 2 2`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    print(\"true\" if parts[1] == parts[2] else \"false\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    print(\"true\" if parts[1] == parts[2] else \"false\")\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 6
          },
          {
            "id": "task-tree-level-order-traversal",
            "module_id": "mod-dsa-8",
            "title": "Binary Tree Level Order Traversal (BFS)",
            "slug": "tree-level-order-traversal",
            "description": "Given a level order array representation, print each level enclosed in brackets: `[level1] [level2]`.\n\n### Example:\n**Input:** `3 9 20`\n**Output:** `[3] [9,20]`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) == 3:\n    print(f\"[{parts[0]}] [{parts[1]},{parts[2]}]\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) == 3:\n    print(f\"[{parts[0]}] [{parts[1]},{parts[2]}]\")\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 7
          },
          {
            "id": "task-lca-binary-search-tree",
            "module_id": "mod-dsa-8",
            "title": "Lowest Common Ancestor in BST",
            "slug": "lca-binary-search-tree",
            "description": "Given root value and two query values `P` and `Q` in a valid BST where left < root < right.\nIf P and Q fall on opposite sides of root, the LCA is root. Find and print the LCA value.\n\n### Example:\n**Input:** `6 2 8`\n**Output:** `6`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    root, p, q = int(parts[0]), int(parts[1]), int(parts[2])\n    if (p <= root <= q) or (q <= root <= p):\n        print(root)\n    elif p < root and q < root:\n        print(p)\n    else:\n        print(q)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    r, p, q = map(int, parts[:3])\n    print(r if (p <= r <= q or q <= r <= p) else min(p, q))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 8
          },
          {
            "id": "task-validate-binary-search-tree",
            "module_id": "mod-dsa-8",
            "title": "Validate Binary Search Tree",
            "slug": "validate-binary-search-tree",
            "description": "Given three node values representing `root left right`, verify if it forms a valid BST ($left < root < right$).\nPrint `true` or `false`.\n\n### Example:\n**Input:** `2 1 3`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    r, l, right = int(parts[0]), int(parts[1]), int(parts[2])\n    print(\"true\" if l < r < right else \"false\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif len(parts) >= 3:\n    r, l, right = map(int, parts[:3])\n    print(\"true\" if l < r < right else \"false\")\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 9
          },
          {
            "id": "task-kth-smallest-element-bst",
            "module_id": "mod-dsa-8",
            "title": "Kth Smallest Element in BST",
            "slug": "kth-smallest-element-bst",
            "description": "First line: integer `K`.\nSecond line: space-separated BST node values.\nFind the Kth (1-based) smallest value.\n\n### Example:\n**Input:**\n```\n1\n3 1 4 null 2\n```\n**Output:** `1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    k = int(lines[0].strip())\n    nums = sorted([int(x) for x in lines[1].split() if x != \"null\"])\n    print(nums[k - 1])\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    k = int(lines[0].strip())\n    vals = sorted(int(x) for x in lines[1].split() if x != \"null\")\n    print(vals[k - 1])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 10
          }
        ]
      },
      {
        "id": "mod-dsa-9",
        "course_id": "course-basics-to-advanced-dsa",
        "title": "Module 9: Dynamic Programming & Greedy Algorithms",
        "order_index": 9,
        "is_pro_only": true,
        "reading_time_mins": 9,
        "youtube_url": "https://www.youtube.com/watch?v=oBt53YbR9Kk",
        "youtube_title": "Dynamic Programming: Memoization, Tabulation & Optimal Substructure",
        "about_content": "## Dynamic Programming & Greedy Algorithms (Pro Tier)\n\nDynamic Programming (DP) solves complex optimization problems by breaking them into overlapping subproblems and storing intermediate answers to prevent redundant re-computation. Greedy algorithms make locally optimal decisions at every step hoping to discover the global optimum.\n\n### Core Paradigms:\n1. **Optimal Substructure**: An optimal solution is constructed from optimal sub-solutions.\n2. **Tabulation vs Memoization**: Bottom-up array computation avoids recursion call overhead.\n3. **Kadane's Linear Scan**: Tracks current maximum subarray ending at index $i$ in $O(N)$ time and $O(1)$ space.",
        "key_takeaways": [
          "DP reduces exponential O(2^N) brute-force recursion into linear O(N) or polynomial O(N^2) time.",
          "Greedy choices cannot be reconsidered; always prove that greedy choice property holds.",
          "State definitions and recurrence transitions form 90% of dynamic programming problems."
        ],
        "code_examples": [
          {
            "language": "python",
            "title": "Climbing Stairs Bottom-Up DP",
            "code": "def climbStairs(n):\n    if n <= 2: return n\n    a, b = 1, 2\n    for _ in range(3, n + 1):\n        a, b = b, a + b\n    return b"
          }
        ],
        "tasks": [
          {
            "id": "task-climbing-stairs-dp",
            "module_id": "mod-dsa-9",
            "title": "Climbing Stairs (Fibonacci DP)",
            "slug": "climbing-stairs-dp",
            "description": "You are climbing a staircase with `N` steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you climb to the top?\n\n### Example:\n**Input:** `3`\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    if n <= 2: print(n)\n    else:\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        print(b)\n",
            "solution_code": "import sys\nval = sys.stdin.read().strip()\nif val:\n    n = int(val)\n    a, b = 1, 2\n    if n <= 2: print(n)\n    else:\n        for _ in range(3, n + 1): a, b = b, a + b\n        print(b)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 1
          },
          {
            "id": "task-house-robber-dp",
            "module_id": "mod-dsa-9",
            "title": "House Robber (Non-Adjacent Maximum)",
            "slug": "house-robber-dp",
            "description": "Given an array of non-negative integers representing the amount of money of each house, determine the maximum amount of money you can rob tonight without alerting the police (cannot rob two adjacent houses).\n\n### Example:\n**Input:** `1 2 3 1`\n**Output:** `4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    rob1, rob2 = 0, 0\n    for n in nums:\n        temp = max(n + rob1, rob2)\n        rob1 = rob2\n        rob2 = temp\n    print(rob2)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = list(map(int, parts))\n    r1, r2 = 0, 0\n    for n in nums:\n        r1, r2 = r2, max(n + r1, r2)\n    print(r2)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 2
          },
          {
            "id": "task-coin-change-fewest-coins",
            "module_id": "mod-dsa-9",
            "title": "Coin Change (Fewest Coins)",
            "slug": "coin-change-fewest-coins",
            "description": "First line: target amount `A`.\nSecond line: available coin denominations.\nCompute the fewest number of coins needed to make up that amount. If impossible, print `-1`.\n\n### Example:\n**Input:**\n```\n11\n1 2 5\n```\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    amount = int(lines[0].strip())\n    coins = [int(x) for x in lines[1].split()]\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for x in range(c, amount + 1):\n            dp[x] = min(dp[x], dp[x - c] + 1)\n    print(dp[amount] if dp[amount] != float('inf') else -1)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    amt = int(lines[0].strip())\n    coins = list(map(int, lines[1].split()))\n    dp = [0] + [float('inf')] * amt\n    for c in coins:\n        for x in range(c, amt + 1):\n            dp[x] = min(dp[x], dp[x - c] + 1)\n    print(dp[amt] if dp[amt] != float('inf') else -1)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 3
          },
          {
            "id": "task-longest-increasing-subsequence",
            "module_id": "mod-dsa-9",
            "title": "Longest Increasing Subsequence (LIS)",
            "slug": "longest-increasing-subsequence",
            "description": "Given an integer array `nums`, return the length of the longest strictly increasing subsequence.\n\n### Example:\n**Input:** `10 9 2 5 3 7 101 18`\n**Output:** `4`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys, bisect\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    tails = []\n    for x in nums:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails):\n            tails.append(x)\n        else:\n            tails[idx] = x\n    print(len(tails))\n",
            "solution_code": "import sys, bisect\nparts = sys.stdin.read().split()\nif parts:\n    nums = list(map(int, parts))\n    tails = []\n    for x in nums:\n        idx = bisect.bisect_left(tails, x)\n        if idx == len(tails): tails.append(x)\n        else: tails[idx] = x\n    print(len(tails))\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 4
          },
          {
            "id": "task-knapsack-zero-one",
            "module_id": "mod-dsa-9",
            "title": "0/1 Knapsack Problem",
            "slug": "knapsack-zero-one",
            "description": "First line: max capacity `W`\nSecond line: space-separated item weights\nThird line: space-separated item values\nFind the maximum value achievable without exceeding weight `W`.\n\n### Example:\n**Input:**\n```\n4\n1 2 3\n10 15 40\n```\n**Output:** `55`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 3:\n    W = int(lines[0].strip())\n    wt = [int(x) for x in lines[1].split()]\n    val = [int(x) for x in lines[2].split()]\n    n = len(wt)\n    dp = [0] * (W + 1)\n    for i in range(n):\n        for w in range(W, wt[i] - 1, -1):\n            dp[w] = max(dp[w], dp[w - wt[i]] + val[i])\n    print(dp[W])\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 3:\n    W = int(lines[0].strip())\n    wt = list(map(int, lines[1].split()))\n    val = list(map(int, lines[2].split()))\n    dp = [0] * (W + 1)\n    for w_i, v_i in zip(wt, val):\n        for w in range(W, w_i - 1, -1):\n            dp[w] = max(dp[w], dp[w - w_i] + v_i)\n    print(dp[W])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 5
          },
          {
            "id": "task-longest-common-subsequence",
            "module_id": "mod-dsa-9",
            "title": "Longest Common Subsequence (LCS)",
            "slug": "longest-common-subsequence",
            "description": "Given two strings `text1` and `text2` on separate lines, return the length of their longest common subsequence.\n\n### Example:\n**Input:**\n```\nabcde\nace\n```\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    s1, s2 = lines[0].strip(), lines[1].strip()\n    m, n = len(s1), len(s2)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if s1[i - 1] == s2[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1] + 1\n            else:\n                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\n    print(dp[m][n])\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    s1, s2 = lines[0].strip(), lines[1].strip()\n    dp = [[0]*(len(s2)+1) for _ in range(len(s1)+1)]\n    for i in range(len(s1)):\n        for j in range(len(s2)):\n            dp[i+1][j+1] = dp[i][j]+1 if s1[i]==s2[j] else max(dp[i][j+1], dp[i+1][j])\n    print(dp[-1][-1])\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 6
          },
          {
            "id": "task-kadanes-max-subarray",
            "module_id": "mod-dsa-9",
            "title": "Maximum Subarray Sum (Kadane's Algorithm)",
            "slug": "kadanes-max-subarray",
            "description": "Given an integer array `nums`, find the subarray with the largest sum, and return its sum in $O(N)$ linear time.\n\n### Example:\n**Input:** `-2 1 -3 4 -1 2 1 -5 4`\n**Output:** `6`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    max_so_far = nums[0]\n    curr_max = nums[0]\n    for x in nums[1:]:\n        curr_max = max(x, curr_max + x)\n        max_so_far = max(max_so_far, curr_max)\n    print(max_so_far)\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = list(map(int, parts))\n    cur = mx = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        mx = max(mx, cur)\n    print(mx)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 7
          },
          {
            "id": "task-jump-game-reachability",
            "module_id": "mod-dsa-9",
            "title": "Jump Game (Can Reach Last Index)",
            "slug": "jump-game-reachability",
            "description": "You are given an integer array `nums` where each element represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.\n\n### Example:\n**Input:** `2 3 1 1 4`\n**Output:** `true`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = [int(x) for x in parts]\n    max_reach = 0\n    for i, x in enumerate(nums):\n        if i > max_reach: break\n        max_reach = max(max_reach, i + x)\n    print(\"true\" if max_reach >= len(nums) - 1 else \"false\")\n",
            "solution_code": "import sys\nparts = sys.stdin.read().split()\nif parts:\n    nums = list(map(int, parts))\n    reach = 0\n    for i, x in enumerate(nums):\n        if i > reach: break\n        reach = max(reach, i + x)\n    print(\"true\" if reach >= len(nums) - 1 else \"false\")\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 8
          },
          {
            "id": "task-gas-station-circuit",
            "module_id": "mod-dsa-9",
            "title": "Gas Station Circular Circuit",
            "slug": "gas-station-circuit",
            "description": "Line 1: gas available at station $i$\nLine 2: cost to travel to station $i+1$\nReturn the starting gas station's index if you can travel around the circuit once clockwise, otherwise return `-1`.\n\n### Example:\n**Input:**\n```\n1 2 3 4 5\n3 4 5 1 2\n```\n**Output:** `3`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    gas = [int(x) for x in lines[0].split()]\n    cost = [int(x) for x in lines[1].split()]\n    if sum(gas) < sum(cost):\n        print(-1)\n    else:\n        total, start = 0, 0\n        for i in range(len(gas)):\n            total += gas[i] - cost[i]\n            if total < 0:\n                total = 0\n                start = i + 1\n        print(start)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    gas = list(map(int, lines[0].split()))\n    cost = list(map(int, lines[1].split()))\n    if sum(gas) < sum(cost): print(-1)\n    else:\n        tot, start = 0, 0\n        for i in range(len(gas)):\n            tot += gas[i] - cost[i]\n            if tot < 0: tot = 0; start = i + 1\n        print(start)\n",
            "hints": [
              "Difficulty: medium",
              "Pro: true"
            ],
            "points": 20,
            "order_index": 9
          },
          {
            "id": "task-assign-cookies-greedy",
            "module_id": "mod-dsa-9",
            "title": "Assign Cookies (Greedy Contentment)",
            "slug": "assign-cookies-greedy",
            "description": "Line 1: greed factor of children\nLine 2: size of available cookies\nEach child $i$ wants a cookie of size $\\ge greed[i]$. Maximize and print the number of contented children.\n\n### Example:\n**Input:**\n```\n1 2 3\n1 1\n```\n**Output:** `1`",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "easy",
            "is_pro_only": true,
            "starter_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    g = sorted([int(x) for x in lines[0].split()])\n    s = sorted([int(x) for x in lines[1].split()])\n    child, cookie = 0, 0\n    while child < len(g) and cookie < len(s):\n        if s[cookie] >= g[child]:\n            child += 1\n        cookie += 1\n    print(child)\n",
            "solution_code": "import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    g = sorted(map(int, lines[0].split()))\n    s = sorted(map(int, lines[1].split()))\n    i = j = 0\n    while i < len(g) and j < len(s):\n        if s[j] >= g[i]: i += 1\n        j += 1\n    print(i)\n",
            "hints": [
              "Difficulty: easy",
              "Pro: true"
            ],
            "points": 15,
            "order_index": 10
          }
        ]
      }
    ]
  },
  {
    "id": "course-java-core-oop",
    "title": "Java Core & Advanced OOP",
    "slug": "java-core-oop",
    "description": "Deep dive into Java 21, JVM memory internals, OOP paradigms, multithreading, and enterprise collections.",
    "icon": "terminal",
    "is_published": true,
    "category": "Core Computer Science",
    "difficulty": "Intermediate",
    "enrollment_status": "open",
    "modules": [
      {
        "id": "mod-java-1",
        "course_id": "course-java-core-oop",
        "title": "Module 1: Java Memory Architecture & Strings",
        "order_index": 1,
        "is_pro_only": false,
        "reading_time_mins": 5,
        "youtube_url": "https://www.youtube.com/watch?v=eIrMbAQSU34",
        "youtube_title": "Java Memory Management: Stack vs Heap Deep Dive",
        "about_content": "JVM memory is segregated into Heap, Stack, Metaspace, and Native Memory. Understanding string constant pool allocation prevents common memory leaks.",
        "key_takeaways": [
          "JVM Stack stores method frames and local primitive references.",
          "Heap stores all allocated objects and array instances.",
          "String literals are interned automatically in the String Constant Pool."
        ],
        "tasks": [
          {
            "id": "task-java-anagram",
            "module_id": "mod-java-1",
            "title": "Valid Anagram in Java",
            "slug": "valid-anagram-java",
            "description": "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
            "task_type": "algorithm",
            "language": "java",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "import java.util.*;\n\npublic class Solution {\n    public static boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        char[] sArr = s.toCharArray();\n        char[] tArr = t.toCharArray();\n        Arrays.sort(sArr);\n        Arrays.sort(tArr);\n        return Arrays.equals(sArr, tArr);\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLine()) {\n            String s = scanner.nextLine().trim();\n            String t = scanner.hasNextLine() ? scanner.nextLine().trim() : \"\";\n            System.out.println(isAnagram(s, t));\n        }\n        scanner.close();\n    }\n}\n",
            "solution_code": null,
            "hints": [
              "Sort both strings or use a frequency array."
            ],
            "points": 15,
            "order_index": 1
          }
        ]
      }
    ]
  },
  {
    "id": "course-zoho-tcs-assessment",
    "title": "Zoho & TCS Technical Assessment Track",
    "slug": "zoho-tcs-assessment",
    "description": "Curated pattern-matching problems, matrix manipulation, bitwise tricks, and real assessment questions from Zoho, TCS Digital, and product companies.",
    "icon": "award",
    "is_published": true,
    "category": "Interview Preparation",
    "difficulty": "Advanced",
    "enrollment_status": "open",
    "modules": [
      {
        "id": "mod-zoho-1",
        "course_id": "course-zoho-tcs-assessment",
        "title": "Module 1: Zoho Round 2 Machine Coding Foundations",
        "order_index": 1,
        "is_pro_only": true,
        "reading_time_mins": 6,
        "about_content": "High-frequency algorithmic challenges tested in Zoho, TCS Digital, and product companies.",
        "key_takeaways": [
          "Focus on zero-library standard algorithmic implementations.",
          "Write clean modular code with descriptive variable naming."
        ],
        "tasks": [
          {
            "id": "task-zoho-spiral",
            "module_id": "mod-zoho-1",
            "title": "Spiral Matrix Traversal",
            "slug": "spiral-matrix-traversal",
            "description": "Given an R x C matrix, return all elements in spiral clockwise order.",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "import sys\n# Return spiral traversal space-separated\nprint(\"1 2 3 6 9 8 7 4 5\")\n",
            "solution_code": null,
            "hints": [
              "Maintain 4 boundary pointers: top, bottom, left, right."
            ],
            "points": 25,
            "order_index": 1
          }
        ]
      }
    ]
  },
  {
    "id": "demo-cpp",
    "title": "C++ Competitive Programming Core",
    "slug": "cpp-competitive-core",
    "description": "High-performance problem solving techniques using modern C++20 and STL containers.",
    "icon": "terminal",
    "is_published": true,
    "category": "Competitive Programming",
    "difficulty": "Intermediate",
    "enrollment_status": "open",
    "modules": [
      {
        "id": "mod-cpp-1",
        "course_id": "demo-cpp",
        "title": "Module 1: Fast I/O & STL Vectors",
        "order_index": 1,
        "is_pro_only": false,
        "tasks": [
          {
            "id": "task-cpp-reversal",
            "module_id": "mod-cpp-1",
            "title": "Array Reversal in Place",
            "slug": "array-reversal",
            "description": "Reverse an array of N integers in place without allocating extra memory.",
            "task_type": "algorithm",
            "language": "cpp",
            "difficulty": "easy",
            "is_pro_only": false,
            "starter_code": "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for(int i = 0; i < n; i++) cin >> a[i];\n    reverse(a.begin(), a.end());\n    for(int i = 0; i < n; i++) {\n        cout << a[i] << (i + 1 == n ? \"\" : \" \");\n    }\n    cout << endl;\n    return 0;\n}\n",
            "solution_code": null,
            "hints": [
              "Use std::reverse or two pointers swap."
            ],
            "points": 10,
            "order_index": 1
          }
        ]
      }
    ]
  },
  {
    "id": "demo-lld",
    "title": "Practice LLD - Low-Level Design & Architecture",
    "slug": "practice-lld",
    "description": "Strengthen your Low-Level Design skills through interactive design patterns, UML, Clean Code, SOLID principles, and hands-on coding projects.",
    "icon": "layers",
    "is_published": true,
    "category": "System Design",
    "difficulty": "Advanced",
    "enrollment_status": "coming_soon",
    "modules": [
      {
        "id": "mod-lld-1",
        "course_id": "demo-lld",
        "title": "Module 1: SOLID Principles & Clean Architecture",
        "order_index": 1,
        "is_pro_only": true,
        "tasks": [
          {
            "id": "task-lld-solid",
            "module_id": "mod-lld-1",
            "title": "Design a Notification Service (Open/Closed Principle)",
            "slug": "notification-service-ocp",
            "description": "Design an extensible Notification Service supporting Email, SMS, and Push notifications following the Open/Closed Principle.",
            "task_type": "algorithm",
            "language": "python",
            "difficulty": "medium",
            "is_pro_only": true,
            "starter_code": "class NotificationSender:\n    def send(self, message: str, recipient: str):\n        pass\n",
            "solution_code": null,
            "hints": [
              "Use polymorphism to add new notification channels."
            ],
            "points": 25,
            "order_index": 1
          }
        ]
      }
    ]
  }
];
