## ADDED Requirements

### Requirement: TLDR command input contract
The system SHALL provide a `/tldr` command that accepts a YouTube URL, summary detail level, and output language selection.

#### Scenario: User submits valid TLDR request
- **WHEN** a user invokes `/tldr` with a valid YouTube URL and supported detail/language options
- **THEN** the system MUST accept the request and execute a summary workflow using those options

### Requirement: TLDR summary behavior
The system SHALL generate a structured summary from video transcript content and scale depth according to selected detail level.

#### Scenario: Detail level controls output depth
- **WHEN** a summary is generated for the same video using low and high detail levels
- **THEN** the high-detail response MUST contain materially more granular points than the low-detail response

### Requirement: TLDR transcript fallback handling
The system SHALL return an explicit fallback response when transcript extraction is unavailable or insufficient.

#### Scenario: Transcript cannot be retrieved
- **WHEN** transcript retrieval fails or returns unusable content
- **THEN** the system MUST return a user-facing message that summary generation could not be completed due to transcript availability

### Requirement: Fact-check command input contract
The system SHALL provide an `/fc` command that accepts a natural-language claim and output language selection.

#### Scenario: User submits valid fact-check request
- **WHEN** a user invokes `/fc` with a non-empty claim and supported language option
- **THEN** the system MUST execute a fact-check workflow for that claim

### Requirement: Fact-check verdict and evidence output
The system SHALL return a verdict category, short reasoning, and citation-backed evidence for `/fc` results.

#### Scenario: Evidence-backed verdict is returned
- **WHEN** fact-check execution completes with sufficient sources
- **THEN** the response MUST include verdict classification, concise explanation, and references to consulted sources

### Requirement: Insufficient-evidence handling
The system SHALL return an explicit uncertainty outcome when source evidence is insufficient for a reliable verdict.

#### Scenario: Source quality or quantity is insufficient
- **WHEN** the fact-check workflow cannot obtain adequate supporting evidence
- **THEN** the system MUST return an uncertainty verdict and indicate that evidence was insufficient

### Requirement: Language-aware responses
The system SHALL return `/tldr` and `/fc` responses in the user-selected language when that language is supported.

#### Scenario: User requests Polish output
- **WHEN** a user executes `/tldr` or `/fc` with language set to Polish
- **THEN** the returned response content MUST be generated in Polish
