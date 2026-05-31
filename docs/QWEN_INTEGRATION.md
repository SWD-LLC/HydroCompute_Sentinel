# Qwen Cloud Integration

This project uses Qwen Cloud as the agentic reasoning layer. All deterministic scoring and calculations are performed in Python; Qwen is responsible for interpreting ambiguous proposals, contradiction analysis, and generating human-facing explanations.

## Environment Configuration

Copy `.env.example` to `.env` and add your Qwen Cloud credentials:

```
cp .env.example .env
```

Edit your `.env` file:

```
QWEN_API_KEY=your_api_key
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
```

## Usage (OpenAI v1 SDK)

The recommended way to connect to Qwen Cloud is the OpenAI v1-compatible SDK:

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.getenv("QWEN_API_KEY"),
    base_url=os.getenv(
        "QWEN_BASE_URL",
        "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    ),
)

model = os.getenv("QWEN_MODEL", "qwen-plus")
```

Example agent call:

```python
response = client.chat.completions.create(
    model=model,
    messages=messages,
    temperature=0.3,
)
```

## Safety

- No API key or private credential should ever be committed to code or tracked by git.
- The `.env.example` file is for documentation and onboarding only.
