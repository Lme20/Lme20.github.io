---
title: "ProcModel: Assembly-Based PCG for 3D Assets"
description: "A descriptor-driven framework that assembles buildings and trees from modular parts."
thumbnail: "../../assets/images/procmodel.webp"
gallery:
  - src: "../../assets/images/procmodel.webp"
    alt: "Modular building and vegetation parts on the left, procedurally assembled skyscrapers, domed buildings and trees on the right"
tags: ["C++", "PCG", "procedural_modelling", "Python", "ERA"]
date: 2026-06-01
repo: "https://github.com/scape-engine/procmodel-scripts"
---

The artefact behind my master's thesis, *Exploration of an Assembly-Based PCG Framework for 3D Asset Generation*. Most of the thesis work was code implementation inside the Scape Engine. To check the actual paper please go to [paper](/papers/assembly-pcg-3d-assets).

## What I built

A PCG framework that generates 3D assets by assembling hand-made modular parts. Each asset type is described by a JSON descriptor: selection groups of parts with weights, constraints between parts, and parameter bindings for deformations like taper, twist, bend and noise.

The same descriptor schema drives two very different domains without changes:

- **Buildings**: skyscrapers and domed buildings, where variation comes from which parts get combined.
- **Vegetation**: trees with three-level hierarchies, handled through cascade activation, plus deformation that adds variation beyond part selection.

The framework runs inside my engine, [ScapeEngine](/projects/project-1). The linked repo holds the Python evaluation pipeline: weight conformance, constraint enforcement, dead-part detection and expressive range analysis (ERA) over generation logs.
