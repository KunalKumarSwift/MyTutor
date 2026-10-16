/**
 * Deterministic development catalogue. Content is written for this project; it is sample
 * material for exercising browsing, filters, pagination, reports and administration.
 */

export interface SeedReference {
  title: string;
  description: string;
  status?: 'ACTIVE' | 'INACTIVE';
  sortOrder?: number;
}

export interface SeedTutorial {
  title: string;
  category: string;
  level: string;
  prerequisites?: string;
  description: string;
  status?: 'ACTIVE' | 'INACTIVE';
  author: 'admin' | 'operator';
  /** Days before the seed reference date (2026-09-30). */
  daysAgo: number;
}

export const SEED_REFERENCE_DATE = Date.UTC(2026, 8, 30, 9, 0, 0);

export const categories: SeedReference[] = [
  { title: 'Programming Fundamentals', description: 'Core ideas every programmer relies on: variables, control flow, functions and debugging.' },
  { title: 'Web Development', description: 'Building pages and applications for the browser, from markup to HTTP.' },
  { title: 'Databases', description: 'Modelling, querying and protecting structured data.' },
  { title: 'Data Structures & Algorithms', description: 'Organising data and reasoning about the cost of the code that processes it.' },
  { title: 'Networking', description: 'How computers find and talk to each other.' },
  { title: 'Software Engineering', description: 'Practices for building software that keeps working as it grows.' },
  { title: 'Legacy Platforms', description: 'Retired material kept for reference. Not shown publicly.', status: 'INACTIVE' },
];

export const difficultyLevels: SeedReference[] = [
  { title: 'Beginner', description: 'No prior experience in the topic is assumed.', sortOrder: 1 },
  { title: 'Intermediate', description: 'Comfortable with the basics and ready to go deeper.', sortOrder: 2 },
  { title: 'Advanced', description: 'Builds on solid working experience.', sortOrder: 3 },
  { title: 'Expert', description: 'Specialist material. Currently unpublished.', sortOrder: 4, status: 'INACTIVE' },
];

