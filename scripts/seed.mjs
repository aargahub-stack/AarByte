import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bhstxlupnawzucsxbjvl.supabase.co";
// Using service_role key to bypass RLS during admin database seeding
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoc3R4bHVwbmF3enVjc3hianZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDYwOTYwNywiZXhwIjoyMTA2MTg1NjA3fQ.AtbeZyoWt_Yb9VHnuvjIwdgaW3Fg2GX3Bewyhkg7oto";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function seed() {
  console.log("Seeding AarByte initial curriculum into Supabase...");

  // 1. Course: Python DSA
  const { data: course1, error: err1 } = await supabase
    .from("courses")
    .upsert(
      {
        title: "Python Data Structures & Algorithms",
        slug: "python-dsa",
        description:
          "Master essential algorithms, arrays, two pointers, hash maps, and recursion with LeetCode-style Python tasks.",
        icon: "code",
        is_published: true,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (err1) {
    console.error("Course 1 creation error:", err1);
    return;
  }
  console.log("✓ Course created:", course1.title);

  // Module 1
  const { data: mod1, error: modErr1 } = await supabase
    .from("modules")
    .insert({
      course_id: course1.id,
      title: "Module 1: Arrays & Two Pointers",
      order_index: 1,
    })
    .select()
    .single();

  if (modErr1) {
    console.error("Module 1 error:", modErr1);
  } else {
    console.log("✓ Module created:", mod1.title);

    // Task 1: Two Sum
    const { data: task1, error: tErr1 } = await supabase
      .from("tasks")
      .insert({
        module_id: mod1.id,
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
        solution_code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i
    return []

import sys, json
lines = sys.stdin.read().splitlines()
if lines:
    nums = json.loads(lines[0])
    target = int(lines[1])
    print(json.dumps(two_sum(nums, target)))
`,
        hints: [
          "A brute force approach would search all pairs in O(n^2) time.",
          "Can you use a hash map to look up complements in O(1) time?",
        ],
        points: 10,
        order_index: 1,
      })
      .select()
      .single();

    if (tErr1) {
      console.error("Task 1 error:", tErr1);
    } else {
      console.log("✓ Task created:", task1.title);
      // Test cases for Two Sum
      await supabase.from("test_cases").insert([
        {
          task_id: task1.id,
          input: "[2, 7, 11, 15]\n9",
          expected_output: "[0, 1]",
          is_hidden: false,
          explanation: "nums[0] + nums[1] == 9, so return [0, 1].",
        },
        {
          task_id: task1.id,
          input: "[3, 2, 4]\n6",
          expected_output: "[1, 2]",
          is_hidden: false,
          explanation: "nums[1] + nums[2] == 6, so return [1, 2].",
        },
        {
          task_id: task1.id,
          input: "[3, 3]\n6",
          expected_output: "[0, 1]",
          is_hidden: false,
          explanation: "nums[0] + nums[1] == 6, so return [0, 1].",
        },
        {
          task_id: task1.id,
          input: "[1, 5, 8, 12, 19]\n20",
          expected_output: "[0, 4]",
          is_hidden: true,
          explanation: "Hidden testcase checking endpoints.",
        },
      ]);
      console.log("✓ Test cases added for Two Sum");
    }

    // Task 2: Valid Palindrome
    const { data: task2, error: tErr2 } = await supabase
      .from("tasks")
      .insert({
        module_id: mod1.id,
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
        solution_code: `def is_palindrome(s: str) -> bool:
    filtered = "".join(ch.lower() for ch in s if ch.isalnum())
    return filtered == filtered[::-1]

import sys
s = sys.stdin.read().strip()
print(str(is_palindrome(s)).lower())
`,
        hints: [
          "Filter non-alphanumeric characters and lowercase the string.",
          "Check if string equals its reverse.",
        ],
        points: 10,
        order_index: 2,
      })
      .select()
      .single();

    if (tErr2) {
      console.error("Task 2 error:", tErr2);
    } else {
      console.log("✓ Task created:", task2.title);
      await supabase.from("test_cases").insert([
        {
          task_id: task2.id,
          input: "A man, a plan, a canal: Panama",
          expected_output: "true",
          is_hidden: false,
          explanation: '"amanaplanacanalpanama" is a palindrome.',
        },
        {
          task_id: task2.id,
          input: "race a car",
          expected_output: "false",
          is_hidden: false,
          explanation: '"raceacar" is not a palindrome.',
        },
        {
          task_id: task2.id,
          input: " ",
          expected_output: "true",
          is_hidden: true,
          explanation: "Empty or space-only string is considered a palindrome.",
        },
      ]);
      console.log("✓ Test cases added for Valid Palindrome");
    }
  }

  // 2. Course: C++ Competitive Programming Core
  const { data: course2, error: err2 } = await supabase
    .from("courses")
    .upsert(
      {
        title: "C++ Competitive Programming Core",
        slug: "cpp-competitive-core",
        description:
          "High-performance problem solving techniques using modern C++20 and STL containers.",
        icon: "terminal",
        is_published: true,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (!err2 && course2) {
    console.log("✓ Course created:", course2.title);
    const { data: mod2 } = await supabase
      .from("modules")
      .insert({
        course_id: course2.id,
        title: "Module 1: Fast I/O & STL Vectors",
        order_index: 1,
      })
      .select()
      .single();

    if (mod2) {
      const { data: task3 } = await supabase
        .from("tasks")
        .insert({
          module_id: mod2.id,
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
          hints: ["Use std::reverse or swap two pointers."],
          points: 10,
          order_index: 1,
        })
        .select()
        .single();

      if (task3) {
        await supabase.from("test_cases").insert([
          {
            task_id: task3.id,
            input: "5\n1 2 3 4 5",
            expected_output: "5 4 3 2 1",
            is_hidden: false,
            explanation: "Reversed array is 5 4 3 2 1.",
          },
          {
            task_id: task3.id,
            input: "3\n10 20 30",
            expected_output: "30 20 10",
            is_hidden: true,
            explanation: "Hidden testcase.",
          },
        ]);
        console.log("✓ Task and testcases added for C++ Array Reversal");
      }
    }
  }

  console.log("All seed data successfully injected into Supabase!");
}

seed().catch(console.error);
