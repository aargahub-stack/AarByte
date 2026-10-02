import type { CourseWithModules } from "@/types/database.types";

export const DEMO_COURSES: CourseWithModules[] = [
  {
    id: "demo-python",
    title: "Python Data Structures & Algorithms",
    slug: "python-dsa",
    description: "Master essential algorithms, arrays, hash maps, and recursion with LeetCode-style Python tasks.",
    icon: "code",
    is_published: true,
    modules: [
      {
        id: "mod-py-1",
        course_id: "demo-python",
        title: "Module 1: Data Structures - Arrays & Two Pointers",
        order_index: 1,
        reading_time_mins: 6,
        youtube_url: "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        youtube_title: "Data Structures in 15 Minutes - Visual Intuition & Practical Guide",
        about_content: `### What is a Data Structure?

A **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently. Just like a physical library organizes books by categories and call numbers so you can locate them in seconds, data structures organize data so algorithms can access and manipulate values in optimal time.

---

### Core Data Structure Categories

1. **Linear Data Structures**: Elements are arranged sequentially in memory (e.g., Arrays, Linked Lists, Stacks, Queues).
2. **Non-Linear Data Structures**: Elements have hierarchical or interconnected relationships (e.g., Trees, Graphs).
3. **Hash-Based Structures**: Key-value mapping providing near O(1) lookup times (e.g., Hash Tables, Hash Sets).

---

### Where Can We Use It? (Real-World Applications)

- **Operating Systems**: Task scheduling uses **Priority Queues** (Heaps); undo/redo actions in code editors use **Stacks**.
- **Databases & Indexing**: Relational engines (PostgreSQL, MySQL) index table rows using **B+ Trees** and **LSM Trees** for lightning-fast disk retrieval.
- **Web Browsers**: Browser history navigation (Back/Forward buttons) is powered by two distinct **Stacks**.
- **Social Networks & Maps**: Friend connections (LinkedIn, Instagram) and GPS routing (Google Maps) rely heavily on **Graphs** and BFS/Dijkstra algorithms.
- **Compilers & Interpreters**: Syntax parsing and bracket matching use **Abstract Syntax Trees (AST)** and **Call Stacks**.

---

### The Two-Pointer Optimization Pattern

Instead of checking every pair with nested loops ($O(N^2)$), the Two-Pointer technique maintains two cursor indices (e.g., \`left\` at start and \`right\` at end) and moves them inward based on comparison logic, reducing the time complexity to **$O(N)$ linear time** and **$O(1)$ space**.`,
        key_takeaways: [
          "Data structures define how information is organized in RAM to optimize algorithmic execution speed.",
          "Arrays offer instant O(1) random access via memory indexing, but resizing and insertions cost O(N).",
          "The Two-Pointer pattern eliminates nested O(N^2) loops by converging from boundaries in O(N) time.",
          "Hash Maps trade memory for O(1) average lookup speeds using hash functions and bucket collision handling."
        ],
        code_examples: [
          {
            language: "python",
            title: "Two Pointers Array Scan (Python)",
            code: "def two_sum_sorted(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        s = arr[left] + arr[right]\n        if s == target:\n            return (left, right)\n        elif s < target:\n            left += 1\n        else:\n            right -= 1\n    return None"
          },
          {
            language: "java",
            title: "Hash Map Fast Lookup (Java)",
            code: "import java.util.HashMap;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int comp = target - nums[i];\n            if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}"
          }
        ],
        tasks: [
          {
            id: "task-py-twosum",
            module_id: "mod-py-1",
            title: "Two Sum",
            slug: "two-sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "def two_sum(nums, target):\n    # Return [index1, index2]\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\nimport sys, json\nlines = sys.stdin.read().splitlines()\nif lines:\n    nums = json.loads(lines[0])\n    target = int(lines[1])\n    print(json.dumps(two_sum(nums, target)))\n",
            solution_code: null,
            hints: ["Use a hash map to store previously seen numbers."],
            points: 10,
            order_index: 1,
          },
          {
            id: "task-py-palindrome",
            module_id: "mod-py-1",
            title: "Valid Palindrome",
            slug: "valid-palindrome",
            description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "def is_palindrome(s: str) -> bool:\n    filtered = \"\".join(ch.lower() for ch in s if ch.isalnum())\n    return filtered == filtered[::-1]\n\nimport sys\ns = sys.stdin.read().strip()\nprint(str(is_palindrome(s)).lower())\n",
            solution_code: null,
            hints: ["Filter non-alphanumeric characters with .isalnum()"],
            points: 10,
            order_index: 2,
          },
          {
            id: "task-py-containerwater",
            module_id: "mod-py-1",
            title: "Container With Most Water",
            slug: "container-with-most-water",
            description: "Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            starter_code: "def max_area(height):\n    left, right = 0, len(height) - 1\n    max_w = 0\n    while left < right:\n        w = right - left\n        h = min(height[left], height[right])\n        max_w = max(max_w, w * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_w\n\nimport sys, json\nlines = sys.stdin.read().splitlines()\nif lines:\n    height = json.loads(lines[0])\n    print(max_area(height))\n",
            solution_code: null,
            hints: ["Use two pointers moving inward from both ends."],
            points: 20,
            order_index: 3,
          },
          {
            id: "task-py-trappingrainwater",
            module_id: "mod-py-1",
            title: "Trapping Rain Water",
            slug: "trapping-rain-water",
            description: "Compute how much water it can trap after raining on an elevation map.",
            task_type: "algorithm",
            language: "python",
            difficulty: "hard",
            starter_code: "def trap(height):\n    if not height: return 0\n    left, right = 0, len(height) - 1\n    left_max, right_max = height[left], height[right]\n    water = 0\n    while left < right:\n        if left_max < right_max:\n            left += 1\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n        else:\n            right -= 1\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n    return water\n\nimport sys, json\nlines = sys.stdin.read().splitlines()\nif lines:\n    height = json.loads(lines[0])\n    print(trap(height))\n",
            solution_code: null,
            hints: ["Track left_max and right_max at each bar."],
            points: 40,
            order_index: 4,
          },
        ],
      },
      {
        id: "mod-py-2",
        course_id: "demo-python",
        title: "Module 2: Stacks & Sliding Window",
        order_index: 2,
        tasks: [
          {
            id: "task-py-valid-parentheses",
            module_id: "mod-py-2",
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            description: "Given a string `s` containing just characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nimport sys\nprint(str(is_valid(sys.stdin.read().strip())).lower())\n",
            solution_code: null,
            hints: ["Push opening brackets to stack and pop matching closers."],
            points: 15,
            order_index: 1,
          },
          {
            id: "task-py-maxsubarray",
            module_id: "mod-py-2",
            title: "Maximum Subarray (Kadane's)",
            slug: "maximum-subarray",
            description: "Find the subarray with the largest sum and return its sum.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            starter_code: "def max_sub_array(nums):\n    max_sum = nums[0]\n    cur_sum = nums[0]\n    for x in nums[1:]:\n        cur_sum = max(x, cur_sum + x)\n        max_sum = max(max_sum, cur_sum)\n    return max_sum\n\nimport sys, json\nlines = sys.stdin.read().splitlines()\nif lines:\n    nums = json.loads(lines[0])\n    print(max_sub_array(nums))\n",
            solution_code: null,
            hints: ["Use Kadane's algorithm to track current subarray sum."],
            points: 20,
            order_index: 2,
          },
        ],
      },
      {
        id: "mod-py-3",
        course_id: "demo-python",
        title: "Module 3: Linked Lists & Pointers",
        order_index: 3,
        tasks: [
          {
            id: "task-py-reverselinkedlist",
            module_id: "mod-py-3",
            title: "Reverse Linked List",
            slug: "reverse-linked-list",
            description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "import sys, json\n\ndef reverse_list(arr):\n    return arr[::-1]\n\nlines = sys.stdin.read().splitlines()\nif lines:\n    arr = json.loads(lines[0])\n    print(json.dumps(reverse_list(arr)))\n",
            solution_code: null,
            hints: ["Change next pointers iteratively using prev and current pointers."],
            points: 15,
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
    description: "High-performance problem solving techniques using modern C++20 and STL containers.",
    icon: "terminal",
    is_published: true,
    modules: [
      {
        id: "mod-cpp-1",
        course_id: "demo-cpp",
        title: "Module 1: Fast I/O & STL Vectors",
        order_index: 1,
        tasks: [
          {
            id: "task-cpp-reversal",
            module_id: "mod-cpp-1",
            title: "Array Reversal in Place",
            slug: "array-reversal",
            description: "Reverse an array of N integers in place without allocating extra memory.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            starter_code: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for(int i = 0; i < n; i++) cin >> a[i];\n    reverse(a.begin(), a.end());\n    for(int i = 0; i < n; i++) {\n        cout << a[i] << (i + 1 == n ? \"\" : \" \");\n    }\n    cout << endl;\n    return 0;\n}\n",
            solution_code: null,
            hints: ["Use std::reverse or two pointers swap."],
            points: 10,
            order_index: 1,
          },
          {
            id: "task-cpp-binarysearch",
            module_id: "mod-cpp-1",
            title: "Binary Search",
            slug: "binary-search",
            description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            starter_code: "#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    int left = 0, right = nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    int n, target;\n    if (!(cin >> n)) return 0;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    cin >> target;\n    cout << search(nums, target) << endl;\n    return 0;\n}\n",
            solution_code: null,
            hints: ["Compute mid index using left + (right - left) / 2."],
            points: 15,
            order_index: 2,
          },
        ],
      },
      {
        id: "mod-cpp-2",
        course_id: "demo-cpp",
        title: "Module 2: Linked Lists & Sorting",
        order_index: 2,
        tasks: [
          {
            id: "task-cpp-mergelists",
            module_id: "mod-cpp-2",
            title: "Merge Two Sorted Lists",
            slug: "merge-two-sorted-lists",
            description: "Merge two sorted arrays/lists into one single sorted list.",
            task_type: "algorithm",
            language: "cpp",
            difficulty: "easy",
            starter_code: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint main() {\n    int n, m;\n    if (!(cin >> n)) return 0;\n    vector<int> a(n);\n    for(int i = 0; i < n; i++) cin >> a[i];\n    if (!(cin >> m)) return 0;\n    vector<int> b(m);\n    for(int i = 0; i < m; i++) cin >> b[i];\n    \n    vector<int> res;\n    int i = 0, j = 0;\n    while(i < n && j < m) {\n        if (a[i] <= b[j]) res.push_back(a[i++]);\n        else res.push_back(b[j++]);\n    }\n    while(i < n) res.push_back(a[i++]);\n    while(j < m) res.push_back(b[j++]);\n    \n    for(int k = 0; k < (int)res.size(); k++) {\n        cout << res[k] << (k + 1 == (int)res.size() ? \"\" : \" \");\n    }\n    cout << endl;\n    return 0;\n}\n",
            solution_code: null,
            hints: ["Compare elements from both lists one by one."],
            points: 20,
            order_index: 1,
          },
        ],
      },
    ],
  },
  {
    id: "demo-js",
    title: "JavaScript & Frontend Engineering",
    slug: "javascript-mastery",
    description: "Deep dive into asynchronous JavaScript, event loop, closures, and algorithmic problem solving.",
    icon: "layout",
    is_published: true,
    modules: [
      {
        id: "mod-js-1",
        course_id: "demo-js",
        title: "Module 1: Functional Programming & Array Transforms",
        order_index: 1,
        tasks: [
          {
            id: "task-js-flatten",
            module_id: "mod-js-1",
            title: "Flatten Deep Array",
            slug: "flatten-deep-array",
            description: "Implement a function `flatten(arr)` that flattens a multi-dimensional array into a single dimension without using `Array.prototype.flat`.",
            task_type: "algorithm",
            language: "javascript",
            difficulty: "medium",
            starter_code: "function flatten(arr) {\n  let res = [];\n  for (let item of arr) {\n    if (Array.isArray(item)) res.push(...flatten(item));\n    else res.push(item);\n  }\n  return res;\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n  const parsed = JSON.parse(input);\n  console.log(JSON.stringify(flatten(parsed)));\n}\n",
            solution_code: null,
            hints: ["Recursively process elements or use a stack."],
            points: 15,
            order_index: 1,
          },
          {
            id: "task-js-longestsubstring",
            module_id: "mod-js-1",
            title: "Longest Substring Without Repeating Characters",
            slug: "longest-substring-without-repeating-characters",
            description: "Given a string `s`, find the length of the longest substring without repeating characters.",
            task_type: "algorithm",
            language: "javascript",
            difficulty: "medium",
            starter_code: "function lengthOfLongestSubstring(s) {\n  let set = new Set();\n  let left = 0;\n  let maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = maxLen < right - left + 1 ? right - left + 1 : maxLen;\n  }\n  return maxLen;\n}\n\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconsole.log(lengthOfLongestSubstring(input));\n",
            solution_code: null,
            hints: ["Use a sliding window with a Set to track characters."],
            points: 25,
            order_index: 2,
          },
        ],
      },
    ],
  },
  {
    id: "demo-java",
    title: "Java Core & Algorithms",
    slug: "java-core-algorithms",
    description: "Object-oriented problem solving, data structures, and string algorithms in Java.",
    icon: "code",
    is_published: true,
    modules: [
      {
        id: "mod-java-1",
        course_id: "demo-java",
        title: "Module 1: Strings & Hash Tables",
        order_index: 1,
        tasks: [
          {
            id: "task-java-anagram",
            module_id: "mod-java-1",
            title: "Valid Anagram",
            slug: "valid-anagram",
            description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
            task_type: "algorithm",
            language: "java",
            difficulty: "easy",
            starter_code: "import java.util.*;\n\npublic class Solution {\n    public static boolean isAnagram(String s, String t) {\n        if (s.length() != t.length()) return false;\n        char[] sArr = s.toCharArray();\n        char[] tArr = t.toCharArray();\n        Arrays.sort(sArr);\n        Arrays.sort(tArr);\n        return Arrays.equals(sArr, tArr);\n    }\n\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        if (scanner.hasNextLine()) {\n            String s = scanner.nextLine().trim();\n            String t = scanner.hasNextLine() ? scanner.nextLine().trim() : \"\";\n            System.out.println(isAnagram(s, t));\n        }\n        scanner.close();\n    }\n}\n",
            solution_code: null,
            hints: ["Sort both strings or use a frequency array."],
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
    description: "Strengthen your Low-Level Design skills through interactive design patterns, UML, Clean Code, SOLID principles, and hands-on coding projects.",
    icon: "layers",
    is_published: true,
    modules: [
      {
        id: "mod-lld-1",
        course_id: "demo-lld",
        title: "Module 1: SOLID Principles & Clean Architecture",
        order_index: 1,
        tasks: [
          {
            id: "task-lld-solid",
            module_id: "mod-lld-1",
            title: "Design a Notification Service (Open/Closed Principle)",
            slug: "notification-service-ocp",
            description: "Design an extensible Notification Service supporting Email, SMS, and Push notifications following the Open/Closed Principle.",
            task_type: "algorithm",
            language: "python",
            difficulty: "medium",
            starter_code: "class NotificationSender:\n    def send(self, message: str, recipient: str):\n        pass\n\nclass EmailNotification(NotificationSender):\n    def send(self, message: str, recipient: str):\n        return f'EMAIL to {recipient}: {message}'\n\nclass SMSNotification(NotificationSender):\n    def send(self, message: str, recipient: str):\n        return f'SMS to {recipient}: {message}'\n\nimport sys\nlines = sys.stdin.read().splitlines()\nif lines:\n    service_type = lines[0].strip()\n    msg = lines[1].strip() if len(lines) > 1 else 'Alert'\n    target = lines[2].strip() if len(lines) > 2 else 'admin'\n    sender = EmailNotification() if service_type == 'email' else SMSNotification()\n    print(sender.send(msg, target))\n",
            solution_code: null,
            hints: ["Use polymorphism to add new notification channels without modifying existing senders."],
            points: 25,
            order_index: 1,
          },
        ],
      },
      {
        id: "mod-lld-2",
        course_id: "demo-lld",
        title: "Module 2: Creational & Structural Design Patterns",
        order_index: 2,
        tasks: [
          {
            id: "task-lld-singleton",
            module_id: "mod-lld-2",
            title: "Thread-Safe Singleton Logger",
            slug: "thread-safe-singleton-logger",
            description: "Implement a thread-safe Singleton Logger class ensuring only a single instance exists across multiple calls.",
            task_type: "algorithm",
            language: "python",
            difficulty: "easy",
            starter_code: "class Logger:\n    _instance = None\n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super(Logger, cls).__new__(cls)\n            cls._instance.logs = []\n        return cls._instance\n\n    def log(self, message: str):\n        self.logs.append(message)\n\nimport sys\nlines = sys.stdin.read().splitlines()\nl1 = Logger()\nl2 = Logger()\nfor line in lines:\n    if line.strip():\n        l1.log(line.strip())\nprint(str(l1 is l2).lower())\nprint(len(l2.logs))\n",
            solution_code: null,
            hints: ["Override __new__ in Python or use a static getInstance method."],
            points: 20,
            order_index: 1,
          },
        ],
      },
    ],
  },
];

