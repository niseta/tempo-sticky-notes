# Project Guidelines

## Project

A desktop Sticky Notes application built with React, TypeScript,
Vite, and Tailwind CSS.

Prioritize simplicity, maintainability, performance, type safety,
and usability.

## Task Scope

- Work only on the component, interaction, or documentation change explicitly requested.
- Do not implement adjacent features or optional enhancements automatically.
- Do not make visible UI or content changes without explicit approval.
- Verify the requested change and stop after reporting the result.

## Commands

- `npm run dev` - Start the development server.
- `npm run lint` - Run ESLint.
- `npm run build` - Type-check and build the application.

## Architecture

- Use React function components and hooks.
- Keep components focused and responsibilities clear.
- Keep each piece of state in the closest component that needs it.
- Lift state only when multiple components must coordinate around it.
- Avoid duplicating state that can be derived from existing values.
- Extract reusable logic only when it improves readability or maintainability.
- Avoid unnecessary abstractions and overengineering.
- Follow existing project conventions.

## TypeScript

- Do not weaken compiler options to bypass type errors.
- Avoid `any` and unnecessary type assertions.
- Define clear types for domain models and component props.
- Prefer type inference when types are obvious.

## UI and Interactions

- Use Tailwind CSS for styling.
- Do not use prebuilt UI or drag-and-drop libraries.
- Use native Pointer Events for dragging and resizing.
- Keep rapidly changing pointer data local to the active interaction when practical.
- Avoid updating shared React state more often than the rendered UI requires.
- Profile before adding memoization or other performance optimizations.
- Target desktop screens with a minimum resolution of 1024x768.
- Support modern Chrome, Firefox, and Microsoft Edge.

## Code Quality

- Prefer readable, maintainable code.
- Handle relevant edge cases.
- Avoid premature optimization.
- Add comments only to explain non-obvious decisions, constraints, or invariants.
- Do not use comments to restate what the code already expresses.
- Write all code comments in English.

## Workflow

- Inspect the existing files relevant to the requested change before modifying them.
- Make small, focused changes.
- Avoid modifying unrelated files.
- Do not add dependencies without approval.
- Do not create Git commits automatically.
- Run `npm run lint` and `npm run build` after application or configuration changes.
- Report remaining errors and unverified behavior.
- Do not update the README unless the task requires it.
- When requested, keep the README aligned only with implemented and verified behavior.
