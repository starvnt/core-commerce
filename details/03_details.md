Hi Keshab,

I’m sharing the STARVNT CORE — Automation System Foundation V1 document with you.

Please go through the PDF carefully. This document outlines the next architectural layer we need to prepare as StarVnt Core evolves beyond basic Customer Tracking.

The objective is not to build a huge automation platform immediately. The focus is to establish a clean, modular, event-driven foundation that can gradually scale.

The core flow should be:

Business Event → Automation Trigger → Condition Evaluation → Rule → Action Execution → Activity / Log

The most important areas covered in the document are:

Automation module architecture

Business event system

Automation rules

Condition engine

Automation actions

Event-driven execution flow

Follow-up automation as the first working use case

Scheduled job foundation

Automation logging

Frontend readiness

Future Aura+ integration


Important

Before starting implementation, first review the architecture against the existing StarVnt Core codebase and the Cust