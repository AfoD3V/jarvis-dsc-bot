## ADDED Requirements

### Requirement: Runtime service separation
The system SHALL separate Discord interaction handling from long-running command execution by running an interaction-facing service and a background worker service as independent processes.

#### Scenario: Long-running command is delegated
- **WHEN** a user invokes a command that requires external API calls with non-trivial latency
- **THEN** the interaction-facing service MUST enqueue a job for background execution and return an immediate deferred acknowledgement to Discord

### Requirement: Queue-backed job execution
The system SHALL use a Redis-backed queue to transfer command execution work from the interaction-facing service to worker processes, including retry-aware job lifecycle state.

#### Scenario: Worker consumes queued job
- **WHEN** the interaction-facing service enqueues a valid command job
- **THEN** a worker MUST consume the job from Redis and update execution state through completion or terminal failure

### Requirement: Provider abstraction boundaries
The system SHALL implement command integrations through provider adapter interfaces so command logic is decoupled from concrete LLM and search SDKs.

#### Scenario: Provider implementation can be swapped by configuration
- **WHEN** runtime configuration selects a different provider implementation for a capability
- **THEN** command handlers MUST continue operating through the same domain interface without command-layer code changes

### Requirement: Extension-ready integration surface
The system SHALL expose integration boundaries for future MCP and n8n webhook adapters without requiring command contract changes.

#### Scenario: New integration adapter is introduced
- **WHEN** an additional integration adapter module is added for MCP or webhook orchestration
- **THEN** the adapter MUST bind to existing domain service interfaces rather than modifying existing slash-command input/output contracts

### Requirement: Structured operational logging
The system SHALL emit structured logs for command execution lifecycle events that include command identifier, request correlation id, and execution outcome.

#### Scenario: Command execution is traceable
- **WHEN** a command request is processed from intake through completion
- **THEN** logs MUST allow operators to correlate intake, queue processing, and completion records by shared correlation id
