-- ═══════════════════════════════════════════════════════════════════════════
-- CREDIBLE — Database Migration: Populate Featured/Guest Quiz
-- Run this in Supabase Dashboard → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO public.system_quizzes (quiz_type, quiz_data, updated_at)
VALUES ('featured', $${
  "quiz_metadata": {
    "total_questions": 30,
    "passing_score": 70,
    "difficulty_distribution": {
      "easy": 9,
      "medium": 12,
      "hard": 9
    }
  },
  "assessment_profile": {
    "assessment_title": "Full Stack Web Development Professional Certification Quiz",
    "source_video_title": "Full Stack Web Development",
    "source_video_url": "https://youtu.be/nu_pCVPKzTk?si=sN1nCVOMdeQ-nJBp",
    "difficulty_rating": "intermediate",
    "knowledge_scope_score": 85,
    "topics_count": 18,
    "projects_count": 3,
    "estimated_learning_hours": 25,
    "assessment_weight": "standard"
  },
  "questions": [
    {
      "question_id": "Q1",
      "topic_id": "T1.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which layer of the client‑server model is responsible for rendering HTML received from the server?",
      "options": [
        {
          "option": "A",
          "text": "Database layer",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Presentation layer (browser)",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Application server",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Network transport layer",
          "is_correct": false
        }
      ],
      "explanation": "The browser (presentation layer) interprets HTML and displays it to the user."
    },
    {
      "question_id": "Q2",
      "topic_id": "T1.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "HTTPS differs from HTTP primarily because it:",
      "options": [
        {
          "option": "A",
          "text": "Uses a different port number",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Encrypts data using TLS/SSL",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Runs on a separate protocol stack",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Does not require DNS",
          "is_correct": false
        }
      ],
      "explanation": "HTTPS adds TLS/SSL encryption to the HTTP protocol, securing data in transit."
    },
    {
      "question_id": "Q3",
      "topic_id": "T1.2",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which command initializes a new Git repository in the current directory?",
      "options": [
        {
          "option": "A",
          "text": "git start",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "git init",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "git create",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "git new",
          "is_correct": false
        }
      ],
      "explanation": "`git init` creates a .git folder and starts tracking the project."
    },
    {
      "question_id": "Q4",
      "topic_id": "T2.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which HTML5 element is most appropriate for the main navigation links of a site?",
      "options": [
        {
          "option": "A",
          "text": "<section>",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "<nav>",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "<article>",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "<aside>",
          "is_correct": false
        }
      ],
      "explanation": "The <nav> element semantically represents a set of navigation links."
    },
    {
      "question_id": "Q5",
      "topic_id": "T2.2",
      "question_type": "multi-select",
      "difficulty": "easy",
      "question_text": "Select all CSS properties that are part of the Flexbox layout model:",
      "options": [
        {
          "option": "A",
          "text": "flex-direction",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "grid-template-columns",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "justify-content",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "align-items",
          "is_correct": true
        }
      ],
      "explanation": "flex-direction, justify-content, and align-items are Flexbox properties; grid-template-columns belongs to CSS Grid."
    },
    {
      "question_id": "Q6",
      "topic_id": "T2.2",
      "question_type": "scenario",
      "difficulty": "medium",
      "question_text": "You need a layout that displays three columns on desktop, two columns on tablet, and a single column on mobile. Which CSS technique best accomplishes this with minimal code?",
      "options": [
        {
          "option": "A",
          "text": "Multiple @media queries with float-based columns",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "CSS Grid with repeat(auto-fit, minmax(250px, 1fr))",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Flexbox with flex-wrap and fixed widths",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Absolute positioning for each column",
          "is_correct": false
        }
      ],
      "explanation": "CSS Grid's auto-fit/minmax pattern automatically adjusts column count based on viewport width."
    },
    {
      "question_id": "Q7",
      "topic_id": "T2.3",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "What does the following JavaScript syntax do?\n\nconst { name, age } = user;",
      "options": [
        {
          "option": "A",
          "text": "Creates a new object named name and age",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Destructures the user object into variables name and age",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Assigns default values to user",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Defines a function called user",
          "is_correct": false
        }
      ],
      "explanation": "Object destructuring extracts the specified properties into standalone variables."
    },
    {
      "question_id": "Q8",
      "topic_id": "T2.3",
      "question_type": "code-output",
      "difficulty": "medium",
      "question_text": "What is logged to the console?\n\n```js\nconst fetchData = async () => {\n  return 42;\n};\nfetchData().then(console.log);\n```",
      "options": [
        {
          "option": "A",
          "text": "Promise { <pending> }",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "42",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "undefined",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Error: async function must be awaited",
          "is_correct": false
        }
      ],
      "explanation": "The async function returns a resolved promise with value 42; .then logs 42."
    },
    {
      "question_id": "Q9",
      "topic_id": "T3.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "In React, JSX allows you to:",
      "options": [
        {
          "option": "A",
          "text": "Write HTML directly inside JavaScript files",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "Render components without a virtual DOM",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Avoid using props",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Compile to pure CSS",
          "is_correct": false
        }
      ],
      "explanation": "JSX is a syntax extension that mixes HTML‑like markup with JavaScript."
    },
    {
      "question_id": "Q10",
      "topic_id": "T3.1",
      "question_type": "single-correct",
      "difficulty": "medium",
      "question_text": "Which React Hook should be used to perform a side effect after the component mounts and only once?",
      "options": [
        {
          "option": "A",
          "text": "useState",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "useEffect(() => { … }, [])",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "useMemo",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "useCallback",
          "is_correct": false
        }
      ],
      "explanation": "Providing an empty dependency array runs the effect only after the first render."
    },
    {
      "question_id": "Q11",
      "topic_id": "T3.2",
      "question_type": "multi-select",
      "difficulty": "hard",
      "question_text": "When using Redux Toolkit, which statements are true? (Select all that apply)",
      "options": [
        {
          "option": "A",
          "text": "createSlice automatically generates action creators",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "The store must be created with combineReducers manually",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Immer is used behind the scenes to allow mutable syntax",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "Reducers must be pure functions that never mutate state",
          "is_correct": false
        }
      ],
      "explanation": "RTK's createSlice creates actions and uses Immer, so reducers can appear mutable while remaining immutable."
    },
    {
      "question_id": "Q12",
      "topic_id": "T3.3",
      "question_type": "scenario",
      "difficulty": "medium",
      "question_text": "A route should be accessible only to logged‑in users. Which React Router pattern implements this?",
      "options": [
        {
          "option": "A",
          "text": "Wrap the component with <Redirect> inside the route",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Create a <PrivateRoute> component that checks auth before rendering",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Use useNavigate inside the component’s render",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Add a query param `auth=true` to the URL",
          "is_correct": false
        }
      ],
      "explanation": "A custom PrivateRoute component conditionally renders based on authentication state."
    },
    {
      "question_id": "Q13",
      "topic_id": "T4.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "In Express, the function signature `app.use((req, res, next) => { … })` is an example of:",
      "options": [
        {
          "option": "A",
          "text": "Routing handler",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Middleware",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Error handler",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Static file server",
          "is_correct": false
        }
      ],
      "explanation": "Calling app.use with three parameters defines middleware that can pass control via next()."
    },
    {
      "question_id": "Q14",
      "topic_id": "T4.2",
      "question_type": "single-correct",
      "difficulty": "medium",
      "question_text": "Which statement correctly describes the difference between SQL and NoSQL databases?",
      "options": [
        {
          "option": "A",
          "text": "SQL databases store data as key‑value pairs, NoSQL uses tables",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "SQL enforces a fixed schema, NoSQL allows flexible schemas",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "SQL is always faster than NoSQL",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "NoSQL cannot support transactions",
          "is_correct": false
        }
      ],
      "explanation": "Relational databases require a predefined schema, whereas document/column stores are schema‑less."
    },
    {
      "question_id": "Q15",
      "topic_id": "T4.2",
      "question_type": "code-output",
      "difficulty": "hard",
      "question_text": "What will be the output of the following Mongoose code?\n\n```js\nconst userSchema = new mongoose.Schema({ name: String });\nconst User = mongoose.model('User', userSchema);\nconst u = new User({ name: 'Alice' });\nconsole.log(u._id instanceof mongoose.Types.ObjectId);\n```",
      "options": [
        {
          "option": "A",
          "text": "true",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "false",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "undefined",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Error thrown",
          "is_correct": false
        }
      ],
      "explanation": "Mongoose automatically assigns an ObjectId to the _id field upon document creation."
    },
    {
      "question_id": "Q16",
      "topic_id": "T4.3",
      "question_type": "single-correct",
      "difficulty": "medium",
      "question_text": "Which header is essential for a server to allow cross‑origin requests?",
      "options": [
        {
          "option": "A",
          "text": "Authorization",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Content-Type",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Access-Control-Allow-Origin",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "Cache-Control",
          "is_correct": false
        }
      ],
      "explanation": "CORS is controlled via the Access-Control-Allow-Origin response header."
    },
    {
      "question_id": "Q17",
      "topic_id": "T5.1",
      "question_type": "scenario",
      "difficulty": "hard",
      "question_text": "You need a CI workflow that (1) runs unit tests on every push, (2) builds a Docker image, and (3) pushes the image to Docker Hub only on the main branch. Which GitHub Actions configuration snippet achieves this?",
      "options": [
        {
          "option": "A",
          "text": "Run all three steps in a single job with `if: github.ref == 'refs/heads/main'` for the push step only",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Create two jobs: `test` on any push, and `deploy` with `needs: test` and `if: github.ref == 'refs/heads/main'`",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Use a single job with `only: main` for the entire workflow",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Trigger a separate workflow file for Docker push",
          "is_correct": false
        }
      ],
      "explanation": "Separate jobs allow tests to run on every push, while the deploy job is gated to the main branch."
    },
    {
      "question_id": "Q18",
      "topic_id": "T5.2",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which environment variable is commonly used to store an API key without hard‑coding it in the source code?",
      "options": [
        {
          "option": "A",
          "text": "API_KEY",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "config.js",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "publicKey",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "LOCALHOST",
          "is_correct": false
        }
      ],
      "explanation": "Storing secrets in environment variables like API_KEY keeps them out of the codebase."
    },
    {
      "question_id": "Q19",
      "topic_id": "T3.2",
      "question_type": "single-correct",
      "difficulty": "hard",
      "question_text": "In Redux Toolkit, which function is used to create an asynchronous thunk action?",
      "options": [
        {
          "option": "A",
          "text": "createAsyncThunk",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "createSlice",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "createReducer",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "createAction",
          "is_correct": false
        }
      ],
      "explanation": "createAsyncThunk generates pending/fulfilled/rejected action types for async logic."
    },
    {
      "question_id": "Q20",
      "topic_id": "T4.3",
      "question_type": "multi-select",
      "difficulty": "hard",
      "question_text": "Which of the following are valid strategies to protect routes in an Express API using JWTs? (Select all that apply)",
      "options": [
        {
          "option": "A",
          "text": "Verify token in a middleware before the protected route",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "Store JWT in a URL query string",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Send the JWT in an HttpOnly cookie",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "Hard‑code the secret key in the client side",
          "is_correct": false
        }
      ],
      "explanation": "Token verification middleware and HttpOnly cookies are secure patterns; query strings expose tokens."
    },
    {
      "question_id": "Q21",
      "topic_id": "T2.3",
      "question_type": "scenario",
      "difficulty": "medium",
      "question_text": "You need to fetch user data from an API and handle errors without using try/catch. Which syntax correctly accomplishes this?",
      "options": [
        {
          "option": "A",
          "text": "fetch(url).then(res => res.json()).catch(err => console.error(err));",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "await fetch(url);",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "fetch(url).then(console.log);",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "fetch(url).error(err => ...);",
          "is_correct": false
        }
      ],
      "explanation": "Using .catch on the promise chain captures any rejection."
    },
    {
      "question_id": "Q22",
      "topic_id": "T3.1",
      "question_type": "code-output",
      "difficulty": "medium",
      "question_text": "What will be rendered by this component?\n\n```jsx\nfunction Greeting({ name }) {\n  return <h1>Hello, {name ?? 'Guest'}!</h1>;\n}\n\nReactDOM.render(<Greeting />, document.getElementById('root'));\n```",
      "options": [
        {
          "option": "A",
          "text": "Hello, Guest!",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "Hello, undefined!",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Hello, null!",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "A runtime error",
          "is_correct": false
        }
      ],
      "explanation": "The nullish coalescing operator falls back to 'Guest' when name is undefined."
    },
    {
      "question_id": "Q23",
      "topic_id": "T5.1",
      "question_type": "single-correct",
      "difficulty": "medium",
      "question_text": "Which Docker command builds an image from a Dockerfile in the current directory and tags it as `myapp:latest`?",
      "options": [
        {
          "option": "A",
          "text": "docker run -t myapp:latest .",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "docker build -t myapp:latest .",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "docker create -t myapp:latest",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "docker compose build myapp",
          "is_correct": false
        }
      ],
      "explanation": "`docker build -t <tag> .` builds and tags the image."
    },
    {
      "question_id": "Q24",
      "topic_id": "T1.2",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which of the following is NOT a typical step in setting up a Node.js development environment?",
      "options": [
        {
          "option": "A",
          "text": "Installing Node via package manager",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Configuring a linter like ESLint",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Setting up a MySQL server as the IDE",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "Initializing a Git repository",
          "is_correct": false
        }
      ],
      "explanation": "An IDE is software; a database server is not part of IDE configuration."
    },
    {
      "question_id": "Q25",
      "topic_id": "T3.3",
      "question_type": "single-correct",
      "difficulty": "hard",
      "question_text": "Which React Router v6 component replaces the older `<Switch>` component?",
      "options": [
        {
          "option": "A",
          "text": "<Routes>",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "<Router>",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "<RouteGroup>",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "<Navigator>",
          "is_correct": false
        }
      ],
      "explanation": "React Router v6 introduced <Routes> to wrap <Route> elements."
    },
    {
      "question_id": "Q26",
      "topic_id": "T5.2",
      "question_type": "multi-select",
      "difficulty": "medium",
      "question_text": "When deploying a React app to Netlify, which of the following configurations are commonly required? (Select all that apply)",
      "options": [
        {
          "option": "A",
          "text": "Specify a build command (e.g., `npm run build`)",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "Set the publish directory to `build/`",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "Create a .netlify.toml for routing rewrites",
          "is_correct": true
        },
        {
          "option": "D",
          "text": "Disable HTTPS in site settings",
          "is_correct": false
        }
      ],
      "explanation": "Build command, publish folder, and optional redirects are typical; HTTPS should remain enabled."
    },
    {
      "question_id": "Q27",
      "topic_id": "T4.1",
      "question_type": "scenario",
      "difficulty": "medium",
      "question_text": "A client sends a POST request with JSON payload to `/api/items`. Which Express code correctly parses the JSON body?",
      "options": [
        {
          "option": "A",
          "text": "app.post('/api/items', (req, res) => { /* req.body is undefined */ });",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "app.use(express.json());\napp.post('/api/items', (req, res) => { res.json(req.body); });",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "app.post('/api/items', express.json(), (req, res) => { res.send(req.body); });",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "app.use(bodyParser.urlencoded({ extended: true }));",
          "is_correct": false
        }
      ],
      "explanation": "express.json() middleware parses incoming JSON payloads."
    },
    {
      "question_id": "Q28",
      "topic_id": "T2.1",
      "question_type": "single-correct",
      "difficulty": "easy",
      "question_text": "Which attribute improves accessibility by providing alternative text for an image?",
      "options": [
        {
          "option": "A",
          "text": "title",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "alt",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "src",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "href",
          "is_correct": false
        }
      ],
      "explanation": "The alt attribute supplies descriptive text for screen readers."
    },
    {
      "question_id": "Q29",
      "topic_id": "T5.2",
      "question_type": "single-correct",
      "difficulty": "hard",
      "question_text": "During a blue‑green deployment on AWS, which service is primarily used to switch traffic between the two environments?",
      "options": [
        {
          "option": "A",
          "text": "Amazon EC2 Auto Scaling",
          "is_correct": false
        },
        {
          "option": "B",
          "text": "Amazon Route 53",
          "is_correct": true
        },
        {
          "option": "C",
          "text": "AWS Lambda",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Amazon S3",
          "is_correct": false
        }
      ],
      "explanation": "Route 53 can update DNS records to point to the new environment instantly."
    },
    {
      "question_id": "Q30",
      "topic_id": "T3.2",
      "question_type": "project",
      "difficulty": "hard",
      "question_text": "For the Task Management App project, which combination of technologies correctly satisfies the stated requirements?",
      "options": [
        {
          "option": "A",
          "text": "React.js for UI, Express for API, JWT for auth, MongoDB via Mongoose",
          "is_correct": true
        },
        {
          "option": "B",
          "text": "Angular for UI, Koa for API, Sessions, MySQL",
          "is_correct": false
        },
        {
          "option": "C",
          "text": "Vue.js, Laravel, OAuth2, PostgreSQL",
          "is_correct": false
        },
        {
          "option": "D",
          "text": "Plain JavaScript, PHP, Cookie‑based auth, SQLite",
          "is_correct": false
        }
      ],
      "explanation": "The project specification lists React, Express, JWT, and MongoDB as the required stack."
    }
  ],
  "received_at": "2026-06-08T18:55:18.218Z"
}$$::jsonb, now())
ON CONFLICT (quiz_type) DO UPDATE SET 
  quiz_data = EXCLUDED.quiz_data,
  updated_at = now();
