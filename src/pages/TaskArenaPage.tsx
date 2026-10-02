import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertTriangle,
  Code2,
  Lock,
  BookOpen,
} from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { LanguageSelector } from "@/components/compiler/LanguageSelector";
import { getLanguageById } from "@/config/languages";
import { courseService } from "@/services/courseService";
import { executeCode, type ExecutionResult } from "@/services/execution/wandboxExecutor";
import { judgeService, type JudgeResult, type TestCaseEvaluation } from "@/services/judgeService";
import type { TaskWithPublicTestCases, EditorSettings } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { progressStorage } from "@/services/storage/progressStorage";
import { enrollmentStorage } from "@/services/storage/enrollmentStorage";
import { DEMO_COURSES } from "@/data/demoCourses";
import { supabase } from "@/services/supabase";
import { cn } from "@/utils/cn";

export interface ModuleTaskItem {
  id: string;
  title: string;
  order_index?: number;
  module_id?: string;
}

export interface CourseContextInfo {
  courseId?: string;
  courseTitle?: string;
  courseSlug?: string;
  moduleId?: string;
  moduleTitle?: string;
}

interface TaskArenaPageProps {
  taskId: string;
  theme: "light" | "dark";
  navigate: (to: string, params?: Record<string, string>) => void;
}

// Built-in comprehensive sample tasks for practice arena
const DEMO_TASKS_MAP: Record<string, TaskWithPublicTestCases> = {
  "task-py-twosum": {
    id: "task-py-twosum",
    module_id: "mod-py-1",
    title: "Two Sum",
    slug: "two-sum",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- Only one valid answer exists.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def two_sum(nums, target):
    # Return [index1, index2]
    lookup = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in lookup:
            return [lookup[diff], i]
        lookup[num] = i
    return []

# Standard I/O runner
import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    nums = json.loads(lines[0])
    target = int(lines[1])
    print(json.dumps(two_sum(nums, target)))
`,
    solution_code: null,
    hints: [
      "A brute force approach would search all pairs in O(n^2) time.",
      "Can you use a hash map to look up complements in O(1) time?",
    ],
    points: 10,
    order_index: 1,
    test_cases: [
      {
        id: "tc-1",
        task_id: "task-py-twosum",
        input: "[2, 7, 11, 15]\n9",
        expected_output: "[0, 1]",
        is_hidden: false,
        explanation: "nums[0] + nums[1] == 9, so return [0, 1].",
      },
      {
        id: "tc-2",
        task_id: "task-py-twosum",
        input: "[3, 2, 4]\n6",
        expected_output: "[1, 2]",
        is_hidden: false,
        explanation: "nums[1] + nums[2] == 6, so return [1, 2].",
      },
      {
        id: "tc-3",
        task_id: "task-py-twosum",
        input: "[3, 3]\n6",
        expected_output: "[0, 1]",
        is_hidden: false,
        explanation: "nums[0] + nums[1] == 6, so return [0, 1].",
      },
    ],
  },
  "task-py-trappingrainwater": {
    id: "task-py-trappingrainwater",
    module_id: "mod-py-1",
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

### Constraints:
- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\``,
    task_type: "algorithm",
    language: "python",
    difficulty: "hard",
    starter_code: `def trap(height):
    if not height:
        return 0
    left, right = 0, len(height) - 1
    left_max, right_max = height[left], height[right]
    water = 0
    while left < right:
        if left_max < right_max:
            left += 1
            left_max = max(left_max, height[left])
            water += left_max - height[left]
        else:
            right -= 1
            right_max = max(right_max, height[right])
            water += right_max - height[right]
    return water

import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    height = json.loads(lines[0])
    print(trap(height))
`,
    solution_code: null,
    hints: [
      "Track left_max and right_max at each bar.",
      "A two-pointer approach solves this in O(n) time and O(1) space.",
    ],
    points: 40,
    order_index: 9,
    test_cases: [
      {
        id: "tc-rw-1",
        task_id: "task-py-trappingrainwater",
        input: "[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]",
        expected_output: "6",
        is_hidden: false,
        explanation: "The elevation map traps 6 units of rain water.",
      },
      {
        id: "tc-rw-2",
        task_id: "task-py-trappingrainwater",
        input: "[4, 2, 0, 3, 2, 5]",
        expected_output: "9",
        is_hidden: false,
        explanation: "The elevation map traps 9 units of rain water.",
      },
    ],
  },
  "task-py-palindrome": {
    id: "task-py-palindrome",
    module_id: "mod-py-1",
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def is_palindrome(s: str) -> bool:
    filtered = "".join(ch.lower() for ch in s if ch.isalnum())
    return filtered == filtered[::-1]

import sys
s = sys.stdin.read().strip()
print(str(is_palindrome(s)).lower())
`,
    solution_code: null,
    hints: [
      "Consider using two pointers from the start and end of the string.",
      "Filter out punctuation and ignore casing before comparing.",
    ],
    points: 10,
    order_index: 2,
    test_cases: [
      {
        id: "tc-pal-1",
        task_id: "task-py-palindrome",
        input: "A man, a plan, a canal: Panama",
        expected_output: "true",
        is_hidden: false,
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
      {
        id: "tc-pal-2",
        task_id: "task-py-palindrome",
        input: "race a car",
        expected_output: "false",
        is_hidden: false,
        explanation: '"raceacar" is not a palindrome.',
      },
    ],
  },
  "task-java-anagram": {
    id: "task-java-anagram",
    module_id: "mod-java-1",
    title: "Valid Anagram",
    slug: "valid-anagram",
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    task_type: "algorithm",
    language: "java",
    difficulty: "easy",
    starter_code: `import java.util.*;

public class Solution {
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        char[] sArr = s.toCharArray();
        char[] tArr = t.toCharArray();
        Arrays.sort(sArr);
        Arrays.sort(tArr);
        return Arrays.equals(sArr, tArr);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextLine()) {
            String s = scanner.nextLine().trim();
            String t = scanner.hasNextLine() ? scanner.nextLine().trim() : "";
            System.out.println(isAnagram(s, t));
        }
        scanner.close();
    }
}
`,
    solution_code: null,
    hints: ["Sort both strings and compare if they are identical, or use a frequency hash map."],
    points: 15,
    order_index: 3,
    test_cases: [
      {
        id: "tc-ana-1",
        task_id: "task-java-anagram",
        input: "anagram\nnagaram",
        expected_output: "true",
        is_hidden: false,
        explanation: '"nagaram" is an anagram of "anagram".',
      },
      {
        id: "tc-ana-2",
        task_id: "task-java-anagram",
        input: "rat\ncar",
        expected_output: "false",
        is_hidden: false,
        explanation: '"car" is not an anagram of "rat".',
      },
    ],
  },
  "task-cpp-binarysearch": {
    id: "task-cpp-binarysearch",
    module_id: "mod-cpp-1",
    title: "Binary Search",
    slug: "binary-search",
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`.