export const tutorials: SeedTutorial[] = [
  {
    title: 'Your First Program: Variables and Output',
    category: 'Programming Fundamentals',
    level: 'Beginner',
    author: 'admin',
    daysAgo: 210,
    description: `A program is a list of instructions the computer follows in order. The simplest useful program stores a value and prints it.

A variable is a named box that holds a value. Give variables descriptive names such as totalPrice rather than x, so the code explains itself.

Practise by writing a program that stores your name and the current year in two variables, then prints a sentence that uses both.`,
  },
  {
    title: 'Making Decisions with If Statements',
    category: 'Programming Fundamentals',
    level: 'Beginner',
    prerequisites: 'Variables and Output',
    author: 'operator',
    daysAgo: 196,
    description: `Programs become useful when they react to data. An if statement runs a block of code only when a condition is true, and an optional else block runs otherwise.

Conditions are built from comparisons (==, <, >=) and combined with logical operators (and, or, not). Keep conditions readable: extract complicated tests into well-named variables.

Exercise: read a temperature and print "cold", "mild" or "hot" using if / else if / else.`,
  },
  {
    title: 'Loops: Repeating Work Safely',
    category: 'Programming Fundamentals',
    level: 'Beginner',
    prerequisites: 'If Statements',
    author: 'admin',
    daysAgo: 182,
    description: `Loops repeat a block of code. A for loop is ideal when you know how many times to repeat; a while loop continues until a condition becomes false.

Every loop needs a way to stop. Before writing one, decide what changes on each pass and why that change eventually ends the loop.

Exercise: print the multiplication table for a number chosen by the user, then rewrite it using the other kind of loop.`,
  },
  {
    title: 'Functions and Parameters',
    category: 'Programming Fundamentals',
    level: 'Intermediate',
    prerequisites: 'Loops and conditionals',
    author: 'operator',
    daysAgo: 160,
    description: `A function packages a piece of logic under a name so it can be reused and tested on its own. Parameters are the inputs; the return value is the output.

Good functions do one thing, have a name that says what that thing is, and avoid surprising side effects such as modifying global state.

Exercise: write a function that converts Celsius to Fahrenheit, then write three checks that confirm it returns the right values.`,
  },
  {
    title: 'Debugging: Reading Error Messages',
    category: 'Programming Fundamentals',
    level: 'Intermediate',
    author: 'admin',
    daysAgo: 120,
    description: `Error messages are clues, not insults. Read them from the top: the type of error, the message, and the file and line where it happened.

When the cause is not obvious, reduce the problem. Remove code until the error disappears, then add it back piece by piece. Print intermediate values to check your assumptions.

Keep a short log of bugs you have fixed and what caused them. Patterns appear quickly.`,
  },
  {
    title: 'HTML Page Structure',
    category: 'Web Development',
    level: 'Beginner',
    author: 'admin',
    daysAgo: 205,
    description: `Every web page is an HTML document: a tree of elements such as headings, paragraphs, links and images.

Use elements for their meaning, not their appearance. A heading is an h1–h6, navigation goes in nav, and the main content in main. Semantic markup helps screen readers, search engines and future maintainers.

Exercise: build a single page about a hobby with a heading, two sections, a list and a link.`,
  },
  {
    title: 'Styling with CSS: The Box Model',
    category: 'Web Development',
    level: 'Beginner',
    prerequisites: 'HTML Page Structure',
    author: 'operator',
    daysAgo: 175,
    description: `Every element on a page is a rectangular box made of content, padding, border and margin. Understanding this box is the key to predictable layouts.

Set box-sizing: border-box so widths include padding and border. Use margin to separate elements and padding to give content breathing room.

Exercise: style a card component with consistent spacing, a subtle border and a hover state.`,
  },
  {
    title: 'Responsive Layouts with Flexbox and Grid',
    category: 'Web Development',
    level: 'Intermediate',
    prerequisites: 'CSS basics and the box model',
    author: 'admin',
    daysAgo: 140,
    description: `Flexbox arranges items along one axis and is perfect for toolbars, navigation and aligning items in a row. Grid controls two dimensions and suits page layouts and card galleries.

Design mobile-first: start with a single column, then add breakpoints where the content needs more room — not at arbitrary device widths.

Exercise: build a gallery that shows one card per row on phones, two on tablets and four on wide screens.`,
  },
  {
    title: 'How HTTP Requests Work',
    category: 'Web Development',
    level: 'Intermediate',
    author: 'operator',
    daysAgo: 98,
    description: `When you open a page, the browser sends an HTTP request: a method (GET, POST, …), a path, headers and sometimes a body. The server replies with a status code, headers and a body.

Status codes group into families: 2xx success, 3xx redirection, 4xx client errors and 5xx server errors. Choosing the right code makes APIs easier to use.

Exercise: open your browser's developer tools, reload a page and identify the method, status and content type of five requests.`,
  },
  {
    title: 'Web Security Basics: XSS and CSRF',
    category: 'Web Development',
    level: 'Advanced',
    prerequisites: 'HTTP fundamentals; building forms',
    author: 'admin',
    daysAgo: 45,
    description: `Cross-site scripting (XSS) happens when user input is rendered as code. Always escape output by default and treat any HTML from users as untrusted.

Cross-site request forgery (CSRF) tricks a signed-in browser into sending an unwanted request. Defences include SameSite cookies, checking the Origin header and requiring a per-session token on state-changing requests.

Exercise: review a form in an application you know and list which of these defences it uses.`,
  },
  {
    title: 'Introduction to Relational Databases',
    category: 'Databases',
    level: 'Beginner',
    author: 'operator',
    daysAgo: 200,
    description: `A relational database stores data in tables of rows and columns. Each table describes one kind of thing — students, courses, enrolments.

A primary key uniquely identifies each row. A foreign key in one table refers to a primary key in another, which is how relationships are represented.

Exercise: sketch tables for a small library: books, members and loans. Mark the primary and foreign keys.`,
  },
  {
    title: 'Writing SELECT Queries',
    category: 'Databases',
    level: 'Beginner',
    prerequisites: 'Relational database basics',
    author: 'admin',
    daysAgo: 168,
    description: `SELECT retrieves data. Choose the columns you need, name the table in FROM, filter rows with WHERE and order them with ORDER BY.

Avoid SELECT * in application code: listing columns makes queries faster and protects you when the table changes.

Exercise: write queries that list the ten most recent orders, then only those above a given amount.`,
  },
  {
    title: 'Joins Explained',
    category: 'Databases',
    level: 'Intermediate',
    prerequisites: 'SELECT queries',
    author: 'operator',
    daysAgo: 130,
    description: `A join combines rows from two tables using a related column. An inner join keeps only matching rows; a left join keeps every row from the left table and fills missing matches with NULL.

Joining in the database is usually far faster than running one query per row in your application — the so-called N+1 problem.

Exercise: list every course with its number of enrolled students, including courses with none.`,
  },
  {
    title: 'Preventing SQL Injection',
    category: 'Databases',
    level: 'Intermediate',
    prerequisites: 'Writing SQL queries from application code',
    author: 'admin',
    daysAgo: 75,
    description: `SQL injection happens when user input is pasted directly into a query string, letting an attacker change the query itself.

The fix is parameterised queries: send the SQL and the values separately so values can never be interpreted as code. ORMs and query builders do this for you when used normally.

Exercise: find a query built by string concatenation and rewrite it using parameters.`,
  },
  {
    title: 'Indexes and Query Performance',
    category: 'Databases',
    level: 'Advanced',
    prerequisites: 'Joins; reading query plans is helpful',
    author: 'operator',
    daysAgo: 30,
    description: `An index is a sorted structure that lets the database find rows without scanning the whole table. Indexes speed up reads but cost space and slow down writes.

Index the columns you filter, join and sort on most often. Use EXPLAIN to confirm the database actually uses the index.

Exercise: time a filtered query on a large table, add an index, and compare the plan and duration.`,
  },
  {
    title: 'Arrays and Lists',
    category: 'Data Structures & Algorithms',
    level: 'Beginner',
    author: 'admin',
    daysAgo: 190,
    description: `An array stores items in a contiguous, numbered sequence. Reading an item by its position is instant; inserting in the middle requires shifting everything after it.

Dynamic lists grow automatically by allocating a larger array and copying items across when they run out of room.

Exercise: implement a function that removes duplicates from a list while keeping the original order.`,
  },
  {
    title: 'Big-O Notation in Plain Language',
    category: 'Data Structures & Algorithms',
    level: 'Intermediate',
    prerequisites: 'Loops; arrays',
    author: 'operator',
    daysAgo: 150,
    description: `Big-O describes how the work an algorithm does grows as the input grows. O(1) stays constant, O(n) grows in proportion to the input, and O(n²) grows with its square.

Constant factors matter less than growth rates for large inputs: an O(n log n) sort will beat an O(n²) sort once the data is big enough.

Exercise: estimate the Big-O of three functions you have written recently.`,
  },
  {
    title: 'Hash Tables',
    category: 'Data Structures & Algorithms',
    level: 'Intermediate',
    prerequisites: 'Big-O notation',
    author: 'admin',
    daysAgo: 88,
    description: `A hash table maps keys to values. A hash function turns each key into a bucket number so lookups take roughly constant time.

Two keys can land in the same bucket — a collision. Implementations handle this with chaining or open addressing and resize when they get too full.

Exercise: count word frequencies in a paragraph using a hash map, then print the five most common words.`,
  },
  {
    title: 'Binary Search',
    category: 'Data Structures & Algorithms',
    level: 'Intermediate',
    prerequisites: 'Arrays; Big-O notation',
    author: 'operator',
    daysAgo: 60,
    description: `Binary search finds a value in a sorted list by repeatedly halving the range that could contain it, giving O(log n) time.

The tricky part is the boundaries. Decide whether your range is inclusive or half-open and keep that rule consistent in every comparison.

Exercise: implement binary search, then adapt it to return the first position where a value could be inserted.`,
  },
  {
    title: 'Graph Traversal: BFS and DFS',
    category: 'Data Structures & Algorithms',
    level: 'Advanced',
    prerequisites: 'Queues, stacks and recursion',
    author: 'admin',
    daysAgo: 20,
    description: `A graph is a set of nodes connected by edges. Breadth-first search explores neighbours level by level using a queue and finds shortest paths in unweighted graphs. Depth-first search follows one path as far as possible using a stack or recursion.

Always track visited nodes, or cycles will trap the traversal forever.

Exercise: model a small map of rooms and find the fewest doors between two of them.`,
  },
  {
    title: 'IP Addresses and Subnets',
    category: 'Networking',
    level: 'Beginner',
    author: 'operator',
    daysAgo: 185,
    description: `An IP address identifies a device on a network. IPv4 addresses are four numbers from 0 to 255; IPv6 addresses are longer and written in hexadecimal.

A subnet mask splits an address into a network part and a host part. Devices in the same subnet can talk directly; others are reached through a router.

Exercise: find your computer's IP address and subnet mask and work out how many hosts that subnet can contain.`,
  },
  {
    title: 'DNS: From Names to Addresses',
    category: 'Networking',
    level: 'Intermediate',
    prerequisites: 'IP addresses',
    author: 'admin',
    daysAgo: 110,
    description: `DNS translates names like example.org into IP addresses. A resolver asks the root servers, then the top-level domain servers, then the domain's own name servers, caching answers along the way.

Common record types are A (IPv4), AAAA (IPv6), CNAME (alias) and MX (mail).

Exercise: use a lookup tool to list the A, AAAA and MX records for a domain you use every day.`,
  },
  {
    title: 'Version Control with Git',
    category: 'Software Engineering',
    level: 'Beginner',
    author: 'admin',
    daysAgo: 178,
    description: `Git records snapshots of your project called commits. Each commit has a message explaining why the change was made.

Branches let you work on a change without disturbing the main line. When it is ready, merge it back after review.

Exercise: create a repository, make three small commits with clear messages, then create and merge a branch.`,
  },
  {
    title: 'Writing Your First Unit Tests',
    category: 'Software Engineering',
    level: 'Intermediate',
    prerequisites: 'Functions',
    author: 'operator',
    daysAgo: 70,
    description: `A unit test calls a small piece of code with known input and checks the output. Good tests are fast, independent and describe behaviour rather than implementation.

Follow arrange–act–assert: set up the inputs, run the code, verify the result. Name each test after the behaviour it protects.

Exercise: write tests for a function that validates email addresses, including at least three invalid cases.`,
  },
  {
    title: 'Refactoring Without Fear',
    category: 'Software Engineering',
    level: 'Advanced',
    prerequisites: 'Unit testing; version control',
    author: 'admin',
    daysAgo: 12,
    description: `Refactoring improves the structure of code without changing its behaviour. Tests are your safety net: run them after every small step.

Common moves include extracting a function, renaming for clarity and replacing a long conditional with polymorphism or a lookup table. Commit each step separately so mistakes are easy to undo.

Exercise: pick a function longer than forty lines and break it into smaller, well-named pieces.`,
  },
  {
    title: 'Code Review Checklist',
    category: 'Software Engineering',
    level: 'Intermediate',
    author: 'operator',
    daysAgo: 5,
    status: 'INACTIVE',
    description: `Draft: a checklist for reviewing changes — correctness, tests, naming, error handling and security. Unpublished until it has been reviewed.`,
  },
  {
    title: 'Classic ASP Page Lifecycle',
    category: 'Legacy Platforms',
    level: 'Intermediate',
    author: 'admin',
    daysAgo: 230,
    description: `Archived material on a retired server-side platform. Its category is inactive, so it is hidden from the public catalogue.`,
  },
  {
    title: 'Compiler Construction Deep Dive',
    category: 'Programming Fundamentals',
    level: 'Expert',
    author: 'admin',
    daysAgo: 8,
    description: `Lexing, parsing, semantic analysis and code generation. Its difficulty level is inactive, so it is hidden from the public catalogue.`,
  },
];
