# Application architecture

- Keep the imported public landing at `/` and the authenticated learning home at `/dashboard`; learning exit links return to the dashboard so the public page does not interrupt practice.
- Isolate the imported landing's styles and color tokens under `.luma-landing` and the `luma-` prefix; its Tailwind 4 source must be adapted to this project's Tailwind 3 without changing the learning interface.
- Send OAuth and email confirmation callbacks to the public `/auth` page, then navigate after the session is hydrated; protected dashboard routes are not OAuth callbacks.