If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    task_type: "algorithm",
    language: "cpp",
    difficulty: "easy",
    starter_code: `#include <iostream>
#include <vector>
#include <sstream>

using namespace std;

int search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int n, target;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        cin >> target;
        cout << search(nums, target) << endl;
    }
    return 0;
}
`,
    solution_code: null,
    hints: ["Use left and right pointers and calculate mid = left + (right - left) / 2."],
    points: 15,
    order_index: 4,
    test_cases: [
      {
        id: "tc-bs-1",
        task_id: "task-cpp-binarysearch",
        input: "6\n-1 0 3 5 9 12\n9",
        expected_output: "4",
        is_hidden: false,
        explanation: "9 exists in nums and its index is 4",
      },
      {
        id: "tc-bs-2",
        task_id: "task-cpp-binarysearch",
        input: "6\n-1 0 3 5 9 12\n2",
        expected_output: "-1",
        is_hidden: false,
        explanation: "2 does not exist in nums so return -1",
      },
    ],
  },
  "task-py-maxsubarray": {
    id: "task-py-maxsubarray",
    module_id: "mod-py-2",
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "medium",
    starter_code: `def max_sub_array(nums):
    max_sum = nums[0]
    curr_sum = 0
    for num in nums:
        curr_sum = max(num, curr_sum + num)
        max_sum = max(max_sum, curr_sum)
    return max_sum

import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    nums = json.loads(lines[0])
    print(max_sub_array(nums))
`,
    solution_code: null,
    hints: ["Kadane's algorithm computes the maximum subarray sum in a single linear pass."],
    points: 25,
    order_index: 5,
    test_cases: [
      {
        id: "tc-ms-1",
        task_id: "task-py-maxsubarray",
        input: "[-2, 1, -3, 4, -1, 2, 1, -5, 4]",
        expected_output: "6",
        is_hidden: false,
        explanation: "The subarray [4, -1, 2, 1] has the largest sum 6.",
      },
      {
        id: "tc-ms-2",
        task_id: "task-py-maxsubarray",
        input: "[1]",
        expected_output: "1",
        is_hidden: false,
        explanation: "The subarray [1] has the largest sum 1.",
      },
    ],
  },
  "task-js-longestsubstring": {
    id: "task-js-longestsubstring",
    module_id: "mod-js-5",
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring",
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.

### Constraints:
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.`,
    task_type: "algorithm",
    language: "javascript",
    difficulty: "medium",
    starter_code: `function lengthOfLongestSubstring(s) {
    let charSet = new Set();
    let left = 0;
    let maxLength = 0;

    for (let right = 0; right < s.length; right++) {
        while (charSet.has(s[right])) {
            charSet.delete(s[left]);
            left++;
        }
        charSet.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    return maxLength;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log(lengthOfLongestSubstring(input));
`,
    solution_code: null,
    hints: ["Use a sliding window with a Set to track seen characters in the current window."],
    points: 30,
    order_index: 6,
    test_cases: [
      {
        id: "tc-ls-1",
        task_id: "task-js-longestsubstring",
        input: "abcabcbb",
        expected_output: "3",
        is_hidden: false,
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        id: "tc-ls-2",
        task_id: "task-js-longestsubstring",
        input: "bbbbb",
        expected_output: "1",
        is_hidden: false,
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
  },
  "task-py-containerwater": {
    id: "task-py-containerwater",
    module_id: "mod-py-6",
    title: "Container With Most Water",
    slug: "container-with-most-water",
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "medium",
    starter_code: `def max_area(height):
    left, right = 0, len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    height = json.loads(lines[0])
    print(max_area(height))
`,
    solution_code: null,
    hints: ["Use two pointers starting at both ends and advance the shorter pointer."],
    points: 25,
    order_index: 7,
    test_cases: [
      {
        id: "tc-cw-1",
        task_id: "task-py-containerwater",
        input: "[1, 8, 6, 2, 5, 4, 8, 3, 7]",
        expected_output: "49",
        is_hidden: false,
        explanation: "The max water is between index 1 and index 8: 7 * 7 = 49.",
      },
      {
        id: "tc-cw-2",
        task_id: "task-py-containerwater",
        input: "[1, 1]",
        expected_output: "1",
        is_hidden: false,
        explanation: "1 * 1 = 1.",
      },
    ],
  },
  "task-cpp-mergelists": {
    id: "task-cpp-mergelists",
    module_id: "mod-cpp-7",
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",
    description: `You are given the heads of two sorted linked lists \`list1\` and \`list2\`.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.`,
    task_type: "algorithm",
    language: "cpp",
    difficulty: "easy",
    starter_code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n, m;
    if (cin >> n >> m) {
        vector<int> all;
        for (int i = 0; i < n; i++) {
            int v; cin >> v; all.push_back(v);
        }
        for (int i = 0; i < m; i++) {
            int v; cin >> v; all.push_back(v);
        }
        sort(all.begin(), all.end());
        for (size_t i = 0; i < all.size(); i++) {
            cout << all[i] << (i + 1 < all.size() ? " " : "");
        }
        cout << endl;
    }
    return 0;
}
`,
    solution_code: null,
    hints: ["You can maintain pointers to both lists and advance the smaller one."],
    points: 15,
    order_index: 8,
    test_cases: [
      {
        id: "tc-ml-1",
        task_id: "task-cpp-mergelists",
        input: "3 3\n1 2 4\n1 3 4",
        expected_output: "1 1 2 3 4 4",
        is_hidden: false,
        explanation: "Merged sorted list is 1 1 2 3 4 4.",
      },
    ],
  },
  "task-py-reverselinkedlist": {
    id: "task-py-reverselinkedlist",
    module_id: "mod-py-10",
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def reverse_list(arr):
    return arr[::-1]

import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    arr = json.loads(lines[0])
    print(json.dumps(reverse_list(arr)))
`,
    solution_code: null,
    hints: ["Iteratively swap pointers using prev, curr, and next_node."],
    points: 10,
    order_index: 10,
    test_cases: [
      {
        id: "tc-rl-1",
        task_id: "task-py-reverselinkedlist",
        input: "[1, 2, 3, 4, 5]",
        expected_output: "[5, 4, 3, 2, 1]",
        is_hidden: false,
        explanation: "The reversed array is [5, 4, 3, 2, 1].",
      },
    ],
  },
  "task-py-valid-parentheses": {
    id: "task-py-valid-parentheses",
    module_id: "mod-py-2",
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    task_type: "algorithm",
    language: "python",
    difficulty: "easy",
    starter_code: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

import sys
print(str(is_valid(sys.stdin.read().strip())).lower())
`,
    solution_code: null,
    hints: ["Push opening brackets to stack and pop matching closers."],
    points: 15,
    order_index: 1,
    test_cases: [
      {
        id: "tc-vp-1",
        task_id: "task-py-valid-parentheses",
        input: "()[]{}",
        expected_output: "true",
        is_hidden: false,
        explanation: "All brackets matched correctly.",
      },
      {
        id: "tc-vp-2",
        task_id: "task-py-valid-parentheses",
        input: "(]",
        expected_output: "false",
        is_hidden: false,
        explanation: "Mismatched bracket types.",
      },
    ],
  },
  "task-cpp-reversal": {
    id: "task-cpp-reversal",
    module_id: "mod-cpp-1",
    title: "Array Reversal in Place",
    slug: "array-reversal",
    description: "Reverse an array of N integers in place without allocating extra memory.",
    task_type: "algorithm",
    language: "cpp",
    difficulty: "easy",
    starter_code: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int n;
    if (!(cin >> n)) return 0;
    vector<int> a(n);
    for(int i = 0; i < n; i++) cin >> a[i];
    reverse(a.begin(), a.end());
    for(int i = 0; i < n; i++) {
        cout << a[i] << (i + 1 == n ? "" : " ");
    }
    cout << endl;
    return 0;
}
`,
    solution_code: null,
    hints: ["Use std::reverse or two pointers swap."],
    points: 10,
    order_index: 1,
    test_cases: [
      {
        id: "tc-rev-1",
        task_id: "task-cpp-reversal",
        input: "5\n1 2 3 4 5",
        expected_output: "5 4 3 2 1",
        is_hidden: false,
        explanation: "Array reversed in place.",
      },
    ],
  },
  "task-js-flatten": {
    id: "task-js-flatten",
    module_id: "mod-js-1",
    title: "Flatten Deep Array",
    slug: "flatten-deep-array",
    description: "Implement a function `flatten(arr)` that flattens a multi-dimensional array into a single dimension without using `Array.prototype.flat`.",
    task_type: "algorithm",
    language: "javascript",
    difficulty: "medium",
    starter_code: `function flatten(arr) {
  let res = [];
  for (let item of arr) {
    if (Array.isArray(item)) res.push(...flatten(item));
    else res.push(item);
  }
  return res;
}

const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const parsed = JSON.parse(input);
  console.log(JSON.stringify(flatten(parsed)));
}
`,
    solution_code: null,
    hints: ["Recursively process elements or use a stack."],
    points: 15,
    order_index: 1,
    test_cases: [
      {
        id: "tc-flat-1",
        task_id: "task-js-flatten",
        input: "[1, [2, [3, 4], 5]]",
        expected_output: "[1,2,3,4,5]",
        is_hidden: false,
        explanation: "Nested arrays flattened into single level.",
      },
    ],
  },
};

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 4,
  wordWrap: true,
  minimap: false,
  lineNumbers: true,
};

