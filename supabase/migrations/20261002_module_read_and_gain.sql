-- =========================================================================
-- AarCode / AarByte Database Migration: "Read & Gain" Learning Modes
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- =========================================================================

-- 1. ADD READ & GAIN COLUMNS TO MODULES TABLE
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS about_content TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS youtube_title TEXT;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS reading_time_mins INTEGER DEFAULT 5;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS code_examples JSONB DEFAULT '[]'::jsonb;

-- 2. SEED SAMPLE RICH STUDY GUIDE CONTENT FOR EXISTING MODULES
-- Example for "Data Structure" / "Arrays & Two Pointers"
UPDATE public.modules
SET 
  about_content = '## What is a Data Structure?

A **Data Structure** is a specialized format for organizing, processing, retrieving, and storing data in computer memory efficiently. Just like a physical library organizes books by categories and call numbers so you can locate them in seconds, data structures organize data so algorithms can access and manipulate values in optimal time.

---

### Core Data Structure Categories

1. **Linear Data Structures**: Elements are arranged sequentially (e.g., Arrays, Linked Lists, Stacks, Queues).
2. **Non-Linear Data Structures**: Elements have hierarchical or interconnected relationships (e.g., Trees, Graphs).
3. **Hash-Based Structures**: Key-value mapping providing near O(1) lookup times (e.g., Hash Tables, Hash Sets).

---

### Where Can We Use It? (Real-World Applications)

- **Operating Systems**: Task scheduling uses **Priority Queues** (Heaps); undo/redo actions use **Stacks**.
- **Databases & Indexing**: Relational engines (PostgreSQL, MySQL) index table rows using **B+ Trees** and **LSM Trees** for lightning-fast disk retrieval.
- **Web Browsers**: Browser history navigation (Back/Forward buttons) is powered by two distinct **Stacks**.
- **Social Networks & Maps**: Friend connections (LinkedIn, Instagram) and GPS routing (Google Maps) rely heavily on **Graphs** and BFS/Dijkstra algorithms.
- **Compilers & Interpreters**: Syntax parsing and bracket matching use **Abstract Syntax Trees (AST)** and **Call Stacks**.

---

### Complexity Cheat Sheet

| Data Structure | Access Time | Search Time | Insertion | Deletion | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Array** | $O(1)$ | $O(N)$ | $O(N)$ | $O(N)$ | $O(N)$ |
| **Hash Table** | N/A | $O(1)$ avg | $O(1)$ avg | $O(1)$ avg | $O(N)$ |
| **Binary Search Tree** | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | $O(N)$ |
| **Stack / Queue** | $O(N)$ | $O(N)$ | $O(1)$ | $O(1)$ | $O(N)$ |',

  youtube_url = 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
  youtube_title = 'Data Structures in 15 Minutes - Visual Intuition & Practical Guide',
  reading_time_mins = 6,
  key_takeaways = '[
    "Data structures define how information is organized in memory to optimize algorithmic runtime.",
    "Arrays offer instant O(1) random access by memory indexing, but resizing and insertions cost O(N).",
    "Hash Maps trade memory for O(1) average lookup speeds using hash functions and collision resolution.",
    "Choosing the right data structure early prevents costly O(N^2) bottlenecks in enterprise software."
  ]'::jsonb,
  code_examples = '[
    {
      "language": "python",
      "title": "Two-Pointer Array Search in Python",
      "code": "def two_sum_sorted(arr, target):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        curr_sum = arr[left] + arr[right]\n        if curr_sum == target:\n            return [left, right]\n        elif curr_sum < target:\n            left += 1\n        else:\n            right -= 1\n    return []"
    },
    {
      "language": "java",
      "title": "Efficient Fast Lookups in Java",
      "code": "import java.util.HashMap;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        HashMap<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}"
    }
  ]'::jsonb
WHERE title ILIKE '%Data Structure%' OR title ILIKE '%Arrays%';
