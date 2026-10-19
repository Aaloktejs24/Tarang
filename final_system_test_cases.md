# Tarang Backend: Final "Super" Verification Test Cases

This document provides a comprehensive list of test scenarios to verify the robustness of your newly upgraded "industry-grade" backend architecture. It covers all features implemented across Phases 5-8.

---

## 1. Gateway & Rate Limiting (KrakenD)
These tests ensure your microservices are protected from excessive traffic at the edge.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **GTW-01** | **Happy Path Routing:** Send a valid request to the API Gateway (`http://localhost:8000/api/v1/auth/login`). | The request successfully routes through KrakenD, hits the Auth service, and returns a 200/401 response from the Auth service. |
| **GTW-02** | **Basic Rate Limit Trigger:** Send 20 requests per second to the `/auth/login` gateway endpoint. | KrakenD interrupts the traffic and returns `HTTP 429 Too Many Requests` *before* the traffic ever reaches your Auth Go server. |
| **GTW-03** | **CORS Preflight:** Send an `OPTIONS` request with `Origin: http://localhost:5173`. | Returns 200 OK with `Access-Control-Allow-Origin` headers. |

---

## 2. Advanced Security & Crypto (ALE & JWT)
These tests verify that user PII is encrypted at rest and that compromised sessions can be killed immediately.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **SEC-01** | **Application-Level Encryption (ALE) Write:** Register a user and complete KYC (providing `FullName`, `DOB`, etc.). | The user is created successfully. Inspect the raw `users` table via `psql`; the `full_name` and `dob` columns must show encrypted ciphertext (base64 string), NOT plaintext. |
| **SEC-02** | **Application-Level Encryption (ALE) Read:** Log in and fetch the user profile via `GET /profile`. | The API returns the plaintext `FullName` and `DOB` (it transparently decrypts the ciphertext on the fly before sending the JSON response). |
| **SEC-03** | **JWT Blacklist on Logout:** Log in to get an Access Token. Hit `POST /api/v1/auth/logout`. Then try to use the *same* Access Token on `GET /profile`. | The `/logout` call returns 200 OK. The subsequent `/profile` call immediately returns `HTTP 401 Unauthorized` (Token Revoked), even if the JWT hasn't expired via TTL yet. |
| **SEC-04** | **Blacklist Expiration:** Inspect Redis (`redis-cli KEYS "blacklist:jti:*"`) immediately after logging out. | The token's `jti` exists in Redis, and its `TTL` strictly matches the remaining lifespan of the JWT. |

---

## 3. Resiliency & Event Architecture (RabbitMQ & Workers)
These tests ensure OTPs are delivered reliably, even if the primary notification service is temporarily down.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **RAB-01** | **Async Publishing:** Register a new user with `test@example.com`. | The Auth service API returns `200 OK` almost instantly (< 50ms) without waiting for the email to actually send. |
| **RAB-02** | **Worker Consumption:** Observe the `notification-worker` Docker logs. | The worker prints `worker X processing OTP` and successfully sends the email via SES. |
| **RAB-03** | **Retry Mechanism:** Temporarily block outbound internet access for the `notification-worker` container, then trigger an OTP. | The worker attempts to send, fails, increments the retry counter, and places the message in `otp_retry_queue`. It will retry up to 5 times. |
| **RAB-04** | **Dead Letter Queue (DLQ):** Allow the retry mechanism in RAB-03 to fail 5 times consecutively. | The message is removed from the active queues and placed permanently into `otp_dead_queue` for administrative review. It is not lost. |

---

## 4. Performance & Caching (Redis Read-Aside)
These tests ensure your Postgres database is protected from read-heavy profiles.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **PRF-01** | **First Profile Read (Cache Miss):** Fetch the user profile for the very first time. | The API returns 200 OK. Postgres is queried. Inspect Redis (`redis-cli get user:id:<uuid>`); the full user object is now cached as JSON. |
| **PRF-02** | **Subsequent Profile Read (Cache Hit):** Fetch the same user profile again immediately. | The API returns 200 OK extremely fast (< 5ms). The query is served entirely from Redis; Postgres logs show zero `SELECT` activity for this request. |
| **PRF-03** | **Cache Expiration:** Check the TTL on the cached user profile in Redis. | The cache key has a TTL of exactly 10 minutes. |

---

## 5. Observability (Prometheus & Jaeger)
These tests verify that if something goes wrong in production, you have the data to debug it quickly.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **OBS-01** | **Distributed Tracing (Happy Path):** Trigger a login flow. Open the Jaeger UI (`http://localhost:16686`). | Search for traces from `auth-service`. You should see a single trace containing a span for the Auth HTTP request, which natively links to a child span representing the gRPC call to the `user-service`. |
| **OBS-02** | **Tracing Bottlenecks:** Inject an artificial `time.Sleep(2 * time.Second)` in the User repository. Trigger a request. | The Jaeger UI clearly shows the `user-service` span taking 2+ seconds, instantly identifying where the latency bottleneck occurred. |
| **OBS-03** | **Prometheus Metrics Exporter:** Visit `http://localhost:8080/metrics`. | The page displays hundreds of raw system metrics (Go memory pools, HTTP request durations, panic counts) ready to be scraped by Grafana. |
| **OBS-04** | **Structured Logging:** Trigger a purposeful error (e.g., bad login). | The container logs output pure JSON via Zap, cleanly separating `level="error"`, `msg="invalid credentials"`, and `trace_id="<uuid>"`. |

---

## 6. Continuous Integration (CI/CD)
These tests ensure your development lifecycle is automated and secure.

| Test Case | Description | Expected Result |
| :--- | :--- | :--- |
| **CICD-01** | **Lint & Test:** Open a simulated Pull Request on GitHub. | GitHub Actions automatically runs `golangci-lint` and `go test -race ./...`. The PR is blocked if any tests fail. |
| **CICD-02** | **Security Scanning:** Introduce a deliberate hardcoded AWS Secret Key into the codebase and commit. | The `gosec` pipeline step detects the hardcoded credential and fails the CI build, preventing the bad code from being merged. |
| **CICD-03** | **Docker Verification (CD):** Push a change to a branch. | The CD workflow successfully executes a dry-run `docker build` for all microservices, proving they compile into valid alpine containers. |