export function TaskArenaPage({ taskId, theme, navigate }: TaskArenaPageProps) {
  const { user, openAuthModal, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState<TaskWithPublicTestCases | null>(null);
  const [activeTaskId, setActiveTaskId] = useState(taskId);
  const [moduleTasks, setModuleTasks] = useState<ModuleTaskItem[]>([]);
  const [courseContext, setCourseContext] = useState<CourseContextInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  type SolutionTab = "code" | "samples" | "hidden" | "custom" | "result";
  const [activeTab, setActiveTab] = useState<SolutionTab>("code");
  type MobileViewMode = "problem" | "code" | "tests";
  const [mobileView, setMobileView] = useState<MobileViewMode>("problem");
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [customStdin, setCustomStdin] = useState("");
  const [isCustomInput, setIsCustomInput] = useState(false);

  const [expandedHints, setExpandedHints] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [runTestResults, setRunTestResults] = useState<TestCaseEvaluation[] | null>(null);
  const [customRunResult, setCustomRunResult] = useState<ExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setActiveTaskId(taskId);
  }, [taskId]);

  async function resolveModuleAndTrack(currentTask: TaskWithPublicTestCases) {
    let resolvedTasks: ModuleTaskItem[] = [];
    let resolvedContext: CourseContextInfo | null = null;

    // 1. If task has a module_id, try querying Supabase module, its tasks, and its course
    if (currentTask.module_id) {
      try {
        const { data: moduleData, error: modErr } = await supabase
          .from("modules")
          .select(`
            id,
            title,
            order_index,
            course_id,
            courses (
              id,
              title,
              slug
            ),
            tasks (
              id,
              title,
              order_index,
              module_id
            )
          `)
          .eq("id", currentTask.module_id)
          .single();

        if (!modErr && moduleData && moduleData.tasks && moduleData.tasks.length > 0) {
          const sortedTasks = [...moduleData.tasks].sort(
            (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)
          );
          resolvedTasks = sortedTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            order_index: t.order_index,
            module_id: t.module_id,
          }));

          const courseObj = moduleData.courses as any;
          resolvedContext = {
            courseId: moduleData.course_id,
            courseTitle: courseObj?.title,
            courseSlug: courseObj?.slug,
            moduleId: moduleData.id,
            moduleTitle: moduleData.title,
          };

          // Auto-enroll if enrolled flow
          if (resolvedContext.courseId) {
            enrollmentStorage.enroll(resolvedContext.courseId);
            if (resolvedContext.courseSlug && resolvedContext.courseSlug !== "#") {
              enrollmentStorage.enroll(resolvedContext.courseSlug);
            }
          }
        }
      } catch (err) {
        console.warn("[TaskArena] Could not fetch module info from Supabase:", err);
      }
    }

    // 2. Fallback to DEMO_COURSES
    if (resolvedTasks.length === 0) {
      for (const course of DEMO_COURSES) {
        const mod = course.modules.find(
          (m) => m.id === currentTask.module_id || m.tasks.some((t) => t.id === currentTask.id)
        );
        if (mod && mod.tasks && mod.tasks.length > 0) {
          resolvedTasks = mod.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            order_index: t.order_index,
            module_id: mod.id,
          }));
          resolvedContext = {
            courseId: course.id,
            courseTitle: course.title,
            courseSlug: course.slug,
            moduleId: mod.id,
            moduleTitle: mod.title,
          };
          enrollmentStorage.enroll(course.id);
          enrollmentStorage.enroll(course.slug);
          break;
        }
      }
    }

    // 3. Fallback: group DEMO_TASKS_MAP by module_id
    if (resolvedTasks.length === 0 && currentTask.module_id) {
      const matchingDemoTasks = Object.values(DEMO_TASKS_MAP).filter(
        (t) => t.module_id === currentTask.module_id
      );
      if (matchingDemoTasks.length > 0) {
        resolvedTasks = matchingDemoTasks.map((t) => ({
          id: t.id,
          title: t.title,
          order_index: t.order_index,
          module_id: t.module_id,
        }));
      }
    }

    // 4. Fallback if still empty: use all demo tasks
    if (resolvedTasks.length === 0) {
      resolvedTasks = Object.values(DEMO_TASKS_MAP).map((t) => ({
        id: t.id,
        title: t.title,
        order_index: t.order_index,
        module_id: t.module_id,
      }));
    }

    // Ensure current task is in resolvedTasks
    const currentExists = resolvedTasks.some((t) => t.id === currentTask.id);
    if (!currentExists) {
      resolvedTasks = [
        { id: currentTask.id, title: currentTask.title, order_index: currentTask.order_index, module_id: currentTask.module_id },
        ...resolvedTasks,
      ];
    }

    setModuleTasks(resolvedTasks);
    setCourseContext(resolvedContext);
  }

  useEffect(() => {
    async function loadTaskAndModule() {
      setLoading(true);
      setJudgeResult(null);
      setRunTestResults(null);
      setCustomRunResult(null);
      setExecutionError(null);
      setActiveTab("code");
      setSelectedCaseIndex(0);
      setShowCelebration(false);

      try {
        let loadedTask: TaskWithPublicTestCases | null = null;
        const { data } = await courseService.getTaskDetails(activeTaskId);
        if (data) {
          loadedTask = data;
        } else if (DEMO_TASKS_MAP[activeTaskId]) {
          loadedTask = DEMO_TASKS_MAP[activeTaskId];
        } else {
          // Check DEMO_COURSES
          for (const c of DEMO_COURSES) {
            for (const m of c.modules) {
              const t = m.tasks.find((x) => x.id === activeTaskId);
              if (t) {
                loadedTask = {
                  ...t,
                  test_cases: DEMO_TASKS_MAP[t.id]?.test_cases || [],
                } as TaskWithPublicTestCases;
                break;
              }
            }
            if (loadedTask) break;
          }
        }

        if (!loadedTask) {
          loadedTask = DEMO_TASKS_MAP["task-py-twosum"];
        }

        setTask(loadedTask);
        setLanguage(loadedTask.language || "python");
        setCode(
          loadedTask.starter_code ||
          getLanguageById(loadedTask.language || "python")?.starterCode ||
          ""
        );
        if (loadedTask.test_cases && loadedTask.test_cases.length > 0) {
          setCustomStdin(loadedTask.test_cases[0].input || "");
        }

        await resolveModuleAndTrack(loadedTask);
      } catch (e: any) {
        console.error("Error loading task:", e);
        const demo = DEMO_TASKS_MAP[activeTaskId] || DEMO_TASKS_MAP["task-py-twosum"];
        setTask(demo);
        setLanguage(demo.language);
        setCode(demo.starter_code || "");
        await resolveModuleAndTrack(demo);
      } finally {
        setLoading(false);
      }
    }

    loadTaskAndModule();
  }, [activeTaskId]);

  const handleResetCode = () => {
    if (!task) return;
    if (confirm("Reset editor to starter code?")) {
      setCode(task.starter_code || getLanguageById(language)?.starterCode || "");
      showToast("info", "Code reset to default");
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  // Run custom stdin test directly
  const handleRunCustomTest = async () => {
    if (!task) return;
    setIsRunning(true);
    setCustomRunResult(null);
    setExecutionError(null);
    try {
      const res = await executeCode({
        language,
        sourceCode: code,
        stdin: customStdin || "",
      });
      setCustomRunResult(res);
      if (res.status !== "success" && (res.stderr || res.stdout)) {
        setExecutionError(res.stderr || res.stdout);
      }
    } catch (err: any) {
      setExecutionError(err.message || "Execution failed");
      showToast("error", err.message || "Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  // Run code against test cases or custom stdin
  const handleRunCode = async () => {
    if (!task) return;
    if (activeTab === "custom") {
      await handleRunCustomTest();
      return;
    }

    setIsRunning(true);
    setActiveTab("result");
    setMobileView("tests");
    setJudgeResult(null);
    setRunTestResults(null);
    setCustomRunResult(null);
    setExecutionError(null);

    try {
      if (isCustomInput) {
        // Run with custom stdin directly
        const res = await executeCode({
          language,
          sourceCode: code,
          stdin: customStdin || "",
        });
        setCustomRunResult(res);
        if (res.status !== "success" && (res.stderr || res.stdout)) {
          setExecutionError(res.stderr || res.stdout);
        }
      } else {
        // Evaluate all public sample test cases
        const sampleCases = task.test_cases || [];
        const evals: TestCaseEvaluation[] = [];
        let firstCompilerError: string | null = null;

        for (let i = 0; i < sampleCases.length; i++) {
          const tc = sampleCases[i];
          const res = await executeCode({
            language,
            sourceCode: code,
            stdin: tc.input || "",
          });

          const actual = (res.stdout || "").replace(/\r\n/g, "\n").trim();
          const expected = (tc.expected_output || "").replace(/\r\n/g, "\n").trim();
          const isMatch = res.status === "success" && actual === expected;

          if (res.status !== "success" && res.stderr && !firstCompilerError) {
            firstCompilerError = res.stderr;
          }

          evals.push({
            testCaseId: tc.id || `tc-${i + 1}`,
            index: i + 1,
            isHidden: false,
            passed: isMatch,
            input: tc.input,
            expectedOutput: tc.expected_output,
            actualOutput: res.stdout,
            executionTimeMs: res.executionTime,
            errorMessage: res.status !== "success" ? res.stderr : undefined,
          });
        }

        setRunTestResults(evals);
        if (firstCompilerError) {
          setExecutionError(firstCompilerError);
        }
      }
    } catch (err: any) {
      setExecutionError(err.message || "Execution failed");
      showToast("error", err.message || "Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit against ALL test cases (Public + Hidden)
  const handleSubmit = async () => {
    if (!task) return;

    setIsSubmitting(true);
    setActiveTab("result");
    setMobileView("tests");
    setRunTestResults(null);
    setCustomRunResult(null);
    setExecutionError(null);

    // If guest user (not logged in), evaluate locally and save progress to localStorage
    if (!user) {
      try {
        const sampleCases = task.test_cases || [];
        const evals: TestCaseEvaluation[] = [];
        let passed = 0;

        for (let i = 0; i < sampleCases.length; i++) {
          const tc = sampleCases[i];
          const execRes = await executeCode({
            language,
            sourceCode: code,
            stdin: tc.input || "",
          });

          const actual = (execRes.stdout || "").replace(/\r\n/g, "\n").trim();
          const expected = (tc.expected_output || "").replace(/\r\n/g, "\n").trim();
          const isMatch = execRes.status === "success" && actual === expected;
          if (isMatch) passed++;

          evals.push({
            testCaseId: tc.id || `tc-${i + 1}`,
            index: i + 1,
            isHidden: false,
            passed: isMatch,
            input: tc.input,
            expectedOutput: tc.expected_output,
            actualOutput: execRes.stdout,
            executionTimeMs: execRes.executionTime,
            errorMessage: execRes.status !== "success" ? execRes.stderr : undefined,
          });
        }

        const allPassed = passed === sampleCases.length && sampleCases.length > 0;
        const pts = task.points || 10;
        const isAlreadyDone = progressStorage.isTaskCompleted(task.id);
        const demoJudgeRes: JudgeResult = {
          status: allPassed ? "passed" : "failed",
          passedCases: passed,
          totalCases: sampleCases.length,
          totalExecutionTimeMs: evals.reduce((acc, e) => acc + (e.executionTimeMs || 0), 0),
          testCaseResults: evals,
          pointsEarned: allPassed ? pts : 0,
          isAlreadyCompleted: isAlreadyDone,
        };

        setJudgeResult(demoJudgeRes);
        const firstErr = evals.find((e) => e.errorMessage)?.errorMessage;
        if (firstErr) {
          setExecutionError(firstErr);
        }

        if (allPassed) {
          progressStorage.recordTaskCompleted(task.id, pts);
          setShowCelebration(true);
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
          });
          showToast("success", `Challenge Solved! +${pts} XP earned. Sign in anytime to sync to the leaderboard!`);
        } else {
          showToast("error", "Submission: Solution failed some test cases");
        }
      } catch (err: any) {
        showToast("error", err?.message || "Execution error during evaluation");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Authenticated User Submission
    try {
      // Check if task exists in database
      const res = await judgeService.submitSolution({
        taskId: task.id,
        userId: user.id,
        code,
        language,
      });

      setJudgeResult(res);
      if (res.errorMessage) {
        setExecutionError(res.errorMessage);
      }

      if (res.status === "passed") {
        progressStorage.recordTaskCompleted(task.id, res.pointsEarned || task.points || 10);
        setShowCelebration(true);
        refreshProfile();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        });
      } else {
        showToast("error", `Submission: ${res.status.toUpperCase()}`);
      }
    } catch (err: any) {
      // Fallback local submission evaluation for demo tasks or unseeded tasks
      const sampleCases = task.test_cases || [];
      const evals: TestCaseEvaluation[] = [];
      let passed = 0;

      for (let i = 0; i < sampleCases.length; i++) {
        const tc = sampleCases[i];
        const execRes = await executeCode({
          language,
          sourceCode: code,
          stdin: tc.input || "",
        });

        const actual = (execRes.stdout || "").replace(/\r\n/g, "\n").trim();
        const expected = (tc.expected_output || "").replace(/\r\n/g, "\n").trim();
        const isMatch = execRes.status === "success" && actual === expected;
        if (isMatch) passed++;

        evals.push({
          testCaseId: tc.id || `tc-${i + 1}`,
          index: i + 1,
          isHidden: false,
          passed: isMatch,
          input: tc.input,
          expectedOutput: tc.expected_output,
          actualOutput: execRes.stdout,
          executionTimeMs: execRes.executionTime,
          errorMessage: execRes.status !== "success" ? execRes.stderr : undefined,
        });
      }

      const allPassed = passed === sampleCases.length && sampleCases.length > 0;
      const pts = task.points || 10;
      const isAlreadyDone = progressStorage.isTaskCompleted(task.id);
      const demoJudgeRes: JudgeResult = {
        status: allPassed ? "passed" : "failed",
        passedCases: passed,
        totalCases: sampleCases.length,
        totalExecutionTimeMs: evals.reduce((acc, e) => acc + (e.executionTimeMs || 0), 0),
        testCaseResults: evals,
        pointsEarned: allPassed ? pts : 0,
        isAlreadyCompleted: isAlreadyDone,
      };

      setJudgeResult(demoJudgeRes);
      const firstErr = evals.find((e) => e.errorMessage)?.errorMessage;
      if (firstErr) {
        setExecutionError(firstErr);
      }

      if (allPassed) {
        progressStorage.recordTaskCompleted(task.id, pts);
        // If logged in, also try to credit profile points directly
        if (user?.id && !isAlreadyDone) {
          try {
            const { data: prof } = await supabase
              .from("profiles")
              .select("points")
              .eq("id", user.id)
              .maybeSingle();
            const currPts = (prof as any)?.points || 0;
            await supabase
              .from("profiles")
              .update({ points: currPts + pts, updated_at: new Date().toISOString() })
              .eq("id", user.id);
            refreshProfile();
          } catch (syncErr) {
            console.warn("Could not sync points to profile:", syncErr);
          }
        }
        setShowCelebration(true);
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        });
      } else {
        showToast("error", "Submission: Solution failed some test cases");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !task) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#070A12] text-slate-500 font-urbanist">
        <Loader2 size={36} className="animate-spin text-[#6366F1]" />
        <span className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Entering Practice Arena...
        </span>
      </div>
    );
  }

  const publicCases = task.test_cases || [];
  const currentCase = publicCases[selectedCaseIndex] || publicCases[0];

  const currentTaskIndex = moduleTasks.findIndex(
    (t) => t.id === (task?.id || activeTaskId)
  );
  const questionNumber = currentTaskIndex >= 0 ? currentTaskIndex + 1 : 1;
  const totalQuestions = moduleTasks.length > 0 ? moduleTasks.length : 1;
  const hasPrev = currentTaskIndex > 0;
  const hasNext = currentTaskIndex >= 0 && currentTaskIndex < moduleTasks.length - 1;

  const handlePrevQuestion = () => {
    if (hasPrev) {
      const prevTask = moduleTasks[currentTaskIndex - 1];
      setActiveTaskId(prevTask.id);
      navigate("task", { taskId: prevTask.id });
    }
  };

  const handleNextQuestion = () => {
    if (hasNext) {
      const nextTask = moduleTasks[currentTaskIndex + 1];
      setActiveTaskId(nextTask.id);
      navigate("task", { taskId: nextTask.id });
    }
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0 font-urbanist bg-[#F8FAFC] dark:bg-[#070A12] text-slate-900 dark:text-white overflow-hidden">
      {/* =====================================================================
          TOP ARENA NAVIGATION & ACTION BAR
      ===================================================================== */}
      <header className="h-14 border-b border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Back button + Breadcrumbs + Difficulty */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            onClick={() => {
              if (courseContext?.courseSlug && courseContext.courseSlug !== "#") {
                navigate("course", { slug: courseContext.courseSlug });
              } else {
                navigate("problems");
              }
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title={courseContext?.courseTitle || "Problems"}
          >
            <ChevronLeft size={17} />
            <span className="hidden sm:inline truncate max-w-[120px]">
              {courseContext?.courseTitle ? courseContext.courseTitle : "Problems"}
            </span>
          </button>

          {courseContext?.moduleTitle && (
            <>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">/</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline truncate max-w-[160px]">
                {courseContext.moduleTitle}
              </span>
            </>
          )}

          <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">/</span>

          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px] xs:max-w-[140px] sm:max-w-xs">
            {task.title}
          </span>

          <span
            className={cn(
              "text-[9px] sm:text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border tracking-wider shrink-0",
              task.difficulty === "easy"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : task.difficulty === "medium"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
            )}
          >
            {task.difficulty}
          </span>

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold font-mono shrink-0">
            <Sparkles size={11} />
            <span>+{task.points || 10} XP</span>
          </span>
        </div>

        {/* Right: Reset + Run + Submit CTA Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={handleResetCode}
            title="Reset editor to starter code"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Reset Code"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 size={13} className="animate-spin text-[#6366F1]" />
            ) : (
              <Play size={13} className="text-[#6366F1] fill-[#6366F1]" />
            )}
            <span className="hidden xs:inline">Run</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          MOBILE WORKSPACE VIEW SWITCHER (Visible on < lg screens)
      ===================================================================== */}
      <div className="lg:hidden flex items-center border-b border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] px-2 py-1.5 shrink-0 z-10 gap-1.5">
        <button
          type="button"
          onClick={() => setMobileView("problem")}
          className={cn(
            "flex-1 py-1.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all",
            mobileView === "problem"
              ? "bg-[#6366F1]/10 text-[#6366F1] dark:text-[#818CF8]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <BookOpen size={13} />
          <span>Problem</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileView("code");
            setActiveTab("code");
          }}
          className={cn(
            "flex-1 py-1.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all",
            mobileView === "code"
              ? "bg-[#6366F1]/10 text-[#6366F1] dark:text-[#818CF8]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Code2 size={13} />
          <span>Code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMobileView("tests");
            if (activeTab === "code") {
              setActiveTab(judgeResult || executionError ? "result" : "samples");
            }
          }}
          className={cn(
            "flex-1 py-1.5 px-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all relative",
            mobileView === "tests"
              ? "bg-[#6366F1]/10 text-[#6366F1] dark:text-[#818CF8]"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Terminal size={13} />
          <span>Tests & Result</span>
          {isRunning || isSubmitting ? (
            <Loader2 size={11} className="animate-spin text-[#6366F1]" />
          ) : executionError || judgeResult?.status === "failed" ? (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          ) : judgeResult?.status === "passed" ? (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : runTestResults ? (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          ) : null}
        </button>
      </div>

      {/* =====================================================================
          MAIN SPLIT-SCREEN WORKSPACE
      ===================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: Problem Statement & Testcase Samples */}
        <div
          className={cn(
            "h-full lg:w-[46%] xl:w-[44%] border-r border-slate-200/80 dark:border-[#1E293B] flex-col min-h-0 bg-white dark:bg-[#090D16] overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar select-text",
            mobileView === "problem" ? "flex w-full" : "hidden lg:flex"
          )}
        >
          {/* Problem Header Info */}
          <div className="space-y-3 border-b border-slate-100 dark:border-[#1E293B] pb-5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {task.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 text-amber-500 font-bold font-mono">
                <Sparkles size={13} />
                <span>+{task.points || 10} XP</span>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1E293B] font-mono uppercase font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                {task.language}
              </span>
              <span>•</span>
              <span>Algorithm Challenge</span>
            </div>
          </div>

          {/* Problem Statement Body */}
          <div className="text-sm text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-line leading-relaxed font-normal">
            {task.description}
          </div>

          {/* Public Test Cases Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span>Example Test Cases</span>
            </h3>
            {publicCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="rounded-2xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50/70 dark:bg-[#0F172A] p-4 space-y-3 text-xs font-mono shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold text-slate-900 dark:text-white text-xs font-sans">
                    Example {idx + 1}
                  </span>
                  <button
                    onClick={() => handleCopy(tc.input, idx)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    title="Copy input"
                  >
                    {copiedIndex === idx ? (
                      <Check size={14} className="text-emerald-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                    Input:
                  </span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre">
                    {tc.input || "(empty)"}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                    Expected Output:
                  </span>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#070A12] border border-slate-200/80 dark:border-[#1E293B] text-emerald-600 dark:text-emerald-400 font-bold overflow-x-auto whitespace-pre">
                    {tc.expected_output}
                  </div>
                </div>

                {tc.explanation && (
                  <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                    Explanation: {tc.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Hints Accordion */}
          {task.hints && task.hints.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <HelpCircle size={14} className="text-[#6366F1]" />
                <span>Hints ({task.hints.length})</span>
              </h3>
              {task.hints.map((hint, hIdx) => {
                const isHintOpen = Boolean(expandedHints[hIdx]);
                return (
                  <div
                    key={hIdx}
                    className="border border-slate-200/80 dark:border-[#1E293B] rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-[#0F172A]"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedHints((prev) => ({ ...prev, [hIdx]: !prev[hIdx] }))
                      }
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>Hint {hIdx + 1}</span>
                      </span>
                      {isHintOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                    {isHintOpen && (
                      <div className="p-4 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#070A12] leading-relaxed border-t border-slate-200/80 dark:border-[#1E293B]">
                        {hint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          {/* Mobile CTA to jump to code */}
          <div className="lg:hidden pt-3 pb-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMobileView("code");
                setActiveTab("code");
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 active:scale-[0.98] transition-all"
            >
              <span>Solve Challenge in Code Editor</span>
              <Code2 size={15} />
            </button>
          </div>
        </div>

        {/* =====================================================================
            RIGHT SOLUTION WORKSPACE (Image 2 Concept with AarCode Design & Engine)
        ===================================================================== */}
        <div
          className={cn(
            "h-full flex-1 flex-col min-h-0 bg-white dark:bg-[#090D16] overflow-hidden",
            mobileView === "problem" ? "hidden lg:flex" : "flex w-full"
          )}
        >
          {/* 1. Solution Pane Header Bar */}
          <div className="h-11 sm:h-12 border-b border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] px-3 sm:px-4 flex items-center justify-between shrink-0">
            {/* Left: { } Your Solution title + solution.ext */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center font-mono font-black text-xs">
                {"{ }"}
              </div>
              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hidden xs:inline">
                Your Solution
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-700/60 text-[10px] sm:text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                solution.{getLanguageById(language)?.extension || "py"}
              </span>
            </div>

            {/* Right: Language Selector + Reset starter code */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-28 sm:w-36">
                <LanguageSelector
                  value={language}
                  onChange={(langId: string) => setLanguage(langId)}
                />
              </div>

              <button
                onClick={handleResetCode}
                title="Reset editor to starter code"
                className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                aria-label="Reset starter code"
              >
                <RotateCcw size={14} />
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 shadow-xs transition-all disabled:opacity-50"
              >
                {isRunning ? (
                  <Loader2 size={13} className="animate-spin text-[#6366F1]" />
                ) : (
                  <Play size={13} className="text-[#6366F1] fill-[#6366F1]" />
                )}
                <span>Run</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* 2. Unified Workspace Tab Navigation */}
          <div className="h-10 border-b border-slate-200/80 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#0B101D] px-2 sm:px-3 flex items-center justify-between shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 min-w-max">
              {/* Tab 1: Code */}
              <button
                onClick={() => {
                  setActiveTab("code");
                  setMobileView("code");
                }}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  activeTab === "code"
                    ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Code2 size={13} />
                <span>Code</span>
              </button>

              {/* Tab 2: Sample Tests */}
              <button
                onClick={() => {
                  setActiveTab("samples");
                  setMobileView("tests");
                }}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  activeTab === "samples"
                    ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <CheckCircle2 size={13} />
                <span>Sample Tests</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  {publicCases.length}
                </span>
              </button>

              {/* Tab 3: Hidden Tests */}
              <button
                onClick={() => {
                  setActiveTab("hidden");
                  setMobileView("tests");
                }}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  activeTab === "hidden"
                    ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Lock size={13} />
                <span>Hidden Tests</span>
              </button>

              {/* Tab 4: Custom Test */}
              <button
                onClick={() => {
                  setActiveTab("custom");
                  setMobileView("tests");
                }}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  activeTab === "custom"
                    ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Terminal size={13} />
                <span>Custom Test</span>
              </button>

              {/* Tab 5: Evaluation Result */}
              <button
                onClick={() => {
                  setActiveTab("result");
                  setMobileView("tests");
                }}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5",
                  activeTab === "result"
                    ? "bg-white dark:bg-[#1E293B] text-[#6366F1] dark:text-[#818CF8] shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                <Sparkles size={13} className={judgeResult?.status === "passed" ? "text-emerald-500" : ""} />
                <span>Evaluation Result</span>
                {isRunning || isSubmitting ? (
                  <Loader2 size={11} className="animate-spin text-[#6366F1]" />
                ) : executionError ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                ) : judgeResult?.status === "passed" ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ) : judgeResult?.status === "failed" ? (
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                ) : runTestResults ? (
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                ) : null}
              </button>
            </div>
          </div>

          {/* 3. Main Tab Contents */}
          <div className="flex-1 min-h-0 relative overflow-hidden bg-[#F8FAFC] dark:bg-[#070A12]">
            {/* View A: Full-Height Code Editor */}
            <div className={cn("h-full w-full flex flex-col min-h-0", activeTab === "code" ? "flex" : "hidden")}>
              <div className="flex-1 min-h-0 relative">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={getLanguageById(language)?.monacoLanguage || language}
                  theme={theme}
                  settings={DEFAULT_SETTINGS}
                />
              </div>

              {/* Status Bar (Image 2 style) */}
              <div className="h-8 px-4 border-t border-slate-200/80 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0B101D] flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0">
                <div className="flex items-center gap-2.5">
                  <span>Ln 1 : Col 1</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="capitalize">{getLanguageById(language)?.name || language}</span>
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span>Spaces: 4</span>
                  <span>14px</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
                    <span className="capitalize">{theme} Theme</span>
                  </span>
                </div>
              </div>
            </div>

            {/* View B: Sample Tests */}
            {activeTab === "samples" && (
              <div className="h-full w-full overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-[#070A12] select-text">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#6366F1]" />
                      <span>Sample Test Cases</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-[#6366F1] font-mono font-bold">
                        {publicCases.length} Cases
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Non-editable sample test cases to verify initial problem logic before submission.
                    </p>
                  </div>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-white" />}
                    <span>Run Sample Tests</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {publicCases.map((tc, idx) => (
                    <div
                      key={tc.id || idx}
                      className="rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-4 space-y-3 text-xs font-mono shadow-sm"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-bold text-slate-900 dark:text-white text-xs font-sans flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-indigo-500/10 text-[#6366F1] flex items-center justify-center font-bold text-[11px]">
                            {idx + 1}
                          </span>
                          <span>Sample Case {idx + 1}</span>
                        </span>
                        <button
                          onClick={() => handleCopy(tc.input, idx)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-flex items-center gap-1 text-[11px] font-sans"
                          title="Copy input"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={13} className="text-emerald-500" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy Input</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300">
                          Input:
                        </span>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-slate-100 overflow-x-auto whitespace-pre">
                          {tc.input || "(empty)"}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-sans font-semibold text-slate-700 dark:text-slate-300">
                          Expected Output:
                        </span>
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold overflow-x-auto whitespace-pre">
                          {tc.expected_output}
                        </div>
                      </div>

                      {tc.explanation && (
                        <p className="font-sans text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                          Explanation: {tc.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View C: Hidden Tests */}
            {activeTab === "hidden" && (
              <div className="h-full w-full overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-[#070A12] select-text">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock size={16} className="text-amber-500" />
                      <span>Hidden Benchmark Tests</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold border border-amber-500/20">
                        Evaluation Suite
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Hidden benchmark test cases evaluate edge cases, boundary values, and time limit constraints.
                    </p>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning || isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    <span>Submit & Evaluate</span>
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-4 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock size={14} className="text-slate-400" />
                        <span>Benchmark Case 1: Edge Cases & Zero Boundaries</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {judgeResult?.status === "passed" ? "Passed" : "Locked"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Verifies minimum constraint edge cases, empty boundaries, and single-element inputs.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] p-4 space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        <Lock size={14} className="text-slate-400" />
                        <span>Benchmark Case 2: Maximum Input Scale & Timeout</span>
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {judgeResult?.status === "passed" ? "Passed" : "Locked"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Stress tests runtime performance against maximal input size to verify asymptotic complexity.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 p-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Submission Completion Reward
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          Passing all sample and hidden tests unlocks full completion credit.
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold font-mono text-amber-500">
                      +{task.points || 10} XP
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* View D: Custom Test Input */}
            {activeTab === "custom" && (
              <div className="h-full w-full overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-[#070A12] select-text">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1E293B]">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Terminal size={16} className="text-[#6366F1]" />
                      <span>Custom Test Input</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                      Provide custom standard input (stdin) to test your code with specific data.
                    </p>
                  </div>
                  <button
                    onClick={handleRunCustomTest}
                    disabled={isRunning || isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm transition-all disabled:opacity-50"
                  >
                    {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-white" />}
                    <span>Run Custom Test</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Standard Input (stdin):
                      </label>
                      <button
                        onClick={() => setCustomStdin("")}
                        className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                    <textarea
                      value={customStdin}
                      onChange={(e) => setCustomStdin(e.target.value)}
                      rows={5}
                      placeholder="Enter custom input lines here..."
                      className="w-full p-3 rounded-xl bg-white dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#6366F1] font-mono text-xs shadow-inner"
                    />
                  </div>

                  {customRunResult && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#1E293B] shadow-sm">
                        <div className="flex items-center gap-2">
                          {customRunResult.status === "success" ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              <CheckCircle2 size={15} />
                              <span>Finished Successfully</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                              <XCircle size={15} />
                              <span>Execution Error</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-xs font-mono">
                          <Clock size={12} className="text-[#6366F1]" />
                          <span>{customRunResult.executionTime} ms</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Output (stdout):
                        </span>
                        <pre className="p-3 rounded-xl bg-white dark:bg-[#070A12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-slate-100 font-mono text-xs whitespace-pre overflow-x-auto shadow-xs">
                          {customRunResult.stdout ? customRunResult.stdout.trim() : "(no output)"}
                        </pre>
                      </div>

                      {customRunResult.stderr && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                            Error / Diagnostic Details:
                          </span>
                          <pre className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                            {customRunResult.stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* View E: Evaluation Result & Submission Breakdown */}
            {activeTab === "result" && (
              <div className="h-full w-full overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#F8FAFC] dark:bg-[#070A12] select-text">
                {/* 1. Executing / Submitting Spinner */}
                {(isRunning || isSubmitting) && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
                    <Loader2 size={32} className="animate-spin text-[#6366F1]" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {isSubmitting ? "Evaluating all sample and hidden test cases..." : "Executing code on runner..."}
                    </span>
                  </div>
                )}

                {/* 2. Compiler & Runtime Error Log (Direct & Clean, No Spoilers/Clues) */}
                {executionError && !isRunning && !isSubmitting && (
                  <div className="rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0E1526] p-4 space-y-3 animate-in shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                        <AlertTriangle size={16} />
                        <span>Compilation / Runtime Error</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(executionError);
                          showToast("info", "Error traceback copied to clipboard");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        title="Copy error message"
                      >
                        <Copy size={12} />
                        <span>Copy Traceback</span>
                      </button>
                    </div>

                    <pre className="p-4 rounded-xl bg-[#090D16] text-rose-300 font-mono text-xs leading-relaxed border border-rose-500/20 overflow-x-auto whitespace-pre-wrap select-text shadow-inner max-h-80 custom-scrollbar">
                      {executionError}
                    </pre>
                  </div>
                )}

                {/* 3. Empty State (No run yet) */}
                {!judgeResult && !runTestResults && !customRunResult && !executionError && !isRunning && !isSubmitting && (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-500 font-sans space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-[#6366F1] flex items-center justify-center mx-auto">
                      <Terminal size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        No Evaluation Results Yet
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Click <strong>Run</strong> to test against sample cases, or <strong>Submit</strong> to evaluate the full test suite.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-center gap-2">
                      <button
                        onClick={handleRunCode}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-all shadow-sm"
                      >
                        Run Sample Cases
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. Full Submission Judge Result Banner & Cards (Matching Image 1 & 2) */}
                {judgeResult && !isRunning && !isSubmitting && (
                  <div className="space-y-4 animate-in">
                    {/* Top Result Banner */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] shadow-xs">
                      <div className="flex items-center gap-2.5">
                        {judgeResult.status === "passed" ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                            <CheckCircle2 size={18} />
                            <span>Accepted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-sm">
                            <XCircle size={18} />
                            <span className="capitalize">{judgeResult.status.replace("_", " ")}</span>
                          </div>
                        )}
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          {judgeResult.passedCases} / {judgeResult.totalCases} Test Cases Passed
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={13} className="text-[#6366F1]" />
                          <span>{judgeResult.totalExecutionTimeMs} ms</span>
                        </span>
                        {judgeResult.pointsEarned > 0 && (
                          <span className="text-amber-500 font-bold font-mono">
                            +{judgeResult.pointsEarned} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Per-testcase cards */}
                    <div className="space-y-2.5">
                      {judgeResult.testCaseResults.map((tc, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all",
                            tc.passed
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300"
                          )}
                        >
                          <div className="flex justify-between font-bold">
                            <span>
                              {tc.isHidden ? "Hidden Benchmark Testcase" : `Sample Case ${tc.index}`}
                            </span>
                            <span>{tc.passed ? "✓ Passed" : "✗ Failed"}</span>
                          </div>

                          {!tc.isHidden && tc.input && (
                            <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                              Input: {tc.input}
                            </div>
                          )}
                          {!tc.isHidden && tc.actualOutput && (
                            <div className="font-mono text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                              Output: {tc.actualOutput.trim()}
                            </div>
                          )}
                          {!tc.isHidden && tc.expectedOutput && !tc.passed && (
                            <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                              Expected: {tc.expectedOutput.trim()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Public Run Code Results (when Run was clicked without Submit) */}
                {runTestResults && !judgeResult && !isRunning && !isSubmitting && (
                  <div className="space-y-4 animate-in">
                    <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs">
                      <span>Sample Cases Evaluation</span>
                      <span className="font-mono text-[#6366F1]">
                        {runTestResults.filter((r) => r.passed).length} / {runTestResults.length} Passed
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {runTestResults.map((res, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all",
                            res.passed
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                              : "bg-rose-500/5 border-rose-500/20 text-rose-700 dark:text-rose-300"
                          )}
                        >
                          <div className="flex justify-between font-bold">
                            <span>Sample Case {res.index}</span>
                            <span>{res.passed ? "✓ Passed" : "✗ Wrong Answer"}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                            Input: {res.input}
                          </div>
                          <div className="text-[11px] text-slate-800 dark:text-slate-200 font-mono font-bold">
                            Your Output: {res.actualOutput?.trim() || "(no output)"}
                          </div>
                          {!res.passed && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              Expected: {res.expectedOutput?.trim()}
                            </div>
                          )}
                          {res.errorMessage && (
                            <div className="text-[11px] text-rose-500 pt-1 font-mono">
                              {res.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          BOTTOM QUESTION NAVIGATION FOOTER (Always Visible, Course Module Scoped)
      ===================================================================== */}
      <footer className="h-12 border-t border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0F172A] px-3 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <button
          onClick={handlePrevQuestion}
          disabled={!hasPrev}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-1.5 text-center truncate px-1">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            Question {questionNumber} of {totalQuestions}
          </span>
          {courseContext?.moduleTitle && (
            <span className="hidden md:inline-block text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
              • {courseContext.moduleTitle}
            </span>
          )}
        </div>

        <button
          onClick={handleNextQuestion}
          disabled={!hasNext}
          className={cn(
            "inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm",
            hasNext
              ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white hover:shadow active:scale-95 cursor-pointer"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
          )}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </footer>

      {/* =====================================================================
          SUCCESS & XP REWARD CELEBRATION MODAL
      ===================================================================== */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm sm:max-w-md rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#1E293B] p-5 sm:p-7 shadow-2xl text-center space-y-4 sm:space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Award size={36} className="animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Challenge Solved!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All public and hidden test cases passed successfully.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Sparkles size={18} />
              <span>+{judgeResult?.pointsEarned || 10} XP Awarded to Profile</span>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Stay Here
              </button>
              <button
                onClick={() => {
                  setShowCelebration(false);
                  if (hasNext) {
                    handleNextQuestion();
                  } else if (courseContext?.courseSlug && courseContext.courseSlug !== "#") {
                    navigate("course", { slug: courseContext.courseSlug });
                  } else {
                    navigate("problems");
                  }
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-md shadow-indigo-500/25 transition-all"
              >
                {hasNext
                  ? "Next Question"
                  : courseContext?.courseTitle
                  ? "Finish Chapter"
                  : "Next Challenge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskArenaPage;
