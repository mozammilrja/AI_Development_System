# Agent Browser Skill

## Description
Enables AI agents to interact with web browsers for testing, scraping, and UI validation.
Uses headless browser automation to navigate pages, interact with elements, and capture screenshots.

## Capabilities
- Open and navigate web pages
- Click elements, fill forms, submit data
- Capture screenshots and DOM snapshots
- Extract structured data from pages
- Validate UI rendering and layout
- Execute JavaScript in page context
- Handle authentication flows
- Wait for dynamic content loading

## Tools Required
- `tools/browser/open_page.py` — Navigate to URLs
- `tools/browser/click_element.py` — Click DOM elements
- `tools/browser/fill_form.py` — Fill form fields
- `tools/browser/capture_screenshot.py` — Take screenshots
- `tools/browser/extract_dom.py` — Extract DOM structure

## Usage
```python
from agents.browser_agent.agent import BrowserAgent

agent = BrowserAgent()
await agent.open_page("https://example.com")
await agent.click("#login-button")
await agent.fill_form({"username": "test", "password": "pass"})
screenshot = await agent.capture_screenshot()
```

## Configuration
- Browser: Chromium (via Playwright)
- Headless: true (default)
- Timeout: 30s per action
- Viewport: 1920x1080
