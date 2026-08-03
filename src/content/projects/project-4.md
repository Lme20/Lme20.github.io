---
title: "Travelbuddy - Planning and journaling app for travellers"
description: "Travelbuddy helps you plan, track, and journal lifetime memories of your travels. This web-based app offers,several features. You can list your visited destinations, create packing and bucket lists, and plan your trips and expenses."
thumbnail: "/images/travelbuddy.png"
tags: ["JavaScript", "Vue.js", "REST API", "MongoDB"]
date: 2023-10-17
featured: true
repo: "https://github.com/Lme20/travelbuddy"
category: "software"
---

# Travelbuddy

## System Definition (MS0)

### Features

- Destination map and planner (chaining to a path to plan roundtrip: "travel via")
- Journal/notes:
  - Text-based
  - (Not implemented: *Images*)
- Checklists:
  - Packing lists
  - (Not implemented: *Bucket lists:*
    - *Destinations*
    - *Activities*)
  - (Not implemented: *Expenses lists:*
    - *Travel expenses, including calculation of sum and currency converter*)
- (Not implemented: *Reviews of destinations and activities*)

### Pages

- Main page containing a map for searching and/or saving possible destinations and activities. Clicking on the map brings up a menu containing options like “Save location” or "Create journal entry"
- Left Sidebar Menu containing entries for Journal, Locations, Activities, Checklists, preferences etc
- Right Sidebar Menu for additional details and options for list and note entries; pops up when entry is selected for creation/editing
- Pages for Journals, Checklists, Locations and an overview of all entries
