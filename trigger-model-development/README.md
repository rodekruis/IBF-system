# Trigger model development

Development of trigger models for IBF-system.
- This contains the exploratory analysis for developing a trigger-model for a given country and disaster-type. 
- It might include (in the future) a lot of shared code between countries and disaster types, and even (automated) tools to aid analysts to develop trigger models.
- The output is a `trigger script` which determines (per country/disaster type) when and where a trigger is reached.

## Setup

This folder contains content for various disaster-types. For now:
1. Floods
2. Droughts

They will use shared code (in the future) and shared setup (for now) as much as possible.

Within each disaster-types, there might be a further split between countries for country-specific (parts of) models. But across countries - even more than across disaster-types - shared code will be used as much as possible.