# `react-hook-form` vs. Organic Demo

React should be mostly presentational, with as much logic done in pure JS/TS as possible.

## Notes

- The complexities of running logic inside a react component are not realized when the logic is so minimal
- `organic.tsx` has some boilerplate code (`local_state.ts`, `#run_task()`, more types), but in reality this could be easily abstracted, while boilerplate of the hook form version technically contains the entire `react-hook-form` codebase.
- In the hook form version, the state management is already starting to get complicated and hard to grok, but
- The comparison here is not meant to be on code readability or bundle size (although the organic version excels in both respects), but on codebase resilience. The organic version scales well and is easily restructured due to its programmatic nature. It is also easily tested (see `organic.test.ts`), and more adaptable (`Engine` could be used to write an excel or pdf version of the state).
