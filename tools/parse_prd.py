#!/usr/bin/env python3
"""
PRD Parser - Extract features and requirements from PRD files.
Usage: python tools/parse_prd.py prd/example.prd.md
"""

import json
import re
import sys
from pathlib import Path
from typing import Any


def parse_prd(filepath: str) -> dict[str, Any]:
    """Parse a PRD file and extract structured data."""
    content = Path(filepath).read_text()
    
    result = {
        "file": filepath,
        "product_name": "",
        "overview": "",
        "features": [],
        "technical_requirements": [],
        "api_endpoints": [],
    }
    
    # Extract product name (first H1)
    name_match = re.search(r'^# (.+)$', content, re.MULTILINE)
    if name_match:
        result["product_name"] = name_match.group(1).strip()
    
    # Extract overview
    overview_match = re.search(r'## Overview\s*\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    if overview_match:
        result["overview"] = overview_match.group(1).strip()
    
    # Extract features
    feature_pattern = r'### Feature (\d+): (.+?)\n(.*?)(?=### Feature|\Z)'
    for match in re.finditer(feature_pattern, content, re.DOTALL):
        feature_num = match.group(1)
        feature_name = match.group(2).strip()
        feature_content = match.group(3)
        
        feature = {
            "id": f"FEAT-{feature_num.zfill(3)}",
            "name": feature_name,
            "priority": "medium",
            "description": "",
            "acceptance_criteria": [],
            "user_stories": [],
        }
        
        # Extract priority
        priority_match = re.search(r'\*\*Priority\*\*:\s*(\w+)', feature_content)
        if priority_match:
            feature["priority"] = priority_match.group(1).lower()
        
        # Extract description
        desc_match = re.search(r'\*\*Description\*\*:\s*\n(.+?)(?=\*\*|\Z)', feature_content, re.DOTALL)
        if desc_match:
            feature["description"] = desc_match.group(1).strip()
        
        # Extract acceptance criteria
        criteria_match = re.search(r'\*\*Acceptance Criteria\*\*:\s*\n(.*?)(?=\*\*|\Z)', feature_content, re.DOTALL)
        if criteria_match:
            criteria_text = criteria_match.group(1)
            criteria = re.findall(r'- \[[ x]\] (.+)', criteria_text)
            feature["acceptance_criteria"] = criteria
        
        # Extract user stories
        stories_match = re.search(r'\*\*User Stories\*\*:\s*\n(.*?)(?=\*\*|\Z)', feature_content, re.DOTALL)
        if stories_match:
            stories_text = stories_match.group(1)
            stories = re.findall(r'- (.+)', stories_text)
            feature["user_stories"] = stories
        
        result["features"].append(feature)
    
    return result


def parse_all_prds(prd_dir: str = "prd") -> list[dict[str, Any]]:
    """Parse all PRD files in a directory."""
    prd_path = Path(prd_dir)
    results = []
    
    for prd_file in prd_path.glob("*.prd.md"):
        try:
            result = parse_prd(str(prd_file))
            results.append(result)
        except Exception as e:
            print(f"Error parsing {prd_file}: {e}", file=sys.stderr)
    
    return results


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Parse specific file
        result = parse_prd(sys.argv[1])
    else:
        # Parse all PRDs
        result = parse_all_prds()
    
    print(json.dumps(result, indent=2))
